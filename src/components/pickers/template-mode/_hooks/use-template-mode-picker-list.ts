"use client";

import { useMemo } from "react";

import { useTemplateModesUi } from "@/lib/api/hooks/template-modes/useTemplateModesUi";

import { resolveSelectedTemplateModeIdString } from "../_utils";
import { useTemplateModePickerSelection } from "./use-template-mode-picker-selection";

export function useTemplateModePickerList() {
  const { data, refetch, isFetching, isPending, isError, error } = useTemplateModesUi();
  const { selectedId, setSelectedId } = useTemplateModePickerSelection();
  const modes = useMemo(() => data?.data ?? [], [data]);

  const resolvedSelectedId = useMemo(
    () => resolveSelectedTemplateModeIdString(modes, selectedId),
    [modes, selectedId],
  );

  const firstMode = modes[0];
  const selectValue = resolvedSelectedId ?? (firstMode !== undefined ? String(firstMode.id) : "");

  const selectedMode = useMemo(() => {
    if (selectValue === "") return null;
    return modes.find((mode) => String(mode.id) === selectValue) ?? null;
  }, [modes, selectValue]);

  return {
    data,
    modes,
    selectedId,
    setSelectedId,
    resolvedSelectedId,
    selectValue,
    selectedMode,
    refetch,
    isFetching,
    isPending,
    isError,
    error,
  };
}
