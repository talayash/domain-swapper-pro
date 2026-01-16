import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { Folder } from '~/types';
import { useStore } from '~/store';
import { validateFolderName } from '~/lib/validators';

interface AddFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingFolder?: Folder | null;
  parentId?: string | null;
}

const FOLDER_ICONS = ['📁', '🛠️', '🧪', '🚀', '💻', '🌐', '🔧', '📦', '⚡', '🎯', '🔒', '📊'];

export function AddFolderModal({ isOpen, onClose, editingFolder, parentId }: AddFolderModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [error, setError] = useState<string | null>(null);

  const addFolder = useStore((state) => state.addFolder);
  const updateFolder = useStore((state) => state.updateFolder);

  useEffect(() => {
    if (isOpen) {
      if (editingFolder) {
        setName(editingFolder.name);
        setIcon(editingFolder.icon || '📁');
      } else {
        setName('');
        setIcon('📁');
      }
      setError(null);
    }
  }, [isOpen, editingFolder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateFolderName(name);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid folder name');
      return;
    }

    if (editingFolder) {
      updateFolder(editingFolder.id, { name, icon });
    } else {
      addFolder({ name, icon, parentId: parentId ?? null });
    }

    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background rounded-lg shadow-lg p-4 w-[320px]">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">
              {editingFolder ? 'Edit Folder' : parentId ? 'Add Subfolder' : 'Add Folder'}
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
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="Folder name"
                className="input"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Icon</label>
              <div className="flex flex-wrap gap-2">
                {FOLDER_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`p-2 text-lg rounded-md transition-colors ${
                      icon === emoji
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-secondary'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
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
                {editingFolder ? 'Save' : 'Add'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
