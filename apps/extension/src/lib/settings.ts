/**
 * Typed wrapper around `chrome.storage.local` for user settings.
 *
 * Keys live in the `pluck:` namespace to avoid collision if we ever need to
 * share storage with another script or vendor.
 */

import type { AISettings, ProviderId } from './ai/types';

const KEY = 'pluck:settings:v1';

const DEFAULT_SETTINGS: AISettings = {
  provider: 'chrome-builtin',
  apiKeys: {},
};

export async function getSettings(): Promise<AISettings> {
  const stored = await chromeStorageGet<AISettings>(KEY);
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
}

export async function updateSettings(patch: Partial<AISettings>): Promise<AISettings> {
  const current = await getSettings();
  const next: AISettings = {
    ...current,
    ...patch,
    apiKeys: { ...current.apiKeys, ...(patch.apiKeys ?? {}) },
  };
  await chromeStorageSet(KEY, next);
  return next;
}

export async function setProvider(id: ProviderId): Promise<void> {
  await updateSettings({ provider: id });
}

export async function setApiKey(
  provider: Exclude<ProviderId, 'chrome-builtin'>,
  key: string,
): Promise<void> {
  await updateSettings({ apiKeys: { [provider]: key } });
}

export async function clearApiKey(
  provider: Exclude<ProviderId, 'chrome-builtin'>,
): Promise<void> {
  const current = await getSettings();
  const apiKeys = { ...current.apiKeys };
  delete apiKeys[provider];
  await chromeStorageSet(KEY, { ...current, apiKeys });
}

// ── chrome.storage promise wrappers ──────────────────────────────────────────

function chromeStorageGet<T>(key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(key, (items) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(items[key] as T | undefined);
      }
    });
  });
}

function chromeStorageSet<T>(key: string, value: T): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}
