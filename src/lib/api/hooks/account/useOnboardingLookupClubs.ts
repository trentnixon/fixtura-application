import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

const STALE_MS = 5 * 60 * 1000;

/**
 * Clubs under the selected association (GET with associationId query param).
 */
export function useOnboardingLookupClubs(
  associationId: number | null,
  options?: { enabled?: boolean },
) {
  const enabled =
    (options?.enabled ?? true) &&
    associationId != null &&
    associationId > 0 &&
    Number.isFinite(associationId);

  return useQuery({
    queryKey: queryKeys.onboarding.lookupsClubs(associationId),
    queryFn: () => accountApi.getOnboardingLookupsClubs(associationId!),
    staleTime: STALE_MS,
    retry: 1,
    enabled,
  });
}
