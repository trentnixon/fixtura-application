"use client";

import { useSupportView } from "@/lib/support/support-view-context";

/**
 * Vision scrape/sync POSTs require BFF `accountId` injection (Phase C).
 * Hide sync controls in support view until that ships.
 */
export function useVisionSyncActionsEnabled(): boolean {
  const { isSupportView } = useSupportView();
  return !isSupportView;
}
