import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { PostAccountSecurityPasswordBody } from "@/types/api/account";

/** POST …/accounts/:accountId/security/password */
export function usePostAccountSecurityPassword(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PostAccountSecurityPasswordBody) =>
      accountApi.postAccountSecurityPassword(accountId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.me });
    },
  });
}
