import { useMemo } from 'react';
import type { Profile, ProfileDomainEntry, EnvironmentRole } from '~/types';
import { useStore } from '~/store';
import { getHostKey, isSwappableUrl } from '~/lib/urlUtils';

export interface EnvironmentMatch {
  profile: Profile;
  currentEntry: ProfileDomainEntry;
  otherEntries: ProfileDomainEntry[];
}

export function useEnvironmentDetection(currentTabUrl: string | null): EnvironmentMatch | null {
  const profiles = useStore((state) => state.profiles);

  return useMemo(() => {
    if (!isSwappableUrl(currentTabUrl)) return null;

    const currentHost = getHostKey(currentTabUrl);

    for (const profile of profiles) {
      for (const entry of profile.entries) {
        if (getHostKey(entry.url) === currentHost) {
          const otherEntries = profile.entries
            .filter((e) => e.id !== entry.id)
            .sort((a, b) => a.order - b.order);
          return { profile, currentEntry: entry, otherEntries };
        }
      }
    }

    return null;
  }, [currentTabUrl, profiles]);
}

export function useProfileRoleForDomain(domainUrl: string): { role: EnvironmentRole; profileName: string } | null {
  const profiles = useStore((state) => state.profiles);

  return useMemo(() => {
    const domainHost = getHostKey(domainUrl);

    for (const profile of profiles) {
      for (const entry of profile.entries) {
        if (getHostKey(entry.url) === domainHost) {
          return { role: entry.role, profileName: profile.name };
        }
      }
    }

    return null;
  }, [domainUrl, profiles]);
}
