import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { UpdateOnboardingStep2Body } from "@/types/api/account";

export type UpdateOnboardingStep2Input = {
  /** New logo file — uploaded first (M1), then id merged into W2. */
  file?: File | null | undefined;
  /** Fields for W2 (merged with uploaded `logoMediaId` when `file` is set). */
  body: UpdateOnboardingStep2Body;
};

/**
 * W2 — PATCH Step 2; runs M1 upload when `file` is provided.
 */
export function useUpdateOnboardingStep2(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, body }: UpdateOnboardingStep2Input) => {
      let merged: UpdateOnboardingStep2Body = { ...body };
      if (file != null) {
        const up = await accountApi.uploadOnboardingStep2Logo(accountId, file);
        merged = { ...merged, logoMediaId: up.data.id };
      }
      return accountApi.updateOnboardingStep2(accountId, merged);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.branding(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.settings(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.mediaLibrary(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.setupStatus(accountId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.onboardingState(accountId),
      });
    },
  });
}
