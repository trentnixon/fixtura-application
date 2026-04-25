"use client";

import { useMemo } from "react";

import { useTemplateGradientsUi } from "@/lib/api/hooks/template-gradients/useTemplateGradientsUi";

import { resolveSelectedTemplateGradientIdString } from "../_utils";
import { useTemplateGradientPickerSelection } from "./use-template-gradient-picker-selection";

export function useTemplateGradientPickerList() {
  const { data, refetch, isFetching, isPending, isError, error } = useTemplateGradientsUi();
  const { selectedId, setSelectedId } = useTemplateGradientPickerSelection();
  const gradients = useMemo(() => data?.data ?? [], [data]);

  const resolvedSelectedId = useMemo(
    () => resolveSelectedTemplateGradientIdString(gradients, selectedId),
    [gradients, selectedId],
  );

  const firstGradient = gradients[0];
  const selectValue =
    resolvedSelectedId ?? (firstGradient !== undefined ? String(firstGradient.id) : "");

  const selectedGradient = useMemo(() => {
    if (selectValue === "") return null;
    return gradients.find((g) => String(g.id) === selectValue) ?? null;
  }, [gradients, selectValue]);

  return {
    data,
    gradients,
    selectedId,
    setSelectedId,
    resolvedSelectedId,
    selectValue,
    selectedGradient,
    refetch,
    isFetching,
    isPending,
    isError,
    error,
  };
}
