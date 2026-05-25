/**
 * Typed wrapper around `chrome.storage.local` for user settings + license.
 *
 * Keys live in the `pluck:` namespace to avoid collision with other extensions.
 */

import type { AISettings, ProviderId } from './ai/types';

const SETTINGS_KEY = 'pluck:settings:v1';
const LICENSE_KEY = 'pluck:license:v1';

const DEFAULT_SETTINGS: AISettings = {
  provider: 'chrome-builtin',
  apiKeys: {},
};

// ── AI provider settings ────────────────────────────────────────────────────

export async function getSettings(): Promise<AISettings> {
  const stored = await chromeStorageGet<AISettings>(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(stored ?? {}) };
}

export async function updateSettings(patch: Partial<AISettings>): Promise<AISettings> {
  const current = await getSettings();
  const next: AISettings = {
    ...current,
    ...patch,
    apiKeys: { ...current.apiKeys, ...(patch.apiKeys ?? {}) },
  };
  await chromeStorageSet(SETTINGS_KEY, next);
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
  await chromeStorageSet(SETTINGS_KEY, { ...current, apiKeys });
}

// ── License storage ────────────────────────────────────────────────────────

export async function getLicense(): Promise<string | null> {
  const jwt = await chromeStorageGet<string>(LICENSE_KEY);
  return jwt ?? null;
}

export async function setLicense(jwt: string): Promise<void> {
  await chromeStorageSet(LICENSE_KEY, jwt);
}

export async function clearLicense(): Promise<void> {
  await chromeStorageRemove(LICENSE_KEY);
}

// ── chrome.storage promise wrappers ─────────────────────────────────────────

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

function chromeStorageRemove(key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove(key, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}
