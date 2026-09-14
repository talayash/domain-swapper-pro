import { useMemo } from 'react';
import { useStore, getDomainsByFolder } from '~/store';
import type { Domain } from '~/types';

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
