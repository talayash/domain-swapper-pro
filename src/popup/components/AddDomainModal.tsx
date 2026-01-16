import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { Domain } from '~/types';
import { useStore } from '~/store';
import { useFolderOptions } from '../hooks/useFolders';
import { validateDomainInput, validateLabel } from '~/lib/validators';

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
      } else {
        setUrl('');
        setLabel('');
        setFolderId(defaultFolderId);
        setProtocol('preserve');
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

    if (editingDomain) {
      updateDomain(editingDomain.id, { url, label: label || undefined, folderId, protocol });
    } else {
      addDomain({ url, label: label || undefined, folderId, protocol });
    }

    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg p-4 w-[320px] max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">
              {editingDomain ? 'Edit Domain' : 'Add Domain'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 hover:bg-secondary rounded">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Domain / URL <span className="text-red-500">*</span>
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
              <label className="block text-sm font-medium mb-1">Label (optional)</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="My Dev Server"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Folder</label>
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
              <label className="block text-sm font-medium mb-1">Protocol</label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value as typeof protocol)}
                className="input"
              >
                <option value="preserve">Preserve current</option>
                <option value="https">Always HTTPS</option>
                <option value="http">Always HTTP</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Determines which protocol to use when swapping
              </p>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary flex-1">
                {editingDomain ? 'Save' : 'Add'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
