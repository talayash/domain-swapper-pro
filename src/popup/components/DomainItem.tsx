import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import type { Domain } from '~/types';
import { useStore } from '~/store';
import { extractDisplayDomain } from '~/lib/urlUtils';
import { useProfileRoleForDomain } from '../hooks/useEnvironmentDetection';
import { useSwap, wantsNewTab } from '../hooks/useSwap';
import { useIsActiveRow } from '../hooks/usePopupNav';
import { EnvironmentBadge } from './EnvironmentBadge';

interface DomainItemProps {
  domain: Domain;
  onEdit: (domain: Domain) => void;
}

export function DomainItem({ domain, onEdit }: DomainItemProps) {
  const showProtocol = useStore((state) => state.settings.showProtocol);
  const deleteDomain = useStore((state) => state.deleteDomain);
  const profileRole = useProfileRoleForDomain(domain.url);
  const swap = useSwap();
  const isActive = useIsActiveRow(domain.id);

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

  const handleClick = (e: React.MouseEvent) => {
    swap(domain, { newTab: wantsNewTab(e), trackRecent: true });
  };

  // Middle-click fires `auxclick`, not `click`.
  const handleAuxClick = (e: React.MouseEvent) => {
    if (e.button !== 1) return;
    e.preventDefault();
    swap(domain, { newTab: true, trackRecent: true });
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

  const displayUrl = extractDisplayDomain(domain.url, showProtocol);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="domain-item group"
      data-row-id={domain.id}
      data-active={isActive || undefined}
      onClick={handleClick}
      onAuxClick={handleAuxClick}
      title="Click to swap · Ctrl+click or middle-click for a new tab"
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

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {domain.label && (
            <span className="text-sm font-medium truncate text-foreground">{domain.label}</span>
          )}
          {profileRole && <EnvironmentBadge role={profileRole.role} size="sm" showLabel={false} />}
        </div>
        <div className={`truncate ${domain.label ? 'text-xs text-muted-foreground' : 'text-sm text-foreground'}`}>
          {displayUrl}
        </div>
      </div>

      <div className="row-actions">
        <button
          type="button"
          onClick={handleEdit}
          className="action-btn"
          title="Edit"
          aria-label="Edit domain"
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="action-btn-danger"
          title="Delete"
          aria-label="Delete domain"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <span className="action-btn" aria-hidden="true">
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </span>
      </div>
    </div>
  );
}
