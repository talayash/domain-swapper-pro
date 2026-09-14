import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Trash2, GripVertical, Layers } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Profile, EnvironmentRole, ProfileDomainEntry } from '~/types';
import { ENVIRONMENT_ROLES } from '~/types';
import { validateProfileName, validateProfileDescription, validateDomainInput } from '~/lib/validators';
import { v4 as uuidv4 } from 'uuid';

interface ProfileEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description?: string;
    entries: Omit<ProfileDomainEntry, 'id' | 'order'>[];
  }) => void;
  editingProfile?: Profile | null;
  initialEntries?: Omit<ProfileDomainEntry, 'id' | 'order'>[];
}

interface EntryRow {
  tempId: string;
  url: string;
  label: string;
  role: EnvironmentRole;
  protocol: 'http' | 'https' | 'preserve';
}

const ROLE_OPTIONS: EnvironmentRole[] = ['production', 'staging', 'qa', 'dev', 'local', 'custom'];

// Shared by the column header and every row so they always line up.
const ENTRY_GRID = 'grid grid-cols-[20px_minmax(0,1fr)_minmax(0,1fr)_120px_100px_28px] gap-2 items-center';

function SortableEntry({
  entry,
  onChange,
  onRemove,
  showRemove,
}: {
  entry: EntryRow;
  onChange: (tempId: string, field: keyof EntryRow, value: string) => void;
  onRemove: (tempId: string) => void;
  showRemove: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: entry.tempId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`${ENTRY_GRID} p-2 rounded-md border bg-card`}>
      <button
        type="button"
        className="self-center cursor-grab active:cursor-grabbing p-0.5 opacity-50 hover:opacity-100 rounded"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
      </button>

      <input
        type="text"
        value={entry.url}
        onChange={(e) => onChange(entry.tempId, 'url', e.target.value)}
        placeholder="example.com"
        className="input text-sm min-w-0"
        aria-label="URL"
      />
      <input
        type="text"
        value={entry.label}
        onChange={(e) => onChange(entry.tempId, 'label', e.target.value)}
        placeholder="Label (optional)"
        className="input text-sm min-w-0"
        aria-label="Label"
      />
      <select
        value={entry.role}
        onChange={(e) => onChange(entry.tempId, 'role', e.target.value)}
        className="input text-sm"
        aria-label="Role"
      >
        {ROLE_OPTIONS.map((role) => (
          <option key={role} value={role}>
            {ENVIRONMENT_ROLES[role].label}
          </option>
        ))}
      </select>
      <select
        value={entry.protocol}
        onChange={(e) => onChange(entry.tempId, 'protocol', e.target.value)}
        className="input text-sm"
        aria-label="Protocol"
      >
        <option value="preserve">Preserve</option>
        <option value="https">HTTPS</option>
        <option value="http">HTTP</option>
      </select>

      {/* Always render the cell so columns stay aligned when the button is hidden */}
      <div className="flex items-center justify-center">
        {showRemove && (
          <button
            type="button"
            onClick={() => onRemove(entry.tempId)}
            className="action-btn-danger"
            aria-label="Remove entry"
            title="Remove entry"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function ProfileEditorModal({
  isOpen,
  onClose,
  onSave,
  editingProfile,
  initialEntries,
}: ProfileEditorModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (editingProfile) {
        setName(editingProfile.name);
        setDescription(editingProfile.description || '');
        setEntries(
          [...editingProfile.entries]
            .sort((a, b) => a.order - b.order)
            .map((e) => ({
              tempId: uuidv4(),
              url: e.url,
              label: e.label || '',
              role: e.role,
              protocol: e.protocol || 'preserve',
            }))
        );
      } else if (initialEntries) {
        setName('');
        setDescription('');
        setEntries(
          initialEntries.map((e) => ({
            tempId: uuidv4(),
            url: e.url,
            label: e.label || '',
            role: e.role,
            protocol: e.protocol || 'preserve',
          }))
        );
      } else {
        setName('');
        setDescription('');
        setEntries([
          { tempId: uuidv4(), url: '', label: '', role: 'production', protocol: 'https' },
          { tempId: uuidv4(), url: '', label: '', role: 'staging', protocol: 'https' },
          { tempId: uuidv4(), url: '', label: '', role: 'dev', protocol: 'https' },
          { tempId: uuidv4(), url: '', label: '', role: 'local', protocol: 'http' },
        ]);
      }
    }
  }, [isOpen, editingProfile, initialEntries]);

  const handleEntryChange = (tempId: string, field: keyof EntryRow, value: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.tempId === tempId ? { ...e, [field]: value } : e))
    );
    setError(null);
  };

  const handleAddEntry = () => {
    setEntries((prev) => [
      ...prev,
      { tempId: uuidv4(), url: '', label: '', role: 'custom', protocol: 'preserve' },
    ]);
  };

  const handleRemoveEntry = (tempId: string) => {
    setEntries((prev) => prev.filter((e) => e.tempId !== tempId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = entries.findIndex((e) => e.tempId === active.id);
    const newIndex = entries.findIndex((e) => e.tempId === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newEntries = [...entries];
      const [moved] = newEntries.splice(oldIndex, 1);
      newEntries.splice(newIndex, 0, moved);
      setEntries(newEntries);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nameValidation = validateProfileName(name);
    if (!nameValidation.isValid) {
      setError(nameValidation.error!);
      return;
    }

    const descValidation = validateProfileDescription(description);
    if (!descValidation.isValid) {
      setError(descValidation.error!);
      return;
    }

    const validEntries = entries.filter((e) => e.url.trim().length > 0);
    if (validEntries.length === 0) {
      setError('At least one environment entry with a URL is required');
      return;
    }

    for (const entry of validEntries) {
      const urlValidation = validateDomainInput(entry.url);
      if (!urlValidation.isValid) {
        setError(`Invalid URL "${entry.url}": ${urlValidation.error}`);
        return;
      }
    }

    onSave({
      name,
      description: description || undefined,
      entries: validEntries.map((e) => ({
        url: e.url,
        label: e.label || undefined,
        role: e.role,
        protocol: e.protocol,
      })),
    });

    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content className="modal-content-wide">
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-base font-medium flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              {editingProfile ? 'Edit Profile' : 'Create Profile'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="btn-icon-sm flex items-center justify-center">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Profile Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError(null);
                  }}
                  placeholder="My Web App"
                  className="input"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Description <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Web application environments"
                  className="input"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Environment Entries</label>
                <button
                  type="button"
                  onClick={handleAddEntry}
                  className="btn btn-ghost text-xs px-2 py-1 h-auto"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Entry
                </button>
              </div>

              <div className={`${ENTRY_GRID} text-xs text-muted-foreground px-[9px] mb-1`}>
                <span></span>
                <span>URL</span>
                <span>Label</span>
                <span>Role</span>
                <span>Protocol</span>
                <span></span>
              </div>

              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={entries.map((e) => e.tempId)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1">
                    {entries.map((entry) => (
                      <SortableEntry
                        key={entry.tempId}
                        entry={entry}
                        onChange={handleEntryChange}
                        onRemove={handleRemoveEntry}
                        showRemove={entries.length > 1}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/5 p-2.5 rounded-md">
                {error}
              </div>
            )}

            <div className="flex gap-2 pt-3">
              <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary flex-1">
                {editingProfile ? 'Save Changes' : 'Create Profile'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
