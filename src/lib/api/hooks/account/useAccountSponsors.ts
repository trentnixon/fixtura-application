import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountSponsorsResponse } from "@/types/api/account";

const sponsorsGatewayRedirectTag = "sponsorsGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (400/403/404) — not a query error. */
export type AccountSponsorsQueryResult =
  | AccountSponsorsResponse
  | {
      readonly _tag: typeof sponsorsGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountSponsorsGatewayRedirect(
  value: AccountSponsorsQueryResult | undefined,
): value is Extract<AccountSponsorsQueryResult, { _tag: typeof sponsorsGatewayRedirectTag }> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === sponsorsGatewayRedirectTag
  );
}

/**
 * Published sponsors for the scoped account (GET /api/accounts/[accountId]/sponsors).
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAccountSponsors(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.sponsors(accountId),
    queryFn: async (): Promise<AccountSponsorsQueryResult> => {
      try {
        return await accountApi.getAccountSponsors(accountId);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: sponsorsGatewayRedirectTag, reason };
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
