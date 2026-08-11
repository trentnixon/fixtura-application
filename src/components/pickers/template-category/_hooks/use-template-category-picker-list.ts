"use client";

import { useMemo } from "react";

import { useTemplateCategoriesListForSelection } from "@/lib/api/hooks/account/useTemplateCategoriesListForSelection";

import { categoryLabel, resolveSelectedCategoryIdString } from "../_utils";
import { useTemplateCategoryPickerSelection } from "./use-template-category-picker-selection";

export function useTemplateCategoryPickerList(accountId: string) {
  const { data } = useTemplateCategoriesListForSelection();
  const { selectedId, setSelectedId } = useTemplateCategoryPickerSelection(accountId);
  const categories = useMemo(() => data?.data ?? [], [data]);

  const resolvedSelectedId = useMemo(
    () => resolveSelectedCategoryIdString(categories, selectedId),
    [categories, selectedId],
  );

  const firstCategory = categories[0];
  const selectValue =
    resolvedSelectedId ?? (firstCategory !== undefined ? String(firstCategory.id) : "");

  const comboboxOptions = useMemo(
    () =>
      categories.map((cat) => ({
        value: String(cat.id),
        label: categoryLabel(cat),
      })),
    [categories],
  );

  const selectedCategory = useMemo(() => {
    if (resolvedSelectedId === undefined) return undefined;
    return categories.find((c) => String(c.id) === resolvedSelectedId);
  }, [categories, resolvedSelectedId]);

  return {
    data,
    categories,
    selectedId,
    setSelectedId,
    resolvedSelectedId,
    selectValue,
    comboboxOptions,
    selectedCategory,
  };
}
