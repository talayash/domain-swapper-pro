import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import type { Domain } from '~/types';
import { useStore } from '~/store';
import { extractDisplayDomain, buildSwapUrl, getCurrentTabUrl, navigateToUrl } from '~/lib/urlUtils';

interface DomainItemProps {
  domain: Domain;
  onEdit: (domain: Domain) => void;
}

export function DomainItem({ domain, onEdit }: DomainItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const settings = useStore((state) => state.settings);
  const deleteDomain = useStore((state) => state.deleteDomain);
  const addToRecent = useStore((state) => state.addToRecent);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: domain.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const handleSwap = async () => {
    const currentUrl = await getCurrentTabUrl();
    if (!currentUrl || !currentUrl.startsWith('http')) return;

    const newUrl = buildSwapUrl(currentUrl, domain, settings);
    addToRecent(domain.id);
    await navigateToUrl(newUrl);
    window.close();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete "${domain.label || domain.url}"?`)) {
      deleteDomain(domain.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(domain);
  };

  const displayUrl = extractDisplayDomain(domain.url, settings.showProtocol);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="domain-item group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSwap}
    >
      <button
        className="drag-handle"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex-1 min-w-0">
        {domain.label && (
          <div className="text-sm font-medium truncate text-foreground">{domain.label}</div>
        )}
        <div className={`truncate ${domain.label ? 'text-xs text-muted-foreground' : 'text-sm text-foreground'}`}>
          {displayUrl}
        </div>
      </div>

      <div className={`flex items-center gap-0.5 transition-opacity duration-150 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
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
        <div className="action-btn">
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
