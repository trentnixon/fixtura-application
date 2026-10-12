import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountBillingResponse, AccountBillingSummaryV1 } from "@/types/api/account";

const billingGatewayRedirectTag = "billingGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (400/403/404) — not a query error. */
export type AccountBillingQueryResult =
  | AccountBillingResponse
  | {
      readonly _tag: typeof billingGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountBillingGatewayRedirect(
  value: AccountBillingQueryResult | undefined,
): value is Extract<AccountBillingQueryResult, { _tag: typeof billingGatewayRedirectTag }> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === billingGatewayRedirectTag
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isAccountBillingSummary(value: unknown): value is AccountBillingSummaryV1 {
  if (!isRecord(value)) return false;
  return (
    typeof value["billingStatus"] === "string" &&
    typeof value["accessStatus"] === "string" &&
    "activeOrder" in value &&
    "currentPlan" in value &&
    "trial" in value
  );
}

/**
 * Billing summary from the shared `queryKeys.account.billing` cache.
 * Account pages store `{ data: summary }`. The organisation picker used to store the summary itself.
 */
export function readAccountBillingSummary(value: unknown): AccountBillingSummaryV1 | undefined {
  if (!isRecord(value)) return undefined;
  if (value["_tag"] === billingGatewayRedirectTag) return undefined;
  const nested = value["data"];
  if (isAccountBillingSummary(nested)) return nested;
  if (isAccountBillingSummary(value)) return value;
  return undefined;
}

/** Same query function as {@link useAccountBilling}, including gateway-redirect results. */
export async function fetchAccountBillingQueryResult(
  accountId: string,
): Promise<AccountBillingQueryResult> {
  try {
    return await accountApi.getAccountBilling(accountId);
  } catch (e) {
    if (e instanceof ApiError) {
      const reason = selectOrgReasonFromApiStatus(e.status);
      if (reason) {
        return { _tag: billingGatewayRedirectTag, reason };
      }
    }
    throw e;
  }
}

/**
 * Billing and payment context for the scoped account (GET /api/accounts/[accountId]/billing).
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAccountBilling(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.billing(accountId),
    queryFn: () => fetchAccountBillingQueryResult(accountId),
    staleTime: 60 * 1000,
    retry: 1,
    enabled,
  });
}
