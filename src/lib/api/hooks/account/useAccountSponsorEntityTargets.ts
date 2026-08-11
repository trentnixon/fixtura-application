import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountSponsorEntityTargetsResponse } from "@/types/api/account";

const sponsorEntityTargetsGatewayRedirectTag = "sponsorEntityTargetsGatewayRedirect" as const;

export type AccountSponsorEntityTargetsQueryResult =
  | AccountSponsorEntityTargetsResponse
  | {
      readonly _tag: typeof sponsorEntityTargetsGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountSponsorEntityTargetsGatewayRedirect(
  value: AccountSponsorEntityTargetsQueryResult | undefined,
): value is Extract<
  AccountSponsorEntityTargetsQueryResult,
  { _tag: typeof sponsorEntityTargetsGatewayRedirectTag }
> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === sponsorEntityTargetsGatewayRedirectTag
  );
}

/**
 * Account-scoped catalogue of sponsor-assignable entity targets.
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker.
 */
export function useAccountSponsorEntityTargets(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.sponsorEntityTargets(accountId),
    queryFn: async (): Promise<AccountSponsorEntityTargetsQueryResult> => {
      try {
        return await accountApi.getAccountSponsorEntityTargets(accountId);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: sponsorEntityTargetsGatewayRedirectTag, reason };
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
