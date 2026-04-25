"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { templateVideoPickerSelectedIdKey } from "../_consts";

/**
 * Shared client selection for template video pickers (TanStack Query cache as UI store).
 * Do not invalidate this key in global reset flows.
 */
export function useTemplateVideoPickerSelection() {
  const queryClient = useQueryClient();

  const { data: selectedId = null } = useQuery<string | null>({
    queryKey: templateVideoPickerSelectedIdKey,
    queryFn: () =>
      Promise.resolve(
        queryClient.getQueryData<string | null>(templateVideoPickerSelectedIdKey) ?? null,
      ),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const setSelectedId = useCallback(
    (id: string | null | undefined) => {
      queryClient.setQueryData(templateVideoPickerSelectedIdKey, id ?? null);
    },
    [queryClient],
  );

  return { selectedId, setSelectedId };
}
