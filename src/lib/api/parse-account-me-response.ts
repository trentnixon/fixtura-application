import { ApiError } from "@/lib/api/client/api-error";

import type { AccountMeResponse, AccountSummary } from "@/types/api/account";

function isAccountSummary(value: unknown): value is AccountSummary {
  if (typeof value !== "object" || value === null) return false;
  const id = (value as Record<string, unknown>)["id"];
  return typeof id === "number" && Number.isFinite(id) && id > 0;
}

/**
 * Fail-closed parse of GET /api/account/me success body.
 * Requires `data.accounts` to be an array (empty allowed). Never synthesizes rows from
 * compatibility `data.accountId`.
 */
export function parseAccountMeResponse(payload: unknown): AccountMeResponse {
  if (typeof payload !== "object" || payload === null) {
    throw new ApiError({
      status: 500,
      message: "Invalid account me response",
      details: payload,
    });
  }

  const data = (payload as Record<string, unknown>)["data"];
  if (typeof data !== "object" || data === null) {
    throw new ApiError({
      status: 500,
      message: "Invalid account me response",
      details: payload,
    });
  }

  const dataRecord = data as Record<string, unknown>;
  const accounts = dataRecord["accounts"];
  if (!Array.isArray(accounts)) {
    throw new ApiError({
      status: 500,
      message: "Invalid account me response: accounts must be an array",
      details: payload,
    });
  }

  if (!accounts.every(isAccountSummary)) {
    throw new ApiError({
      status: 500,
      message: "Invalid account me response: accounts rows are malformed",
      details: payload,
    });
  }

  return {
    data: {
      ...(dataRecord as unknown as AccountMeResponse["data"]),
      accounts,
    },
  };
}
