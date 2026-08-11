import type { AccountMePayload } from "@/types/api/account";

/**
 * Whether the user can access the support super-user directory and cross-account reads.
 * UI gating only — backend re-checks on every request.
 */
export function canAccessAllAccountsFromMePayload(payload: AccountMePayload | undefined): boolean {
  return payload?.user?.capabilities?.canAccessAllAccounts === true;
}

/** Owned account ids from GET /api/account/me `accounts[]`. */
export function ownedAccountIdsFromMePayload(payload: AccountMePayload | undefined): string[] {
  if (!payload?.accounts?.length) return [];
  return payload.accounts.map((row) => String(row.id));
}

/** Whether `accountId` appears in the user's owned `accounts[]`. */
export function isOwnedAccountId(
  payload: AccountMePayload | undefined,
  accountId: string | undefined,
): boolean {
  if (!accountId || accountId === "") return false;
  return ownedAccountIdsFromMePayload(payload).includes(accountId);
}

/** Support staff with capability but zero owned accounts. */
export function isSupportOnlyUser(payload: AccountMePayload | undefined): boolean {
  return (
    canAccessAllAccountsFromMePayload(payload) && ownedAccountIdsFromMePayload(payload).length === 0
  );
}

/**
 * Whether the user is viewing a customer account via support (not their own org).
 */
export function isSupportViewForAccount(
  payload: AccountMePayload | undefined,
  routeAccountId: string | undefined,
): boolean {
  if (!canAccessAllAccountsFromMePayload(payload)) return false;
  if (!routeAccountId) return false;
  return !isOwnedAccountId(payload, routeAccountId);
}
