import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountClubLogosDirectoryResponse } from "@/types/api/account";

const clubLogosDirectoryGatewayRedirectTag = "clubLogosDirectoryGatewayRedirect" as const;

export type AccountClubLogosDirectoryQueryResult =
  | AccountClubLogosDirectoryResponse
  | {
      readonly _tag: typeof clubLogosDirectoryGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountClubLogosDirectoryGatewayRedirect(
  value: AccountClubLogosDirectoryQueryResult | undefined,
): value is Extract<
  AccountClubLogosDirectoryQueryResult,
  { _tag: typeof clubLogosDirectoryGatewayRedirectTag }
> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === clubLogosDirectoryGatewayRedirectTag
  );
}

/**
 * Account-scoped club directory for `/o/:accountId/club-logos`.
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker.
 */
export function useAccountClubLogosDirectory(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.clubLogosDirectory(accountId),
    queryFn: async (): Promise<AccountClubLogosDirectoryQueryResult> => {
      try {
        return await accountApi.getAccountClubLogosDirectory(accountId);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: clubLogosDirectoryGatewayRedirectTag, reason };
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
