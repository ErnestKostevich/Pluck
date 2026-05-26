/**
 * AI provider factory + selection.
 *
 * Callers use `runInference(req)` and don't need to know which provider answers.
 * Provider selection priority:
 *   1. The user's chosen provider in settings (if available).
 *   2. The first available fallback in PRIORITY order.
 *   3. Throws — UI surfaces the error to the user.
 *
 * Each phase is logged + timeout-guarded so we never hang the picker silently.
 */

import type { InferRequest, InferResponse } from '@pluck/shared';
import { getSettings } from '../settings';
import type { AIProvider, AISettings, ProviderId } from './types';
import { ChromeBuiltinProvider } from './providers/chrome-builtin';
import { createAnthropicProvider } from './providers/anthropic';
import { createGeminiProvider } from './providers/gemini';
import { createOpenAIProvider } from './providers/openai';

/** Fallback order when the chosen provider isn't available. */
const PRIORITY: ProviderId[] = ['chrome-builtin', 'anthropic', 'gemini', 'openai'];

const AVAILABILITY_TIMEOUT_MS = 8_000;
const INFER_TIMEOUT_MS = 90_000;

function getProvider(id: ProviderId, settings: AISettings): AIProvider {
  switch (id) {
    case 'chrome-builtin':
      return ChromeBuiltinProvider;
    case 'anthropic':
      return createAnthropicProvider(() => settings);
    case 'gemini':
      return createGeminiProvider(() => settings);
    case 'openai':
      return createOpenAIProvider(() => settings);
  }
}

/**
 * Race a promise against a timeout. If the promise doesn't resolve within
 * `ms`, throws with the given label. Prevents any provider from hanging the
 * whole flow forever (e.g. Chrome built-in AI when Gemini Nano isn't loaded,
 * a hung fetch to api.anthropic.com, etc.).
 */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${(ms / 1000).toFixed(0)}s`)),
      ms,
    );
  });
  return Promise.race([p, timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  }) as Promise<T>;
}

async function tryProvider(
  id: ProviderId,
  prov: AIProvider,
  req: InferRequest,
): Promise<
  | { ok: true; response: InferResponse }
  | { ok: false; reason: string }
> {
  console.log(`[Pluck bg] checking ${id}…`);
  let avail;
  try {
    avail = await withTimeout(prov.isAvailable(), AVAILABILITY_TIMEOUT_MS, `${id} isAvailable()`);
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[Pluck bg] ${id} isAvailable() failed:`, reason);
    return { ok: false, reason };
  }
  if (!avail.ok) {
    console.log(`[Pluck bg] ${id} not available:`, avail.reason);
    return { ok: false, reason: avail.reason };
  }
  console.log(`[Pluck bg] ${id} available — running inference…`);
  const start = Date.now();
  try {
    const response = await withTimeout(prov.infer(req), INFER_TIMEOUT_MS, `${id} inference`);
    console.log(`[Pluck bg] ${id} inference returned in ${Date.now() - start}ms`);
    return { ok: true, response };
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    console.warn(`[Pluck bg] ${id} inference failed after ${Date.now() - start}ms:`, reason);
    return { ok: false, reason };
  }
}

export async function runInference(req: InferRequest): Promise<{
  response: InferResponse;
  providerUsed: ProviderId;
}> {
  const settings = await getSettings();
  const chosen = settings.provider;
  console.log(`[Pluck bg] runInference start; chosen provider: ${chosen}`);

  const chosenProv = getProvider(chosen, settings);
  const tryChosen = await tryProvider(chosen, chosenProv, req);
  if (tryChosen.ok) return { response: tryChosen.response, providerUsed: chosen };

  const failures: string[] = [`${chosen}: ${tryChosen.reason}`];

  for (const id of PRIORITY) {
    if (id === chosen) continue;
    const prov = getProvider(id, settings);
    const tryThis = await tryProvider(id, prov, req);
    if (tryThis.ok) return { response: tryThis.response, providerUsed: id };
    failures.push(`${id}: ${tryThis.reason}`);
  }

  throw new Error(`No AI provider available. Tried:\n  - ${failures.join('\n  - ')}`);
}

export {
  ChromeBuiltinProvider,
  createAnthropicProvider,
  createGeminiProvider,
  createOpenAIProvider,
};
export type { AIProvider, ProviderId, AISettings } from './types';
