import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { UpdateOnboardingStep3Body } from "@/types/api/account";

/**
 * W3 — PATCH Step 3 contact / delivery.
 */
export function useUpdateOnboardingStep3(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateOnboardingStep3Body) =>
      accountApi.updateOnboardingStep3(accountId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.settings(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.setupStatus(accountId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.onboardingState(accountId),
      });
    },
  });
}
