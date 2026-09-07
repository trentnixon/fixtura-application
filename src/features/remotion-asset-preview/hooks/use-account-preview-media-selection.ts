"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { queryKeys } from "@/lib/api/query/query-keys";

import type { AccountMediaLibraryItem } from "@/types/api/account";

/** Share the sample photo across account previews for this app session. */
export function useAccountPreviewMediaSelection(
  accountId: string,
  items: readonly AccountMediaLibraryItem[],
) {
  const queryClient = useQueryClient();
  const selection = useQuery({
    queryKey: queryKeys.account.previewMediaSelection(accountId),
    queryFn: (): number | null => null,
    initialData: null,
    enabled: false,
    gcTime: Infinity,
  });
  const selectedItem = items.find((item) => item.id === selection.data) ?? items[0] ?? null;

  const selectMedia = useCallback(
    (mediaId: number) => {
      if (items.some((item) => item.id === mediaId)) {
        queryClient.setQueryData(queryKeys.account.previewMediaSelection(accountId), mediaId);
      }
    },
    [accountId, items, queryClient],
  );

  return { selectedItem, selectMedia };
}
