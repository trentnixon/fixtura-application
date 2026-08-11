import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { AccountSponsorEntityType } from "@/types/api/account";

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
      queryKey: ["account", "sponsor-allocations-entity", accountId, id],
    });
  }
}

/**
 * Entity allocation POST/PATCH/DELETE for variable sponsor and entity targets.
 * Entity v1 is additive: callers should POST without clearing existing target rows.
 */
export function useAccountSponsorAllocationsEntityMutations(accountId: string) {
  const queryClient = useQueryClient();

  const postAllocation = useMutation({
    mutationFn: (params: {
      sponsorId: number;
      entityType: AccountSponsorEntityType;
      entityId: number;
      body: unknown;
    }) =>
      accountApi.postAccountSponsorAllocationEntity(
        accountId,
        params.sponsorId,
        params.entityType,
        params.entityId,
        params.body,
      ),
    onSuccess: async (_, v) => {
      await invalidateSponsorAllocationQueries(accountId, [v.sponsorId], queryClient);
    },
  });

  const patchAllocation = useMutation({
    mutationFn: (params: {
      sponsorId: number;
      entityType: AccountSponsorEntityType;
      entityId: number;
      allocationId: number;
      body: unknown;
    }) =>
      accountApi.patchAccountSponsorAllocationEntity(
        accountId,
        params.sponsorId,
        params.entityType,
        params.entityId,
        params.allocationId,
        params.body,
      ),
    onSuccess: async (_, v) => {
      await invalidateSponsorAllocationQueries(accountId, [v.sponsorId], queryClient);
    },
  });

  const deleteAllocation = useMutation({
    mutationFn: (params: {
      sponsorId: number;
      entityType: AccountSponsorEntityType;
      entityId: number;
      allocationId: number;
    }) =>
      accountApi.deleteAccountSponsorAllocationEntity(
        accountId,
        params.sponsorId,
        params.entityType,
        params.entityId,
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
