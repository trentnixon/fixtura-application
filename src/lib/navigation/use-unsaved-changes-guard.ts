"use client";

import { useEffect } from "react";

import { useUnsavedChangesContext } from "@/lib/navigation/unsaved-changes-context";

/** Registers beforeunload when the page has unsaved edits. */
export function useUnsavedChangesGuard(isDirty: boolean) {
  const { setIsDirty } = useUnsavedChangesContext();

  useEffect(() => {
    setIsDirty(isDirty);
    return () => setIsDirty(false);
  }, [isDirty, setIsDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);
}
