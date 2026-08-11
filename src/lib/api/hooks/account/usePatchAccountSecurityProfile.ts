import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { PatchAccountSecurityProfileRequest } from "@/types/api/account";

/** PATCH …/accounts/:accountId/security/profile — display name on account entity. */
export function usePatchAccountSecurityProfile(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PatchAccountSecurityProfileRequest) =>
      accountApi.patchAccountSecurityProfile(accountId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.settings(accountId) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
    },
  });
}
