import type { Profile } from '~/types';
import { ENVIRONMENT_ROLES } from '~/types';
import { parseDomainInput } from '~/lib/urlUtils';

const STORAGE_KEY = 'domain-swapper-pro';

interface StoredState {
  profiles?: Profile[];
}

function matchUrlToProfile(
  currentUrl: string,
  profiles: Profile[]
): { role: Profile['entries'][0]['role'] } | null {
  try {
    const current = new URL(currentUrl);
    const currentHost = current.hostname + (current.port ? ':' + current.port : '');

    for (const profile of profiles) {
      for (const entry of profile.entries) {
        const parsed = parseDomainInput(entry.url);
        const entryHost = parsed.hostname + (parsed.port ? ':' + parsed.port : '');
        if (currentHost === entryHost) {
          return { role: entry.role };
        }
      }
    }
  } catch {
    // Invalid URL
  }

  return null;
}

export async function updateBadgeForTab(tabId: number, url: string) {
  try {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    const state: StoredState | undefined = result[STORAGE_KEY];

    if (!state?.profiles || state.profiles.length === 0) {
      await chrome.action.setBadgeText({ tabId, text: '' });
      return;
    }

    const match = matchUrlToProfile(url, state.profiles);

    if (match) {
      const roleConfig = ENVIRONMENT_ROLES[match.role];
      await chrome.action.setBadgeBackgroundColor({ tabId, color: roleConfig.dotColor });
      await chrome.action.setBadgeText({ tabId, text: roleConfig.shortLabel });
    } else {
      await chrome.action.setBadgeText({ tabId, text: '' });
    }
  } catch {
    // Tab may have been closed
  }
}

export function setupBadgeListeners() {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url || changeInfo.status === 'complete') {
      if (tab.url && tab.url.startsWith('http')) {
        updateBadgeForTab(tabId, tab.url);
      }
    }
  });

  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      if (tab.url && tab.url.startsWith('http')) {
        updateBadgeForTab(activeInfo.tabId, tab.url);
      }
    } catch {
      // Tab may not exist
    }
  });

  // Re-evaluate badge when storage changes (profiles updated)
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id && tab.url && tab.url.startsWith('http')) {
          updateBadgeForTab(tab.id, tab.url);
        }
      } catch {
        // No active tab
      }
    }
  });
}
