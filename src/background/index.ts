import { setupContextMenus, handleContextMenuClick } from './handlers/contextMenu';
import { handleCommand } from './handlers/commands';
import { setupBadgeListeners } from './handlers/badge';

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
});

chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

chrome.commands.onCommand.addListener(handleCommand);

setupBadgeListeners();

export {};
