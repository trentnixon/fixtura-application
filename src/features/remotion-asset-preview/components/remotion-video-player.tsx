"use client";

import { Player } from "@remotion/player";
import { useMemo } from "react";

import {
  REMOTION_PREVIEW_COMPOSITION_HEIGHT,
  REMOTION_PREVIEW_COMPOSITION_WIDTH,
  REMOTION_PREVIEW_FPS,
} from "@/components/remotion/_constants/remotion-player";
import "@/components/remotion/remotion-preview.css";
import { cn } from "@/lib/utils";
import { FixturaTemplateScene } from "@/vendor/fixtura-remotion-assets/preview";

import { withTemplateVariationModeNormalizedForRemotionPlayer } from "../utils/normalize-template-variation-mode-for-player";
import { previewMediaKeyFromData } from "../utils/preview-media-key-from-data";

import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

const defaultAspectFrameClassName =
  "relative mx-auto w-full min-w-0 max-w-full max-h-[min(78vh,720px)] aspect-[1080/1350] overflow-hidden rounded-xl";

export type RemotionVideoPlayerProps = {
  data: FixturaDataset;
  durationInFrames: number;
  className?: string;
  aspectFrameClassName?: string;
  /**
   * Surface + sizing on `[data-remotion-preview-root]` itself (fitted to the player).
   * When set, skips the full-width aspect frame + absolute inset layout.
   */
  previewRootClassName?: string;
};

export function RemotionVideoPlayer({
  data,
  durationInFrames,
  className,
  aspectFrameClassName,
  previewRootClassName,
}: RemotionVideoPlayerProps) {
  const playerData = useMemo(
    () => withTemplateVariationModeNormalizedForRemotionPlayer(data),
    [data],
  );
  const mediaKey = previewMediaKeyFromData(data);

  const player = (
    <Player
      key={mediaKey}
      component={FixturaTemplateScene}
      durationInFrames={durationInFrames}
      compositionWidth={REMOTION_PREVIEW_COMPOSITION_WIDTH}
      compositionHeight={REMOTION_PREVIEW_COMPOSITION_HEIGHT}
      fps={REMOTION_PREVIEW_FPS}
      inputProps={{ data: playerData }}
      controls
      style={{ width: "100%", height: "100%" }}
    />
  );

  if (previewRootClassName != null) {
    return (
      <div className={cn("flex min-h-0 w-full min-w-0 justify-center", className)}>
        <div
          data-remotion-preview-root
          className={cn("not-prose relative min-h-0 overflow-hidden", previewRootClassName)}
        >
          {player}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-0 w-full min-w-0 justify-center", className)}>
      <div className={cn(defaultAspectFrameClassName, aspectFrameClassName)}>
        <div
          data-remotion-preview-root
          className="not-prose absolute inset-0 min-h-0 min-w-0 overflow-hidden"
        >
          {player}
        </div>
      </div>
    </div>
  );
}
