import type { EnvironmentRole, Profile } from '~/types';
import { ENVIRONMENT_ROLES } from '~/types';
import { getHostKey, isSwappableUrl } from '~/lib/urlUtils';

const STORAGE_KEY = 'domain-swapper-pro';

interface StoredState {
  profiles?: Profile[];
}

function matchUrlToProfile(
  currentUrl: string,
  profiles: Profile[]
): { role: EnvironmentRole } | null {
  try {
    const currentHost = getHostKey(currentUrl);

    for (const profile of profiles) {
      for (const entry of profile.entries) {
        if (getHostKey(entry.url) === currentHost) {
          return { role: entry.role };
        }
      }
    }
  } catch {
    // Invalid URL
  }

  return null;
}

async function clearBadge(tabId: number) {
  try {
    await chrome.action.setBadgeText({ tabId, text: '' });
  } catch {
    // Tab may have been closed
  }
}

export async function updateBadgeForTab(tabId: number, url: string | undefined) {
  // Non-http pages (chrome://, file://, new tab) can never match a profile.
  // Clear explicitly so a badge from a previous page doesn't linger.
  if (!isSwappableUrl(url)) {
    await clearBadge(tabId);
    return;
  }

  try {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    const state: StoredState | undefined = result[STORAGE_KEY];

    if (!state?.profiles || state.profiles.length === 0) {
      await clearBadge(tabId);
      return;
    }

    const match = matchUrlToProfile(url, state.profiles);

    if (match) {
      const roleConfig = ENVIRONMENT_ROLES[match.role];
      await chrome.action.setBadgeBackgroundColor({ tabId, color: roleConfig.dotColor });
      await chrome.action.setBadgeText({ tabId, text: roleConfig.shortLabel });
    } else {
      await clearBadge(tabId);
    }
  } catch {
    // Tab may have been closed
  }
}

export function setupBadgeListeners() {
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url || changeInfo.status === 'complete') {
      updateBadgeForTab(tabId, tab.url);
    }
  });

  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await chrome.tabs.get(activeInfo.tabId);
      updateBadgeForTab(activeInfo.tabId, tab.url);
    } catch {
      // Tab may not exist
    }
  });

  // Re-evaluate badge when storage changes (profiles updated)
  chrome.storage.onChanged.addListener(async (changes, areaName) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab?.id) {
          updateBadgeForTab(tab.id, tab.url);
        }
      } catch {
        // No active tab
      }
    }
  });
}
