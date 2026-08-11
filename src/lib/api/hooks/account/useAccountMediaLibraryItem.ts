import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import {
  selectOrgReasonFromApiStatus,
  type SelectOrgGatewayReason,
} from "@/lib/config/gateway-reasons";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountMediaLibraryItemResponse } from "@/types/api/account";

const mediaLibraryItemGatewayRedirectTag = "mediaLibraryItemGatewayRedirect" as const;

/** Successful fetch, or expected “send user to select-org gateway” (400/403/404) — not a query error. */
export type AccountMediaLibraryItemQueryResult =
  | AccountMediaLibraryItemResponse
  | {
      readonly _tag: typeof mediaLibraryItemGatewayRedirectTag;
      readonly reason: SelectOrgGatewayReason;
    };

export function isAccountMediaLibraryItemGatewayRedirect(
  value: AccountMediaLibraryItemQueryResult | undefined,
): value is Extract<
  AccountMediaLibraryItemQueryResult,
  { _tag: typeof mediaLibraryItemGatewayRedirectTag }
> {
  return (
    value !== undefined &&
    typeof value === "object" &&
    "_tag" in value &&
    value._tag === mediaLibraryItemGatewayRedirectTag
  );
}

/**
 * Single published gallery row (GET /api/accounts/[accountId]/media-library/[mediaId]).
 * HTTP 400/403/404 resolve successfully with a gateway redirect marker (no thrown ApiError / global query onError).
 */
export function useAccountMediaLibraryItem(
  accountId: string,
  mediaId: string,
  options?: { enabled?: boolean },
) {
  const enabled = options?.enabled ?? Boolean(accountId && mediaId);
  return useQuery({
    queryKey: queryKeys.account.mediaLibraryItem(accountId, mediaId),
    queryFn: async (): Promise<AccountMediaLibraryItemQueryResult> => {
      try {
        return await accountApi.getAccountMediaLibraryItem(accountId, mediaId);
      } catch (e) {
        if (e instanceof ApiError) {
          const reason = selectOrgReasonFromApiStatus(e.status);
          if (reason) {
            return { _tag: mediaLibraryItemGatewayRedirectTag, reason };
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
