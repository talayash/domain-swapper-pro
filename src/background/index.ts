import {
  rebuildContextMenus,
  registerContextMenuListeners,
  handleContextMenuClick
} from './handlers/contextMenu';
import { handleCommand } from './handlers/commands';
import { setupBadgeListeners } from './handlers/badge';

// MV3 service workers are suspended when idle and re-run from the top when
// woken. Every listener must therefore be registered at module top level;
// anything registered inside an `onInstalled` callback is lost on wake.

chrome.runtime.onInstalled.addListener(() => {
  rebuildContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  rebuildContextMenus();
});

chrome.contextMenus.onClicked.addListener(handleContextMenuClick);

chrome.commands.onCommand.addListener(handleCommand);

registerContextMenuListeners();
setupBadgeListeners();

export {};
