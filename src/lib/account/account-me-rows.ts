import type { AccountMePayload, AccountSummary } from "@/types/api/account";

/**
 * Rows for the org picker: prefers `accounts[]`, falls back to legacy single `accountId` + contentHub.
 */
export function accountPickerRowsFromMePayload(
  payload: AccountMePayload | undefined,
): AccountSummary[] {
  if (!payload) return [];
  const accounts = payload.accounts ?? [];
  if (accounts.length > 0) return accounts;
  if (payload.accountId != null) {
    return [{ id: payload.accountId, contentHub: payload.contentHub }];
  }
  return [];
}
