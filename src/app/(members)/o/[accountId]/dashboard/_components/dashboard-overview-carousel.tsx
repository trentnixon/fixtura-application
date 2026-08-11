"use client";

import {
  AssetPreviewStage,
  type AssetPreviewDisplayMode,
  type RemotionAssetPreviewState,
} from "@/features/remotion-asset-preview";

import {
  DASHBOARD_PREVIEW_CAROUSEL_CONTENT_CLASS,
  DASHBOARD_PREVIEW_CAROUSEL_ITEM_CLASS,
  DASHBOARD_PREVIEW_ITEMS_IN_VIEW,
  DASHBOARD_PREVIEW_REMOTION_ROOT_CLASS,
} from "../_constants/dashboard-preview-layout";

import type { ReactNode } from "react";

type DashboardOverviewCarouselProps = {
  remotionPreviewState: RemotionAssetPreviewState;
  displayMode: AssetPreviewDisplayMode;
  brandingSettingsDebug?: ReactNode;
  title?: ReactNode;
  compact?: boolean;
};

export function DashboardOverviewCarousel({
  remotionPreviewState,
  displayMode,
  brandingSettingsDebug,
  title,
  compact = false,
}: DashboardOverviewCarouselProps) {
  return (
    <AssetPreviewStage
      embedded={compact}
      displayMode={displayMode}
      state={remotionPreviewState}
      {...(compact ? { title: title ?? null } : title !== undefined ? { title } : {})}
      {...(brandingSettingsDebug !== undefined ? { brandingSettingsDebug } : {})}
      {...(compact ? { itemsInView: DASHBOARD_PREVIEW_ITEMS_IN_VIEW } : {})}
      {...(compact ? { opts: { align: "start" as const } } : {})}
      className={
        compact ? "w-full max-w-none min-w-0" : "flex h-full min-h-0 max-w-none flex-1 flex-col"
      }
      surfaceClassName={
        compact
          ? "flex w-full min-w-0 flex-col overflow-hidden rounded-none border-0 bg-transparent shadow-none ring-0"
          : "flex h-full min-h-[min(50vh,420px)] flex-col"
      }
      bodyClassName={compact ? "flex min-h-0 flex-col !p-0" : "flex min-h-0 flex-1 flex-col"}
      contentClassName={
        compact ? DASHBOARD_PREVIEW_CAROUSEL_CONTENT_CLASS : "-ml-2 h-full min-h-0 flex-1 md:-ml-4"
      }
      {...(compact ? { itemClassName: DASHBOARD_PREVIEW_CAROUSEL_ITEM_CLASS } : {})}
      {...(compact ? { thumbnailPreviewRootClassName: DASHBOARD_PREVIEW_REMOTION_ROOT_CLASS } : {})}
    />
  );
}
