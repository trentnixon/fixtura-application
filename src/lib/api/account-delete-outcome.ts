import { accountPickerRowsFromMePayload } from "@/lib/account/account-me-rows";
import { ApiError } from "@/lib/api/client/api-error";

import type { AccountMePayload } from "@/types/api/account";

const DEFINITE_DELETE_FAILURE_STATUSES = new Set([400, 401, 403, 404]);

/**
 * Definite CMS/BFF delete failures — retain the account; do not reconcile as success.
 */
export function isDefiniteDeleteFailure(error: unknown): error is ApiError {
  if (!(error instanceof ApiError)) return false;
  return DEFINITE_DELETE_FAILURE_STATUSES.has(error.status);
}

/**
 * Uncertain delete outcomes (timeout / transport / server error).
 * Caller must refetch `/api/account/me` before claiming success or failure.
 */
export function isUncertainDeleteOutcome(error: unknown): boolean {
  if (!(error instanceof ApiError)) return true;
  if (error.status === 408) return true;
  if (error.status >= 500) return true;
  return false;
}

/**
 * Whether `accountId` appears in owned `accounts[]` (never uses compatibility `accountId`).
 */
export function accountIdPresentInMePayload(
  payload: AccountMePayload | undefined,
  accountId: string,
): boolean {
  if (!accountId) return false;
  return accountPickerRowsFromMePayload(payload).some((row) => String(row.id) === accountId);
}

export const DELETE_CONFIRMATION_FAILED_MESSAGE =
  "We could not confirm whether the account was deleted. Refresh organisation selection and try again if it is still listed.";
