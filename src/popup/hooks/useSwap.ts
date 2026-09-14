import { useCallback } from 'react';
import type { Domain } from '~/types';
import { useStore, flushStore } from '~/store';
import {
  buildSwapUrl,
  getCurrentTabUrl,
  isSwappableUrl,
  navigateToUrl,
  openUrlInNewTab,
} from '~/lib/urlUtils';

export interface SwapOptions {
  /** Open the swapped URL in a new tab instead of navigating the current one. */
  newTab?: boolean;
  /** Record the target in `recentDomains` (only meaningful for saved domains). */
  trackRecent?: boolean;
}

/**
 * Returns whether a mouse event asks for "open in new tab" semantics:
 * Ctrl/Cmd-click or a middle-button click.
 */
export function wantsNewTab(e: { ctrlKey: boolean; metaKey: boolean; button?: number }): boolean {
  return e.ctrlKey || e.metaKey || e.button === 1;
}

/**
 * Single swap entry point for every popup surface (domain rows, the
 * environment ladder, keyboard shortcuts). Builds the target URL from the
 * current tab, navigates or opens a new tab, persists state, then closes.
 */
export function useSwap() {
  const settings = useStore((state) => state.settings);
  const addToRecent = useStore((state) => state.addToRecent);

  return useCallback(
    async (target: Domain, options: SwapOptions = {}): Promise<boolean> => {
      const currentUrl = await getCurrentTabUrl();
      if (!isSwappableUrl(currentUrl)) return false;

      const newUrl = buildSwapUrl(currentUrl, target, settings);

      if (options.trackRecent) {
        addToRecent(target.id);
      }

      if (options.newTab) {
        await openUrlInNewTab(newUrl);
      } else {
        await navigateToUrl(newUrl);
      }

      // The popup document is destroyed by window.close(), which would also
      // kill the throttled storage write. Flush first so recents survive.
      await flushStore();
      window.close();
      return true;
    },
    [settings, addToRecent]
  );
}
