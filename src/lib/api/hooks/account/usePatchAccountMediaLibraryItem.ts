import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { PatchAccountMediaLibraryBody } from "@/types/api/account";

export function usePatchAccountMediaLibraryItem(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { suppressGlobalError: true },
    mutationFn: ({ mediaId, body }: { mediaId: string; body: PatchAccountMediaLibraryBody }) =>
      accountApi.patchAccountMediaLibraryItem(accountId, mediaId, body),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.mediaLibrary(accountId) });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.account.mediaLibraryItem(accountId, variables.mediaId),
      });
    },
  });
}
