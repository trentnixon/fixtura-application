"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { assetPickerSelectedIdKey } from "../_consts";

/**
 * Shared client selection for Image Options asset pickers (TanStack Query cache as UI store).
 * Selection is namespaced by accountId. Do not invalidate this key in global reset flows.
 */
export function useAssetPickerSelection(accountId: string) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => assetPickerSelectedIdKey(accountId), [accountId]);

  const { data: selectedId = null } = useQuery<string | null>({
    queryKey,
    queryFn: () => Promise.resolve(queryClient.getQueryData<string | null>(queryKey) ?? null),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const setSelectedId = useCallback(
    (id: string | null | undefined) => {
      const next = id ?? null;
      const current = queryClient.getQueryData<string | null>(queryKey) ?? null;
      // TanStack Query setQueryData always bumps dataUpdatedAt and notifies observers.
      // Skipping no-ops prevents sync effects from infinite-looping on empty lists.
      if (current === next) return;
      queryClient.setQueryData(queryKey, next);
    },
    [queryClient, queryKey],
  );

  return { selectedId, setSelectedId };
}
