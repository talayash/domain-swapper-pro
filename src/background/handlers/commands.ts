import type { Domain, Settings } from '~/types';
import { buildSwapUrl } from '~/lib/urlUtils';

const STORAGE_KEY = 'domain-swapper-pro';

interface StoredState {
  domains: Domain[];
  settings: Settings;
  recentDomains: string[];
}

export function handleCommand(command: string) {
  if (command === 'quick-swap') {
    handleQuickSwap();
  }
}

async function handleQuickSwap() {
  const result = await chrome.storage.local.get([STORAGE_KEY]);
  const state: StoredState | undefined = result[STORAGE_KEY];

  if (!state || !state.recentDomains || state.recentDomains.length === 0) {
    return;
  }

  const lastDomainId = state.recentDomains[0];
  const domain = state.domains.find((d) => d.id === lastDomainId);

  if (!domain) return;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url || !tab.url.startsWith('http') || !tab.id) return;

  const newUrl = buildSwapUrl(tab.url, domain, state.settings);
  await chrome.tabs.update(tab.id, { url: newUrl });
}
