import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { PatchAccountNotificationsRequest } from "@/types/api/account";

/** Persist bundle addressee + delivery email via PATCH …/accounts/:accountId/notifications. */
export function usePatchAccountNotifications(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PatchAccountNotificationsRequest) =>
      accountApi.patchAccountNotifications(accountId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.settings(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.scheduler(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
    },
  });
}
