import { useMemo } from 'react';
import type { Profile, ProfileDomainEntry, EnvironmentRole } from '~/types';
import { useStore } from '~/store';
import { parseDomainInput } from '~/lib/urlUtils';

export interface EnvironmentMatch {
  profile: Profile;
  currentEntry: ProfileDomainEntry;
  otherEntries: ProfileDomainEntry[];
}

function getHostKey(url: string): string {
  const parsed = parseDomainInput(url);
  return parsed.hostname + (parsed.port ? ':' + parsed.port : '');
}

export function useEnvironmentDetection(currentTabUrl: string | null): EnvironmentMatch | null {
  const profiles = useStore((state) => state.profiles);

  return useMemo(() => {
    if (!currentTabUrl || !currentTabUrl.startsWith('http')) return null;

    try {
      const currentHost = new URL(currentTabUrl).hostname +
        (new URL(currentTabUrl).port ? ':' + new URL(currentTabUrl).port : '');

      for (const profile of profiles) {
        for (const entry of profile.entries) {
          const entryHost = getHostKey(entry.url);
          if (currentHost === entryHost) {
            const otherEntries = profile.entries
              .filter((e) => e.id !== entry.id)
              .sort((a, b) => a.order - b.order);
            return { profile, currentEntry: entry, otherEntries };
          }
        }
      }
    } catch {
      // Invalid URL
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
        const entryHost = getHostKey(entry.url);
        if (domainHost === entryHost) {
          return { role: entry.role, profileName: profile.name };
        }
      }
    }

    return null;
  }, [domainUrl, profiles]);
}
