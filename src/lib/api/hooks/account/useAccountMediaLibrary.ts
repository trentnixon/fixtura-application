import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountMediaLibraryResponse } from "@/types/api/account";

const mediaLibraryGatewayRedirectTag = "mediaLibraryGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (400/403/404) — not a query error. */
export type AccountMediaLibraryQueryResult =
  | AccountMediaLibraryResponse
  | {
      readonly _tag: typeof mediaLibraryGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountMediaLibraryGatewayRedirect(
  value: AccountMediaLibraryQueryResult | undefined,
): value is Extract<
  AccountMediaLibraryQueryResult,
  { _tag: typeof mediaLibraryGatewayRedirectTag }
> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === mediaLibraryGatewayRedirectTag
  );
}

/**
 * Published gallery items for the scoped account (GET /api/accounts/[accountId]/media-library).
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAccountMediaLibrary(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);
  return useQuery({
    queryKey: queryKeys.account.mediaLibrary(accountId),
    queryFn: async (): Promise<AccountMediaLibraryQueryResult> => {
      try {
        return await accountApi.getAccountMediaLibrary(accountId);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: mediaLibraryGatewayRedirectTag, reason };
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
