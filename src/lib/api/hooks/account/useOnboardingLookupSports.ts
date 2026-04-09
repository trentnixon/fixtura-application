import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

const STALE_MS = 60 * 60 * 1000; // align with Strapi Cache-Control max-age=3600; session-static

/**
 * L1 — GET /api/account/onboarding/lookups/sports (cached).
 */
export function useOnboardingLookupSports(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.onboarding.lookupsSports,
    queryFn: () => accountApi.getOnboardingLookupsSports(),
    staleTime: STALE_MS,
    retry: 1,
    enabled: options?.enabled !== false,
  });
}
