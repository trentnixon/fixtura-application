"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  countGroupsNeedingAttention,
  getGroupsNeedingAttention,
  mediaGalleryGroupDomId,
} from "../_utils/media-gallery-coverage";

import type { MediaGalleryCategoryConfig } from "../_utils/media-gallery-category";
import type { MediaGalleryCoverage } from "../_utils/media-gallery-coverage";
import type { MediaGalleryView } from "../_utils/media-gallery-query-state";

type MediaGalleryCoverageSummaryProps = {
  coverage: MediaGalleryCoverage;
  view: Exclude<MediaGalleryView, "pool">;
  categoryConfig: MediaGalleryCategoryConfig;
  onUpload: () => void;
};

export function MediaGalleryCoverageSummary({
  coverage,
  view,
  categoryConfig,
  onUpload,
}: MediaGalleryCoverageSummaryProps) {
  const needingAttentionCount = countGroupsNeedingAttention(coverage, view);
  const groupsNeedingAttention = getGroupsNeedingAttention(coverage, view);
  const isHealthy = needingAttentionCount === 0;

  const handleShowNeedingAttention = () => {
    const firstGroup = groupsNeedingAttention[0];
    if (!firstGroup) return;
    const element = document.getElementById(mediaGalleryGroupDomId(view, firstGroup));
    element?.scrollIntoView({ behavior: "smooth", block: "start" });
    element?.focus({ preventScroll: true });
  };

  const viewLabel = view === "asset" ? "asset types" : categoryConfig.categoryLabel.toLowerCase();
  const singularLabel =
    view === "asset" ? "asset type" : categoryConfig.categoryLabel.toLowerCase();
  const statusLabel = isHealthy
    ? `All ${viewLabel} covered`
    : `${needingAttentionCount} ${needingAttentionCount === 1 ? singularLabel : viewLabel} need backgrounds`;

  return (
    <div
      className="border-border bg-muted/30 flex min-w-0 flex-wrap items-center gap-2 rounded-lg border px-3 py-2"
      role="status"
      aria-live="polite"
    >
      {isHealthy ? (
        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" aria-hidden />
      ) : (
        <AlertTriangle className="size-4 shrink-0 text-amber-600" aria-hidden />
      )}
      <span className="text-sm font-medium">{statusLabel}</span>
      <div className="flex flex-wrap items-center gap-1.5">
        <Button type="button" size="sm" variant="outline" onClick={onUpload}>
          Upload background
        </Button>
        {!isHealthy ? (
          <Button type="button" size="sm" variant="ghost" onClick={handleShowNeedingAttention}>
            Show groups needing attention
          </Button>
        ) : null}
      </div>
    </div>
  );
}
