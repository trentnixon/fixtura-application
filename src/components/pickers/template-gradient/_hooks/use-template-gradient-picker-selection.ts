"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { templateGradientPickerSelectedIdKey } from "../_consts";

/**
 * Shared client selection for template gradient pickers (TanStack Query cache as UI store).
 * Do not invalidate this key in global reset flows.
 */
export function useTemplateGradientPickerSelection() {
  const queryClient = useQueryClient();

  const { data: selectedId = null } = useQuery<string | null>({
    queryKey: templateGradientPickerSelectedIdKey,
    queryFn: () =>
      Promise.resolve(
        queryClient.getQueryData<string | null>(templateGradientPickerSelectedIdKey) ?? null,
      ),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const setSelectedId = useCallback(
    (id: string | null | undefined) => {
      queryClient.setQueryData(templateGradientPickerSelectedIdKey, id ?? null);
    },
    [queryClient],
  );

  return { selectedId, setSelectedId };
}
