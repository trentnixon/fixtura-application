"use client";

import { cn } from "@/lib/utils";

import { AssetPreviewCarousel } from "./asset-preview-carousel";
import { RemotionVideoPlayer } from "./remotion-video-player";

import type { AssetPreviewCarouselProps } from "./asset-preview-carousel";
import type { AssetPreviewDisplayMode, RemotionAssetPreviewState } from "../types";

export type AssetPreviewStageProps = {
  displayMode: AssetPreviewDisplayMode;
  state: RemotionAssetPreviewState;
} & Omit<AssetPreviewCarouselProps, "state">;

export function AssetPreviewStage({
  displayMode,
  state,
  className,
  contentClassName,
  thumbnailPreviewRootClassName,
  thumbnailFrameClassName,
  embedded = false,
  ...carouselProps
}: AssetPreviewStageProps) {
  if (displayMode === "video" && state.status === "ready" && state.data !== null) {
    return (
      <div className={cn(embedded && "w-full min-w-0", embedded && contentClassName, className)}>
        <RemotionVideoPlayer
          data={state.data}
          durationInFrames={state.durationInFrames}
          {...(thumbnailPreviewRootClassName !== undefined
            ? { previewRootClassName: thumbnailPreviewRootClassName }
            : {})}
          {...(thumbnailFrameClassName !== undefined
            ? { aspectFrameClassName: thumbnailFrameClassName }
            : {})}
          {...(embedded ? { className: "w-full min-w-0" } : {})}
        />
      </div>
    );
  }

  return (
    <AssetPreviewCarousel
      state={state}
      embedded={embedded}
      {...(className !== undefined ? { className } : {})}
      {...(contentClassName !== undefined ? { contentClassName } : {})}
      {...(thumbnailPreviewRootClassName !== undefined ? { thumbnailPreviewRootClassName } : {})}
      {...(thumbnailFrameClassName !== undefined ? { thumbnailFrameClassName } : {})}
      {...carouselProps}
    />
  );
}
