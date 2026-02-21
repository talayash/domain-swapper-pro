import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Globe, Tag, Folder, Shield, Scissors } from 'lucide-react';
import type { Domain } from '~/types';
import { useStore } from '~/store';
import { useFolderOptions } from '../hooks/useFolders';
import { validateDomainInput, validateLabel, validateIgnorePaths } from '~/lib/validators';

interface AddDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingDomain?: Domain | null;
}

export function AddDomainModal({ isOpen, onClose, editingDomain }: AddDomainModalProps) {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [protocol, setProtocol] = useState<'http' | 'https' | 'preserve'>('preserve');
  const [ignorePaths, setIgnorePaths] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addDomain = useStore((state) => state.addDomain);
  const updateDomain = useStore((state) => state.updateDomain);
  const defaultFolderId = useStore((state) => state.settings.defaultFolderId);
  const folderOptions = useFolderOptions();

  useEffect(() => {
    if (isOpen) {
      if (editingDomain) {
        setUrl(editingDomain.url);
        setLabel(editingDomain.label || '');
        setFolderId(editingDomain.folderId);
        setProtocol(editingDomain.protocol || 'preserve');
        setIgnorePaths(editingDomain.ignorePaths?.join(', ') || '');
      } else {
        setUrl('');
        setLabel('');
        setFolderId(defaultFolderId);
        setProtocol('preserve');
        setIgnorePaths('');
      }
      setError(null);
    }
  }, [isOpen, editingDomain, defaultFolderId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const urlValidation = validateDomainInput(url);
    if (!urlValidation.isValid) {
      setError(urlValidation.error || 'Invalid URL');
      return;
    }

    const labelValidation = validateLabel(label);
    if (!labelValidation.isValid) {
      setError(labelValidation.error || 'Invalid label');
      return;
    }

    const parsedIgnorePaths = ignorePaths
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (parsedIgnorePaths.length > 0) {
      const ignoreValidation = validateIgnorePaths(parsedIgnorePaths);
      if (!ignoreValidation.isValid) {
        setError(ignoreValidation.error || 'Invalid ignore paths');
        return;
      }
    }

    const domainData = {
      url,
      label: label || undefined,
      folderId,
      protocol,
      ignorePaths: parsedIgnorePaths.length > 0 ? parsedIgnorePaths : undefined,
    };

    if (editingDomain) {
      updateDomain(editingDomain.id, domainData);
    } else {
      addDomain(domainData);
    }

    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              {editingDomain ? 'Edit Domain' : 'Add Domain'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="btn-icon-sm flex items-center justify-center">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                Domain / URL <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                placeholder="example.com or https://example.com:8080"
                className="input"
                autoFocus
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                Label <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="My Dev Server"
                className="input"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                Folder
              </label>
              <select
                value={folderId || ''}
                onChange={(e) => setFolderId(e.target.value || null)}
                className="input"
              >
                {folderOptions.map((opt) => (
                  <option key={opt.id || 'null'} value={opt.id || ''}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                Protocol
              </label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value as typeof protocol)}
                className="input"
              >
                <option value="preserve">Preserve current</option>
                <option value="https">Always HTTPS</option>
                <option value="http">Always HTTP</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1.5">
                Determines which protocol to use when swapping
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Scissors className="h-3.5 w-3.5 text-muted-foreground" />
                Ignore Path Prefixes <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={ignorePaths}
                onChange={(e) => setIgnorePaths(e.target.value)}
                placeholder="he-il, en-us, staging"
                className="input"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Comma-separated path prefixes to strip when swapping to this domain
              </p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-3">
              <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary flex-1">
                {editingDomain ? 'Save Changes' : 'Add Domain'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
