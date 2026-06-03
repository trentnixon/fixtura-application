import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  isAccountClubLogosDirectoryGatewayRedirect,
  type AccountClubLogosDirectoryQueryResult,
} from "./useAccountClubLogosDirectory";
import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { PatchAccountClubLogoBody, PatchAccountClubLogoResponse } from "@/types/api/account";

export type UpdateClubLogoInput = {
  /** New logo file — uploaded first (M1), then id merged into W2. */
  file?: File | null | undefined;
  /** Fields for W2 (merged with uploaded `logoMediaId` when `file` is set). */
  body?: PatchAccountClubLogoBody;
};

/**
 * M1 + W2 — upload and persist a club logo under association scope (club id in path).
 */
export function useUpdateClubLogo(accountId: string, clubId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, body }: UpdateClubLogoInput) => {
      let merged: PatchAccountClubLogoBody = { ...(body ?? {}) };
      if (file != null) {
        const up = await accountApi.uploadAccountClubLogo(accountId, clubId, file);
        merged = { ...merged, logoMediaId: up.data.id };
      }
      return accountApi.patchAccountClubLogo(accountId, clubId, merged);
    },
    onSuccess: async (patchResponse: PatchAccountClubLogoResponse) => {
      const updated = patchResponse.data;
      queryClient.setQueryData<AccountClubLogosDirectoryQueryResult | undefined>(
        queryKeys.account.clubLogosDirectory(accountId),
        (old: AccountClubLogosDirectoryQueryResult | undefined) => {
          if (!old || isAccountClubLogosDirectoryGatewayRedirect(old)) return old;
          return {
            data: {
              clubs: old.data.clubs.map((row) =>
                row.id === updated.id ? { ...row, ...updated } : row,
              ),
            },
          };
        },
      );
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.clubLogosDirectory(accountId),
      });
    },
  });
}
