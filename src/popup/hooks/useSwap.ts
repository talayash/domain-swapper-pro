import { useCallback } from 'react';
import type { Domain, SwapTarget } from '~/types';
import { useStore, flushStore } from '~/store';
import { buildSwapUrl, getCurrentTabUrl, isSwappableUrl, openSwapUrl } from '~/lib/urlUtils';

export interface SwapOptions {
  /**
   * Where to open the swapped URL. Omit to use the user's default
   * (`settings.openBehavior`).
   */
  target?: SwapTarget;
  /** Record the target in `recentDomains` (only meaningful for saved domains). */
  trackRecent?: boolean;
}

interface ModifierState {
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  /** Mouse button for click events; undefined for keyboard events. */
  button?: number;
}

/**
 * Resolve where a click / Enter should open the swapped URL.
 *
 * - Shift          → new window (matches Chrome's Shift+click convention)
 * - Ctrl / Cmd / middle-click → toggles between the current tab and a new tab,
 *   so the modifier still means something when "new tab" is already the default
 * - no modifier    → the user's default from Preferences
 */
export function resolveSwapTarget(e: ModifierState, defaultTarget: SwapTarget): SwapTarget {
  if (e.shiftKey) return 'newWindow';
  if (e.ctrlKey || e.metaKey || e.button === 1) {
    return defaultTarget === 'newTab' ? 'current' : 'newTab';
  }
  return defaultTarget;
}

/**
 * Single swap entry point for every popup surface (domain rows, the
 * environment ladder, keyboard shortcuts). Builds the target URL from the
 * current tab, opens it in the requested target, persists state, then closes.
 */
export function useSwap() {
  const settings = useStore((state) => state.settings);
  const addToRecent = useStore((state) => state.addToRecent);

  const swap = useCallback(
    async (domain: Domain, options: SwapOptions = {}): Promise<boolean> => {
      const currentUrl = await getCurrentTabUrl();
      if (!isSwappableUrl(currentUrl)) return false;

      const newUrl = buildSwapUrl(currentUrl, domain, settings);

      if (options.trackRecent) {
        addToRecent(domain.id);
      }

      await openSwapUrl(newUrl, options.target ?? settings.openBehavior);

      // The popup document is destroyed by window.close(), which would also
      // kill the throttled storage write. Flush first so recents survive.
      await flushStore();
      window.close();
      return true;
    },
    [settings, addToRecent]
  );

  /** Resolve a mouse/keyboard event against the user's default open behavior. */
  const targetFor = useCallback(
    (e: ModifierState) => resolveSwapTarget(e, settings.openBehavior),
    [settings.openBehavior]
  );

  return { swap, targetFor };
}

/** Tooltip shared by every clickable swap row. */
export const SWAP_HINT = 'Click to swap · Ctrl+click / middle-click: new tab · Shift+click: new window';
