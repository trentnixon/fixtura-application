import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

/** Create general allocation; invalidates sponsors list + general allocation query for the sponsor. */
export function usePostAccountSponsorAllocationGeneral(accountId: string, sponsorId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: unknown) =>
      accountApi.postAccountSponsorAllocationGeneral(accountId, sponsorId, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.sponsors(accountId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.sponsorAllocationsGeneral(accountId, sponsorId),
      });
    },
  });
}
