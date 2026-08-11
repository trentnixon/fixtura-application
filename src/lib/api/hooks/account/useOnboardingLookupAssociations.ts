import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

const STALE_MS = 5 * 60 * 1000;

/**
 * Associations for the selected sport (GET with sport query param).
 */
export function useOnboardingLookupAssociations(sport: string, options?: { enabled?: boolean }) {
  const trimmed = sport.trim();
  const enabled = (options?.enabled ?? true) && Boolean(trimmed);

  return useQuery({
    queryKey: queryKeys.onboarding.lookupsAssociations(trimmed),
    queryFn: () => accountApi.getOnboardingLookupsAssociations(trimmed),
    staleTime: STALE_MS,
    retry: 1,
    enabled,
  });
}
