"use client";

import { useCallback, useEffect, useState } from "react";

import type { SelectOrgSortMode } from "@/lib/account/select-organisation-workspace";

const PREF_KEY_PREFIX = "fixtura:select-org-preferences:";

export type SelectOrgViewMode = "grid" | "list";

type StoredSelectOrgPreferencesV1 = {
  version: 1;
  viewMode: SelectOrgViewMode;
  sortMode: SelectOrgSortMode;
};

const VALID_SORT_MODES: SelectOrgSortMode[] = [
  "name-asc",
  "name-desc",
  "newest-first",
  "setup-first",
];

function storageKey(userId: number): string {
  return `${PREF_KEY_PREFIX}${userId}`;
}

function parseStoredPreferences(raw: string): StoredSelectOrgPreferencesV1 | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      (parsed as { version: unknown }).version === 1 &&
      ((parsed as { viewMode: unknown }).viewMode === "grid" ||
        (parsed as { viewMode: unknown }).viewMode === "list") &&
      VALID_SORT_MODES.includes((parsed as { sortMode: SelectOrgSortMode }).sortMode)
    ) {
      return parsed as StoredSelectOrgPreferencesV1;
    }
  } catch {
    return null;
  }
  return null;
}

function readPreferences(userId: number | undefined): StoredSelectOrgPreferencesV1 | null {
  if (userId == null || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return null;
    return parseStoredPreferences(raw);
  } catch {
    return null;
  }
}

function writePreferences(userId: number | undefined, prefs: StoredSelectOrgPreferencesV1): void {
  if (userId == null || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(prefs));
  } catch {
    // Ignore quota / privacy errors.
  }
}

export function defaultSelectOrgViewMode(
  organisationCount: number,
  storedViewMode: SelectOrgViewMode | undefined,
  isMobile: boolean,
): SelectOrgViewMode {
  if (storedViewMode) return storedViewMode;
  if (isMobile) return "list";
  return "grid";
}

export function useSelectOrgPreferences(userId: number | undefined) {
  const [viewMode, setViewModeState] = useState<SelectOrgViewMode | undefined>(undefined);
  const [sortMode, setSortModeState] = useState<SelectOrgSortMode>("name-asc");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = readPreferences(userId);
    if (stored) {
      setViewModeState(stored.viewMode);
      setSortModeState(stored.sortMode);
    }
    setHydrated(true);
  }, [userId]);

  const persist = useCallback(
    (next: Partial<Pick<StoredSelectOrgPreferencesV1, "viewMode" | "sortMode">>) => {
      const merged: StoredSelectOrgPreferencesV1 = {
        version: 1,
        viewMode: next.viewMode ?? viewMode ?? "grid",
        sortMode: next.sortMode ?? sortMode,
      };
      writePreferences(userId, merged);
    },
    [sortMode, userId, viewMode],
  );

  const setViewMode = useCallback(
    (mode: SelectOrgViewMode) => {
      setViewModeState(mode);
      persist({ viewMode: mode });
    },
    [persist],
  );

  const setSortMode = useCallback(
    (mode: SelectOrgSortMode) => {
      setSortModeState(mode);
      persist({ sortMode: mode });
    },
    [persist],
  );

  return {
    viewMode,
    sortMode,
    setViewMode,
    setSortMode,
    hydrated,
    storedViewMode: viewMode,
  };
}
