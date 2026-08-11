import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountSettingsResponse } from "@/types/api/account";

const settingsGatewayRedirectTag = "settingsGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (400/403/404) — not a query error. */
export type AccountSettingsQueryResult =
  | AccountSettingsResponse
  | {
      readonly _tag: typeof settingsGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountSettingsGatewayRedirect(
  value: AccountSettingsQueryResult | undefined,
): value is Extract<AccountSettingsQueryResult, { _tag: typeof settingsGatewayRedirectTag }> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === settingsGatewayRedirectTag
  );
}

/**
 * Account settings for the scoped account (GET /api/accounts/[accountId]/settings).
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAccountSettings(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.settings(accountId),
    queryFn: async (): Promise<AccountSettingsQueryResult> => {
      try {
        return await accountApi.getAccountSettings(accountId);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: settingsGatewayRedirectTag, reason };
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
