"use client";

/**
 * Gate season-hub React Query hooks until route `accountId` is known.
 * Support users use the same BFF reads as owners (TKT-2026-017 Track 1).
 */
export function useSeasonHubQueriesEnabled(accountId: string | undefined): boolean {
  return Boolean(accountId);
}
