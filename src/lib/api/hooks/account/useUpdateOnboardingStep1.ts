import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { UpdateOnboardingStep1Body } from "@/types/api/account";

/**
 * W1 — PATCH Step 1; invalidates bootstrap + settings + org context for the account.
 */
export function useUpdateOnboardingStep1(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateOnboardingStep1Body) =>
      accountApi.updateOnboardingStep1(accountId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.settings(accountId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.organisationContext(accountId),
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.setupStatus(accountId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.onboardingState(accountId),
      });
    },
  });
}
