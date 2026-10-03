import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { PatchAccountActiveBody } from "@/types/api/account";

/** PATCH …/accounts/:accountId/active — owner sets account.isActive. */
export function usePatchAccountActive(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PatchAccountActiveBody) => accountApi.patchAccountActive(accountId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.settings(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.onboardingState(accountId),
      });
    },
  });
}
