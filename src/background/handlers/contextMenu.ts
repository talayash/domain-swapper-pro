import type { Domain, Folder, Settings } from '~/types';
import { buildSwapUrl } from '~/lib/urlUtils';

const ROOT_MENU_ID = 'domain-swapper-root';
const STORAGE_KEY = 'domain-swapper-pro';

interface StoredState {
  domains: Domain[];
  folders: Folder[];
  settings: Settings;
  recentDomains: string[];
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

  if (!state || !state.domains || state.domains.length === 0) {
    chrome.contextMenus.create({
      id: 'no-domains',
      parentId: ROOT_MENU_ID,
      title: 'No domains configured',
      enabled: false,
      contexts: ['page', 'link']
    });
    return;
  }

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

export function handleContextMenuClick(
  info: chrome.contextMenus.OnClickData,
  tab?: chrome.tabs.Tab
) {
  if (!info.menuItemId.toString().startsWith('domain-')) return;

  const domainId = info.menuItemId.toString().replace('domain-', '');

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
