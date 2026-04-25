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
 * If CMS still reports `isUpdating` while `status` looks terminal, polling continues until `isUpdating` clears.
 * Authoritative for in-wizard sync polling; pair with {@link useOnboardingOnboardingState} for routing and wizard flags.
 * @see create-organisation/.comms/phase-6/app-handoff-onboarding-phase6-s1-s2.md
 * @see .comms/onBoarding/app-handoff-onboarding-lifecycle-v1-integration.md
 * @see .comms/CODEX/onboarding-data-fetch-outstanding-issues-frontend.md
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
      if (error instanceof ApiError && error.status === 408) {
        return failureCount < 3;
      }
      return failureCount < 2;
    },
    refetchInterval: (query) => {
      if (query.state.fetchStatus === "fetching") return false;
      if (query.state.status === "error") {
        return query.state.error instanceof ApiError && query.state.error.status === 408
          ? ONBOARDING_SETUP_STATUS_POLL_MS
          : false;
      }
      const row = query.state.data;
      if (!row) return false;
      const terminal = isTerminalOnboardingSetupStatus(row.status);
      if (terminal && row.isUpdating !== true) return false;
      return ONBOARDING_SETUP_STATUS_POLL_MS;
    },
  });
}
