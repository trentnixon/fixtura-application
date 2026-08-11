import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

export function useDeleteAccountMediaLibraryItem(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { suppressGlobalError: true },
    mutationFn: (mediaId: string) => accountApi.deleteAccountMediaLibraryItem(accountId, mediaId),
    onSuccess: async (_, mediaId) => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.mediaLibrary(accountId) });
      await queryClient.removeQueries({
        queryKey: queryKeys.account.mediaLibraryItem(accountId, mediaId),
      });
    },
  });
}
