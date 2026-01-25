import type { Domain, ParsedDomain, Settings } from '~/types';

export function parseDomainInput(input: string): ParsedDomain {
  const trimmed = input.trim().replace(/\/+$/, '');

  let protocol: 'http' | 'https' | null = null;
  let remainder = trimmed;

  if (trimmed.startsWith('https://')) {
    protocol = 'https';
    remainder = trimmed.slice(8);
  } else if (trimmed.startsWith('http://')) {
    protocol = 'http';
    remainder = trimmed.slice(7);
  }

  const portMatch = remainder.match(/:(\d+)$/);
  let hostname = remainder;
  let port: string | null = null;

  if (portMatch) {
    port = portMatch[1];
    hostname = remainder.slice(0, -portMatch[0].length);
  }

  const full = protocol
    ? `${protocol}://${hostname}${port ? ':' + port : ''}`
    : `${hostname}${port ? ':' + port : ''}`;

  return { protocol, hostname, port, full };
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

export function getCurrentTabUrl(): Promise<string | null> {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.url) {
        resolve(tabs[0].url);
      } else {
        resolve(null);
      }
    });
  });
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
