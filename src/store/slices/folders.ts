import type { StateCreator } from 'zustand';
import type { Folder, FolderInput } from '~/types';
import { DEFAULT_FOLDERS } from '~/types';
import { v4 as uuidv4 } from 'uuid';

export interface FoldersSlice {
  folders: Folder[];
  addFolder: (input: FolderInput) => Folder;
  updateFolder: (id: string, updates: Partial<FolderInput>) => void;
  deleteFolder: (id: string) => void;
  toggleFolderCollapse: (id: string) => void;
  reorderFolders: (orderedIds: string[]) => void;
}

export const createFoldersSlice: StateCreator<FoldersSlice, [], [], FoldersSlice> = (set, get) => ({
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

  deleteFolder: (id) => {
    set((state) => {
      const childFolderIds = state.folders
        .filter((f) => f.parentId === id)
        .map((f) => f.id);

      const allFolderIdsToDelete = [id, ...childFolderIds];

      return {
        folders: state.folders.filter((folder) => !allFolderIdsToDelete.includes(folder.id))
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
