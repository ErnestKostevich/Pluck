/**
 * Execute a saved job:
 *   1. Open the URL in a hidden tab.
 *   2. Extract rows from the current page via chrome.scripting.executeScript.
 *   3. If pagination is detected and within caps, navigate to the next page
 *      and extract again, accumulating rows.
 *   4. Persist a RunRecord.
 *   5. If a webhook integration is enabled, POST the rows with an HMAC sig.
 *   6. Close the tab.
 *
 * Called by:
 *   - Popup's "Run now" button (via 'run-job' message to background)
 *   - chrome.alarms.onAlarm listener for scheduled runs
 */

import type { SavedJob, RunRecord } from './storage';
import { appendRun, getJob, updateRun } from './storage';
import { dispatchWebhook } from './integrations/webhook';

const PAGE_LOAD_TIMEOUT_MS = 30_000;
const POST_LOAD_DWELL_MS = 1500;
const DEFAULT_MAX_PAGES = 10;
const DEFAULT_MAX_ROWS = 1000;
const HARD_MAX_PAGES = 50;
const HARD_MAX_ROWS = 10_000;

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

  const maxPages = Math.min(job.paginationCap?.maxPages ?? DEFAULT_MAX_PAGES, HARD_MAX_PAGES);
  const maxRows = Math.min(job.paginationCap?.maxRows ?? DEFAULT_MAX_ROWS, HARD_MAX_ROWS);
  const supportsPagination =
    job.schema.paginationHint?.type === 'next-link' ||
    job.schema.paginationHint?.type === 'page-numbers';

  let tabId: number | undefined;
  const allRows: Record<string, string>[] = [];
  let pagesScraped = 0;
  let nextUrl: string | null = job.url;

  try {
    const tab = await chrome.tabs.create({ url: job.url, active: false });
    tabId = tab.id;
    if (!tabId) throw new Error('Failed to create background tab.');

    while (nextUrl && pagesScraped < maxPages && allRows.length < maxRows) {
      if (pagesScraped > 0) {
        // Navigate the existing tab to the next URL.
        await chrome.tabs.update(tabId, { url: nextUrl });
      }
      await waitForTabComplete(tabId, PAGE_LOAD_TIMEOUT_MS);
      await sleep(POST_LOAD_DWELL_MS);

      const results = await chrome.scripting.executeScript({
        target: { tabId },
        world: 'MAIN',
        func: extractInPage,
        args: [job.schema],
      });

      const result = results[0]?.result as
        | { containerMatches: number; rows: Record<string, string>[]; nextUrl: string | null }
        | undefined;

      if (!result) throw new Error('Extractor script returned no result.');
      allRows.push(...result.rows);
      pagesScraped++;

      if (!supportsPagination) break;
      nextUrl = result.nextUrl && result.nextUrl !== nextUrl ? result.nextUrl : null;
    }

    // Trim to maxRows if pagination overshoots.
    const trimmedRows = allRows.slice(0, maxRows);

    const finishedAt = Date.now();
    const final: RunRecord = {
      ...initial,
      status: 'succeeded',
      finishedAt,
      rowCount: trimmedRows.length,
      rows: trimmedRows,
    };
    await updateRun(runId, final);

    // Fire-and-forget webhook (after persistence so the run is recorded even if webhook fails).
    const webhook = job.integrations?.webhook;
    if (webhook?.enabled && webhook.url) {
      dispatchWebhook(webhook, job, final).catch((err) => {
        console.error('[pluck] webhook dispatch failed', err);
      });
    }

    return final;
  } catch (err) {
    const finishedAt = Date.now();
    const failed: RunRecord = {
      ...initial,
      status: 'failed',
      finishedAt,
      rowCount: allRows.length,
      // Keep partial rows so the user can see what was extracted before the failure.
      rows: allRows.length > 0 ? allRows : undefined,
      error: err instanceof Error ? err.message : String(err),
    };
    await updateRun(runId, failed);
    return failed;
  } finally {
    if (tabId) {
      try {
        await chrome.tabs.remove(tabId);
      } catch {
        /* tab already gone */
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
 * Runs IN THE PAGE CONTEXT (not the extension). Must be self-contained —
 * chrome.scripting copies the function source into the page.
 *
 * Extracts rows + locates the "next page" URL based on paginationHint.
 */
function extractInPage(schema: SavedJob['schema']): {
  containerMatches: number;
  rows: Record<string, string>[];
  nextUrl: string | null;
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

  // Find next-page URL if pagination is configured.
  let nextUrl: string | null = null;
  const hint = schema.paginationHint;
  if (
    hint &&
    (hint.type === 'next-link' || hint.type === 'page-numbers') &&
    hint.selector
  ) {
    try {
      const nextEl = document.querySelector(hint.selector);
      if (nextEl) {
        const href = nextEl.getAttribute('href');
        if (href) {
          try {
            nextUrl = new URL(href, document.baseURI).href;
          } catch {
            nextUrl = null;
          }
        }
      }
    } catch {
      nextUrl = null;
    }
  }

  return { containerMatches: containers.length, rows, nextUrl };
}
