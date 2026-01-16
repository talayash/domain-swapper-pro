import { create } from 'zustand';
import type { Domain, Folder, AppState } from '~/types';
import { DEFAULT_SETTINGS, DEFAULT_FOLDERS } from '~/types';
import { createDomainsSlice, type DomainsSlice } from './slices/domains';
import { createFoldersSlice, type FoldersSlice } from './slices/folders';
import { createSettingsSlice, type SettingsSlice } from './slices/settings';
import { chromeStorage, loadFromStorage, syncToCloudStorage } from './middleware/chromeStorage';
import { migrateData, getExportData } from '~/lib/migrations';

const STORAGE_KEY = 'domain-swapper-pro';

export type StoreState = DomainsSlice & FoldersSlice & SettingsSlice & {
  isLoaded: boolean;
  loadState: () => Promise<void>;
  importData: (data: unknown) => void;
  exportData: () => object;
  syncToCloud: () => Promise<void>;
};

export const useStore = create<StoreState>()(
  chromeStorage(
    (set, get, api) => ({
      ...createDomainsSlice(set, get, api),
      ...createFoldersSlice(set, get, api),
      ...createSettingsSlice(set, get, api),

      isLoaded: false,

      loadState: async () => {
        const stored = await loadFromStorage<AppState>(STORAGE_KEY);

        if (stored) {
          const migrated = migrateData(stored);
          set({
            domains: migrated.domains,
            folders: migrated.folders.length > 0 ? migrated.folders : [...DEFAULT_FOLDERS],
            settings: migrated.settings,
            recentDomains: migrated.recentDomains,
            isLoaded: true
          });
        } else {
          set({
            domains: [],
            folders: [...DEFAULT_FOLDERS],
            settings: { ...DEFAULT_SETTINGS },
            recentDomains: [],
            isLoaded: true
          });
        }
      },

      importData: (data) => {
        const migrated = migrateData(data as AppState);
        set({
          domains: migrated.domains,
          folders: migrated.folders.length > 0 ? migrated.folders : [...DEFAULT_FOLDERS],
          settings: migrated.settings,
          recentDomains: migrated.recentDomains
        });
      },

      exportData: () => {
        const state = get();
        return getExportData({
          domains: state.domains,
          folders: state.folders,
          settings: state.settings,
          recentDomains: state.recentDomains
        });
      },

      syncToCloud: async () => {
        const state = get();
        const data: AppState = {
          domains: state.domains,
          folders: state.folders,
          settings: state.settings,
          recentDomains: state.recentDomains
        };
        await syncToCloudStorage(STORAGE_KEY, data);
      }
    }),
    { key: STORAGE_KEY, throttleMs: 500 }
  )
);

export const getDomainsByFolder = (domains: Domain[], folderId: string | null): Domain[] => {
  return domains
    .filter((d) => d.folderId === folderId)
    .sort((a, b) => a.order - b.order);
};

export const getRootFolders = (folders: Folder[]): Folder[] => {
  return folders
    .filter((f) => f.parentId === null)
    .sort((a, b) => a.order - b.order);
};

export const getChildFolders = (folders: Folder[], parentId: string): Folder[] => {
  return folders
    .filter((f) => f.parentId === parentId)
    .sort((a, b) => a.order - b.order);
};
