"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { templateImagePickerSelectedIdKey } from "../_consts";

/**
 * Shared client selection for template image pickers (TanStack Query cache as UI store).
 * Do not invalidate this key in global reset flows.
 */
export function useTemplateImagePickerSelection() {
  const queryClient = useQueryClient();

  const { data: selectedId = null } = useQuery<string | null>({
    queryKey: templateImagePickerSelectedIdKey,
    queryFn: () =>
      Promise.resolve(
        queryClient.getQueryData<string | null>(templateImagePickerSelectedIdKey) ?? null,
      ),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const setSelectedId = useCallback(
    (id: string | null | undefined) => {
      queryClient.setQueryData(templateImagePickerSelectedIdKey, id ?? null);
    },
    [queryClient],
  );

  return { selectedId, setSelectedId };
}
