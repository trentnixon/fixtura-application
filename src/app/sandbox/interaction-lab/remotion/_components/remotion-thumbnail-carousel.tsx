"use client";

import { Thumbnail } from "@remotion/player";

import {
  DEFAULT_REMOTION_SANDBOX_COMPOSITION_ID,
  REMOTION_SANDBOX_PREVIEW_THUMBNAIL_FRAME,
} from "@/components/remotion/_constants/remotion-composition";
import {
  REMOTION_PREVIEW_COMPOSITION_HEIGHT,
  REMOTION_PREVIEW_COMPOSITION_WIDTH,
  REMOTION_PREVIEW_FPS,
} from "@/components/remotion/_constants/remotion-player";
import { DEFAULT_REMOTION_SANDBOX_TEMPLATE } from "@/components/remotion/_constants/remotion-templates";
import { getSandboxThumbnailFramesFromData } from "@/components/remotion/_utils/get-sandbox-thumbnail-frames";
import {
  TypographyCardDescription,
  TypographyCardTitle,
  TypographySectionDescription,
  TypographySubsectionTitle,
} from "@/components/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Surface } from "@/components/ui/container";
import { cn } from "@/lib/utils";
import { FixturaTemplateScene } from "@/vendor/fixtura-remotion-assets/preview";

import type { FixturaDataset } from "@/vendor/fixtura-remotion-assets/preview";

const thumbnailAspectBoxClassName =
  "relative mx-auto w-full max-w-[min(100%,12rem)] aspect-[1080/1350] min-h-0";

type SandboxRemotionThumbnailCarouselProps = {
  template?: string;
  compositionId?: string;
  data: FixturaDataset;
  durationInFrames: number;
};

export function RemotionThumbnailCarousel({
  template = DEFAULT_REMOTION_SANDBOX_TEMPLATE,
  compositionId = DEFAULT_REMOTION_SANDBOX_COMPOSITION_ID,
  data,
  durationInFrames,
}: SandboxRemotionThumbnailCarouselProps) {
  const { frames: desiredThumbFrames, fromDataset: usesDatasetFrames } =
    getSandboxThumbnailFramesFromData(data, REMOTION_SANDBOX_PREVIEW_THUMBNAIL_FRAME);

  const thumbnailTargets = desiredThumbFrames.map((desired) => {
    const frameToDisplay = durationInFrames > 0 ? Math.min(desired, durationInFrames - 1) : 0;
    const wasClamped = durationInFrames > 0 && desired > durationInFrames - 1;
    return { desired, frameToDisplay, wasClamped };
  });
  const anyThumbClamped = thumbnailTargets.some((target) => target.wasClamped);
  const mediaKey = `${template}-${compositionId}`;

  return (
    <Surface className="p-0">
      <div className="border-border space-y-1.5 border-b px-6 py-5 md:px-8">
        <TypographySubsectionTitle>Thumbnails</TypographySubsectionTitle>
        <TypographySectionDescription className="max-w-2xl">
          {usesDatasetFrames
            ? `Dataset frames: [${desiredThumbFrames.join(", ")}]. Stills use the same template as the preview above.`
            : `Static frame fallback (frame ${REMOTION_SANDBOX_PREVIEW_THUMBNAIL_FRAME}).`}
        </TypographySectionDescription>
        {anyThumbClamped ? (
          <p className="text-sm text-orange-600 dark:text-orange-400">
            One or more requested frames exceed composition length ({durationInFrames} frames);
            showing clamped stills.
          </p>
        ) : null}
      </div>

      <div className="relative px-6 py-8 sm:px-10 sm:py-10 md:px-14 md:py-10">
        <Carousel className="mx-auto w-full max-w-4xl" opts={{ align: "start" }}>
          <CarouselContent className="-ml-2 md:-ml-4">
            {thumbnailTargets.map(({ desired, frameToDisplay, wasClamped }, index) => (
              <CarouselItem
                key={`${mediaKey}-thumb-${index}-${desired}`}
                className="py-1 pl-2 md:basis-1/2 md:py-2 md:pl-4 lg:basis-1/3"
              >
                <Card className="ring-border/60 h-full min-h-44 justify-between shadow-md ring-1">
                  <CardHeader className="space-y-1 pb-2">
                    <TypographyCardTitle as="p" className="text-base tabular-nums">
                      {wasClamped
                        ? `Frame ${desired} -> ${frameToDisplay}`
                        : `Frame ${frameToDisplay}`}
                    </TypographyCardTitle>
                    <TypographyCardDescription as="p" className="text-xs sm:text-sm">
                      Still {index + 1} of {thumbnailTargets.length}
                    </TypographyCardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col items-center justify-center pt-0 pb-6">
                    <div className={cn(thumbnailAspectBoxClassName, "w-full")}>
                      <div
                        data-remotion-preview-root
                        className={cn("not-prose", "h-full min-h-0 w-full")}
                      >
                        <Thumbnail
                          key={`${mediaKey}-thumb-${index}-${desired}`}
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
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="max-sm:-left-2 sm:-left-4 md:-left-6" />
          <CarouselNext className="max-sm:-right-2 sm:-right-4 md:-right-6" />
        </Carousel>
      </div>
    </Surface>
  );
}
