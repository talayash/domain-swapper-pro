import React, { useEffect, useRef, useState } from 'react';
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
import { Plus, FolderPlus, Settings, Globe, SearchX } from 'lucide-react';
import type { Domain, Folder } from '~/types';
import { useStore } from '~/store';
import { profileEntryToDomain } from '~/lib/urlUtils';
import { useRootFolders } from '../hooks/useFolders';
import { useDomainsByFolder } from '../hooks/useDomains';
import { useCurrentTabUrl } from '../hooks/useCurrentTabUrl';
import { useEnvironmentDetection } from '../hooks/useEnvironmentDetection';
import { usePopupRows, type PopupRow } from '../hooks/usePopupRows';
import { PopupNavProvider } from '../hooks/usePopupNav';
import { useSwap } from '../hooks/useSwap';
import { SearchBar } from './SearchBar';
import { FolderItem } from './FolderItem';
import { DomainItem } from './DomainItem';
import { EnvironmentLadder } from './EnvironmentLadder';
import { AddDomainModal } from './AddDomainModal';
import { AddFolderModal } from './AddFolderModal';

export function DomainList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [subfolderParentId, setSubfolderParentId] = useState<string | null>(null);

  // Keyboard navigation: -1 means nothing highlighted.
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentTabUrl = useCurrentTabUrl();
  const envMatch = useEnvironmentDetection(currentTabUrl);
  const swap = useSwap();

  const rootFolders = useRootFolders();
  const uncategorizedDomains = useDomainsByFolder(null);
  const reorderFolders = useStore((state) => state.reorderFolders);
  const reorderDomains = useStore((state) => state.reorderDomains);

  const { isSearching, matchedDomainIds, visibleFolderIds, rows, matchCount } =
    usePopupRows(searchQuery, envMatch);

  const isModalOpen = isDomainModalOpen || isFolderModalOpen;
  const hasAnything = rootFolders.length > 0 || uncategorizedDomains.length > 0;

  // Clamp the highlight to the current row list; highlight the top result while searching.
  const clampedIndex = rows.length === 0 ? -1 : Math.min(activeIndex, rows.length - 1);
  const activeRow: PopupRow | null = clampedIndex >= 0 ? rows[clampedIndex] : null;

  useEffect(() => {
    setActiveIndex(searchQuery.trim() ? 0 : -1);
  }, [searchQuery]);

  useEffect(() => {
    if (!activeRow) return;
    const el = document.querySelector<HTMLElement>(`[data-row-id="${CSS.escape(activeRow.id)}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeRow]);

  const swapRow = (row: PopupRow, newTab: boolean) => {
    if (row.kind === 'domain') {
      swap(row.domain, { newTab, trackRecent: true });
    } else {
      swap(profileEntryToDomain(row.entry), { newTab });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Modals manage their own keyboard behaviour (Radix handles Escape).
    if (isModalOpen) return;
    // dnd-kit's keyboard sensor owns Space/Enter/arrows while a drag handle is focused.
    if ((e.target as HTMLElement).closest('.drag-handle')) return;

    const lastIndex = rows.length - 1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (rows.length > 0) setActiveIndex((i) => (i < 0 ? 0 : Math.min(i + 1, lastIndex)));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (rows.length > 0) setActiveIndex((i) => (i < 0 || i > lastIndex ? lastIndex : Math.max(i - 1, 0)));
        break;
      case 'Home':
        if (rows.length > 0 && e.target === searchInputRef.current && !searchQuery) {
          e.preventDefault();
          setActiveIndex(0);
        }
        break;
      case 'End':
        if (rows.length > 0 && e.target === searchInputRef.current && !searchQuery) {
          e.preventDefault();
          setActiveIndex(rows.length - 1);
        }
        break;
      case 'Enter':
        // Only hijack Enter from the search box, so buttons keep working.
        if (activeRow && e.target === searchInputRef.current) {
          e.preventDefault();
          swapRow(activeRow, e.ctrlKey || e.metaKey);
        }
        break;
      case 'Escape':
        e.preventDefault();
        if (searchQuery) {
          setSearchQuery('');
          searchInputRef.current?.focus();
        } else {
          window.close();
        }
        break;
    }
  };

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
    searchInputRef.current?.focus();
  };

  const handleCloseFolderModal = () => {
    setIsFolderModalOpen(false);
    setEditingFolder(null);
    setSubfolderParentId(null);
    searchInputRef.current?.focus();
  };

  const filteredUncategorized = matchedDomainIds
    ? uncategorizedDomains.filter((d) => matchedDomainIds.has(d.id))
    : uncategorizedDomains;

  const visibleRootFolders = rootFolders.filter((f) => visibleFolderIds.has(f.id));

  return (
    <PopupNavProvider activeRowId={activeRow?.id ?? null}>
      <div className="flex flex-col flex-1 min-h-0" onKeyDown={handleKeyDown}>
        {/* Header */}
        <div className="header">
          <div className="flex items-center justify-between mb-3">
            <h1 className="header-title">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>Domain Swapper</span>
            </h1>
            <button
              type="button"
              onClick={() => chrome.runtime.openOptionsPage()}
              className="btn-icon-sm flex items-center justify-center"
              title="Settings"
              aria-label="Open settings"
            >
              <Settings className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <SearchBar ref={searchInputRef} value={searchQuery} onChange={setSearchQuery} autoFocus />
          {isSearching && (
            <div className="mt-2 text-[11px] text-muted-foreground tabular-nums" aria-live="polite">
              {matchCount === 0
                ? 'No matches'
                : `${matchCount} match${matchCount === 1 ? '' : 'es'} · Enter to swap`}
            </div>
          )}
        </div>

        {/* Environment Ladder (hidden while searching so results stay uncluttered) */}
        {envMatch && !isSearching && <EnvironmentLadder match={envMatch} />}

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleFolderDragEnd}
          >
            <SortableContext
              items={visibleRootFolders.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {visibleRootFolders.map((folder) => (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  matchedDomainIds={matchedDomainIds}
                  visibleFolderIds={visibleFolderIds}
                  onEditDomain={handleEditDomain}
                  onEditFolder={handleEditFolder}
                  onAddSubfolder={handleAddSubfolder}
                />
              ))}
            </SortableContext>
          </DndContext>

          {filteredUncategorized.length > 0 && (
            <div className={visibleRootFolders.length > 0 ? 'mt-3' : ''}>
              <div className="section-label">Uncategorized</div>
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

          {!hasAnything && (
            <div className="empty-state">
              <Globe className="empty-state-icon" />
              <p className="empty-state-text">No domains yet</p>
              <button
                type="button"
                onClick={() => setIsDomainModalOpen(true)}
                className="btn btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add your first domain
              </button>
            </div>
          )}

          {hasAnything && isSearching && matchCount === 0 && (
            <div className="empty-state">
              <SearchX className="empty-state-icon" />
              <p className="empty-state-text">
                No domains match <span className="text-foreground">“{searchQuery.trim()}”</span>
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="btn btn-secondary"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* Keyboard hints */}
        {rows.length > 0 && (
          <div className="kbd-hints" aria-hidden="true">
            <span><kbd className="kbd">↑</kbd><kbd className="kbd">↓</kbd> navigate</span>
            <span><kbd className="kbd">↵</kbd> swap</span>
            <span><kbd className="kbd">Ctrl</kbd>+<kbd className="kbd">↵</kbd> new tab</span>
            <span><kbd className="kbd">Esc</kbd> close</span>
          </div>
        )}

        {/* Footer */}
        <div className="footer">
          <button
            type="button"
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
            type="button"
            onClick={() => {
              setEditingFolder(null);
              setSubfolderParentId(null);
              setIsFolderModalOpen(true);
            }}
            className="btn btn-secondary"
            title="Add Folder"
            aria-label="Add folder"
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
    </PopupNavProvider>
  );
}
