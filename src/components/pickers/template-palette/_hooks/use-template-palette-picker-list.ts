"use client";

import { useMemo } from "react";

import { useTemplatePalettesUi } from "@/lib/api/hooks/template-palettes/useTemplatePalettesUi";

import { resolveSelectedTemplatePaletteIdString } from "../_utils";
import { useTemplatePalettePickerSelection } from "./use-template-palette-picker-selection";

export function useTemplatePalettePickerList() {
  const { data, refetch, isFetching, isPending, isError, error } = useTemplatePalettesUi();
  const { selectedId, setSelectedId } = useTemplatePalettePickerSelection();
  const palettes = useMemo(() => data?.data ?? [], [data]);

  const resolvedSelectedId = useMemo(
    () => resolveSelectedTemplatePaletteIdString(palettes, selectedId),
    [palettes, selectedId],
  );

  const firstPalette = palettes[0];
  const selectValue =
    resolvedSelectedId ?? (firstPalette !== undefined ? String(firstPalette.id) : "");

  const selectedPalette = useMemo(() => {
    if (selectValue === "") return null;
    return palettes.find((palette) => String(palette.id) === selectValue) ?? null;
  }, [palettes, selectValue]);

  return {
    data,
    palettes,
    selectedId,
    setSelectedId,
    resolvedSelectedId,
    selectValue,
    selectedPalette,
    refetch,
    isFetching,
    isPending,
    isError,
    error,
  };
}
