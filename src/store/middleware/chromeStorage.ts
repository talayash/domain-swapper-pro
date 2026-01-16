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

const chromeStorageImpl: ChromeStorageImpl = (f, { key, throttleMs = 500 }) => (set, get, api) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const saveToStorage = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      const state = get();
      chrome.storage.local.set({ [key]: state });
    }, throttleMs);
  };

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
