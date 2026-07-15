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
 * True when the query key is account- or season-hub-scoped and carries a different
 * account id than `currentAccountId`. Never matches user-scoped `["account","me"]`.
 */
export function isOtherAccountScopedQueryKey(
  queryKey: QueryKey,
  currentAccountId: string,
): boolean {
  if (!Array.isArray(queryKey) || queryKey.length < 2) return false;
  const root = queryKey[0];
  if (root !== "account" && root !== "season-hub") return false;

  if (
    root === "account" &&
    typeof queryKey[1] === "string" &&
    USER_SCOPED_ACCOUNT_KEYS.has(queryKey[1])
  ) {
    return false;
  }

  for (let i = 1; i < queryKey.length; i += 1) {
    const segment = keySegmentAsAccountId(queryKey[i]);
    if (segment == null) continue;
    if (segment === currentAccountId) return false;
    // Treat digit-only positive ids as account slots (matches route segment convention).
    if (/^\d+$/.test(segment)) return true;
  }
  return false;
}

/**
 * Cancel in-flight account / season-hub queries for accounts other than `currentAccountId`.
 * Leaves warm cache entries in place for A↔B return; does not cancel `account.me` / `auth.me`.
 */
export function cancelOtherAccountQueries(
  queryClient: QueryClient,
  currentAccountId: string,
): Promise<void> {
  if (!currentAccountId) return Promise.resolve();
  return queryClient.cancelQueries({
    predicate: (query) => isOtherAccountScopedQueryKey(query.queryKey, currentAccountId),
  });
}
