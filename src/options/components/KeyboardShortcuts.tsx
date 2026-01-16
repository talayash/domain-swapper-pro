import { Keyboard } from 'lucide-react';
import { useStore } from '~/store';

export function KeyboardShortcuts() {
  const settings = useStore((state) => state.settings);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Keyboard className="h-5 w-5" />
        <p className="text-sm">
          Keyboard shortcuts can be customized in Chrome settings.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
          <div>
            <p className="font-medium">Open Popup</p>
            <p className="text-sm text-muted-foreground">
              Open the Domain Swapper popup
            </p>
          </div>
          <kbd className="px-3 py-1.5 bg-background border rounded-md text-sm font-mono">
            {settings.keyboardShortcuts.openPopup}
          </kbd>
        </div>

        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
          <div>
            <p className="font-medium">Quick Swap</p>
            <p className="text-sm text-muted-foreground">
              Swap to the last used domain
            </p>
          </div>
          <kbd className="px-3 py-1.5 bg-background border rounded-md text-sm font-mono">
            {settings.keyboardShortcuts.quickSwap}
          </kbd>
        </div>
      </div>

      <div className="pt-4 border-t">
        <a
          href="chrome://extensions/shortcuts"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-secondary"
          onClick={(e) => {
            e.preventDefault();
            chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
          }}
        >
          Configure Shortcuts in Chrome
        </a>
      </div>
    </div>
  );
}
