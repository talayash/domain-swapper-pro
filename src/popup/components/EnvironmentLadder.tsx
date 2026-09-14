import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { ProfileDomainEntry } from '~/types';
import { extractDisplayDomain, profileEntryToDomain } from '~/lib/urlUtils';
import { useSwap, SWAP_HINT } from '../hooks/useSwap';
import { useIsActiveRow } from '../hooks/usePopupNav';
import { EnvironmentBadge } from './EnvironmentBadge';
import type { EnvironmentMatch } from '../hooks/useEnvironmentDetection';

interface EnvironmentLadderProps {
  match: EnvironmentMatch;
}

function LadderEntry({ entry }: { entry: ProfileDomainEntry }) {
  const { swap, targetFor } = useSwap();
  const isActive = useIsActiveRow(entry.id);

  const handleClick = (e: React.MouseEvent) => {
    swap(profileEntryToDomain(entry), { target: targetFor(e) });
  };

  const handleAuxClick = (e: React.MouseEvent) => {
    if (e.button !== 1) return;
    e.preventDefault();
    swap(profileEntryToDomain(entry), { target: targetFor(e) });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onAuxClick={handleAuxClick}
      data-row-id={entry.id}
      data-active={isActive || undefined}
      className="ladder-entry group"
      title={SWAP_HINT}
    >
      <EnvironmentBadge role={entry.role} size="sm" />
      <span className="text-xs text-foreground truncate flex-1">
        {entry.label || extractDisplayDomain(entry.url, false)}
      </span>
      <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 group-data-[active]:opacity-100 transition-opacity shrink-0" />
    </button>
  );
}

export function EnvironmentLadder({ match }: EnvironmentLadderProps) {
  return (
    <div className="mx-2 mb-2 rounded-lg border bg-card p-2.5">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium text-muted-foreground truncate">
          {match.profile.name}
        </span>
        <div className="flex items-center gap-1.5 ml-auto shrink-0">
          <EnvironmentBadge role={match.currentEntry.role} size="sm" />
        </div>
      </div>

      {match.otherEntries.length > 0 && (
        <div className="flex items-center gap-1 mb-1.5">
          <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
          <span className="text-[10px] text-muted-foreground">Swap to:</span>
        </div>
      )}

      <div className="space-y-0.5">
        {match.otherEntries.map((entry) => (
          <LadderEntry key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
