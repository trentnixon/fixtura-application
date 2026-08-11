"use client";

import { useMemo } from "react";

import { useImageOptionsAssetsPicker } from "@/components/pickers/assets-list-for-selection";
import {
  resolveSelectedCategoryIdString,
  useTemplateCategoryPickerSelection,
} from "@/components/pickers/template-category";
import { DEFAULT_REMOTION_SANDBOX_COMPOSITION_ID } from "@/components/remotion/_constants/remotion-composition";
import { isRemotionSandboxCricketCompositionId } from "@/components/remotion/_constants/remotion-datasets";
import { resolveRemotionTemplateFromSlug } from "@/components/remotion/_utils/resolve-remotion-template-from-slug";
import { useTemplateCategoriesListForSelection } from "@/lib/api/hooks/account/useTemplateCategoriesListForSelection";
import { PICKER_SANDBOX_ACCOUNT_SCOPE } from "@/lib/api/query/query-keys";

import type { RemotionSandboxCricketCompositionId } from "@/components/remotion/_types/remotion-sandbox";
import type { TemplateCategoryCatalogItem } from "@/types/api/account";

export function useRemotionSandboxSelection() {
  const categoriesQuery = useTemplateCategoriesListForSelection();
  const imageOptions = useImageOptionsAssetsPicker({
    accountId: PICKER_SANDBOX_ACCOUNT_SCOPE,
  });
  const { selectedId } = useTemplateCategoryPickerSelection(PICKER_SANDBOX_ACCOUNT_SCOPE);

  const categories = useMemo<TemplateCategoryCatalogItem[]>(
    () => categoriesQuery.data?.data ?? [],
    [categoriesQuery.data],
  );

  const resolvedSelectedId = useMemo(
    () => resolveSelectedCategoryIdString(categories, selectedId),
    [categories, selectedId],
  );

  const selectedCategory = useMemo(() => {
    if (resolvedSelectedId == null) {
      return undefined;
    }

    return categories.find((category) => String(category.id) === resolvedSelectedId);
  }, [categories, resolvedSelectedId]);

  const { template, usedFallback } = useMemo(
    () => resolveRemotionTemplateFromSlug(selectedCategory?.slug),
    [selectedCategory?.slug],
  );

  const compositionId = useMemo((): RemotionSandboxCricketCompositionId => {
    const fromAsset = imageOptions.selected?.CompositionID;
    if (isRemotionSandboxCricketCompositionId(fromAsset)) {
      return fromAsset;
    }
    return DEFAULT_REMOTION_SANDBOX_COMPOSITION_ID;
  }, [imageOptions.selected]);

  return {
    categoriesQuery,
    categories,
    selectedCategory,
    template,
    usedFallback,
    compositionId,
    imageOptions,
  };
}
