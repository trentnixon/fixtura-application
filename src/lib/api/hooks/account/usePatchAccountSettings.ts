import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { PatchAccountSettingsRequest } from "@/types/api/account";

/** Persist organisation settings (preferences / delivery) via PATCH …/accounts/:accountId/settings. */
export function usePatchAccountSettings(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PatchAccountSettingsRequest) =>
      accountApi.patchAccountSettings(accountId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.settings(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.scheduler(accountId) });
    },
  });
}
