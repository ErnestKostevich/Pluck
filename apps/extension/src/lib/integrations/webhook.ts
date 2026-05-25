/**
 * Webhook integration: POSTs scraped rows to a user-configured URL with an
 * HMAC-SHA256 signature so the receiving server can verify it came from Pluck.
 *
 * Pro-gated. The secret is generated per job (32 bytes, base64). It's shown
 * to the user in the edit form so they can paste it into their server's
 * webhook validator.
 *
 * Signature: HMAC-SHA256 of the raw JSON request body, encoded as base64.
 * Sent in the `x-pluck-signature` header.
 *
 * Body shape:
 *   {
 *     jobId: string,
 *     jobName: string,
 *     runId: string,
 *     startedAt: number,
 *     finishedAt: number,
 *     rowCount: number,
 *     rows: Record<string, string>[],
 *   }
 */

import type { WebhookConfig } from '../storage';
import type { SavedJob, RunRecord } from '../storage';

export interface WebhookDispatchResult {
  ok: boolean;
  status?: number;
  error?: string;
}

export async function dispatchWebhook(
  config: WebhookConfig,
  job: SavedJob,
  run: RunRecord,
): Promise<WebhookDispatchResult> {
  if (!config.enabled) return { ok: true };
  if (!config.url) return { ok: false, error: 'webhook url is empty' };
  if (!run.rows) return { ok: false, error: 'run has no rows to send' };

  const body = JSON.stringify({
    jobId: job.id,
    jobName: job.name,
    runId: run.id,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt ?? Date.now(),
    rowCount: run.rowCount,
    rows: run.rows,
  });

  let signature: string;
  try {
    signature = await hmacSha256Base64(config.secret, body);
  } catch (err) {
    return { ok: false, error: `signing failed: ${errMsg(err)}` };
  }

  try {
    const res = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pluck-signature': signature,
        'x-pluck-job-id': job.id,
        'x-pluck-run-id': run.id,
      },
      body,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, status: res.status, error: text || res.statusText };
    }
    return { ok: true, status: res.status };
  } catch (err) {
    return { ok: false, error: `network: ${errMsg(err)}` };
  }
}

/** Generate a new random secret. 32 bytes, base64-encoded. */
export function generateWebhookSecret(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin);
}

async function hmacSha256Base64(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret) as BufferSource,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message) as BufferSource);
  const bytes = new Uint8Array(sig);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]!);
  return btoa(bin);
}

function errMsg(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
