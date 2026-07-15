import { ApiError } from "@/lib/api/client/api-error";

import type { CreateFirstAccountResponse } from "@/types/api/account";

/**
 * Fail-closed parse of POST /api/account/first success body.
 * Accepts only `{ data: { accountId: number } }` (both 200 reuse and 201 create).
 */
export function parseCreateFirstAccountResponse(payload: unknown): CreateFirstAccountResponse {
  if (typeof payload !== "object" || payload === null) {
    throw new ApiError({
      status: 500,
      message: "Invalid account create response",
      details: payload,
    });
  }

  const data = (payload as Record<string, unknown>)["data"];
  if (typeof data !== "object" || data === null) {
    throw new ApiError({
      status: 500,
      message: "Invalid account create response",
      details: payload,
    });
  }

  const accountId = (data as Record<string, unknown>)["accountId"];
  if (typeof accountId !== "number" || !Number.isFinite(accountId) || accountId <= 0) {
    throw new ApiError({
      status: 500,
      message: "Invalid account create response",
      details: payload,
    });
  }

  return { data: { accountId } };
}
