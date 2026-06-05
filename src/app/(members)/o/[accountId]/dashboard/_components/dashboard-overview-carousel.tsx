"use client";

import {
  AssetPreviewCarousel,
  type RemotionAssetPreviewState,
} from "@/features/remotion-asset-preview";

import type { ReactNode } from "react";

type DashboardOverviewCarouselProps = {
  remotionPreviewState: RemotionAssetPreviewState;
  brandingSettingsDebug?: ReactNode;
  title?: ReactNode;
  compact?: boolean;
};

export function DashboardOverviewCarousel({
  remotionPreviewState,
  brandingSettingsDebug,
  title,
  compact = false,
}: DashboardOverviewCarouselProps) {
  return (
    <AssetPreviewCarousel
      state={remotionPreviewState}
      title={title}
      brandingSettingsDebug={brandingSettingsDebug}
      className="flex h-full min-h-0 max-w-none flex-1 flex-col"
      surfaceClassName={
        compact
          ? "flex h-full min-h-0 flex-col overflow-hidden rounded-none border-0 bg-transparent shadow-none ring-0"
          : "flex h-full min-h-[min(50vh,420px)] flex-col"
      }
      bodyClassName={compact ? "flex min-h-0 flex-1 flex-col p-0" : "flex min-h-0 flex-1 flex-col"}
      /** Keep default `-ml-*` + item `pl-*` so slides have horizontal gutter; height fills the panel. */
      contentClassName="-ml-2 h-full min-h-0 flex-1 md:-ml-4"
      /** Horizontal padding = gap between slides; vertical padding off so the poster fills the slide top/bottom. */
      itemClassName="basis-full !h-full !min-h-0 !py-0 !pt-0 !pb-0"
      thumbnailFrameClassName={compact ? "rounded-none" : undefined}
    />
  );
}
