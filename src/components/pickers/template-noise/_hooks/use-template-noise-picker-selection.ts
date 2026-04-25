"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { templateNoisePickerSelectedIdKey } from "../_consts";

/**
 * Shared client selection for template noise pickers (TanStack Query cache as UI store).
 * Do not invalidate this key in global reset flows.
 */
export function useTemplateNoisePickerSelection() {
  const queryClient = useQueryClient();

  const { data: selectedId = null } = useQuery<string | null>({
    queryKey: templateNoisePickerSelectedIdKey,
    queryFn: () =>
      Promise.resolve(
        queryClient.getQueryData<string | null>(templateNoisePickerSelectedIdKey) ?? null,
      ),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const setSelectedId = useCallback(
    (id: string | null | undefined) => {
      queryClient.setQueryData(templateNoisePickerSelectedIdKey, id ?? null);
    },
    [queryClient],
  );

  return { selectedId, setSelectedId };
}
