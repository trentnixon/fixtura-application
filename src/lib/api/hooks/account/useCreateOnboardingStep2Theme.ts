import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { CreateOnboardingStep2ThemeBody } from "@/types/api/account";

/**
 * POST custom private theme for onboarding Step 2; invalidates branding + theme lookup + bootstrap.
 */
export function useCreateOnboardingStep2Theme(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateOnboardingStep2ThemeBody) =>
      accountApi.createOnboardingStep2Theme(accountId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.branding(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.onboarding.lookupsThemes });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.settings(accountId) });
    },
  });
}
