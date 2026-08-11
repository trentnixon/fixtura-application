import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { PostAccountSponsorBody } from "@/types/api/account";

export function usePostAccountSponsor(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PostAccountSponsorBody) => accountApi.postAccountSponsor(accountId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.sponsors(accountId) });
    },
  });
}
