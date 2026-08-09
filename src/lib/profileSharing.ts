import type { Profile, ProfileInput, EnvironmentRole } from '~/types';

const PREFIX = 'DSP1:';

const VALID_ROLES: EnvironmentRole[] = ['production', 'staging', 'qa', 'dev', 'local', 'custom'];

interface CompactEntry {
  u: string;
  r: EnvironmentRole;
  l?: string;
  p?: 'http' | 'https' | 'preserve';
}

interface CompactProfile {
  n: string;
  d?: string;
  e: CompactEntry[];
}

export function encodeProfile(profile: Profile): string {
  const compact: CompactProfile = {
    n: profile.name,
    e: profile.entries
      .sort((a, b) => a.order - b.order)
      .map((entry) => {
        const e: CompactEntry = { u: entry.url, r: entry.role };
        if (entry.label) e.l = entry.label;
        if (entry.protocol && entry.protocol !== 'preserve') e.p = entry.protocol;
        return e;
      }),
  };
  if (profile.description) compact.d = profile.description;

  const json = JSON.stringify(compact);
  return PREFIX + btoa(unescape(encodeURIComponent(json)));
}

export function decodeProfile(encoded: string): ProfileInput | null {
  try {
    if (!encoded.startsWith(PREFIX)) return null;

    const base64 = encoded.slice(PREFIX.length);
    const json = decodeURIComponent(escape(atob(base64)));
    const compact: CompactProfile = JSON.parse(json);

    if (!compact.n || typeof compact.n !== 'string') return null;
    if (!Array.isArray(compact.e) || compact.e.length === 0) return null;

    const entries: ProfileInput['entries'] = [];
    for (const e of compact.e) {
      if (!e.u || typeof e.u !== 'string') return null;
      if (!VALID_ROLES.includes(e.r)) return null;

      entries.push({
        url: e.u,
        role: e.r,
        label: e.l,
        protocol: e.p || 'preserve',
      });
    }

    return {
      name: compact.n,
      description: compact.d,
      entries,
    };
  } catch {
    return null;
  }
}

export function getEncodedSize(encoded: string): number {
  return encoded.length;
}
