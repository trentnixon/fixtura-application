"use client";

import { CardCarouselPanel } from "@/components/carousel";
import { TypographyMuted, TypographySectionDescription } from "@/components/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { RemotionThumbnailStill } from "./remotion-thumbnail-still";

import type { RemotionAssetPreviewState } from "../types";
import type { ReactNode } from "react";

function previewMediaKeyFromData(data: NonNullable<RemotionAssetPreviewState["data"]>): string {
  const r = data as Record<string, unknown>;
  const vm = r["videoMeta"] as Record<string, unknown> | undefined;
  const video = vm?.["video"] as Record<string, unknown> | undefined;
  const appearance = video?.["appearance"] as Record<string, unknown> | undefined;
  const meta = video?.["metadata"] as Record<string, unknown> | undefined;
  const template = typeof appearance?.["template"] === "string" ? appearance["template"] : "";
  const comp = typeof meta?.["compositionId"] === "string" ? meta["compositionId"] : "";
  return `${template}-${comp}`;
}

export type AssetPreviewCarouselProps = {
  state: RemotionAssetPreviewState;
  title?: ReactNode;
  description?: ReactNode;
  /** Snapshot of account branding / theme for troubleshooting (shown under the title). */
  brandingSettingsDebug?: ReactNode;
  className?: string;
  surfaceClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  /** Passed to `CardCarousel` / `CarouselContent` inner flex (e.g. clear negative margin, height). */
  contentClassName?: string;
  itemClassName?: string;
  thumbnailFrameClassName?: string;
};

export function AssetPreviewCarousel({
  state,
  title = "Asset preview",
  description,
  brandingSettingsDebug,
  className,
  surfaceClassName,
  headerClassName,
  bodyClassName,
  contentClassName,
  itemClassName,
  thumbnailFrameClassName,
}: AssetPreviewCarouselProps) {
  const { status } = state;

  const showSettingsDebug = brandingSettingsDebug != null;
  const headerDescriptionClassName = showSettingsDebug ? "max-w-none w-full" : undefined;

  const wrapHeaderDescription = (inner: ReactNode | null): ReactNode | null => {
    if (!showSettingsDebug && !inner) return null;
    return (
      <div className="w-full max-w-none space-y-3">
        {showSettingsDebug ? (
          <div className="border-border bg-muted/35 space-y-2 rounded-lg border p-3">
            <p className="text-muted-foreground text-[0.65rem] font-semibold tracking-wide uppercase">
              User settings (debug)
            </p>
            {brandingSettingsDebug}
          </div>
        ) : null}
        {inner}
      </div>
    );
  };

  const optionalPanelClassNames = {
    ...(className !== undefined ? { className } : {}),
    ...(surfaceClassName !== undefined ? { surfaceClassName } : {}),
    ...(headerClassName !== undefined ? { headerClassName } : {}),
    ...(bodyClassName !== undefined ? { bodyClassName } : {}),
    ...(contentClassName !== undefined ? { contentClassName } : {}),
    ...(itemClassName !== undefined ? { itemClassName } : {}),
    ...(headerDescriptionClassName !== undefined ? { headerDescriptionClassName } : {}),
  };

  if (status === "unsupported-sport") {
    return (
      <CardCarouselPanel
        {...optionalPanelClassNames}
        title={title}
        description={wrapHeaderDescription(
          description === undefined || description === null ? null : description,
        )}
        items={[1]}
        getItemKey={() => "unsupported"}
        renderItem={() => (
          <div className="flex min-h-40 items-center justify-center p-4">
            <TypographyMuted className="text-center text-sm leading-relaxed">
              Preview is available for Cricket organisations. Your sport is not supported for this
              preview yet.
            </TypographyMuted>
          </div>
        )}
      />
    );
  }

  if (status === "loading") {
    return (
      <CardCarouselPanel
        {...optionalPanelClassNames}
        title={title}
        description={wrapHeaderDescription(
          description === undefined || description === null ? null : description,
        )}
        items={[1]}
        getItemKey={() => "loading"}
        renderItem={() => (
          <div className="flex min-h-[min(60vh,22rem)] items-center justify-center p-4">
            <Skeleton className="mx-auto aspect-[1080/1350] w-full max-w-[min(100%,12rem)] rounded-md" />
          </div>
        )}
      />
    );
  }

  if (status === "error") {
    return (
      <CardCarouselPanel
        {...optionalPanelClassNames}
        title={title}
        description={wrapHeaderDescription(
          description === undefined || description === null ? null : description,
        )}
        items={[1]}
        getItemKey={() => "error"}
        renderItem={() => (
          <div className="text-destructive flex min-h-40 items-center justify-center p-4 text-sm">
            {state.loadError ?? "Failed to load preview."}
          </div>
        )}
      />
    );
  }

  if (status !== "ready" || state.data === null || state.frameTargets.length === 0) {
    return (
      <CardCarouselPanel
        {...optionalPanelClassNames}
        title={title}
        description={wrapHeaderDescription(
          description === undefined || description === null ? null : description,
        )}
        items={[1]}
        getItemKey={() => "empty"}
        renderItem={() => (
          <div className="flex min-h-40 items-center justify-center p-4">
            <TypographyMuted className="text-center text-sm">No preview data.</TypographyMuted>
          </div>
        )}
      />
    );
  }

  const previewData = state.data;
  const mediaKey = previewMediaKeyFromData(previewData);
  const anyClamped = state.frameTargets.some((t) => t.wasClamped);
  const showFramesFallbackNote = !state.fromDatasetFrames;

  const hasHeaderDescription =
    (description !== undefined &&
      description !== null &&
      (typeof description !== "string" || description.trim() !== "")) ||
    anyClamped ||
    showFramesFallbackNote;

  const headerDescription = hasHeaderDescription ? (
    <div className="space-y-2">
      {typeof description === "string" ? (
        <TypographySectionDescription className="max-w-2xl">
          {description}
        </TypographySectionDescription>
      ) : (
        description
      )}
      {anyClamped ? (
        <p className="text-sm text-orange-600 dark:text-orange-400">
          One or more thumbnail frames exceed composition length ({state.durationInFrames} frames);
          showing clamped stills.
        </p>
      ) : null}
      {showFramesFallbackNote ? (
        <p className="text-muted-foreground text-xs">
          Using fallback thumbnail frame; dataset had no <code className="text-xs">frames</code>{" "}
          array.
        </p>
      ) : null}
    </div>
  ) : null;

  return (
    <CardCarouselPanel
      {...optionalPanelClassNames}
      title={title}
      description={wrapHeaderDescription(headerDescription)}
      items={state.frameTargets}
      getItemKey={(_, index) => `${mediaKey}-f-${index}`}
      renderItem={(target, index) => (
        <Card className="flex h-full min-h-0 flex-col gap-0 border-0 bg-transparent py-0 shadow-none ring-0">
          <CardContent className="flex h-full min-h-0 flex-1 flex-col !p-0">
            <RemotionThumbnailStill
              data={previewData}
              durationInFrames={state.durationInFrames}
              frameToDisplay={target.frameToDisplay}
              frameKey={`${mediaKey}-thumb-${index}-${target.desired}`}
              aspectFrameClassName={thumbnailFrameClassName}
            />
          </CardContent>
        </Card>
      )}
    />
  );
}
