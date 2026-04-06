import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountRenderDetailResponse } from "@/types/api/account";

const renderDetailGatewayRedirectTag = "renderDetailGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (400/403/404) — not a query error. */
export type AccountRenderDetailQueryResult =
  | AccountRenderDetailResponse
  | {
      readonly _tag: typeof renderDetailGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountRenderDetailGatewayRedirect(
  value: AccountRenderDetailQueryResult | undefined,
): value is Extract<
  AccountRenderDetailQueryResult,
  { _tag: typeof renderDetailGatewayRedirectTag }
> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === renderDetailGatewayRedirectTag
  );
}

/**
 * Single render detail for the scoped account (GET /api/accounts/[accountId]/renders/[renderId], Phase 8).
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAccountRenderDetail(
  accountId: string,
  renderId: string,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? Boolean(accountId && renderId);
  return useQuery({
    queryKey: queryKeys.account.renderDetail(accountId, renderId),
    queryFn: async (): Promise<AccountRenderDetailQueryResult> => {
      try {
        return await accountApi.getAccountRenderDetail(accountId, renderId);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: renderDetailGatewayRedirectTag, reason };
          }
        }
        throw e;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled,
  });
}
