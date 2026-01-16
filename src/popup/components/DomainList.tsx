import { useState } from 'react';
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
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { Plus, FolderPlus, Settings } from 'lucide-react';
import type { Domain, Folder } from '~/types';
import { useStore } from '~/store';
import { useRootFolders } from '../hooks/useFolders';
import { useDomainsByFolder } from '../hooks/useDomains';
import { SearchBar } from './SearchBar';
import { FolderItem } from './FolderItem';
import { DomainItem } from './DomainItem';
import { AddDomainModal } from './AddDomainModal';
import { AddFolderModal } from './AddFolderModal';

export function DomainList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [subfolderParentId, setSubfolderParentId] = useState<string | null>(null);

  const rootFolders = useRootFolders();
  const uncategorizedDomains = useDomainsByFolder(null);
  const reorderFolders = useStore((state) => state.reorderFolders);
  const reorderDomains = useStore((state) => state.reorderDomains);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleFolderDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = rootFolders.findIndex((f) => f.id === active.id);
    const newIndex = rootFolders.findIndex((f) => f.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = [...rootFolders];
      const [moved] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, moved);
      reorderFolders(newOrder.map((f) => f.id));
    }
  };

  const handleUncategorizedDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = uncategorizedDomains.findIndex((d) => d.id === active.id);
    const newIndex = uncategorizedDomains.findIndex((d) => d.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = [...uncategorizedDomains];
      const [moved] = newOrder.splice(oldIndex, 1);
      newOrder.splice(newIndex, 0, moved);
      reorderDomains(null, newOrder.map((d) => d.id));
    }
  };

  const handleEditDomain = (domain: Domain) => {
    setEditingDomain(domain);
    setIsDomainModalOpen(true);
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setSubfolderParentId(null);
    setIsFolderModalOpen(true);
  };

  const handleAddSubfolder = (parentId: string) => {
    setEditingFolder(null);
    setSubfolderParentId(parentId);
    setIsFolderModalOpen(true);
  };

  const handleCloseDomainModal = () => {
    setIsDomainModalOpen(false);
    setEditingDomain(null);
  };

  const handleCloseFolderModal = () => {
    setIsFolderModalOpen(false);
    setEditingFolder(null);
    setSubfolderParentId(null);
  };

  const filteredUncategorized = searchQuery
    ? uncategorizedDomains.filter(
        (d) =>
          d.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
          d.label?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : uncategorizedDomains;

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <span>🔄</span> Domain Swapper Pro
          </h1>
          <button
            onClick={() => chrome.runtime.openOptionsPage()}
            className="p-1.5 hover:bg-secondary rounded"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleFolderDragEnd}
        >
          <SortableContext
            items={rootFolders.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            {rootFolders.map((folder) => (
              <FolderItem
                key={folder.id}
                folder={folder}
                searchQuery={searchQuery}
                onEditDomain={handleEditDomain}
                onEditFolder={handleEditFolder}
                onAddSubfolder={handleAddSubfolder}
              />
            ))}
          </SortableContext>
        </DndContext>

        {filteredUncategorized.length > 0 && (
          <div className="mt-2">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground uppercase">
              Uncategorized
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleUncategorizedDragEnd}
            >
              <SortableContext
                items={filteredUncategorized.map((d) => d.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredUncategorized.map((domain) => (
                  <DomainItem
                    key={domain.id}
                    domain={domain}
                    onEdit={handleEditDomain}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}

        {rootFolders.length === 0 && uncategorizedDomains.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">No domains yet</p>
            <button
              onClick={() => setIsDomainModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add your first domain
            </button>
          </div>
        )}
      </div>

      <div className="p-3 border-t flex gap-2">
        <button
          onClick={() => {
            setEditingDomain(null);
            setIsDomainModalOpen(true);
          }}
          className="btn btn-primary flex-1"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Domain
        </button>
        <button
          onClick={() => {
            setEditingFolder(null);
            setSubfolderParentId(null);
            setIsFolderModalOpen(true);
          }}
          className="btn btn-secondary"
        >
          <FolderPlus className="h-4 w-4" />
        </button>
      </div>

      <AddDomainModal
        isOpen={isDomainModalOpen}
        onClose={handleCloseDomainModal}
        editingDomain={editingDomain}
      />

      <AddFolderModal
        isOpen={isFolderModalOpen}
        onClose={handleCloseFolderModal}
        editingFolder={editingFolder}
        parentId={subfolderParentId}
      />
    </div>
  );
}
