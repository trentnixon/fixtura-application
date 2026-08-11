import { useMutation, useQueryClient } from "@tanstack/react-query";

import { accountApi } from "@/lib/api/services/account.api";

import { queryKeys } from "../../query/query-keys";

/**
 * Lifecycle v1 — POST retry-setup after setup or fetch pipeline failure.
 */
export function useRetryOnboardingSetup(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Record<string, unknown> = {}) =>
      accountApi.retryOnboardingSetup(accountId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.onboardingState(accountId),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.setupStatus(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.settings(accountId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.organisationContext(accountId),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.branding(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}
