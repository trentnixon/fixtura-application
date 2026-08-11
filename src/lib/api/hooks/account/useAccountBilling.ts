import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountBillingResponse } from "@/types/api/account";

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

/**
 * Billing and payment context for the scoped account (GET /api/accounts/[accountId]/billing).
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAccountBilling(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.billing(accountId),
    queryFn: async (): Promise<AccountBillingQueryResult> => {
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
    },
    staleTime: 60 * 1000,
    retry: 1,
    enabled,
  });
}
