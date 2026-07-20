"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type UnsavedChangesContextValue = {
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  confirmIfDirty: (action: () => void) => void;
};

const UnsavedChangesContext = createContext<UnsavedChangesContextValue | null>(null);

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false);

  const confirmIfDirty = useCallback(
    (action: () => void) => {
      if (!isDirty) {
        action();
        return;
      }
      const ok = window.confirm("You have unsaved changes. Leave this page without saving?");
      if (ok) {
        setIsDirty(false);
        action();
      }
    },
    [isDirty],
  );

  const value = useMemo(() => ({ isDirty, setIsDirty, confirmIfDirty }), [isDirty, confirmIfDirty]);

  return <UnsavedChangesContext.Provider value={value}>{children}</UnsavedChangesContext.Provider>;
}

export function useUnsavedChangesContext(): UnsavedChangesContextValue {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) {
    return {
      isDirty: false,
      setIsDirty: () => {},
      confirmIfDirty: (action) => action(),
    };
  }
  return ctx;
}
