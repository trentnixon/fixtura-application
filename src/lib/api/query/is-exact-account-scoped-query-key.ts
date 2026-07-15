import type { QueryClient, QueryKey } from "@tanstack/react-query";

const USER_SCOPED_ACCOUNT_KEYS = new Set(["me"]);

function keySegmentAsAccountId(segment: unknown): string | null {
  if (typeof segment === "string" && segment.length > 0) return segment;
  if (typeof segment === "number" && Number.isFinite(segment) && segment > 0) {
    return String(Math.trunc(segment));
  }
  return null;
}

/**
 * True when the query key is scoped to exactly `accountId` via known registry shapes:
 * - `["account", <domain>, accountId, ...]` (excludes user-scoped `me` and shared catalogues)
 * - `["season-hub", <domain>, accountId, ...]`
 * - `["ui", "pickers", ..., "selectedId", accountId]`
 *
 * Compares only the dedicated account-id slot — never treats nested resource ids as account ids.
 */
export function isExactAccountScopedQueryKey(queryKey: QueryKey, accountId: string): boolean {
  if (!accountId || !Array.isArray(queryKey) || queryKey.length < 2) return false;
  const root = queryKey[0];

  if (root === "account") {
    const domain = queryKey[1];
    if (typeof domain === "string" && USER_SCOPED_ACCOUNT_KEYS.has(domain)) return false;
    if (queryKey.length < 3) return false;
    return keySegmentAsAccountId(queryKey[2]) === accountId;
  }

  if (root === "season-hub") {
    if (queryKey.length < 3) return false;
    return keySegmentAsAccountId(queryKey[2]) === accountId;
  }

  if (root === "ui" && queryKey[1] === "pickers") {
    const selectedIdIdx = queryKey.lastIndexOf("selectedId");
    if (selectedIdIdx < 0 || selectedIdIdx + 1 >= queryKey.length) return false;
    return keySegmentAsAccountId(queryKey[selectedIdIdx + 1]) === accountId;
  }

  return false;
}

/**
 * Cancel and remove every TanStack Query entry scoped to one exact account id.
 * Preserves `account.me` / `auth.me`, shared catalogues, and every other account's cache.
 */
export async function removeExactAccountScopedQueries(
  queryClient: QueryClient,
  accountId: string,
): Promise<void> {
  if (!accountId) return;
  const predicate = (query: { queryKey: QueryKey }) =>
    isExactAccountScopedQueryKey(query.queryKey, accountId);
  await queryClient.cancelQueries({ predicate });
  queryClient.removeQueries({ predicate });
}

/**
 * Clears known account-scoped session/local UI persistence for a deleted id.
 * Only removes keys that include the exact account id.
 */
export function clearDeletedAccountPersistedState(accountId: string): void {
  if (!accountId || typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(`manage-sponsors:${accountId}:local-sponsors`);
  } catch {
    // ignore storage failures during cleanup
  }
}
