import type { StateCreator } from 'zustand';
import type { Domain, DomainInput } from '~/types';
import { v4 as uuidv4 } from 'uuid';

export interface DomainsSlice {
  domains: Domain[];
  recentDomains: string[];
  addDomain: (input: DomainInput) => Domain;
  updateDomain: (id: string, updates: Partial<DomainInput>) => void;
  deleteDomain: (id: string) => void;
  reorderDomains: (folderId: string | null, orderedIds: string[]) => void;
  moveDomainToFolder: (domainId: string, folderId: string | null) => void;
  addToRecent: (domainId: string) => void;
}

export const createDomainsSlice: StateCreator<DomainsSlice, [], [], DomainsSlice> = (set, get) => ({
  domains: [],
  recentDomains: [],

  addDomain: (input) => {
    const folderId = input.folderId ?? null;
    const domainsInFolder = get().domains.filter((d) => d.folderId === folderId);
    const maxOrder = domainsInFolder.length > 0
      ? Math.max(...domainsInFolder.map((d) => d.order))
      : -1;

    const cleanedIgnorePaths = input.ignorePaths
      ?.map((p) => p.trim().replace(/^\/+/, ''))
      .filter((p) => p.length > 0);

    const newDomain: Domain = {
      id: uuidv4(),
      url: input.url.trim().replace(/\/+$/, ''),
      label: input.label?.trim(),
      folderId,
      protocol: input.protocol || 'preserve',
      ignorePaths: cleanedIgnorePaths && cleanedIgnorePaths.length > 0 ? cleanedIgnorePaths : undefined,
      order: maxOrder + 1,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    set((state) => ({
      domains: [...state.domains, newDomain]
    }));

    return newDomain;
  },

  updateDomain: (id, updates) => {
    const cleanedIgnorePaths = updates.ignorePaths !== undefined
      ? updates.ignorePaths
          ?.map((p) => p.trim().replace(/^\/+/, ''))
          .filter((p) => p.length > 0)
      : undefined;

    set((state) => ({
      domains: state.domains.map((domain) =>
        domain.id === id
          ? {
              ...domain,
              ...updates,
              url: updates.url ? updates.url.trim().replace(/\/+$/, '') : domain.url,
              label: updates.label !== undefined ? updates.label?.trim() : domain.label,
              ignorePaths: cleanedIgnorePaths !== undefined
                ? (cleanedIgnorePaths && cleanedIgnorePaths.length > 0 ? cleanedIgnorePaths : undefined)
                : domain.ignorePaths,
              updatedAt: Date.now()
            }
          : domain
      )
    }));
  },

  deleteDomain: (id) => {
    set((state) => ({
      domains: state.domains.filter((domain) => domain.id !== id),
      recentDomains: state.recentDomains.filter((rid) => rid !== id)
    }));
  },

  reorderDomains: (folderId, orderedIds) => {
    set((state) => ({
      domains: state.domains.map((domain) => {
        if (domain.folderId !== folderId) return domain;
        const newOrder = orderedIds.indexOf(domain.id);
        if (newOrder === -1) return domain;
        return { ...domain, order: newOrder, updatedAt: Date.now() };
      })
    }));
  },

  moveDomainToFolder: (domainId, folderId) => {
    const domainsInFolder = get().domains.filter((d) => d.folderId === folderId);
    const maxOrder = domainsInFolder.length > 0
      ? Math.max(...domainsInFolder.map((d) => d.order))
      : -1;

    set((state) => ({
      domains: state.domains.map((domain) =>
        domain.id === domainId
          ? { ...domain, folderId, order: maxOrder + 1, updatedAt: Date.now() }
          : domain
      )
    }));
  },

  addToRecent: (domainId) => {
    set((state) => {
      const filtered = state.recentDomains.filter((id) => id !== domainId);
      return {
        recentDomains: [domainId, ...filtered].slice(0, 5)
      };
    });
  }
});
