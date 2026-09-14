import type { Domain, ParsedDomain, ProfileDomainEntry, Settings } from '~/types';

/**
 * Parse a user-entered domain string such as `example.com`,
 * `https://example.com:8080`, or even a full URL with a path.
 *
 * Hostnames are case-insensitive, so the hostname is always lowercased.
 * Anything after the host (path, query, hash) is dropped so callers can
 * safely pass full URLs as well as bare domains.
 */
export function parseDomainInput(input: string): ParsedDomain {
  const trimmed = input.trim().replace(/\/+$/, '');

  let protocol: 'http' | 'https' | null = null;
  let remainder = trimmed;

  if (/^https:\/\//i.test(trimmed)) {
    protocol = 'https';
    remainder = trimmed.slice(8);
  } else if (/^http:\/\//i.test(trimmed)) {
    protocol = 'http';
    remainder = trimmed.slice(7);
  }

  // Drop path / query / hash so `example.com/some/path` resolves to `example.com`
  const hostEnd = remainder.search(/[/?#]/);
  if (hostEnd !== -1) {
    remainder = remainder.slice(0, hostEnd);
  }

  const portMatch = remainder.match(/:(\d+)$/);
  let hostname = remainder;
  let port: string | null = null;

  if (portMatch) {
    port = portMatch[1];
    hostname = remainder.slice(0, -portMatch[0].length);
  }

  hostname = hostname.toLowerCase();

  const full = protocol
    ? `${protocol}://${hostname}${port ? ':' + port : ''}`
    : `${hostname}${port ? ':' + port : ''}`;

  return { protocol, hostname, port, full };
}

/**
 * Returns whether the input contains a path, query, or hash component
 * after the host. Used to give users a precise validation message.
 */
export function hasPathComponent(input: string): boolean {
  const withoutProtocol = input.trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  return /[/?#]/.test(withoutProtocol);
}

/**
 * Canonical matching key for environment detection: `hostname[:port]`,
 * lowercased. Protocol, path, query, and hash are intentionally ignored.
 *
 * Accepts both bare domain inputs (`Staging.Example.com:8080`) and full
 * URLs (`https://staging.example.com:8080/a/b?c`) and yields the same key.
 */
export function getHostKey(urlOrDomain: string): string {
  const parsed = parseDomainInput(urlOrDomain);
  return parsed.hostname + (parsed.port ? ':' + parsed.port : '');
}

/**
 * Adapt a profile entry into the `Domain` shape that `buildSwapUrl` expects.
 * Profile entries deliberately do not reference `Domain` records, so surfaces
 * that swap via a profile build this temporary object instead.
 */
export function profileEntryToDomain(entry: ProfileDomainEntry): Domain {
  return {
    id: entry.id,
    url: entry.url,
    label: entry.label,
    folderId: null,
    protocol: entry.protocol || 'preserve',
    order: entry.order,
    createdAt: 0,
    updatedAt: 0,
  };
}

export function buildSwapUrl(
  currentUrl: string,
  targetDomain: Domain,
  settings: Settings
): string {
  const current = new URL(currentUrl);
  const target = parseDomainInput(targetDomain.url);

  let newProtocol: string;

  if (settings.forceHttps) {
    newProtocol = 'https:';
  } else if (targetDomain.protocol === 'http') {
    newProtocol = 'http:';
  } else if (targetDomain.protocol === 'https') {
    newProtocol = 'https:';
  } else if (target.protocol) {
    newProtocol = `${target.protocol}:`;
  } else {
    newProtocol = current.protocol;
  }

  const newUrl = new URL(currentUrl);
  newUrl.protocol = newProtocol;
  newUrl.hostname = target.hostname;
  // Explicitly set or clear the port to handle all swap cases:
  // - From port URL to non-port URL (e.g., localhost:3000 → www.example.com)
  // - From non-port URL to port URL (e.g., www.example.com → localhost:3000)
  // - Between different ports (e.g., localhost:3000 → localhost:8080)
  newUrl.port = target.port || '';

  if (targetDomain.ignorePaths && targetDomain.ignorePaths.length > 0) {
    for (const ignorePath of targetDomain.ignorePaths) {
      const prefix = '/' + ignorePath;
      if (newUrl.pathname === prefix || newUrl.pathname.startsWith(prefix + '/')) {
        newUrl.pathname = newUrl.pathname.slice(prefix.length) || '/';
        break;
      }
    }
  }

  return newUrl.toString();
}

export function extractDisplayDomain(url: string, showProtocol: boolean): string {
  const parsed = parseDomainInput(url);

  if (showProtocol && parsed.protocol) {
    return parsed.full;
  }

  return `${parsed.hostname}${parsed.port ? ':' + parsed.port : ''}`;
}

export function normalizeUrl(input: string): string {
  return input.trim().replace(/\/+$/, '');
}

export function isSwappableUrl(url: string | null | undefined): url is string {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

export function getCurrentTab(): Promise<chrome.tabs.Tab | null> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0] ?? null);
    });
  });
}

export function getCurrentTabUrl(): Promise<string | null> {
  return getCurrentTab().then((tab) => tab?.url ?? null);
}

export function navigateToUrl(url: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.update(tabs[0].id, { url }, () => resolve());
      } else {
        resolve();
      }
    });
  });
}

/**
 * Open `url` in a new tab placed directly after the current tab and focus it.
 */
export function openUrlInNewTab(url: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const current = tabs[0];
      chrome.tabs.create(
        {
          url,
          active: true,
          index: current ? current.index + 1 : undefined,
          openerTabId: current?.id,
        },
        () => resolve()
      );
    });
  });
}
