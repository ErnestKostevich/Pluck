/**
 * Vitest setup — installs a minimal chrome.* shim so storage tests can run
 * without depending on a real Chrome runtime.
 */

import { vi } from 'vitest';

interface MockChrome {
  storage: {
    local: {
      get: (key: string, cb: (items: Record<string, unknown>) => void) => void;
      set: (items: Record<string, unknown>, cb: () => void) => void;
      remove: (key: string, cb: () => void) => void;
    };
  };
  runtime: { lastError: chrome.runtime.LastError | null };
  alarms: {
    create: ReturnType<typeof vi.fn>;
    clear: ReturnType<typeof vi.fn>;
    getAll: ReturnType<typeof vi.fn>;
  };
}

const storage = new Map<string, unknown>();

const mockChrome: MockChrome = {
  storage: {
    local: {
      get(key, cb) {
        cb({ [key]: storage.get(key) });
      },
      set(items, cb) {
        for (const [k, v] of Object.entries(items)) storage.set(k, v);
        cb();
      },
      remove(key, cb) {
        storage.delete(key);
        cb();
      },
    },
  },
  runtime: { lastError: null },
  alarms: {
    create: vi.fn().mockResolvedValue(undefined),
    clear: vi.fn().mockResolvedValue(true),
    getAll: vi.fn().mockResolvedValue([]),
  },
};

(globalThis as unknown as { chrome: MockChrome }).chrome = mockChrome;

// Clear storage between tests so they're isolated.
import { beforeEach } from 'vitest';
beforeEach(() => {
  storage.clear();
});
