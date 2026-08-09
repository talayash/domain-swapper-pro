import type { Domain, Folder, Profile, Settings } from '~/types';
import { ENVIRONMENT_ROLES } from '~/types';
import { buildSwapUrl } from '~/lib/urlUtils';

const ROOT_MENU_ID = 'domain-swapper-root';
const STORAGE_KEY = 'domain-swapper-pro';

interface StoredState {
  domains: Domain[];
  folders: Folder[];
  settings: Settings;
  recentDomains: string[];
  profiles: Profile[];
}

export function setupContextMenus() {
  chrome.contextMenus.create({
    id: ROOT_MENU_ID,
    title: 'Swap Domain',
    contexts: ['page', 'link']
  });

  updateContextMenuItems();

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes[STORAGE_KEY]) {
      updateContextMenuItems();
    }
  });
}

async function updateContextMenuItems() {
  await chrome.contextMenus.removeAll();

  chrome.contextMenus.create({
    id: ROOT_MENU_ID,
    title: 'Swap Domain',
    contexts: ['page', 'link']
  });

  const result = await chrome.storage.local.get([STORAGE_KEY]);
  const state: StoredState | undefined = result[STORAGE_KEY];

  if (!state) {
    chrome.contextMenus.create({
      id: 'no-domains',
      parentId: ROOT_MENU_ID,
      title: 'No domains configured',
      enabled: false,
      contexts: ['page', 'link']
    });
    return;
  }

  const hasProfiles = state.profiles && state.profiles.length > 0;
  const hasDomains = state.domains && state.domains.length > 0;

  if (!hasProfiles && !hasDomains) {
    chrome.contextMenus.create({
      id: 'no-domains',
      parentId: ROOT_MENU_ID,
      title: 'No domains configured',
      enabled: false,
      contexts: ['page', 'link']
    });
    return;
  }

  // Add profiles first
  if (hasProfiles) {
    for (const profile of state.profiles) {
      chrome.contextMenus.create({
        id: `profile-${profile.id}`,
        parentId: ROOT_MENU_ID,
        title: `⚡ ${profile.name}`,
        contexts: ['page', 'link']
      });

      const sortedEntries = [...profile.entries].sort((a, b) => a.order - b.order);
      for (const entry of sortedEntries) {
        const roleConfig = ENVIRONMENT_ROLES[entry.role];
        chrome.contextMenus.create({
          id: `profile-entry:${profile.id}::${entry.id}`,
          parentId: `profile-${profile.id}`,
          title: `${roleConfig.shortLabel} — ${entry.label || entry.url}`,
          contexts: ['page', 'link']
        });
      }
    }
  }

  // Separator between profiles and domains
  if (hasProfiles && hasDomains) {
    chrome.contextMenus.create({
      id: 'profile-domain-separator',
      parentId: ROOT_MENU_ID,
      type: 'separator',
      contexts: ['page', 'link']
    });
  }

  // Existing folder/domain menus
  if (hasDomains) {
    const rootFolders = (state.folders || [])
      .filter((f) => f.parentId === null)
      .sort((a, b) => a.order - b.order);

    for (const folder of rootFolders) {
      const domainsInFolder = state.domains
        .filter((d) => d.folderId === folder.id)
        .sort((a, b) => a.order - b.order);

      if (domainsInFolder.length === 0) continue;

      chrome.contextMenus.create({
        id: `folder-${folder.id}`,
        parentId: ROOT_MENU_ID,
        title: `${folder.icon || '📁'} ${folder.name}`,
        contexts: ['page', 'link']
      });

      for (const domain of domainsInFolder) {
        chrome.contextMenus.create({
          id: `domain-${domain.id}`,
          parentId: `folder-${folder.id}`,
          title: domain.label || domain.url,
          contexts: ['page', 'link']
        });
      }
    }

    const uncategorizedDomains = state.domains
      .filter((d) => d.folderId === null)
      .sort((a, b) => a.order - b.order);

    if (uncategorizedDomains.length > 0 && rootFolders.length > 0) {
      chrome.contextMenus.create({
        id: 'separator',
        parentId: ROOT_MENU_ID,
        type: 'separator',
        contexts: ['page', 'link']
      });
    }

    for (const domain of uncategorizedDomains) {
      chrome.contextMenus.create({
        id: `domain-${domain.id}`,
        parentId: ROOT_MENU_ID,
        title: domain.label || domain.url,
        contexts: ['page', 'link']
      });
    }
  }
}

export function handleContextMenuClick(
  info: chrome.contextMenus.OnClickData,
  tab?: chrome.tabs.Tab
) {
  const menuItemId = info.menuItemId.toString();

  // Handle profile entry clicks
  if (menuItemId.startsWith('profile-entry:')) {
    handleProfileEntryClick(menuItemId, info, tab);
    return;
  }

  // Handle domain clicks
  if (menuItemId.startsWith('domain-')) {
    handleDomainClick(menuItemId, info, tab);
    return;
  }
}

function handleProfileEntryClick(
  menuItemId: string,
  info: chrome.contextMenus.OnClickData,
  tab?: chrome.tabs.Tab
) {
  const [profileId, entryId] = menuItemId.slice('profile-entry:'.length).split('::');
  if (!profileId || !entryId) return;

  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const state: StoredState | undefined = result[STORAGE_KEY];
    if (!state?.profiles) return;

    const profile = state.profiles.find((p) => p.id === profileId);
    if (!profile) return;

    const entry = profile.entries.find((e) => e.id === entryId);
    if (!entry) return;

    const currentUrl = info.linkUrl || info.pageUrl || tab?.url;
    if (!currentUrl || !currentUrl.startsWith('http')) return;

    // Build a temporary Domain-like object for buildSwapUrl
    const tempDomain: Domain = {
      id: entry.id,
      url: entry.url,
      label: entry.label,
      folderId: null,
      protocol: entry.protocol || 'preserve',
      order: 0,
      createdAt: 0,
      updatedAt: 0,
    };

    const newUrl = buildSwapUrl(currentUrl, tempDomain, state.settings);

    if (tab?.id) {
      chrome.tabs.update(tab.id, { url: newUrl });
    }
  });
}

function handleDomainClick(
  menuItemId: string,
  info: chrome.contextMenus.OnClickData,
  tab?: chrome.tabs.Tab
) {
  const domainId = menuItemId.replace('domain-', '');

  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const state: StoredState | undefined = result[STORAGE_KEY];
    if (!state) return;

    const domain = state.domains.find((d) => d.id === domainId);
    if (!domain) return;

    const currentUrl = info.linkUrl || info.pageUrl || tab?.url;
    if (!currentUrl || !currentUrl.startsWith('http')) return;

    const newUrl = buildSwapUrl(currentUrl, domain, state.settings);

    if (tab?.id) {
      chrome.tabs.update(tab.id, { url: newUrl });

      const recentDomains = [
        domainId,
        ...(state.recentDomains || []).filter((id) => id !== domainId)
      ].slice(0, 5);

      chrome.storage.local.set({
        [STORAGE_KEY]: { ...state, recentDomains }
      });
    }
  });
}
