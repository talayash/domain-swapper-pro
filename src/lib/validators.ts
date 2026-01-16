import { parseDomainInput } from './urlUtils';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

const HOSTNAME_REGEX = /^(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)*[a-zA-Z]{2,}|localhost)$/;
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const PORT_REGEX = /^[1-9][0-9]{0,4}$/;

export function validateDomainInput(input: string): ValidationResult {
  if (!input || input.trim().length === 0) {
    return { isValid: false, error: 'Domain is required' };
  }

  const parsed = parseDomainInput(input);
  const { hostname, port } = parsed;

  if (!hostname) {
    return { isValid: false, error: 'Invalid domain format' };
  }

  const isValidHostname = HOSTNAME_REGEX.test(hostname);
  const isValidIp = IPV4_REGEX.test(hostname);
  const isLocalhost = hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local');

  if (!isValidHostname && !isValidIp && !isLocalhost) {
    return { isValid: false, error: 'Invalid hostname format' };
  }

  if (port) {
    if (!PORT_REGEX.test(port)) {
      return { isValid: false, error: 'Invalid port number' };
    }
    const portNum = parseInt(port, 10);
    if (portNum < 1 || portNum > 65535) {
      return { isValid: false, error: 'Port must be between 1 and 65535' };
    }
  }

  return { isValid: true };
}

export function validateFolderName(name: string): ValidationResult {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Folder name is required' };
  }

  if (name.trim().length > 50) {
    return { isValid: false, error: 'Folder name must be 50 characters or less' };
  }

  return { isValid: true };
}

export function validateLabel(label: string): ValidationResult {
  if (label && label.length > 100) {
    return { isValid: false, error: 'Label must be 100 characters or less' };
  }

  return { isValid: true };
}

export function validateImportData(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'Invalid data format' };
  }

  const obj = data as Record<string, unknown>;

  if (!Array.isArray(obj.domains)) {
    return { isValid: false, error: 'Missing or invalid domains array' };
  }

  if (!Array.isArray(obj.folders)) {
    return { isValid: false, error: 'Missing or invalid folders array' };
  }

  for (const domain of obj.domains) {
    if (!domain || typeof domain !== 'object') {
      return { isValid: false, error: 'Invalid domain object' };
    }
    const d = domain as Record<string, unknown>;
    if (!d.id || !d.url) {
      return { isValid: false, error: 'Domain missing required fields (id, url)' };
    }
  }

  for (const folder of obj.folders) {
    if (!folder || typeof folder !== 'object') {
      return { isValid: false, error: 'Invalid folder object' };
    }
    const f = folder as Record<string, unknown>;
    if (!f.id || !f.name) {
      return { isValid: false, error: 'Folder missing required fields (id, name)' };
    }
  }

  return { isValid: true };
}
