import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronRight, GripVertical, Pencil, Trash2, FolderPlus } from 'lucide-react';
import type { Folder, Domain } from '~/types';
import { useStore } from '~/store';
import { useDomainsByFolder } from '../hooks/useDomains';
import { useChildFolders } from '../hooks/useFolders';
import { DomainItem } from './DomainItem';

interface FolderItemProps {
  folder: Folder;
  /** Domains matching the current search, or null when not searching. */
  matchedDomainIds: Set<string> | null;
  /** Folders that should render (see usePopupRows). */
  visibleFolderIds: Set<string>;
  onEditDomain: (domain: Domain) => void;
  onEditFolder: (folder: Folder) => void;
  onAddSubfolder: (parentId: string) => void;
  level?: number;
}

export function FolderItem({
  folder,
  matchedDomainIds,
  visibleFolderIds,
  onEditDomain,
  onEditFolder,
  onAddSubfolder,
  level = 0
}: FolderItemProps) {
  const toggleFolderCollapse = useStore((state) => state.toggleFolderCollapse);
  const deleteFolder = useStore((state) => state.deleteFolder);
  const reorderDomains = useStore((state) => state.reorderDomains);

  const domains = useDomainsByFolder(folder.id);
  const childFolders = useChildFolders(folder.id);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: folder.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const isSearching = matchedDomainIds !== null;

  if (!visibleFolderIds.has(folder.id)) {
    return null;
  }

  const filteredDomains = isSearching
    ? domains.filter((d) => matchedDomainIds.has(d.id))
    : domains;

  const visibleChildren = childFolders.filter((c) => visibleFolderIds.has(c.id));
  const hasContent = filteredDomains.length > 0 || visibleChildren.length > 0;

  // While searching every folder with a match is forced open so results are
  // never hidden behind a collapsed header.
  const isOpen = isSearching || !folder.isCollapsed;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = domains.findIndex((d) => d.id === active.id);
    const newIndex = domains.findIndex((d) => d.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = [...domains];
      const [moved] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, moved);
      reorderDomains(folder.id, newOrder.map((d) => d.id));
    }
  };

  const handleToggle = () => {
    if (!isSearching) toggleFolderCollapse(folder.id);
  };

  const handleHeaderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const domainCount = domains.length;
    const detail = domainCount > 0
      ? ` Its ${domainCount} domain${domainCount === 1 ? '' : 's'} will move to Uncategorized.`
      : '';
    if (confirm(`Delete folder "${folder.name}"?${detail}`)) {
      deleteFolder(folder.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditFolder(folder);
  };

  const handleAddSubfolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddSubfolder(folder.id);
  };

  return (
    <div ref={setNodeRef} style={style} className="select-none mb-1">
      {/* Controlled: the header div below is the toggle, so no Collapsible.Trigger is used. */}
      <Collapsible.Root open={isOpen}>
        <div
          className="folder-item group"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          onClick={handleToggle}
          onKeyDown={handleHeaderKeyDown}
        >
          <button
            type="button"
            className="drag-handle"
            aria-label="Drag to reorder"
            onClick={(e) => e.stopPropagation()}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>

          <ChevronRight
            className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-150 ${
              isOpen ? 'rotate-90' : ''
            }`}
          />

          <span className="text-base leading-none">{folder.icon || '📁'}</span>

          <span className="flex-1 text-sm font-medium truncate text-foreground">{folder.name}</span>

          <span className="badge badge-muted mr-1 tabular-nums">
            {filteredDomains.length}
          </span>

          <div className="row-actions">
            {level === 0 && (
              <button
                type="button"
                onClick={handleAddSubfolder}
                className="action-btn"
                title="Add subfolder"
                aria-label="Add subfolder"
              >
                <FolderPlus className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
            <button
              type="button"
              onClick={handleEdit}
              className="action-btn"
              title="Edit"
              aria-label="Edit folder"
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="action-btn-danger"
              title="Delete"
              aria-label="Delete folder"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <Collapsible.Content>
          {hasContent && (
            <div className="animate-fade-in" style={{ marginLeft: `${level * 16 + 24}px` }}>
              {visibleChildren.map((childFolder) => (
                <FolderItem
                  key={childFolder.id}
                  folder={childFolder}
                  matchedDomainIds={matchedDomainIds}
                  visibleFolderIds={visibleFolderIds}
                  onEditDomain={onEditDomain}
                  onEditFolder={onEditFolder}
                  onAddSubfolder={onAddSubfolder}
                  level={level + 1}
                />
              ))}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredDomains.map((d) => d.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredDomains.map((domain) => (
                    <DomainItem
                      key={domain.id}
                      domain={domain}
                      onEdit={onEditDomain}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}
        </Collapsible.Content>
      </Collapsible.Root>
    </div>
  );
}
