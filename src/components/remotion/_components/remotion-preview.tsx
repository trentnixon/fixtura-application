"use client";

import { Player } from "@remotion/player";

import { cn } from "@/lib/utils";
import { FixturaTemplateScene } from "@/vendor/fixtura-remotion-assets/preview";

import "../remotion-preview.css";
import { DEFAULT_REMOTION_SANDBOX_COMPOSITION_ID } from "../_constants/remotion-composition";
import {
  REMOTION_PREVIEW_COMPOSITION_HEIGHT,
  REMOTION_PREVIEW_COMPOSITION_WIDTH,
  REMOTION_PREVIEW_FPS,
} from "../_constants/remotion-player";
import { DEFAULT_REMOTION_SANDBOX_TEMPLATE } from "../_constants/remotion-templates";

import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

const previewShellClassName =
  "bg-muted/30 flex w-full max-w-3xl justify-center rounded-lg border p-4";

const previewAspectBoxClassName =
  "relative w-full max-w-[min(100%,calc(85vh*1080/1350))] aspect-[1080/1350] min-h-0";

export type RemotionVideoPreviewProps = {
  className?: string;
  template?: string;
  compositionId?: string;
  data: FixturaDataset | null;
  durationInFrames: number;
  loadError: string | null;
};

export function RemotionVideoPreview({
  className,
  template = DEFAULT_REMOTION_SANDBOX_TEMPLATE,
  compositionId = DEFAULT_REMOTION_SANDBOX_COMPOSITION_ID,
  data,
  durationInFrames,
  loadError,
}: RemotionVideoPreviewProps) {
  if (loadError) {
    return (
      <div className={cn(previewShellClassName, className)}>
        <div className="text-destructive w-full rounded-md border border-dashed p-6 text-sm">
          {loadError}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn(previewShellClassName, className)}>
        <div className="text-muted-foreground w-full rounded-md border border-dashed p-6 text-sm">
          Loading preview dataset...
        </div>
      </div>
    );
  }

  const mediaKey = `${template}-${compositionId}`;

  return (
    <div className={cn("flex w-full max-w-3xl flex-col", className)}>
      <div className={cn(previewShellClassName, "max-w-none")}>
        <div className={previewAspectBoxClassName}>
          <div data-remotion-preview-root className={cn("not-prose", "h-full min-h-0 w-full")}>
            <Player
              key={mediaKey}
              component={FixturaTemplateScene}
              durationInFrames={durationInFrames}
              compositionWidth={REMOTION_PREVIEW_COMPOSITION_WIDTH}
              compositionHeight={REMOTION_PREVIEW_COMPOSITION_HEIGHT}
              fps={REMOTION_PREVIEW_FPS}
              inputProps={{ data }}
              controls
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
