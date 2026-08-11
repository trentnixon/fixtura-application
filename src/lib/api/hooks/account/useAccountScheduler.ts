import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountSchedulerResponse } from "@/types/api/account";

const schedulerGatewayRedirectTag = "schedulerGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (400/403/404) — not a query error. */
export type AccountSchedulerQueryResult =
  | AccountSchedulerResponse
  | {
      readonly _tag: typeof schedulerGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountSchedulerGatewayRedirect(
  value: AccountSchedulerQueryResult | undefined,
): value is Extract<AccountSchedulerQueryResult, { _tag: typeof schedulerGatewayRedirectTag }> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === schedulerGatewayRedirectTag
  );
}

/**
 * Scheduler payload for the scoped account (GET /api/accounts/[accountId]/scheduler, Phase 5).
 * Use for scheduler config and `Queued` / `isRendering` / `days_of_the_week`; not for render history (Phase 7) or `isUpdating` (use `useAccountSettings`).
 *
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAccountScheduler(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.scheduler(accountId),
    queryFn: async (): Promise<AccountSchedulerQueryResult> => {
      try {
        return await accountApi.getAccountScheduler(accountId);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: schedulerGatewayRedirectTag, reason };
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
