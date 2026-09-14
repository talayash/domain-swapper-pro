import type { StateCreator } from 'zustand';
import type { Folder, FolderInput } from '~/types';
import { DEFAULT_FOLDERS } from '~/types';
import { v4 as uuidv4 } from 'uuid';
import type { DomainsSlice } from './domains';

export interface FoldersSlice {
  folders: Folder[];
  addFolder: (input: FolderInput) => Folder;
  updateFolder: (id: string, updates: Partial<FolderInput>) => void;
  deleteFolder: (id: string) => void;
  toggleFolderCollapse: (id: string) => void;
  reorderFolders: (orderedIds: string[]) => void;
}

/**
 * Collect a folder and every folder nested beneath it, at any depth.
 */
export function collectFolderSubtreeIds(folders: Folder[], rootId: string): string[] {
  const result: string[] = [];
  const queue = [rootId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    result.push(currentId);
    for (const folder of folders) {
      if (folder.parentId === currentId) {
        queue.push(folder.id);
      }
    }
  }

  return result;
}

// The folders slice reads and writes `domains` when deleting a folder, so it
// is typed against the union of both slices (the Zustand "slices" pattern).
export const createFoldersSlice: StateCreator<
  FoldersSlice & Pick<DomainsSlice, 'domains'>,
  [],
  [],
  FoldersSlice
> = (set, get) => ({
  folders: [...DEFAULT_FOLDERS],

  addFolder: (input) => {
    const parentId = input.parentId ?? null;
    const foldersAtLevel = get().folders.filter((f) => f.parentId === parentId);
    const maxOrder = foldersAtLevel.length > 0
      ? Math.max(...foldersAtLevel.map((f) => f.order))
      : -1;

    const newFolder: Folder = {
      id: uuidv4(),
      name: input.name.trim(),
      parentId,
      icon: input.icon || '📁',
      color: input.color,
      isCollapsed: false,
      order: maxOrder + 1,
      createdAt: Date.now()
    };

    set((state) => ({
      folders: [...state.folders, newFolder]
    }));

    return newFolder;
  },

  updateFolder: (id, updates) => {
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === id
          ? {
              ...folder,
              ...updates,
              name: updates.name !== undefined ? updates.name.trim() : folder.name
            }
          : folder
      )
    }));
  },

  /**
   * Delete a folder and all nested subfolders. Domains that lived in any of
   * those folders are moved to Uncategorized (appended after existing ones)
   * rather than being orphaned with a dangling folderId.
   */
  deleteFolder: (id) => {
    set((state) => {
      const idsToDelete = new Set(collectFolderSubtreeIds(state.folders, id));

      const uncategorized = state.domains.filter((d) => d.folderId === null);
      let nextOrder = uncategorized.length > 0
        ? Math.max(...uncategorized.map((d) => d.order)) + 1
        : 0;

      const now = Date.now();
      const domains = state.domains.map((domain) => {
        if (domain.folderId === null || !idsToDelete.has(domain.folderId)) return domain;
        return { ...domain, folderId: null, order: nextOrder++, updatedAt: now };
      });

      return {
        folders: state.folders.filter((folder) => !idsToDelete.has(folder.id)),
        domains
      };
    });
  },

  toggleFolderCollapse: (id) => {
    set((state) => ({
      folders: state.folders.map((folder) =>
        folder.id === id ? { ...folder, isCollapsed: !folder.isCollapsed } : folder
      )
    }));
  },

  reorderFolders: (orderedIds) => {
    set((state) => ({
      folders: state.folders.map((folder) => {
        const newOrder = orderedIds.indexOf(folder.id);
        if (newOrder === -1) return folder;
        return { ...folder, order: newOrder };
      })
    }));
  }
});
