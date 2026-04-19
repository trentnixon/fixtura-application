"use client";

import { Card } from "@/components/ui/card";

import { RemotionSandboxFiltersColumn } from "./remotion-sandbox-filters-column";
import { RemotionSandboxGradientBar } from "./remotion-sandbox-gradient-bar";
import { RemotionSandboxPreviewColumn } from "./remotion-sandbox-preview-column";
import { RemotionThumbnailCarousel } from "./remotion-thumbnail-carousel";
import { useRemotionSandboxPreviewData } from "../_hooks/use-remotion-sandbox-preview-data";
import { useRemotionSandboxSelection } from "../_hooks/use-remotion-sandbox-selection";

export function RemotionSandboxPanel() {
  const {
    categoriesQuery,
    categories,
    selectedCategory,
    template,
    usedFallback,
    compositionId,
    imageOptions,
  } = useRemotionSandboxSelection();

  const { data, durationInFrames, loadError } = useRemotionSandboxPreviewData({
    template,
    compositionId,
  });

  const fallbackNoteSlug =
    categoriesQuery.isSuccess &&
    categories.length > 0 &&
    usedFallback &&
    selectedCategory !== undefined
      ? selectedCategory.slug
      : null;

  return (
    <>
      <Card className="w-full max-w-6xl overflow-hidden">
        <RemotionSandboxGradientBar />
        <div className="flex flex-col lg:flex-row">
          <RemotionSandboxPreviewColumn
            fallbackNoteSlug={fallbackNoteSlug}
            template={template}
            compositionId={compositionId}
            data={data}
            durationInFrames={durationInFrames}
            loadError={loadError}
          />
          <RemotionSandboxFiltersColumn
            isPending={categoriesQuery.isPending}
            isError={categoriesQuery.isError}
            isEmpty={categories.length === 0}
            categoriesError={categoriesQuery.error}
            onCategoriesRetry={() => void categoriesQuery.refetch()}
            imageOptions={imageOptions}
          />
        </div>
      </Card>
      {data !== null && loadError === null ? (
        <RemotionThumbnailCarousel
          template={template}
          compositionId={compositionId}
          data={data}
          durationInFrames={durationInFrames}
        />
      ) : null}
    </>
  );
}
