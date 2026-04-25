"use client";

import { useMemo } from "react";

import { useTemplatePatternsUi } from "@/lib/api/hooks/template-patterns/useTemplatePatternsUi";

import { resolveSelectedTemplatePatternIdString } from "../_utils";
import { useTemplatePatternPickerSelection } from "./use-template-pattern-picker-selection";

export function useTemplatePatternPickerList() {
  const { data, refetch, isFetching, isPending, isError, error } = useTemplatePatternsUi();
  const { selectedId, setSelectedId } = useTemplatePatternPickerSelection();
  const patterns = useMemo(() => data?.data ?? [], [data]);

  const resolvedSelectedId = useMemo(
    () => resolveSelectedTemplatePatternIdString(patterns, selectedId),
    [patterns, selectedId],
  );

  const firstPattern = patterns[0];
  const selectValue =
    resolvedSelectedId ?? (firstPattern !== undefined ? String(firstPattern.id) : "");

  const selectedPattern = useMemo(() => {
    if (selectValue === "") return null;
    return patterns.find((item) => String(item.id) === selectValue) ?? null;
  }, [patterns, selectValue]);

  return {
    data,
    patterns,
    selectedId,
    setSelectedId,
    resolvedSelectedId,
    selectValue,
    selectedPattern,
    refetch,
    isFetching,
    isPending,
    isError,
    error,
  };
}
