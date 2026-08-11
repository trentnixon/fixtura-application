import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatusExcludingBadRequest,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type {
  AccountAnalyticsOverviewParams,
  AccountAnalyticsOverviewResponse,
} from "@/types/api/account";

const analyticsOverviewGatewayRedirectTag = "analyticsOverviewGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (403/404 only) — not a query error. */
export type AccountAnalyticsOverviewQueryResult =
  | AccountAnalyticsOverviewResponse
  | {
      readonly _tag: typeof analyticsOverviewGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountAnalyticsOverviewGatewayRedirect(
  value: AccountAnalyticsOverviewQueryResult | undefined,
): value is Extract<
  AccountAnalyticsOverviewQueryResult,
  { _tag: typeof analyticsOverviewGatewayRedirectTag }
> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === analyticsOverviewGatewayRedirectTag
  );
}

/**
 * Range-scoped analytics for the account (GET /api/accounts/[accountId]/analytics/overview, Phase 9).
 * HTTP 400 (invalid dates / range) surfaces as query error — not a gateway redirect.
 * HTTP 403/404 resolve successfully with a gateway redirect marker.
 */
export function useAccountAnalyticsOverview(
  accountId: string,
  params?: AccountAnalyticsOverviewParams,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.analyticsOverview(accountId, params),
    queryFn: async (): Promise<AccountAnalyticsOverviewQueryResult> => {
      try {
        return await accountApi.getAccountAnalyticsOverview(accountId, params);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatusExcludingBadRequest(e.status);
          if (reason) {
            return { _tag: analyticsOverviewGatewayRedirectTag, reason };
          }
        }
        throw e;
      }
    },
    staleTime: 30 * 1000,
    retry: 1,
    enabled,
  });
}
