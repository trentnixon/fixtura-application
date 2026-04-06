import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountOrganisationContextResponse } from "@/types/api/account";

const organisationContextGatewayRedirectTag = "organisationContextGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (400/403/404) — not a query error. */
export type AccountOrganisationContextQueryResult =
  | AccountOrganisationContextResponse
  | {
      readonly _tag: typeof organisationContextGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountOrganisationContextGatewayRedirect(
  value: AccountOrganisationContextQueryResult | undefined,
): value is Extract<
  AccountOrganisationContextQueryResult,
  { _tag: typeof organisationContextGatewayRedirectTag }
> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === organisationContextGatewayRedirectTag
  );
}

/**
 * Organisation summary for the scoped account (GET /api/accounts/[accountId]/organisation, Phase 4).
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAccountOrganisationContext(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.organisationContext(accountId),
    queryFn: async (): Promise<AccountOrganisationContextQueryResult> => {
      try {
        return await accountApi.getAccountOrganisationContext(accountId);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: organisationContextGatewayRedirectTag, reason };
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
