import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountBillingInvoiceRequestsResponse } from "@/types/api/account";

const billingInvoiceRequestsGatewayRedirectTag = "billingInvoiceRequestsGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (400/403/404) — not a query error. */
export type AccountBillingInvoiceRequestsQueryResult =
  | AccountBillingInvoiceRequestsResponse
  | {
      readonly _tag: typeof billingInvoiceRequestsGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountBillingInvoiceRequestsGatewayRedirect(
  value: AccountBillingInvoiceRequestsQueryResult | undefined,
): value is Extract<
  AccountBillingInvoiceRequestsQueryResult,
  { _tag: typeof billingInvoiceRequestsGatewayRedirectTag }
> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === billingInvoiceRequestsGatewayRedirectTag
  );
}

/**
 * Invoice request history for the scoped account (GET …/billing/invoice-requests).
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAccountBillingInvoiceRequests(
  accountId: string,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.billingInvoiceRequests(accountId),
    queryFn: async (): Promise<AccountBillingInvoiceRequestsQueryResult> => {
      try {
        return await accountApi.getAccountBillingInvoiceRequests(accountId);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: billingInvoiceRequestsGatewayRedirectTag, reason };
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
