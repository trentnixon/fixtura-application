import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

export function useDeleteAccountSponsor(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sponsorId: number) => accountApi.deleteAccountSponsor(accountId, sponsorId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.sponsors(accountId) });
    },
  });
}
