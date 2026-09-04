"use client";

import { useSupportView } from "@/lib/support/support-view-context";

/** Per-fixture result scrape remains out of scope for support v1. */
export function useVisionResultSyncActionsEnabled(): boolean {
  const { isSupportView } = useSupportView();
  return !isSupportView;
}
