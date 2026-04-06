import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountRenderTokenResponse } from "@/types/api/account";

const renderTokenGatewayRedirectTag = "renderTokenGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (400/403/404) — not a query error. */
export type AccountRenderTokenQueryResult =
  | AccountRenderTokenResponse
  | {
      readonly _tag: typeof renderTokenGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountRenderTokenGatewayRedirect(
  value: AccountRenderTokenQueryResult | undefined,
): value is Extract<AccountRenderTokenQueryResult, { _tag: typeof renderTokenGatewayRedirectTag }> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === renderTokenGatewayRedirectTag
  );
}

/**
 * Sanitized render-token payload for the scoped account (GET /api/accounts/[accountId]/render-token, Phase 6).
 * Use when the UI needs the credential without loading the legacy hub. Do not log or display `data.render_token.token`.
 *
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAccountRenderToken(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.renderToken(accountId),
    queryFn: async (): Promise<AccountRenderTokenQueryResult> => {
      try {
        return await accountApi.getAccountRenderToken(accountId);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: renderTokenGatewayRedirectTag, reason };
          }
        }
        throw e;
      }
    },
    staleTime: 0,
    retry: 1,
    enabled,
  });
}
