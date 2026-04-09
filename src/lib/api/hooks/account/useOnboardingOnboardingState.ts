import { useQuery } from "@tanstack/react-query";

import { parseOnboardingStatePayload } from "@/lib/api/parse-onboarding-state";
import { accountApi } from "@/lib/api/services/account.api";

import { queryKeys } from "../../query/query-keys";

import type { OnboardingStateData } from "@/types/api/account";

const STALE_MS = 30_000;

/**
 * Lifecycle v1 — GET onboarding-state (bootstrap + invalidations; not a high-frequency poll).
 */
export function useOnboardingOnboardingState(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);

  return useQuery({
    queryKey: queryKeys.account.onboardingState(accountId),
    queryFn: async (): Promise<OnboardingStateData> => {
      const raw = await accountApi.getOnboardingOnboardingState(accountId);
      const parsed = parseOnboardingStatePayload(raw);
      if (!parsed) {
        throw new Error("Onboarding state response could not be parsed.");
      }
      return parsed;
    },
    enabled,
    staleTime: STALE_MS,
  });
}
