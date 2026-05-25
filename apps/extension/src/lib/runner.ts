/**
 * Execute a saved job: open the URL in a hidden tab, run the saved schema
 * against the live DOM via chrome.scripting.executeScript, capture rows,
 * save a RunRecord, close the tab.
 *
 * Called both by:
 *   - The popup's "Run now" button (via a 'run-job' message to background)
 *   - The chrome.alarms.onAlarm listener (for scheduled runs)
 */

import type { SavedJob, RunRecord } from './storage';
import { appendRun, getJob, updateRun } from './storage';
import { extractWithSchema } from './selector-validation';

const PAGE_LOAD_TIMEOUT_MS = 30_000;
const POST_LOAD_DWELL_MS = 1500; // let dynamic content render

export async function runJob(jobId: string): Promise<RunRecord> {
  const job = await getJob(jobId);
  if (!job) throw new Error(`Job ${jobId} not found.`);

  const runId = crypto.randomUUID();
  const startedAt = Date.now();
  const initial: RunRecord = {
    id: runId,
    jobId: job.id,
    startedAt,
    status: 'running',
    rowCount: 0,
  };
  await appendRun(initial);

  let tabId: number | undefined;
  try {
    const tab = await chrome.tabs.create({ url: job.url, active: false });
    tabId = tab.id;
    if (!tabId) throw new Error('Failed to create background tab.');

    await waitForTabComplete(tabId, PAGE_LOAD_TIMEOUT_MS);
    await sleep(POST_LOAD_DWELL_MS);

    const results = await chrome.scripting.executeScript({
      target: { tabId },
      world: 'MAIN',
      func: extractInPage,
      args: [job.schema],
    });

    const result = results[0]?.result as
      | { containerMatches: number; rows: Record<string, string>[] }
      | undefined;

    if (!result) throw new Error('Extractor script returned no result.');

    const finishedAt = Date.now();
    const final: RunRecord = {
      ...initial,
      status: 'succeeded',
      finishedAt,
      rowCount: result.rows.length,
      rows: result.rows,
    };
    await updateRun(runId, final);
    return final;
  } catch (err) {
    const finishedAt = Date.now();
    const failed: RunRecord = {
      ...initial,
      status: 'failed',
      finishedAt,
      rowCount: 0,
      error: err instanceof Error ? err.message : String(err),
    };
    await updateRun(runId, failed);
    return failed;
  } finally {
    if (tabId) {
      // Best-effort cleanup; ignore if the tab was already closed.
      try {
        await chrome.tabs.remove(tabId);
      } catch {
        /* swallow */
      }
    }
  }
}

function waitForTabComplete(tabId: number, timeoutMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error('Page load timed out.'));
    }, timeoutMs);

    const listener = (
      updatedTabId: number,
      changeInfo: chrome.tabs.TabChangeInfo,
    ): void => {
      if (updatedTabId === tabId && changeInfo.status === 'complete') {
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    };

    chrome.tabs.onUpdated.addListener(listener);

    // Check current state in case it's already complete.
    chrome.tabs.get(tabId).then((t) => {
      if (t.status === 'complete') {
        clearTimeout(timer);
        chrome.tabs.onUpdated.removeListener(listener);
        resolve();
      }
    });
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Runs IN THE PAGE CONTEXT (not the extension context). Must be self-contained
 * — it cannot import from elsewhere in the extension; chrome.scripting copies
 * the function source into the page.
 *
 * We keep this duplicated logic in sync with `selector-validation.ts`.
 * Refactor only if both can share a pure-DOM module that gets bundled into both.
 */
function extractInPage(schema: SavedJob['schema']): {
  containerMatches: number;
  rows: Record<string, string>[];
} {
  const containers = Array.from(document.querySelectorAll(schema.containerSelector));
  const rows: Record<string, string>[] = [];

  for (const container of containers) {
    const row: Record<string, string> = {};
    for (const col of schema.columns) {
      let el: Element | null;
      try {
        el =
          col.selector === '' || col.selector === '.'
            ? container
            : container.querySelector(col.selector);
      } catch {
        el = null;
      }
      if (!el) {
        row[col.label] = '';
        continue;
      }
      let raw = '';
      switch (col.attribute) {
        case undefined:
        case 'text':
          raw = (el as HTMLElement).innerText ?? el.textContent ?? '';
          break;
        case 'href':
          raw = el.getAttribute('href') ?? '';
          if (raw) {
            try {
              raw = new URL(raw, document.baseURI).href;
            } catch {
              /* leave as-is */
            }
          }
          break;
        case 'src':
          raw = el.getAttribute('src') ?? '';
          if (raw) {
            try {
              raw = new URL(raw, document.baseURI).href;
            } catch {
              /* leave as-is */
            }
          }
          break;
        case 'value':
          raw = (el as HTMLInputElement).value ?? '';
          break;
        default:
          raw = el.getAttribute(col.attribute) ?? '';
      }
      row[col.label] = raw.replace(/\s+/g, ' ').trim();
    }
    rows.push(row);
  }

  return { containerMatches: containers.length, rows };
}

// Suppress unused-imports lint — extractWithSchema is co-located reference logic.
void extractWithSchema;
