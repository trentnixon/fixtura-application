import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

function uniqueInts(ids: number[]): number[] {
  return Array.from(new Set(ids.filter((n) => Number.isFinite(n) && n > 0)));
}

async function invalidateSponsorAllocationQueries(
  accountId: string,
  sponsorIds: number[],
  qc: ReturnType<typeof useQueryClient>,
) {
  await qc.invalidateQueries({ queryKey: queryKeys.account.sponsors(accountId) });
  for (const id of uniqueInts(sponsorIds)) {
    await qc.invalidateQueries({
      queryKey: queryKeys.account.sponsorAllocationsGeneral(accountId, id),
    });
  }
}

/**
 * General allocation POST/PATCH/DELETE for variable `sponsorId` (position assignment table).
 */
export function useAccountSponsorAllocationsGeneralMutations(accountId: string) {
  const queryClient = useQueryClient();

  const postAllocation = useMutation({
    mutationFn: (params: { sponsorId: number; body: unknown }) =>
      accountApi.postAccountSponsorAllocationGeneral(accountId, params.sponsorId, params.body),
    onSuccess: async (_, v) => {
      await invalidateSponsorAllocationQueries(accountId, [v.sponsorId], queryClient);
    },
  });

  const patchAllocation = useMutation({
    mutationFn: (params: { sponsorId: number; allocationId: number; body: unknown }) =>
      accountApi.patchAccountSponsorAllocationGeneral(
        accountId,
        params.sponsorId,
        params.allocationId,
        params.body,
      ),
    onSuccess: async (_, v) => {
      await invalidateSponsorAllocationQueries(accountId, [v.sponsorId], queryClient);
    },
  });

  const deleteAllocation = useMutation({
    mutationFn: (params: { sponsorId: number; allocationId: number }) =>
      accountApi.deleteAccountSponsorAllocationGeneral(
        accountId,
        params.sponsorId,
        params.allocationId,
      ),
    onSuccess: async (_, v) => {
      await invalidateSponsorAllocationQueries(accountId, [v.sponsorId], queryClient);
    },
  });

  const isPending =
    postAllocation.isPending || patchAllocation.isPending || deleteAllocation.isPending;

  return {
    postAllocation,
    patchAllocation,
    deleteAllocation,
    isPending,
  };
}
