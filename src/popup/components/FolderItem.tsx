import React, { useState } from 'react';
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
import { ChevronRight, ChevronDown, GripVertical, Pencil, Trash2, FolderPlus } from 'lucide-react';
import type { Folder, Domain } from '~/types';
import { useStore } from '~/store';
import { useDomainsByFolder } from '../hooks/useDomains';
import { useChildFolders } from '../hooks/useFolders';
import { DomainItem } from './DomainItem';

interface FolderItemProps {
  folder: Folder;
  searchQuery: string;
  onEditDomain: (domain: Domain) => void;
  onEditFolder: (folder: Folder) => void;
  onAddSubfolder: (parentId: string) => void;
  level?: number;
}

export function FolderItem({
  folder,
  searchQuery,
  onEditDomain,
  onEditFolder,
  onAddSubfolder,
  level = 0
}: FolderItemProps) {
  const [isHovered, setIsHovered] = useState(false);
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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete folder "${folder.name}" and move all domains to Uncategorized?`)) {
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

  const filteredDomains = searchQuery
    ? domains.filter(
        (d) =>
          d.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.label?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : domains;

  const hasContent = filteredDomains.length > 0 || childFolders.length > 0;

  return (
    <div ref={setNodeRef} style={style} className="select-none mb-1">
      <Collapsible.Root open={!folder.isCollapsed} onOpenChange={() => toggleFolderCollapse(folder.id)}>
        <div
          className="folder-item group"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <button
            className="drag-handle"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>

          <Collapsible.Trigger asChild>
            <button className="p-0.5 rounded hover:bg-secondary/80 transition-colors">
              {folder.isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          </Collapsible.Trigger>

          <span className="text-base">{folder.icon || '📁'}</span>

          <span className="flex-1 text-sm font-medium truncate text-foreground">{folder.name}</span>

          <span className="badge badge-muted mr-1">
            {filteredDomains.length}
          </span>

          <div className={`flex items-center gap-0.5 transition-opacity duration-150 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            {level === 0 && (
              <button
                onClick={handleAddSubfolder}
                className="action-btn"
                title="Add subfolder"
              >
                <FolderPlus className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            )}
            <button
              onClick={handleEdit}
              className="action-btn"
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <button
              onClick={handleDelete}
              className="action-btn-danger"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <Collapsible.Content>
          {hasContent && (
            <div className="ml-4 animate-fade-in" style={{ marginLeft: `${level * 16 + 24}px` }}>
              {childFolders.map((childFolder) => (
                <FolderItem
                  key={childFolder.id}
                  folder={childFolder}
                  searchQuery={searchQuery}
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
