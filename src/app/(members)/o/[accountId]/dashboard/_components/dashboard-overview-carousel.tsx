"use client";

import {
  AssetPreviewCarousel,
  type RemotionAssetPreviewState,
} from "@/features/remotion-asset-preview";

import type { ReactNode } from "react";

type DashboardOverviewCarouselProps = {
  remotionPreviewState: RemotionAssetPreviewState;
  brandingSettingsDebug?: ReactNode;
};

export function DashboardOverviewCarousel({
  remotionPreviewState,
  brandingSettingsDebug,
}: DashboardOverviewCarouselProps) {
  return (
    <AssetPreviewCarousel
      state={remotionPreviewState}
      brandingSettingsDebug={brandingSettingsDebug}
      className="flex h-full min-h-0 max-w-none flex-1 flex-col"
      surfaceClassName="flex h-full min-h-[min(50vh,420px)] flex-col"
      bodyClassName="flex min-h-0 flex-1 flex-col"
      /** Keep default `-ml-*` + item `pl-*` so slides have horizontal gutter; height fills the panel. */
      contentClassName="-ml-2 h-full min-h-0 flex-1 md:-ml-4"
      /** Horizontal padding = gap between slides; vertical padding off so the poster fills the slide top/bottom. */
      itemClassName="basis-full !h-full !min-h-0 !py-0 !pt-0 !pb-0"
    />
  );
}
