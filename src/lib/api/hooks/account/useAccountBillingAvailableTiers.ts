import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountBillingAvailableTiersResponse } from "@/types/api/account";

const billingAvailableTiersGatewayRedirectTag = "billingAvailableTiersGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (400/403/404) — not a query error. */
export type AccountBillingAvailableTiersQueryResult =
  | AccountBillingAvailableTiersResponse
  | {
      readonly _tag: typeof billingAvailableTiersGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountBillingAvailableTiersGatewayRedirect(
  value: AccountBillingAvailableTiersQueryResult | undefined,
): value is Extract<
  AccountBillingAvailableTiersQueryResult,
  { _tag: typeof billingAvailableTiersGatewayRedirectTag }
> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === billingAvailableTiersGatewayRedirectTag
  );
}

/**
 * Available billing tiers for plan selection (GET …/billing/available-tiers).
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAccountBillingAvailableTiers(
  accountId: string,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.billingAvailableTiers(accountId),
    queryFn: async (): Promise<AccountBillingAvailableTiersQueryResult> => {
      try {
        return await accountApi.getAccountBillingAvailableTiers(accountId);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: billingAvailableTiersGatewayRedirectTag, reason };
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
