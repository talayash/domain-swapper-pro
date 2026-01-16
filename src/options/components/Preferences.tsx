import * as Switch from '@radix-ui/react-switch';
import { useStore } from '~/store';

export function Preferences() {
  const settings = useStore((state) => state.settings);
  const updateSettings = useStore((state) => state.updateSettings);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Appearance</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as typeof settings.theme })}
              className="input w-48"
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Show Protocol</label>
              <p className="text-xs text-muted-foreground">
                Display http:// or https:// prefix in domain list
              </p>
            </div>
            <Switch.Root
              checked={settings.showProtocol}
              onCheckedChange={(checked) => updateSettings({ showProtocol: checked })}
              className="w-10 h-5 bg-secondary rounded-full relative data-[state=checked]:bg-primary transition-colors"
            >
              <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-5" />
            </Switch.Root>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Protocol Handling</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Force HTTPS</label>
              <p className="text-xs text-muted-foreground">
                Always use HTTPS when swapping domains (overrides domain settings)
              </p>
            </div>
            <Switch.Root
              checked={settings.forceHttps}
              onCheckedChange={(checked) => updateSettings({ forceHttps: checked })}
              className="w-10 h-5 bg-secondary rounded-full relative data-[state=checked]:bg-primary transition-colors"
            >
              <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-5" />
            </Switch.Root>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Sync</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Chrome Sync</label>
              <p className="text-xs text-muted-foreground">
                Sync settings across your Chrome browsers
              </p>
            </div>
            <Switch.Root
              checked={settings.syncEnabled}
              onCheckedChange={(checked) => updateSettings({ syncEnabled: checked })}
              className="w-10 h-5 bg-secondary rounded-full relative data-[state=checked]:bg-primary transition-colors"
            >
              <Switch.Thumb className="block w-4 h-4 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-5" />
            </Switch.Root>
          </div>
        </div>
      </div>
    </div>
  );
}
