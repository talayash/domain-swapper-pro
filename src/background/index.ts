import { setupContextMenus, handleContextMenuClick } from './handlers/contextMenu';
import { handleCommand } from './handlers/commands';

chrome.runtime.onInstalled.addListener(() => {
  setupContextMenus();
});

chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

chrome.commands.onCommand.addListener(handleCommand);

export {};
