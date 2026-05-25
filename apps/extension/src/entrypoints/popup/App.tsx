import { useEffect, useState, useCallback } from 'react';
import type {
  PopupToContentMessage,
  PopupToBgMessage,
  BgRunJobReply,
} from '@/lib/messages';
import { getSettings, getLicense } from '@/lib/settings';
import type { ProviderId } from '@/lib/ai/types';
import {
  listJobs,
  deleteJob,
  FREE_TIER_MAX_JOBS,
  type SavedJob,
} from '@/lib/storage';
import { verifyLicense } from '@/lib/license';
import { downloadCsv, rowsToCsv, slugify } from '@/lib/export';
import { getRun } from '@/lib/storage';

const PROVIDER_LABELS: Record<ProviderId, string> = {
  'chrome-builtin': 'Chrome built-in AI',
  anthropic: 'Anthropic Claude',
  gemini: 'Google Gemini',
  openai: 'OpenAI',
};

export function App() {
  const [tabUrl, setTabUrl] = useState<string>('');
  const [provider, setProvider] = useState<ProviderId | null>(null);
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [isPro, setIsPro] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runningJobs, setRunningJobs] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    const [s, lic, js] = await Promise.all([getSettings(), getLicense(), listJobs()]);
    setProvider(s.provider);
    setJobs(js);
    if (lic) {
      const res = await verifyLicense(lic);
      setIsPro(res.valid && res.payload.plan === 'pro');
    } else {
      setIsPro(false);
    }
  }, []);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setTabUrl(tabs[0]?.url ?? '');
    });
    refresh();
  }, [refresh]);

  async function startPicker() {
    setError(null);
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      setError('No active tab.');
      return;
    }
    if (tab.url && /^(chrome|edge|about|file):/.test(tab.url)) {
      setError('Pluck cannot run on browser internal pages. Open a regular web page.');
      return;
    }
    const message: PopupToContentMessage = { type: 'start-picker' };
    try {
      await chrome.tabs.sendMessage(tab.id, message);
      window.close();
    } catch (err) {
      setError(
        `Could not start picker. Reload the target page and try again. (${
          err instanceof Error ? err.message : String(err)
        })`,
      );
    }
  }

  async function runJob(jobId: string) {
    setRunningJobs((s) => new Set(s).add(jobId));
    const msg: PopupToBgMessage = { type: 'run-job', jobId };
    try {
      const reply: BgRunJobReply = await chrome.runtime.sendMessage(msg);
      if (!reply.ok) {
        setError(`Run failed: ${reply.error}`);
      }
    } catch (err) {
      setError(`Run failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setRunningJobs((s) => {
        const next = new Set(s);
        next.delete(jobId);
        return next;
      });
      refresh();
    }
  }

  async function exportJob(job: SavedJob) {
    if (!job.lastRun) {
      setError('This job has no completed run yet. Run it first.');
      return;
    }
    const run = await getRun(job.lastRun.runId);
    if (!run?.rows || run.rows.length === 0) {
      setError('No rows in the most recent run.');
      return;
    }
    const csv = rowsToCsv(run.rows);
    downloadCsv(`${slugify(job.name)}-${new Date(run.startedAt).toISOString().slice(0, 10)}.csv`, csv);
  }

  async function deleteJobById(jobId: string) {
    if (!confirm('Delete this job and its run history? This cannot be undone.')) return;
    await deleteJob(jobId);
    refresh();
  }

  function openOptions(e: React.MouseEvent) {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  }

  const atFreeTierCap = !isPro && jobs.length >= FREE_TIER_MAX_JOBS;

  return (
    <main>
      <header>
        <span className="brand">🍒 Pluck</span>
        <span className={`badge ${isPro ? 'pro' : ''}`}>{isPro ? 'PRO' : 'FREE'}</span>
      </header>

      <section className="hero">
        <button
          className="primary"
          onClick={startPicker}
          disabled={atFreeTierCap}
          title={atFreeTierCap ? 'Free tier limit reached. Upgrade or delete a job first.' : undefined}
        >
          {atFreeTierCap ? 'Free tier limit reached' : 'Start picker on this tab'}
        </button>
        {!isPro && (
          <p className="hero-hint">
            {jobs.length}/{FREE_TIER_MAX_JOBS} jobs used ·{' '}
            <a href="#" onClick={openOptions}>
              Upgrade
            </a>
          </p>
        )}
      </section>

      {error && (
        <div className="error" onClick={() => setError(null)}>
          {error}
          <span className="dismiss">✕</span>
        </div>
      )}

      <section className="jobs">
        <div className="jobs-header">
          <h2>Saved jobs</h2>
          <a href="#" onClick={openOptions} className="settings-link">
            Settings
          </a>
        </div>
        {jobs.length === 0 ? (
          <p className="empty">
            No jobs yet. Click <strong>Start picker</strong> on any page to create one.
          </p>
        ) : (
          <ul className="job-list">
            {jobs.map((job) => (
              <li key={job.id}>
                <div className="job-row">
                  <div className="job-meta">
                    <div className="job-name" title={job.name}>
                      {job.name}
                    </div>
                    <div className="job-host">
                      {hostnameOrUrl(job.url)}
                      {job.schedule && (
                        <span className="schedule-tag">every {job.schedule.periodMinutes}m</span>
                      )}
                    </div>
                    {job.lastRun ? (
                      <div className={`last-run ${job.lastRun.status}`}>
                        {job.lastRun.status === 'succeeded' && `${job.lastRun.rowCount} rows`}
                        {job.lastRun.status === 'failed' && `Failed`}
                        {job.lastRun.status === 'running' && `Running…`}
                        {' · '}
                        {timeAgo(job.lastRun.finishedAt)}
                      </div>
                    ) : (
                      <div className="last-run none">Never run</div>
                    )}
                  </div>
                  <div className="job-actions">
                    <button
                      onClick={() => runJob(job.id)}
                      disabled={runningJobs.has(job.id)}
                      title="Run now"
                    >
                      {runningJobs.has(job.id) ? '…' : '▶'}
                    </button>
                    <button
                      onClick={() => exportJob(job)}
                      disabled={!job.lastRun || job.lastRun.rowCount === 0}
                      title="Download CSV of latest run"
                    >
                      ⬇
                    </button>
                    <button onClick={() => deleteJobById(job.id)} title="Delete">
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer>
        <div className="row">
          <span>Active tab:</span>
          <span className="tab-url" title={tabUrl}>
            {tabUrl ? new URL(tabUrl).hostname : '—'}
          </span>
        </div>
        <div className="row">
          <span>AI:</span>
          <span className="tab-url">{provider ? PROVIDER_LABELS[provider] : '…'}</span>
        </div>
      </footer>
    </main>
  );
}

function hostnameOrUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return 'just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}
