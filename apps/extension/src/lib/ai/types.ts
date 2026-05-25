/**
 * AI provider abstraction.
 *
 * All inference adapters implement this interface so the rest of the
 * extension never knows whether it's talking to Chrome built-in Gemini Nano,
 * Anthropic, Google Gemini API, or OpenAI.
 */

import type { InferRequest, InferResponse } from '@pluck/shared';

export type ProviderId = 'chrome-builtin' | 'anthropic' | 'gemini' | 'openai';

export interface ProviderMeta {
  id: ProviderId;
  /** Human-readable name shown in the UI. */
  label: string;
  /** Short description shown under the radio button in settings. */
  description: string;
  /** Whether the user must supply an API key. */
  requiresApiKey: boolean;
  /** Where the user gets a key, if applicable. */
  apiKeyUrl?: string;
}

export interface AIProvider {
  readonly meta: ProviderMeta;
  /** Probe whether this provider works in the current environment + with current settings. */
  isAvailable(): Promise<{ ok: true } | { ok: false; reason: string }>;
  /** Run pattern inference. Throws on any failure; callers should catch and surface. */
  infer(req: InferRequest): Promise<InferResponse>;
}

/** Settings the user can configure for AI. Persisted in `chrome.storage.local`. */
export interface AISettings {
  /** Which provider to use by default. */
  provider: ProviderId;
  /** API keys, keyed by provider id. Only those that need a key. */
  apiKeys: Partial<Record<Exclude<ProviderId, 'chrome-builtin'>, string>>;
}

export class ProviderError extends Error {
  constructor(
    public readonly providerId: ProviderId,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(`[${providerId}] ${message}`);
    this.name = 'ProviderError';
  }
}
