import { createContext, useContext, type ReactNode } from 'react';

interface PopupNavContextValue {
  /** Row currently highlighted by keyboard navigation, or null. */
  activeRowId: string | null;
}

const PopupNavContext = createContext<PopupNavContextValue>({ activeRowId: null });

export function PopupNavProvider({
  activeRowId,
  children,
}: PopupNavContextValue & { children: ReactNode }) {
  return (
    <PopupNavContext.Provider value={{ activeRowId }}>
      {children}
    </PopupNavContext.Provider>
  );
}

/** Whether the given row is the keyboard-highlighted one. */
export function useIsActiveRow(rowId: string): boolean {
  return useContext(PopupNavContext).activeRowId === rowId;
}
