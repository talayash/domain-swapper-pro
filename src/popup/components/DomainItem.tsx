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
      className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-secondary/50 cursor-pointer group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSwap}
    >
      <button
        className="cursor-grab active:cursor-grabbing p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="flex-1 min-w-0">
        {domain.label && (
          <div className="text-sm font-medium truncate">{domain.label}</div>
        )}
        <div className={`text-xs truncate ${domain.label ? 'text-muted-foreground' : 'text-sm'}`}>
          {displayUrl}
        </div>
      </div>

      {isHovered && (
        <div className="flex items-center gap-1">
          <button
            onClick={handleEdit}
            className="p-1 hover:bg-secondary rounded"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-secondary rounded"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-red-500" />
          </button>
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
