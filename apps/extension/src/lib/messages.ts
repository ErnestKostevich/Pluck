/**
 * Typed message contracts between popup / options / content script / background.
 * Use a tagged-union pattern so handlers can switch on `type`.
 */

import type { InferRequest, InferResponse } from '@pluck/shared';
import type { ProviderId } from './ai/types';
import type { SavedJob, RunRecord } from './storage';

// ── popup/options → content script (via chrome.tabs.sendMessage) ────────────

export type PopupToContentMessage =
  | { type: 'start-picker' }
  | { type: 'stop-picker' }
  | { type: 'extract-with-schema'; schema: SavedJob['schema'] };

export type ContentToPopupReply =
  | { ok: true; rows: Record<string, string>[]; containerMatches: number }
  | { ok: false; error: string };

// ── content script → background (chrome.runtime.sendMessage) ────────────────

export type ContentToBgMessage =
  | { type: 'infer'; payload: InferRequest }
  | { type: 'save-job'; name: string; url: string; schema: InferResponse }
  | { type: 'picker-cancelled' };

export type BgInferReply =
  | { ok: true; data: InferResponse; providerUsed: ProviderId }
  | { ok: false; error: string };

export type BgSaveJobReply = { ok: true; job: SavedJob } | { ok: false; error: string };

// ── popup → background ──────────────────────────────────────────────────────

export type PopupToBgMessage =
  | { type: 'run-job'; jobId: string }
  | { type: 'cancel-run'; runId: string };

export type BgRunJobReply = { ok: true; run: RunRecord } | { ok: false; error: string };
