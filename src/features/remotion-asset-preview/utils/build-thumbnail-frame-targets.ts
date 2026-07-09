import { REMOTION_SANDBOX_PREVIEW_THUMBNAIL_FRAME } from "@/components/remotion/_constants/remotion-composition";
import { getSandboxThumbnailFramesFromData } from "@/components/remotion/_utils/get-sandbox-thumbnail-frames";

import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

export type ThumbnailFrameTarget = {
  desired: number;
  frameToDisplay: number;
  wasClamped: boolean;
};

export type BuildThumbnailFrameTargetsResult = {
  targets: ThumbnailFrameTarget[];
  fromDataset: boolean;
  desiredThumbFrames: number[];
};

export function buildThumbnailFrameTargets(
  data: FixturaDataset,
  durationInFrames: number,
  maxFrameTargets?: number,
): BuildThumbnailFrameTargetsResult {
  const { frames: desiredThumbFrames, fromDataset: usesDatasetFrames } =
    getSandboxThumbnailFramesFromData(data, REMOTION_SANDBOX_PREVIEW_THUMBNAIL_FRAME);

  const limitedDesiredThumbFrames =
    maxFrameTargets != null && maxFrameTargets > 0
      ? desiredThumbFrames.slice(0, maxFrameTargets)
      : desiredThumbFrames;

  const targets = limitedDesiredThumbFrames.map((desired) => {
    const frameToDisplay = durationInFrames > 0 ? Math.min(desired, durationInFrames - 1) : 0;
    const wasClamped = durationInFrames > 0 && desired > durationInFrames - 1;
    return { desired, frameToDisplay, wasClamped };
  });

  return { targets, fromDataset: usesDatasetFrames, desiredThumbFrames: limitedDesiredThumbFrames };
}
