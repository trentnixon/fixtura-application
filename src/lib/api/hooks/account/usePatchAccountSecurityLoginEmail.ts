import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { PatchAccountSecurityLoginEmailRequest } from "@/types/api/account";

/** PATCH …/accounts/:accountId/security/login-email — JWT user email. */
export function usePatchAccountSecurityLoginEmail(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PatchAccountSecurityLoginEmailRequest) =>
      accountApi.patchAccountSecurityLoginEmail(accountId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.settings(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
    },
  });
}
