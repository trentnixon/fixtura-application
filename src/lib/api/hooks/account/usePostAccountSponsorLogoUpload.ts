import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

export function usePostAccountSponsorLogoUpload(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sponsorId, formData }: { sponsorId: number; formData: FormData }) =>
      accountApi.postAccountSponsorLogoUpload(accountId, sponsorId, formData),
    onSuccess: async (_, { sponsorId }) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.sponsors(accountId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.sponsorAllocationsGeneral(accountId, sponsorId),
      });
    },
  });
}
