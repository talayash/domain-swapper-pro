import { useMemo } from 'react';
import { useStore, getRootFolders, getChildFolders } from '~/store';
import type { Folder } from '~/types';

export function useRootFolders(): Folder[] {
  const folders = useStore((state) => state.folders);

  return useMemo(() => {
    return getRootFolders(folders);
  }, [folders]);
}

export function useChildFolders(parentId: string): Folder[] {
  const folders = useStore((state) => state.folders);

  return useMemo(() => {
    return getChildFolders(folders, parentId);
  }, [folders, parentId]);
}

export function useFolderById(folderId: string | null): Folder | undefined {
  const folders = useStore((state) => state.folders);

  return useMemo(() => {
    if (!folderId) return undefined;
    return folders.find((f) => f.id === folderId);
  }, [folders, folderId]);
}

export function useFolderOptions(): Array<{ id: string | null; name: string }> {
  const folders = useStore((state) => state.folders);

  return useMemo(() => {
    const rootFolders = getRootFolders(folders);
    const options: Array<{ id: string | null; name: string }> = [
      { id: null, name: 'Uncategorized' }
    ];

    for (const folder of rootFolders) {
      options.push({ id: folder.id, name: folder.name });

      const children = getChildFolders(folders, folder.id);
      for (const child of children) {
        options.push({ id: child.id, name: `  ${child.name}` });
      }
    }

    return options;
  }, [folders]);
}
