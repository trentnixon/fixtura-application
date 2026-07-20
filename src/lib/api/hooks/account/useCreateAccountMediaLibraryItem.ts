import { useMutation, useQueryClient } from "@tanstack/react-query";

import { buildMediaLibraryCreateFormData } from "@/lib/api/media-library/build-media-library-create-form-data";

import { queryKeys } from "../../query/query-keys";
import { accountApi } from "../../services/account.api";

import type { CreateAccountMediaLibraryMetadata } from "@/types/api/account";

export function useCreateAccountMediaLibraryItem(accountId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    meta: { suppressGlobalError: true },
    mutationFn: ({
      file,
      metadata,
    }: {
      file: File;
      metadata?: CreateAccountMediaLibraryMetadata;
    }) =>
      accountApi.createAccountMediaLibraryItem(
        accountId,
        buildMediaLibraryCreateFormData(file, metadata),
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.account.mediaLibrary(accountId) });
    },
  });
}
