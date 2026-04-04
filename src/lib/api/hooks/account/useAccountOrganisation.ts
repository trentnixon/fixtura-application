import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { OrganisationAccountDetailsResponse } from "@/types/api/account";

const organisationGatewayRedirectTag = "organisationGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (400/403/404) — not a query error. */
export type OrganisationAccountDetailsQueryResult =
  | OrganisationAccountDetailsResponse
  | {
      readonly _tag: typeof organisationGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isOrganisationGatewayRedirect(
  value: OrganisationAccountDetailsQueryResult | undefined,
): value is Extract<
  OrganisationAccountDetailsQueryResult,
  { _tag: typeof organisationGatewayRedirectTag }
> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === organisationGatewayRedirectTag
  );
}

/**
 * Full dashboard aggregate for the scoped account (GET /api/account/organisation/[accountId]).
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAccountOrganisation(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.organisation(accountId),
    queryFn: async (): Promise<OrganisationAccountDetailsQueryResult> => {
      try {
        return await accountApi.getOrganisationAccountDetails(accountId);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: organisationGatewayRedirectTag, reason };
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
