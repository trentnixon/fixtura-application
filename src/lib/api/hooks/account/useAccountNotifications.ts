import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountNotificationsResponse } from "@/types/api/account";

const notificationsGatewayRedirectTag = "notificationsGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (400/403/404) — not a query error. */
export type AccountNotificationsQueryResult =
  | AccountNotificationsResponse
  | {
      readonly _tag: typeof notificationsGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountNotificationsGatewayRedirect(
  value: AccountNotificationsQueryResult | undefined,
): value is Extract<
  AccountNotificationsQueryResult,
  { _tag: typeof notificationsGatewayRedirectTag }
> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === notificationsGatewayRedirectTag
  );
}

/**
 * Notifications slice for the scoped account (GET /api/accounts/[accountId]/notifications).
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAccountNotifications(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.notifications(accountId),
    queryFn: async (): Promise<AccountNotificationsQueryResult> => {
      try {
        return await accountApi.getAccountNotifications(accountId);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: notificationsGatewayRedirectTag, reason };
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
