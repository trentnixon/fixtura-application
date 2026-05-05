import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountBillingOrdersResponse } from "@/types/api/account";

const billingOrdersGatewayRedirectTag = "billingOrdersGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (400/403/404) — not a query error. */
export type AccountBillingOrdersQueryResult =
  | AccountBillingOrdersResponse
  | {
      readonly _tag: typeof billingOrdersGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountBillingOrdersGatewayRedirect(
  value: AccountBillingOrdersQueryResult | undefined,
): value is Extract<
  AccountBillingOrdersQueryResult,
  { _tag: typeof billingOrdersGatewayRedirectTag }
> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === billingOrdersGatewayRedirectTag
  );
}

/**
 * Full order history for the scoped account (GET …/billing/orders → Strapi …/orders/account/:accountId).
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAccountBillingOrders(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.billingOrders(accountId),
    queryFn: async (): Promise<AccountBillingOrdersQueryResult> => {
      try {
        return await accountApi.getAccountBillingOrders(accountId);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: billingOrdersGatewayRedirectTag, reason };
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
