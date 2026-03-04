import { useEffect, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Settings, Keyboard, Download } from 'lucide-react';
import { useStore } from '~/store';
import { Preferences } from './components/Preferences';
import { KeyboardShortcuts } from './components/KeyboardShortcuts';
import { ImportExport } from './components/ImportExport';
import '~/styles/globals.css';

function Options() {
  const [activeTab, setActiveTab] = useState('preferences');
  const isLoaded = useStore((state) => state.isLoaded);
  const loadState = useStore((state) => state.loadState);
  const theme = useStore((state) => state.settings.theme);

  useEffect(() => {
    loadState();
  }, [loadState]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-xl font-medium">Domain Swapper Pro</h1>
          <p className="text-sm text-muted-foreground mt-1">Settings</p>
        </div>

        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
          <Tabs.List className="flex gap-1 border-b mb-6">
            <Tabs.Trigger
              value="preferences"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-colors"
            >
              <Settings className="h-4 w-4" />
              Preferences
            </Tabs.Trigger>
            <Tabs.Trigger
              value="shortcuts"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-colors"
            >
              <Keyboard className="h-4 w-4" />
              Shortcuts
            </Tabs.Trigger>
            <Tabs.Trigger
              value="import-export"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary transition-colors"
            >
              <Download className="h-4 w-4" />
              Import / Export
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="preferences" className="outline-none">
            <Preferences />
          </Tabs.Content>

          <Tabs.Content value="shortcuts" className="outline-none">
            <KeyboardShortcuts />
          </Tabs.Content>

          <Tabs.Content value="import-export" className="outline-none">
            <ImportExport />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
}

export default Options;
