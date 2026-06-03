"use client";

import { Thumbnail } from "@remotion/player";

import {
  REMOTION_PREVIEW_COMPOSITION_HEIGHT,
  REMOTION_PREVIEW_COMPOSITION_WIDTH,
  REMOTION_PREVIEW_FPS,
} from "@/components/remotion/_constants/remotion-player";
import "@/components/remotion/remotion-preview.css";
import { cn } from "@/lib/utils";
import { FixturaTemplateScene } from "@/vendor/fixtura-remotion-assets/preview";

import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

/** Composition-sized frame so the still has non-zero height without relying on a tall flex ancestor (Embla viewport is often `h-auto`). */
const aspectFrameClassName =
  "relative mx-auto w-full min-w-0 max-w-full max-h-[min(78vh,720px)] aspect-[1080/1350] overflow-hidden rounded-xl";

export type RemotionThumbnailStillProps = {
  data: FixturaDataset;
  durationInFrames: number;
  frameToDisplay: number;
  /** Stable key for Remotion `Thumbnail` remounts (e.g. template + composition + frame). */
  frameKey: string;
  className?: string;
};

export function RemotionThumbnailStill({
  data,
  durationInFrames,
  frameToDisplay,
  frameKey,
  className,
}: RemotionThumbnailStillProps) {
  return (
    <div className={cn("flex min-h-0 w-full min-w-0 justify-center", className)}>
      <div className={aspectFrameClassName}>
        <div
          data-remotion-preview-root
          className="not-prose absolute inset-0 min-h-0 min-w-0 overflow-hidden"
        >
          <Thumbnail
            key={frameKey}
            component={FixturaTemplateScene}
            durationInFrames={durationInFrames}
            compositionWidth={REMOTION_PREVIEW_COMPOSITION_WIDTH}
            compositionHeight={REMOTION_PREVIEW_COMPOSITION_HEIGHT}
            fps={REMOTION_PREVIEW_FPS}
            inputProps={{ data }}
            frameToDisplay={frameToDisplay}
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
