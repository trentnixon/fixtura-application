import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AllTemplateOptionsResponse } from "@/types/api/account";

const allTemplateOptionsGatewayRedirectTag = "allTemplateOptionsGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (400/403/404) — not a query error. */
export type AllTemplateOptionsQueryResult =
  | AllTemplateOptionsResponse
  | {
      readonly _tag: typeof allTemplateOptionsGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAllTemplateOptionsGatewayRedirect(
  value: AllTemplateOptionsQueryResult | undefined,
): value is Extract<
  AllTemplateOptionsQueryResult,
  { _tag: typeof allTemplateOptionsGatewayRedirectTag }
> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === allTemplateOptionsGatewayRedirectTag
  );
}

/**
 * Full template catalog for the scoped account (GET /api/accounts/[accountId]/all-template-options).
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAllTemplateOptions(
  accountId: string,
  options?: {
    enabled?: boolean;
    templateOptionId?: number | null;
  },
) {
  const enabled = options?.enabled ?? Boolean(accountId);
  const templateOptionId = options?.templateOptionId;
  const templateOptionIdKey =
    templateOptionId !== undefined &&
    templateOptionId !== null &&
    Number.isInteger(templateOptionId) &&
    templateOptionId > 0
      ? { templateOptionId }
      : undefined;

  return useQuery({
    queryKey: queryKeys.account.allTemplateOptions(accountId, templateOptionIdKey),
    queryFn: async (): Promise<AllTemplateOptionsQueryResult> => {
      try {
        return await accountApi.getAllTemplateOptions(accountId, templateOptionIdKey);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: allTemplateOptionsGatewayRedirectTag, reason };
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
