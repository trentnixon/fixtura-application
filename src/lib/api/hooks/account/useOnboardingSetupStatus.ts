import { useQuery } from "@tanstack/react-query";

import { ApiError } from "@/lib/api/client/api-error";
import { parseOnboardingSetupStatusPayload } from "@/lib/api/parse-onboarding-setup-status";
import {
  isTerminalOnboardingSetupStatus,
  ONBOARDING_SETUP_STATUS_POLL_MS,
} from "@/lib/config/onboarding";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { OnboardingSetupStatusData } from "@/types/api/account";

/**
 * S1 — GET setup status; polls until `status` is terminal (`ready`, `failed`, or legacy `blocked` / `abandoned`).
 * @see create-organisation/.comms/phase-6/app-handoff-onboarding-phase6-s1-s2.md
 * @see .comms/onBoarding/app-handoff-onboarding-lifecycle-v1-integration.md
 */
export function useOnboardingSetupStatus(accountId: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? Boolean(accountId);

  return useQuery({
    queryKey: queryKeys.account.setupStatus(accountId),
    queryFn: async (): Promise<OnboardingSetupStatusData> => {
      const raw = await accountApi.getOnboardingSetupStatus(accountId);
      const parsed = parseOnboardingSetupStatusPayload(raw);
      if (!parsed) {
        throw new Error("Setup status response is missing a valid status field.");
      }
      return parsed;
    },
    enabled,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && (error.status === 404 || error.status === 503)) {
        return failureCount < 1;
      }
      return failureCount < 2;
    },
    refetchInterval: (query) => {
      if (query.state.fetchStatus === "fetching") return false;
      if (query.state.status === "error") return false;
      const row = query.state.data;
      if (!row) return false;
      if (isTerminalOnboardingSetupStatus(row.status)) return false;
      return ONBOARDING_SETUP_STATUS_POLL_MS;
    },
  });
}
