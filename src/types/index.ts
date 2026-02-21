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

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  forceHttps: boolean;
  showProtocol: boolean;
  defaultFolderId: string | null;
  keyboardShortcuts: {
    openPopup: string;
    quickSwap: string;
  };
  syncEnabled: boolean;
}

export interface AppState {
  domains: Domain[];
  folders: Folder[];
  settings: Settings;
  recentDomains: string[];
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
