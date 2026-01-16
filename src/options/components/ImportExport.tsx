import React, { useRef, useState } from 'react';
import { Download, Upload, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useStore } from '~/store';
import { validateImportData } from '~/lib/validators';

export function ImportExport() {
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportData = useStore((state) => state.exportData);
  const importData = useStore((state) => state.importData);
  const syncToCloud = useStore((state) => state.syncToCloud);
  const settings = useStore((state) => state.settings);

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `domain-swapper-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus({ type: 'success', message: 'Configuration exported successfully!' });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const validation = validateImportData(data);

        if (!validation.isValid) {
          setStatus({ type: 'error', message: validation.error || 'Invalid file format' });
          return;
        }

        importData(data);
        setStatus({ type: 'success', message: 'Configuration imported successfully!' });
      } catch {
        setStatus({ type: 'error', message: 'Failed to parse file. Ensure it is valid JSON.' });
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSyncToCloud = async () => {
    try {
      await syncToCloud();
      setStatus({ type: 'success', message: 'Synced to Chrome cloud storage!' });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Sync failed'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Backup & Restore</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <button onClick={handleExport} className="btn btn-primary">
              <Download className="h-4 w-4 mr-2" />
              Export Configuration
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Configuration
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Export your domains, folders, and settings to a JSON file for backup or transfer
            between browsers.
          </p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Cloud Sync</h3>
        <div className="space-y-4">
          <button
            onClick={handleSyncToCloud}
            disabled={!settings.syncEnabled}
            className="btn btn-secondary"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Now
          </button>

          {!settings.syncEnabled && (
            <p className="text-sm text-muted-foreground">
              Enable Chrome Sync in Preferences to use cloud backup.
            </p>
          )}
        </div>
      </div>

      {status && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg ${
            status.type === 'success'
              ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
              : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
}
