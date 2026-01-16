import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { useStore, getDomainsByFolder } from '~/store';
import type { Domain } from '~/types';

interface UseDomainSearchOptions {
  searchQuery: string;
  folderId?: string | null;
}

export function useDomainSearch({ searchQuery, folderId }: UseDomainSearchOptions) {
  const domains = useStore((state) => state.domains);

  const fuse = useMemo(() => {
    return new Fuse(domains, {
      keys: ['url', 'label'],
      threshold: 0.4,
      ignoreLocation: true
    });
  }, [domains]);

  const filteredDomains = useMemo(() => {
    if (!searchQuery.trim()) {
      if (folderId !== undefined) {
        return getDomainsByFolder(domains, folderId);
      }
      return domains;
    }

    const results = fuse.search(searchQuery);
    const matchedDomains = results.map((r) => r.item);

    if (folderId !== undefined) {
      return matchedDomains.filter((d) => d.folderId === folderId);
    }

    return matchedDomains;
  }, [domains, searchQuery, folderId, fuse]);

  return filteredDomains;
}

export function useDomainsByFolder(folderId: string | null): Domain[] {
  const domains = useStore((state) => state.domains);

  return useMemo(() => {
    return getDomainsByFolder(domains, folderId);
  }, [domains, folderId]);
}

export function useRecentDomains(): Domain[] {
  const domains = useStore((state) => state.domains);
  const recentDomainIds = useStore((state) => state.recentDomains);

  return useMemo(() => {
    return recentDomainIds
      .map((id) => domains.find((d) => d.id === id))
      .filter((d): d is Domain => d !== undefined);
  }, [domains, recentDomainIds]);
}
