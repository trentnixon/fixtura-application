"use client";

import { useMemo } from "react";

import { useTemplateTexturesUi } from "@/lib/api/hooks/template-textures/useTemplateTexturesUi";

import { resolveSelectedTemplateTextureIdString } from "../_utils";
import { useTemplateTexturePickerSelection } from "./use-template-texture-picker-selection";

export function useTemplateTexturePickerList() {
  const { data, refetch, isFetching, isPending, isError, error } = useTemplateTexturesUi();
  const { selectedId, setSelectedId } = useTemplateTexturePickerSelection();
  const textures = useMemo(() => data?.data ?? [], [data]);

  const resolvedSelectedId = useMemo(
    () => resolveSelectedTemplateTextureIdString(textures, selectedId),
    [textures, selectedId],
  );

  const firstTexture = textures[0];
  const selectValue =
    resolvedSelectedId ?? (firstTexture !== undefined ? String(firstTexture.id) : "");

  const selectedTexture = useMemo(() => {
    if (selectValue === "") return null;
    return textures.find((item) => String(item.id) === selectValue) ?? null;
  }, [textures, selectValue]);

  return {
    data,
    textures,
    selectedId,
    setSelectedId,
    resolvedSelectedId,
    selectValue,
    selectedTexture,
    refetch,
    isFetching,
    isPending,
    isError,
    error,
  };
}
