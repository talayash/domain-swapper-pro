export interface Domain {
  id: string;
  url: string;
  label?: string;
  folderId: string | null;
  protocol?: 'http' | 'https' | 'preserve';
  ignorePaths?: string[];
  order: number;
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  icon?: string;
  color?: string;
  isCollapsed: boolean;
  order: number;
  createdAt: number;
}

/** Where a swapped URL is opened. */
export type SwapTarget = 'current' | 'newTab' | 'newWindow';

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  forceHttps: boolean;
  showProtocol: boolean;
  /** Default target for a plain click / Enter. Modifier keys override it per swap. */
  openBehavior: SwapTarget;
  defaultFolderId: string | null;
  keyboardShortcuts: {
    openPopup: string;
    quickSwap: string;
  };
  syncEnabled: boolean;
}

export type EnvironmentRole = 'production' | 'staging' | 'qa' | 'dev' | 'local' | 'custom';

export interface EnvironmentRoleConfig {
  label: string;
  color: string;
  shortLabel: string;
  dotColor: string;
}

export const ENVIRONMENT_ROLES: Record<EnvironmentRole, EnvironmentRoleConfig> = {
  production: { label: 'Production', color: 'green', shortLabel: 'PROD', dotColor: '#22c55e' },
  staging:    { label: 'Staging',    color: 'yellow', shortLabel: 'STG', dotColor: '#eab308' },
  qa:         { label: 'QA',         color: 'blue', shortLabel: 'QA', dotColor: '#3b82f6' },
  dev:        { label: 'Dev',        color: 'red', shortLabel: 'DEV', dotColor: '#ef4444' },
  local:      { label: 'Local',      color: 'gray', shortLabel: 'LOCAL', dotColor: '#6b7280' },
  custom:     { label: 'Custom',     color: 'purple', shortLabel: 'CUSTOM', dotColor: '#a855f7' },
};

export interface ProfileDomainEntry {
  id: string;
  url: string;
  label?: string;
  role: EnvironmentRole;
  protocol?: 'http' | 'https' | 'preserve';
  order: number;
}

export interface Profile {
  id: string;
  name: string;
  description?: string;
  entries: ProfileDomainEntry[];
  createdAt: number;
  updatedAt: number;
}

export interface ProfileInput {
  name: string;
  description?: string;
  entries: Omit<ProfileDomainEntry, 'id' | 'order'>[];
}

export interface AppState {
  domains: Domain[];
  folders: Folder[];
  settings: Settings;
  recentDomains: string[];
  profiles: Profile[];
}

export interface ParsedDomain {
  protocol: 'http' | 'https' | null;
  hostname: string;
  port: string | null;
  full: string;
}

export interface DomainInput {
  url: string;
  label?: string;
  folderId?: string | null;
  protocol?: 'http' | 'https' | 'preserve';
  ignorePaths?: string[];
}

export interface FolderInput {
  name: string;
  parentId?: string | null;
  icon?: string;
  color?: string;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  forceHttps: false,
  showProtocol: true,
  openBehavior: 'current',
  defaultFolderId: null,
  keyboardShortcuts: {
    openPopup: 'Alt+D',
    quickSwap: 'Alt+Shift+D'
  },
  syncEnabled: false
};

export const DEFAULT_FOLDERS: Folder[] = [
  {
    id: 'development',
    name: 'Development',
    parentId: null,
    icon: '🛠️',
    isCollapsed: false,
    order: 0,
    createdAt: Date.now()
  },
  {
    id: 'staging',
    name: 'Staging/QA',
    parentId: null,
    icon: '🧪',
    isCollapsed: false,
    order: 1,
    createdAt: Date.now()
  },
  {
    id: 'production',
    name: 'Production',
    parentId: null,
    icon: '🚀',
    isCollapsed: false,
    order: 2,
    createdAt: Date.now()
  }
];
