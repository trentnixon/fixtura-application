import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { GradeOrderingGetParams, GradeOrderingResponse } from "@/types/api/grade-ordering";

const gradeOrderingGatewayRedirectTag = "gradeOrderingGatewayRedirect" as const;

export type AccountGradeOrderingQueryResult =
  | GradeOrderingResponse
  | {
      readonly _tag: typeof gradeOrderingGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountGradeOrderingGatewayRedirect(
  value: AccountGradeOrderingQueryResult | undefined,
): value is Extract<
  AccountGradeOrderingQueryResult,
  { _tag: typeof gradeOrderingGatewayRedirectTag }
> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === gradeOrderingGatewayRedirectTag
  );
}

/**
 * Normalized grade ordering for a scoped account + organisation (GET …/grade-ordering).
 */
export function useAccountGradeOrdering(
  accountId: string,
  params: GradeOrderingGetParams | null,
  options?: { enabled?: boolean },
) {
  const enabled =
    (options?.enabled ?? Boolean(accountId)) &&
    params !== null &&
    Number.isFinite(params.organisationId);

  return useQuery({
    queryKey:
      params !== null
        ? queryKeys.account.gradeOrdering(accountId, params.organisationType, params.organisationId)
        : ["account", "grade-ordering", accountId, "pending-org"],
    queryFn: async (): Promise<AccountGradeOrderingQueryResult> => {
      if (!params) throw new Error("Organisation context required");
      try {
        return await accountApi.getAccountGradeOrdering(accountId, params);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: gradeOrderingGatewayRedirectTag, reason };
          }
        }
        throw e;
      }
    },
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    enabled,
  });
}
