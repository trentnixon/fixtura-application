import { ApiError } from "@/lib/api/client/api-error";

import type { DeleteAccountResponse } from "@/types/api/account";

/**
 * Fail-closed parse of DELETE /api/accounts/:accountId success body.
 * Accepts only `{ data: { accountId: number, deleted: true } }`.
 * When `expectedAccountId` is set, the returned id must match.
 */
export function parseDeleteAccountResponse(
  payload: unknown,
  expectedAccountId?: string,
): DeleteAccountResponse {
  if (typeof payload !== "object" || payload === null) {
    throw new ApiError({
      status: 500,
      message: "Invalid account delete response",
      details: payload,
    });
  }

  const data = (payload as Record<string, unknown>)["data"];
  if (typeof data !== "object" || data === null) {
    throw new ApiError({
      status: 500,
      message: "Invalid account delete response",
      details: payload,
    });
  }

  const record = data as Record<string, unknown>;
  const accountId = record["accountId"];
  const deleted = record["deleted"];

  if (typeof accountId !== "number" || !Number.isFinite(accountId) || accountId <= 0) {
    throw new ApiError({
      status: 500,
      message: "Invalid account delete response",
      details: payload,
    });
  }

  if (deleted !== true) {
    throw new ApiError({
      status: 500,
      message: "Invalid account delete response",
      details: payload,
    });
  }

  if (
    expectedAccountId != null &&
    expectedAccountId !== "" &&
    String(accountId) !== expectedAccountId
  ) {
    throw new ApiError({
      status: 500,
      message: "Account delete response id does not match request",
      details: payload,
    });
  }

  return { data: { accountId, deleted: true } };
}
