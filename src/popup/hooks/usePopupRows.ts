import { useMemo } from 'react';
import Fuse from 'fuse.js';
import type { Domain, Folder, ProfileDomainEntry } from '~/types';
import { useStore, getDomainsByFolder, getRootFolders, getChildFolders } from '~/store';
import type { EnvironmentMatch } from './useEnvironmentDetection';

export type PopupRow =
  | { kind: 'domain'; id: string; domain: Domain }
  | { kind: 'profile-entry'; id: string; entry: ProfileDomainEntry };

export interface PopupRows {
  /** True when the search box has a non-empty query. */
  isSearching: boolean;
  /** IDs of domains matching the query, or null when not searching. */
  matchedDomainIds: Set<string> | null;
  /** Folders that should render. While searching, only folders whose subtree has a match. */
  visibleFolderIds: Set<string>;
  /** Every swappable row in exact on-screen order (for keyboard navigation). */
  rows: PopupRow[];
  /** Number of matching domains while searching (0 otherwise). */
  matchCount: number;
}

/**
 * The single source of truth for what the popup displays and in what order.
 *
 * Render order mirrors the component tree exactly:
 *   1. Environment ladder entries (hidden while searching)
 *   2. Root folders in order; inside each: child folders, then domains
 *      (collapsed folders contribute no rows unless searching)
 *   3. Uncategorized domains
 */
export function usePopupRows(searchQuery: string, envMatch: EnvironmentMatch | null): PopupRows {
  const domains = useStore((state) => state.domains);
  const folders = useStore((state) => state.folders);

  const fuse = useMemo(
    () =>
      new Fuse(domains, {
        keys: ['url', 'label'],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [domains]
  );

  return useMemo(() => {
    const query = searchQuery.trim();
    const isSearching = query.length > 0;

    const matchedDomainIds = isSearching
      ? new Set(fuse.search(query).map((r) => r.item.id))
      : null;

    const matches = (d: Domain) => !matchedDomainIds || matchedDomainIds.has(d.id);
    const toRow = (domain: Domain): PopupRow => ({ kind: 'domain', id: domain.id, domain });

    const visibleFolderIds = new Set<string>();
    const rows: PopupRow[] = [];

    if (!isSearching && envMatch) {
      for (const entry of envMatch.otherEntries) {
        rows.push({ kind: 'profile-entry', id: entry.id, entry });
      }
    }

    const walk = (folder: Folder): { rows: PopupRow[]; hasContent: boolean } => {
      const children = getChildFolders(folders, folder.id);
      const ownDomains = getDomainsByFolder(domains, folder.id).filter(matches);
      const childResults = children.map(walk);
      const hasContent = ownDomains.length > 0 || childResults.some((r) => r.hasContent);

      if (isSearching && !hasContent) {
        return { rows: [], hasContent: false };
      }

      visibleFolderIds.add(folder.id);

      const isOpen = isSearching || !folder.isCollapsed;
      if (!isOpen) {
        return { rows: [], hasContent };
      }

      return {
        rows: [...childResults.flatMap((r) => r.rows), ...ownDomains.map(toRow)],
        hasContent,
      };
    };

    for (const folder of getRootFolders(folders)) {
      rows.push(...walk(folder).rows);
    }

    for (const domain of getDomainsByFolder(domains, null).filter(matches)) {
      rows.push(toRow(domain));
    }

    const matchCount = isSearching ? rows.filter((r) => r.kind === 'domain').length : 0;

    return { isSearching, matchedDomainIds, visibleFolderIds, rows, matchCount };
  }, [domains, folders, fuse, searchQuery, envMatch]);
}
