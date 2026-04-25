"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { templatePatternPickerSelectedIdKey } from "../_consts";

/**
 * Shared client selection for template pattern pickers (TanStack Query cache as UI store).
 * Do not invalidate this key in global reset flows.
 */
export function useTemplatePatternPickerSelection() {
  const queryClient = useQueryClient();

  const { data: selectedId = null } = useQuery<string | null>({
    queryKey: templatePatternPickerSelectedIdKey,
    queryFn: () =>
      Promise.resolve(
        queryClient.getQueryData<string | null>(templatePatternPickerSelectedIdKey) ?? null,
      ),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const setSelectedId = useCallback(
    (id: string | null | undefined) => {
      queryClient.setQueryData(templatePatternPickerSelectedIdKey, id ?? null);
    },
    [queryClient],
  );

  return { selectedId, setSelectedId };
}
