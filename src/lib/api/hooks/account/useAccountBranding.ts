import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountBrandingResponse } from "@/types/api/account";

const brandingGatewayRedirectTag = "brandingGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (400/403/404) — not a query error. */
export type AccountBrandingQueryResult =
  | AccountBrandingResponse
  | {
      readonly _tag: typeof brandingGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountBrandingGatewayRedirect(
  value: AccountBrandingQueryResult | undefined,
): value is Extract<AccountBrandingQueryResult, { _tag: typeof brandingGatewayRedirectTag }> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === brandingGatewayRedirectTag
  );
}

/**
 * Account branding for the scoped account (GET /api/accounts/[accountId]/branding).
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAccountBranding(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.branding(accountId),
    queryFn: async (): Promise<AccountBrandingQueryResult> => {
      try {
        return await accountApi.getAccountBranding(accountId);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: brandingGatewayRedirectTag, reason };
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
