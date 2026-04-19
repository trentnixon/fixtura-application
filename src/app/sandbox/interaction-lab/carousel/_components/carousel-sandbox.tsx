"use client";

import {
  TypographyCaption,
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyEyebrow,
  TypographyInlineCode,
  TypographyMetricValue,
  TypographyPageDescription,
  TypographyPageTitle,
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

const SLIDE_COUNT = 10;

export function CarouselSandbox() {
  return (
    <div className="space-y-10">
      <header className="border-border space-y-3 border-b pb-10">
        <TypographyEyebrow>Development only</TypographyEyebrow>
        <div className="space-y-2">
          <TypographyPageTitle>Carousel</TypographyPageTitle>
          <TypographyPageDescription className="max-w-3xl">
            Interactive slides using the <TypographyInlineCode>Carousel</TypographyInlineCode>{" "}
            primitive (Embla). Navigate with on-screen controls, keyboard arrows, or swipe and
            trackpad gestures.
          </TypographyPageDescription>
        </div>
      </header>

      <Surface className="p-0">
        <div className="border-border space-y-1.5 border-b px-6 py-5 md:px-8">
          <TypographySubsectionTitle>Preview</TypographySubsectionTitle>
          <TypographySectionDescription className="max-w-2xl">
            Numbered placeholder slides. Item width uses responsive{" "}
            <TypographyInlineCode>basis</TypographyInlineCode> so multiple slides peek in on larger
            viewports.
          </TypographySectionDescription>
        </div>

        <div className="relative px-6 py-8 sm:px-10 sm:py-10 md:px-14 md:py-10">
          <Carousel className="mx-auto w-full max-w-4xl" opts={{ align: "start" }}>
            <CarouselContent className="-ml-2 md:-ml-4">
              {Array.from({ length: SLIDE_COUNT }, (_, i) => i + 1).map((n) => (
                <CarouselItem
                  key={n}
                  className="py-1 pl-2 md:basis-1/2 md:py-2 md:pl-4 lg:basis-1/3"
                >
                  <Card className="ring-border/60 h-full min-h-44 justify-between shadow-md ring-1">
                    <CardHeader className="space-y-1 pb-2">
                      <TypographyCardTitle as="p" className="text-base">
                        Slide {n}
                      </TypographyCardTitle>
                      <TypographyCardDescription as="p" className="text-xs sm:text-sm">
                        Placeholder card {n} of {SLIDE_COUNT}
                      </TypographyCardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col items-center justify-center gap-2 pt-0 pb-8">
                      <TypographyMetricValue className="tabular-nums">{n}</TypographyMetricValue>
                      <TypographyCaption>
                        Item {n} of {SLIDE_COUNT}
                      </TypographyCaption>
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
    </div>
  );
}
