import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { OnboardingLookupsThemesResponse } from "@/types/api/account";

const STALE_MS = 60 * 60 * 1000;

/**
 * L3 — GET /api/account/onboarding/lookups/themes (premade catalogue).
 */
export function useOnboardingLookupThemes(options?: { enabled?: boolean }) {
  return useQuery<OnboardingLookupsThemesResponse>({
    queryKey: queryKeys.onboarding.lookupsThemes,
    queryFn: () => accountApi.getOnboardingLookupsThemes(),
    staleTime: STALE_MS,
    retry: 1,
    enabled: options?.enabled !== false,
  });
}
