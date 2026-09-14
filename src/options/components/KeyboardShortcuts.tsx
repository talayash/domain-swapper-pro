import { useEffect, useState } from 'react';
import { Keyboard, ExternalLink } from 'lucide-react';
import { DEFAULT_SETTINGS } from '~/types';

interface ShortcutRow {
  command: string;
  title: string;
  description: string;
  fallback: string;
}

// `_execute_action` is Chrome's reserved command that opens the popup.
const SHORTCUT_ROWS: ShortcutRow[] = [
  {
    command: '_execute_action',
    title: 'Open Popup',
    description: 'Open the Domain Swapper popup',
    fallback: DEFAULT_SETTINGS.keyboardShortcuts.openPopup,
  },
  {
    command: 'quick-swap',
    title: 'Quick Swap',
    description: 'Swap to the last used domain',
    fallback: DEFAULT_SETTINGS.keyboardShortcuts.quickSwap,
  },
];

const POPUP_KEYS: Array<{ keys: string[]; action: string }> = [
  { keys: ['↑', '↓'], action: 'Move between domains' },
  { keys: ['↵'], action: 'Swap current tab to the highlighted domain' },
  { keys: ['Ctrl', '↵'], action: 'Open the swapped URL in a new tab' },
  { keys: ['Esc'], action: 'Clear the search, then close the popup' },
];

export function KeyboardShortcuts() {
  // Read the shortcuts Chrome actually has bound rather than our defaults,
  // since users can rebind them at chrome://extensions/shortcuts.
  const [bound, setBound] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    chrome.commands.getAll((commands) => {
      const map: Record<string, string> = {};
      for (const command of commands) {
        if (command.name) map[command.name] = command.shortcut ?? '';
      }
      setBound(map);
    });
  }, []);

  const renderShortcut = (row: ShortcutRow) => {
    if (bound === null) {
      return <kbd className="shortcut-key opacity-50">{row.fallback}</kbd>;
    }
    const shortcut = bound[row.command];
    if (!shortcut) {
      return <span className="text-xs text-muted-foreground italic">Not set</span>;
    }
    return <kbd className="shortcut-key">{shortcut}</kbd>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Keyboard className="h-5 w-5" />
        <p className="text-sm">
          Global shortcuts are managed by Chrome. Change them from the shortcuts page linked below.
        </p>
      </div>

      <div className="space-y-3">
        {SHORTCUT_ROWS.map((row) => (
          <div key={row.command} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
            <div>
              <p className="font-medium">{row.title}</p>
              <p className="text-sm text-muted-foreground">{row.description}</p>
            </div>
            {renderShortcut(row)}
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Inside the popup</h3>
        <div className="border rounded-lg divide-y">
          {POPUP_KEYS.map((item) => (
            <div key={item.action} className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm text-muted-foreground">{item.action}</span>
              <span className="flex items-center gap-1">
                {item.keys.map((key, i) => (
                  <span key={key} className="flex items-center gap-1">
                    {i > 0 && <span className="text-xs text-muted-foreground">+</span>}
                    <kbd className="shortcut-key">{key}</kbd>
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Ctrl+click or middle-click a domain to open it in a new tab.
        </p>
      </div>

      <div className="pt-4 border-t">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => chrome.tabs.create({ url: 'chrome://extensions/shortcuts' })}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Configure Shortcuts in Chrome
        </button>
      </div>
    </div>
  );
}
