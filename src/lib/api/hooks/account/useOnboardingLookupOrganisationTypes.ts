import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

const STALE_MS = 60 * 60 * 1000;

/**
 * L2 — GET /api/account/onboarding/lookups/organisation-types (cached).
 */
export function useOnboardingLookupOrganisationTypes(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.onboarding.lookupsOrganisationTypes,
    queryFn: () => accountApi.getOnboardingLookupsOrganisationTypes(),
    staleTime: STALE_MS,
    retry: 1,
    enabled: options?.enabled !== false,
  });
}
