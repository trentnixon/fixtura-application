import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountSponsorAllocationsListResponse } from "@/types/api/account";

/**
 * Filtered general allocation rows for a sponsor (Strapi route; published + in-memory filter).
 * Use alongside nested `sponsorshipAllocations` on `AccountSponsorDto` when you need general-only rows.
 */
export function useAccountSponsorAllocationsGeneral(
  accountId: string,
  sponsorId: number | null,
  options?: { enabled?: boolean },
) {
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(accountId) &&
    sponsorId != null &&
    Number.isFinite(sponsorId) &&
    sponsorId > 0;

  return useQuery({
    queryKey:
      sponsorId != null && sponsorId > 0
        ? queryKeys.account.sponsorAllocationsGeneral(accountId, sponsorId)
        : (["account", "sponsor-allocations-general", accountId, "none"] as const),
    queryFn: (): Promise<AccountSponsorAllocationsListResponse> =>
      accountApi.getAccountSponsorAllocationsGeneral(accountId, sponsorId!),
    enabled,
    staleTime: 60 * 1000,
  });
}
