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

1. **Service Worker** (`src/background/`) — Runs in the background. Handles keyboard commands (`Alt+D` open popup, `Alt+Shift+D` quick swap) and right-click context menu. Reads from Chrome storage and navigates tabs.

2. **Popup UI** (`src/popup/`) — Main user interface for browsing, searching, and clicking domains. React app with Zustand store.

3. **Options Page** (`src/options/`) — Settings, keyboard shortcut customization, import/export. Separate React entry point.

### State Management

Zustand store composed of three slices (`src/store/slices/`): `domains`, `folders`, `settings`. A custom `chromeStorage` middleware (`src/store/middleware/`) persists state to Chrome Local Storage API with 500ms throttled writes. The store key is `domain-swapper-pro`.

### URL Swap Flow

When a user clicks a domain: get current tab URL → `parseDomainInput()` extracts target hostname/port/protocol → `buildSwapUrl()` preserves path+query and applies protocol rules → navigate tab → track in `recentDomains` (max 5). Core logic lives in `src/lib/urlUtils.ts`.

### Data Model

- **Domain**: URL + optional label, per-domain protocol setting (`http`/`https`/`preserve`), belongs to optional folder, has sort order.
- **Folder**: Supports nesting via `parentId`, has icon/color, collapsible.
- **Settings**: Theme (`light`/`dark`/`system`), `forceHttps`, keyboard shortcuts, sync toggle.

### Key Patterns

- **Zustand slice factories**: Each slice uses `StateCreator` typing pattern in `src/store/slices/`.
- **Path alias**: `~` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.json`).
- **Radix UI dialogs**: Modals use `Dialog.Root` → `Dialog.Portal` → `Dialog.Overlay` + `Dialog.Content`.
- **dnd-kit**: Drag-and-drop reordering with `DndContext` + `SortableContext`.
- **Fuse.js**: Fuzzy search over domains, memoized in `src/popup/hooks/useDomains.ts`.
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
