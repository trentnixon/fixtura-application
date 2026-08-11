import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { PatchAccountSponsorBody } from "@/types/api/account";

export function usePatchAccountSponsor(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sponsorId, body }: { sponsorId: number; body: PatchAccountSponsorBody }) =>
      accountApi.patchAccountSponsor(accountId, sponsorId, body),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.sponsors(accountId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.sponsorAllocationsGeneral(accountId, variables.sponsorId),
      });
    },
  });
}
