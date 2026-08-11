"use client";

import { useSupportView } from "@/lib/support/support-view-context";

/**
 * Season-hub APIs are owner-scoped only — support users get 404.
 * Skip those queries in support view to avoid global error toasts.
 */
export function useSeasonHubQueriesEnabled(accountId: string | undefined): boolean {
  const { isSupportView } = useSupportView();
  return Boolean(accountId) && !isSupportView;
}
