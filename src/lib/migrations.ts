import type { AppState, Domain, Folder, Profile, Settings } from '~/types';
import { DEFAULT_SETTINGS, DEFAULT_FOLDERS } from '~/types';
import { v4 as uuidv4 } from 'uuid';

const CURRENT_VERSION = 2;

interface LegacyDomain {
  domain?: string;
  url?: string;
  name?: string;
}

interface StoredData {
  version?: number;
  domains?: (Domain | LegacyDomain)[];
  folders?: Folder[];
  settings?: Partial<Settings>;
  recentDomains?: string[];
  profiles?: Profile[];
}

export function migrateData(data: StoredData): AppState {
  const version = data.version || 0;

  let migratedData = { ...data };

  if (version < 1) {
    migratedData = migrateToV1(migratedData);
  }

  if (version < 2) {
    migratedData = migrateToV2(migratedData);
  }

  return {
    domains: (migratedData.domains as Domain[]) || [],
    folders: migratedData.folders || [...DEFAULT_FOLDERS],
    settings: { ...DEFAULT_SETTINGS, ...migratedData.settings },
    recentDomains: migratedData.recentDomains || [],
    profiles: migratedData.profiles || []
  };
}

function migrateToV1(data: StoredData): StoredData {
  const legacyDomains = data.domains || [];
  const migratedDomains: Domain[] = [];

  for (let i = 0; i < legacyDomains.length; i++) {
    const legacy = legacyDomains[i] as LegacyDomain & Partial<Domain>;

    if ('id' in legacy && 'url' in legacy && 'order' in legacy) {
      migratedDomains.push(legacy as Domain);
      continue;
    }

    const url = legacy.url || legacy.domain || '';
    if (!url) continue;

    const migratedDomain: Domain = {
      id: uuidv4(),
      url: url,
      label: legacy.name,
      folderId: null,
      protocol: 'preserve',
      order: i,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    migratedDomains.push(migratedDomain);
  }

  return {
    ...data,
    version: 1,
    domains: migratedDomains,
    folders: data.folders || [...DEFAULT_FOLDERS]
  };
}

function migrateToV2(data: StoredData): StoredData {
  return {
    ...data,
    version: 2,
    profiles: data.profiles || []
  };
}

export function getExportData(state: AppState): object {
  return {
    version: CURRENT_VERSION,
    exportedAt: new Date().toISOString(),
    domains: state.domains,
    folders: state.folders,
    settings: state.settings,
    profiles: state.profiles
  };
}
