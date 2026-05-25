/**
 * Chrome built-in AI provider — uses the on-device Gemini Nano via the Prompt API.
 *
 * Requires Chrome ≥ 127 with the "Prompt API for Gemini Nano" feature enabled
 * (chrome://flags or origin trial). On unsupported environments, `isAvailable()`
 * returns a clear reason so the UI can route the user to BYOK instead.
 *
 * Quality is lower than frontier models; this is the **free path** for users
 * who don't want to manage an API key. The picker's selector-validation step
 * (highlighting matches before the user confirms) catches most of its mistakes.
 *
 * API reference (subject to change as the feature ships):
 *   https://developer.chrome.com/docs/ai/prompt-api
 */

import type { InferRequest, InferResponse } from '@pluck/shared';
import { validateInferResponse } from '@pluck/shared';
import type { AIProvider } from '../types';
import { ProviderError } from '../types';
import { SYSTEM_PROMPT, buildFlatPrompt } from '../prompt';

// Minimal local typing of the experimental API.
// Replace with the official `dom-chromium-ai` type package once published.
interface ChromeAiLanguageModel {
  capabilities(): Promise<{ available: 'readily' | 'after-download' | 'no' }>;
  create(opts?: {
    systemPrompt?: string;
    temperature?: number;
    topK?: number;
  }): Promise<ChromeAiSession>;
}

interface ChromeAiSession {
  prompt(input: string): Promise<string>;
  destroy(): void;
}

interface ChromeAiGlobal {
  languageModel?: ChromeAiLanguageModel;
  // Older API surface, kept as fallback.
  assistant?: ChromeAiLanguageModel;
}

function getChromeAi(): ChromeAiGlobal | null {
  const g = globalThis as unknown as { ai?: ChromeAiGlobal };
  return g.ai ?? null;
}

function getLanguageModel(): ChromeAiLanguageModel | null {
  const ai = getChromeAi();
  return ai?.languageModel ?? ai?.assistant ?? null;
}

export const ChromeBuiltinProvider: AIProvider = {
  meta: {
    id: 'chrome-builtin',
    label: 'Chrome built-in AI (free, on-device)',
    description:
      'Runs Gemini Nano locally on your machine. No API key, no usage cost. Requires Chrome 127+ with the Prompt API enabled.',
    requiresApiKey: false,
  },

  async isAvailable() {
    const model = getLanguageModel();
    if (!model) {
      return {
        ok: false,
        reason:
          'Chrome built-in AI is not available in this browser. Update to Chrome 127+ and enable the Prompt API at chrome://flags, or pick a different provider.',
      };
    }
    try {
      const caps = await model.capabilities();
      if (caps.available === 'no') {
        return { ok: false, reason: 'Prompt API reports unavailable on this device.' };
      }
      if (caps.available === 'after-download') {
        return {
          ok: false,
          reason:
            'Gemini Nano needs to download to your device first. Open chrome://components and update "Optimization Guide On Device Model", then retry.',
        };
      }
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        reason: `Capability check failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  },

  async infer(req: InferRequest): Promise<InferResponse> {
    const model = getLanguageModel();
    if (!model) {
      throw new ProviderError('chrome-builtin', 'Prompt API not available in this browser');
    }

    const session = await model.create({
      systemPrompt: SYSTEM_PROMPT,
      temperature: 0.2,
      topK: 3,
    });

    try {
      const raw = await session.prompt(buildFlatPrompt(req));
      return parseJsonResponse(raw);
    } catch (err) {
      throw new ProviderError(
        'chrome-builtin',
        err instanceof Error ? err.message : 'inference failed',
        err,
      );
    } finally {
      session.destroy();
    }
  },
};

function parseJsonResponse(raw: string): InferResponse {
  // The model sometimes wraps JSON in code fences despite instructions. Strip them.
  const trimmed = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch (err) {
    throw new ProviderError(
      'chrome-builtin',
      `model returned non-JSON output: ${trimmed.slice(0, 200)}…`,
      err,
    );
  }
  try {
    return validateInferResponse(parsed);
  } catch (err) {
    throw new ProviderError(
      'chrome-builtin',
      `model response failed schema validation: ${err instanceof Error ? err.message : String(err)}`,
      err,
    );
  }
}
