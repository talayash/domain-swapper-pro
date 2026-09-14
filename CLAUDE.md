# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Domain Swapper Pro is a Chrome Extension (Manifest V3) that enables one-click domain/URL switching while preserving the current URL path. Built with React 18 + TypeScript, Zustand, Vite with CRXJS plugin, Tailwind CSS, and Radix UI.

## Commands

```bash
npm run dev          # Vite dev server with hot reload
npm run build        # TypeScript check + Vite production build
npm run typecheck    # Type checking only (tsc --noEmit)
```

No test framework is configured. There are no lint commands — type checking via `tsc --noEmit` is the primary static analysis.

## Architecture

### Three Extension Contexts

1. **Service Worker** (`src/background/`) — Runs in the background. Handles the `quick-swap` command (`Alt+Shift+D`), right-click context menu, and the toolbar badge. Reads from Chrome storage and navigates tabs. `Alt+D` uses Chrome's reserved `_execute_action` command, which opens the popup natively and never reaches `onCommand`. **All listeners must be registered at module top level** — MV3 suspends the worker when idle and only top-level code re-runs on wake, so anything registered inside `onInstalled` is lost.

2. **Popup UI** (`src/popup/`) — Main user interface for browsing, searching, and clicking domains. React app with Zustand store. Keyboard-first: `usePopupRows` flattens ladder entries, folders (respecting collapse/search visibility), and uncategorized domains into one ordered row list; `DomainList` drives arrow/Enter/Esc navigation from it, and `PopupNavProvider` shares the active row ID. All swaps go through `useSwap`, which also flushes the throttled storage write before `window.close()`.

3. **Options Page** (`src/options/`) — Settings, keyboard shortcut customization, import/export. Separate React entry point.

### State Management

Zustand store composed of four slices (`src/store/slices/`): `domains`, `folders`, `settings`, `profiles`. A custom `chromeStorage` middleware (`src/store/middleware/`) persists state to Chrome Local Storage API with 500ms throttled writes; `flushStore()` forces a pending write out (required before closing the popup). The store key is `domain-swapper-pro`. The `folders` slice is typed against `FoldersSlice & Pick<DomainsSlice, 'domains'>` because deleting a folder moves its domains to Uncategorized.

### URL Swap Flow

When a user clicks a domain: get current tab URL → `parseDomainInput()` extracts target hostname/port/protocol (lowercased, path stripped) → `buildSwapUrl()` preserves path+query and applies protocol rules → `openSwapUrl()` opens it in the current tab, a new tab, or a new window → track in `recentDomains` (max 5). The target comes from `settings.openBehavior` unless a modifier overrides it: Shift = new window, Ctrl/Cmd/middle-click toggles new tab (`resolveSwapTarget()` in `useSwap`). Background handlers (quick-swap, context menu) also go through `openSwapUrl()` and honor the setting. Core logic lives in `src/lib/urlUtils.ts`. Environment detection (popup ladder, item badges, toolbar badge) matches on `getHostKey()` = `hostname[:port]`, the single shared predicate. Profile entries are adapted for swapping via `profileEntryToDomain()`.

### Data Model

- **Domain**: URL + optional label, per-domain protocol setting (`http`/`https`/`preserve`), belongs to optional folder, has sort order.
- **Folder**: Supports nesting via `parentId`, has icon/color, collapsible.
- **Settings**: Theme (`light`/`dark`/`system`), `forceHttps`, `openBehavior` (`current`/`newTab`/`newWindow`), keyboard shortcuts, sync toggle.

### Key Patterns

- **Zustand slice factories**: Each slice uses `StateCreator` typing pattern in `src/store/slices/`.
- **Path alias**: `~` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).
- **Radix UI dialogs**: Modals use `Dialog.Root` → `Dialog.Portal` → `Dialog.Overlay` + `Dialog.Content`.
- **dnd-kit**: Drag-and-drop reordering with `DndContext` + `SortableContext`.
- **Fuse.js**: Fuzzy search over domains, memoized in `src/popup/hooks/usePopupRows.ts`. While searching, folders with no matches are hidden and folders with matches are forced open.
- **Data migrations**: `src/lib/migrations.ts` handles version 0→1 format migration on load.
- **Validation**: Functions return `{ isValid: boolean; error?: string }` (`src/lib/validators.ts`).

### Styling

Tailwind CSS with CSS custom properties for theming. Component-level utility classes defined in `src/styles/globals.css` (`btn`, `btn-primary`, `input`, `modal-overlay`, etc.). Dark mode via class strategy.

### Chrome Permissions

Minimal: `activeTab`, `storage`, `contextMenus`.

## Development Notes

- Hot reload works for popup/options changes. Background service worker changes require manual reload in `chrome://extensions`.
- Build output goes to `dist/` (gitignored). Load this folder unpacked in Chrome for testing.
- TypeScript strict mode is enabled.
