"use client";

import { useMemo } from "react";

import { useTemplateNoisesUi } from "@/lib/api/hooks/template-noises/useTemplateNoisesUi";

import { resolveSelectedTemplateNoiseIdString } from "../_utils";
import { useTemplateNoisePickerSelection } from "./use-template-noise-picker-selection";

export function useTemplateNoisePickerList(accountId: string) {
  const { data, refetch, isFetching, isPending, isError, error } = useTemplateNoisesUi();
  const { selectedId, setSelectedId } = useTemplateNoisePickerSelection(accountId);
  const noises = useMemo(() => data?.data ?? [], [data]);

  const resolvedSelectedId = useMemo(
    () => resolveSelectedTemplateNoiseIdString(noises, selectedId),
    [noises, selectedId],
  );

  const firstNoise = noises[0];
  const selectValue = resolvedSelectedId ?? (firstNoise !== undefined ? String(firstNoise.id) : "");

  const selectedNoise = useMemo(() => {
    if (selectValue === "") return null;
    return noises.find((noise) => String(noise.id) === selectValue) ?? null;
  }, [noises, selectValue]);

  return {
    data,
    noises,
    selectedId,
    setSelectedId,
    resolvedSelectedId,
    selectValue,
    selectedNoise,
    refetch,
    isFetching,
    isPending,
    isError,
    error,
  };
}
