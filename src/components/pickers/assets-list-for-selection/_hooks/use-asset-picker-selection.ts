"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { assetPickerSelectedIdKey } from "../_consts";

/**
 * Shared client selection for Image Options asset pickers (TanStack Query cache as UI store).
 * Do not invalidate this key in global reset flows.
 */
export function useAssetPickerSelection() {
  const queryClient = useQueryClient();

  const { data: selectedId = null } = useQuery<string | null>({
    queryKey: assetPickerSelectedIdKey,
    queryFn: () =>
      Promise.resolve(queryClient.getQueryData<string | null>(assetPickerSelectedIdKey) ?? null),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const setSelectedId = useCallback(
    (id: string | null | undefined) => {
      queryClient.setQueryData(assetPickerSelectedIdKey, id ?? null);
    },
    [queryClient],
  );

  return { selectedId, setSelectedId };
}
