import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatusExcludingBadRequest,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountRendersListParams, AccountRendersListResponse } from "@/types/api/account";

const rendersGatewayRedirectTag = "rendersGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (403/404 only) — not a query error. */
export type AccountRendersQueryResult =
  | AccountRendersListResponse
  | {
      readonly _tag: typeof rendersGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountRendersGatewayRedirect(
  value: AccountRendersQueryResult | undefined,
): value is Extract<AccountRendersQueryResult, { _tag: typeof rendersGatewayRedirectTag }> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === rendersGatewayRedirectTag
  );
}

/**
 * Paginated render list for the scoped account (GET /api/accounts/[accountId]/renders, Phase 7).
 * HTTP 400 (invalid filters/pagination) surfaces as query error — not a gateway redirect.
 * HTTP 403/404 resolve successfully with a gateway redirect marker.
 */
export function useAccountRenders(
  accountId: string,
  params?: AccountRendersListParams,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.renders(accountId, params),
    queryFn: async (): Promise<AccountRendersQueryResult> => {
      try {
        return await accountApi.getAccountRenders(accountId, params);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatusExcludingBadRequest(e.status);
          if (reason) {
            return { _tag: rendersGatewayRedirectTag, reason };
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
