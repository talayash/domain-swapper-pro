import type { StateCreator, StoreMutatorIdentifier } from 'zustand';

type ChromeStorageMiddleware = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = []
>(
  f: StateCreator<T, Mps, Mcs>,
  options: { key: string; throttleMs?: number }
) => StateCreator<T, Mps, Mcs>;

type ChromeStorageImpl = <T>(
  f: StateCreator<T, [], []>,
  options: { key: string; throttleMs?: number }
) => StateCreator<T, [], []>;

// One flusher per storage key. Lets short-lived contexts (the popup closes
// itself right after a swap) force the throttled write out before unloading.
const flushers = new Map<string, () => Promise<void>>();

/**
 * Immediately persist any pending throttled write for `key`.
 * Resolves once Chrome has acknowledged the write. No-op if nothing is pending.
 */
export function flushStorage(key: string): Promise<void> {
  const flush = flushers.get(key);
  return flush ? flush() : Promise.resolve();
}

const chromeStorageImpl: ChromeStorageImpl = (f, { key, throttleMs = 500 }) => (set, get, api) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const writeNow = (): Promise<void> =>
    new Promise((resolve) => {
      chrome.storage.local.set({ [key]: get() }, () => resolve());
    });

  const saveToStorage = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      writeNow();
    }, throttleMs);
  };

  flushers.set(key, async () => {
    if (!timeoutId) return;
    clearTimeout(timeoutId);
    timeoutId = null;
    await writeNow();
  });

  const wrappedSet: typeof set = (...args) => {
    set(...args);
    saveToStorage();
  };

  return f(wrappedSet, get, api);
};

export const chromeStorage = chromeStorageImpl as unknown as ChromeStorageMiddleware;

export async function loadFromStorage<T>(key: string): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] || null);
    });
  });
}

export async function syncToCloudStorage<T>(key: string, data: T): Promise<void> {
  return new Promise((resolve, reject) => {
    const serialized = JSON.stringify(data);
    if (serialized.length > chrome.storage.sync.QUOTA_BYTES_PER_ITEM) {
      reject(new Error('Data exceeds Chrome sync storage quota'));
      return;
    }
    chrome.storage.sync.set({ [key]: data }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

export async function loadFromCloudStorage<T>(key: string): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.storage.sync.get([key], (result) => {
      resolve(result[key] || null);
    });
  });
}
