import { ArrowRight } from 'lucide-react';
import type { ProfileDomainEntry, Domain } from '~/types';
import { useStore } from '~/store';
import { buildSwapUrl, navigateToUrl, extractDisplayDomain } from '~/lib/urlUtils';
import { EnvironmentBadge } from './EnvironmentBadge';
import type { EnvironmentMatch } from '../hooks/useEnvironmentDetection';

interface EnvironmentLadderProps {
  match: EnvironmentMatch;
  currentTabUrl: string;
}

export function EnvironmentLadder({ match, currentTabUrl }: EnvironmentLadderProps) {
  const settings = useStore((state) => state.settings);

  const handleSwap = async (entry: ProfileDomainEntry) => {
    const tempDomain: Domain = {
      id: entry.id,
      url: entry.url,
      label: entry.label,
      folderId: null,
      protocol: entry.protocol || 'preserve',
      order: 0,
      createdAt: 0,
      updatedAt: 0,
    };

    const newUrl = buildSwapUrl(currentTabUrl, tempDomain, settings);
    await navigateToUrl(newUrl);
    window.close();
  };

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
        {match.otherEntries.map((entry) => {
          return (
            <button
              key={entry.id}
              onClick={() => handleSwap(entry)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left
                         hover:bg-secondary/60 transition-colors duration-100 group"
            >
              <EnvironmentBadge role={entry.role} size="sm" />
              <span className="text-xs text-foreground truncate flex-1">
                {entry.label || extractDisplayDomain(entry.url, false)}
              </span>
              <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
