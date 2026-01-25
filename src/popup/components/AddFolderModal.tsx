import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, FolderOpen, Type } from 'lucide-react';
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

  const getTitle = () => {
    if (editingFolder) return 'Edit Folder';
    if (parentId) return 'Add Subfolder';
    return 'Add Folder';
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <FolderOpen className="h-4 w-4 text-primary" />
              </div>
              {getTitle()}
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
                <Type className="h-3.5 w-3.5 text-muted-foreground" />
                Name <span className="text-destructive">*</span>
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
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <span className="text-muted-foreground">🎨</span>
                Icon
              </label>
              <div className="flex flex-wrap gap-1.5">
                {FOLDER_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`p-2 text-lg rounded-lg transition-all duration-150 ${
                      icon === emoji
                        ? 'bg-primary text-primary-foreground shadow-sm scale-110'
                        : 'hover:bg-secondary hover:scale-105'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
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
                {editingFolder ? 'Save Changes' : 'Add Folder'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
