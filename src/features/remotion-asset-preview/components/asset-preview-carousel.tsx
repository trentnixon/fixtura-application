"use client";

import {
  CardCarouselPanel,
  resolveCarouselEmbeddedGutterClasses,
  resolveCarouselItemBasisClass,
} from "@/components/carousel";
import { TypographyMuted, TypographySectionDescription } from "@/components/typography";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import { RemotionThumbnailStill } from "./remotion-thumbnail-still";
import { previewMediaKeyFromData } from "../utils/preview-media-key-from-data";

import type { RemotionAssetPreviewState } from "../types";
import type { CarouselItemsInViewConfig } from "@/components/carousel";
import type { ReactNode } from "react";

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
  /** Surface-style classes on `[data-remotion-preview-root]` per still. */
  thumbnailPreviewRootClassName?: string;
  previousClassName?: string;
  nextClassName?: string;
  /** Slides visible in the viewport at once (embedded default: 1). */
  itemsInView?: CarouselItemsInViewConfig;
  /**
   * Flat layout for template builder and other embedded contexts:
   * no card chrome, no body padding, carousel fills the parent box.
   */
  embedded?: boolean;
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
  thumbnailPreviewRootClassName,
  previousClassName,
  nextClassName,
  itemsInView,
  embedded = false,
  opts: carouselOpts,
}: AssetPreviewCarouselProps) {
  const { status } = state;
  const resolvedItemsInView = itemsInView ?? (embedded ? 1 : undefined);
  const embeddedGutterClasses = embedded
    ? resolveCarouselEmbeddedGutterClasses(resolvedItemsInView)
    : null;
  const embeddedItemsInViewBasisClass = embedded
    ? resolveCarouselItemBasisClass(resolvedItemsInView)
    : undefined;

  const showSettingsDebug = brandingSettingsDebug != null;
  const headerDescriptionClassName = showSettingsDebug ? "max-w-none w-full" : undefined;
  const resolvedTitle = embedded ? null : title;

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

  const resolvedThumbnailFrameClassName = cn(
    embedded &&
      !thumbnailFrameClassName &&
      "mx-auto w-full max-w-full overflow-hidden rounded-lg aspect-[1080/1350] max-h-[min(78vh,720px)]",
    thumbnailFrameClassName,
  );

  const carouselPanelProps = {
    className: cn(embedded && "w-full max-w-none", className),
    surfaceClassName: cn(
      embedded && "border-0 bg-transparent p-0 shadow-none ring-0",
      surfaceClassName,
    ),
    bodyClassName: cn(embedded && "!p-0 !px-0 !py-0", bodyClassName),
    itemsInView: resolvedItemsInView,
    contentClassName: cn(
      embedded && "!ml-0",
      embeddedGutterClasses?.contentClassName,
      contentClassName,
    ),
    itemClassName: cn(
      embedded && "!p-0 !pl-0",
      embeddedGutterClasses?.itemClassName,
      embedded && embeddedItemsInViewBasisClass == null && "basis-full",
      embeddedItemsInViewBasisClass,
      itemClassName,
    ),
    previousClassName: cn(embedded && "left-0 size-7 sm:-left-3 sm:size-8", previousClassName),
    nextClassName: cn(embedded && "right-0 size-7 sm:-right-3 sm:size-8", nextClassName),
    ...(headerClassName !== undefined ? { headerClassName } : {}),
    ...(headerDescriptionClassName !== undefined ? { headerDescriptionClassName } : {}),
    opts: embedded ? { align: "center" as const, ...carouselOpts } : carouselOpts,
  };

  if (status === "unsupported-sport") {
    return (
      <CardCarouselPanel
        {...carouselPanelProps}
        title={resolvedTitle}
        description={wrapHeaderDescription(
          description === undefined || description === null ? null : description,
        )}
        items={[1]}
        getItemKey={() => "unsupported"}
        renderItem={() => (
          <div
            className={cn(
              "flex items-center justify-center",
              embedded ? "w-full p-2" : "min-h-40 p-4",
            )}
          >
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
        {...carouselPanelProps}
        title={resolvedTitle}
        description={wrapHeaderDescription(
          description === undefined || description === null ? null : description,
        )}
        items={[1]}
        getItemKey={() => "loading"}
        renderItem={() => (
          <div
            className={cn(
              "flex items-center justify-center",
              embedded ? "w-full p-0" : "min-h-[min(60vh,22rem)] p-4",
            )}
          >
            {embedded ? (
              <div className="flex w-full min-w-0 justify-center">
                <Skeleton
                  className={
                    thumbnailPreviewRootClassName ??
                    cn("mx-auto w-full", resolvedThumbnailFrameClassName)
                  }
                />
              </div>
            ) : (
              <Skeleton className="mx-auto aspect-[1080/1350] w-full max-w-[min(100%,12rem)] rounded-md" />
            )}
          </div>
        )}
      />
    );
  }

  if (status === "error") {
    return (
      <CardCarouselPanel
        {...carouselPanelProps}
        title={resolvedTitle}
        description={wrapHeaderDescription(
          description === undefined || description === null ? null : description,
        )}
        items={[1]}
        getItemKey={() => "error"}
        renderItem={() => (
          <div
            className={cn(
              "text-destructive flex items-center justify-center text-sm",
              embedded ? "w-full p-2" : "min-h-40 p-4",
            )}
          >
            {state.loadError ?? "Failed to load preview."}
          </div>
        )}
      />
    );
  }

  if (status !== "ready" || state.data === null || state.frameTargets.length === 0) {
    return (
      <CardCarouselPanel
        {...carouselPanelProps}
        title={resolvedTitle}
        description={wrapHeaderDescription(
          description === undefined || description === null ? null : description,
        )}
        items={[1]}
        getItemKey={() => "empty"}
        renderItem={() => (
          <div
            className={cn(
              "flex items-center justify-center",
              embedded ? "w-full p-2" : "min-h-40 p-4",
            )}
          >
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
      {...carouselPanelProps}
      title={resolvedTitle}
      description={wrapHeaderDescription(embedded ? null : headerDescription)}
      items={state.frameTargets}
      getItemKey={(_, index) => `${mediaKey}-f-${index}`}
      renderItem={(target, index) => {
        const still = (
          <RemotionThumbnailStill
            data={previewData}
            durationInFrames={state.durationInFrames}
            frameToDisplay={target.frameToDisplay}
            frameKey={`${mediaKey}-thumb-${index}-${target.desired}`}
            className={embedded ? "w-full min-w-0" : undefined}
            aspectFrameClassName={
              thumbnailPreviewRootClassName ? undefined : resolvedThumbnailFrameClassName
            }
            previewRootClassName={thumbnailPreviewRootClassName}
          />
        );

        if (embedded) return still;

        return (
          <Card className="flex h-full min-h-0 flex-col gap-0 border-0 bg-transparent py-0 shadow-none ring-0">
            <CardContent className="flex h-full min-h-0 flex-1 flex-col !p-0">{still}</CardContent>
          </Card>
        );
      }}
    />
  );
}
