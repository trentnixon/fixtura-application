"use client";

import { CardCarouselNumberedSlide, CardCarouselPanel } from "@/components/carousel";
import {
  TypographyEyebrow,
  TypographyInlineCode,
  TypographyPageDescription,
  TypographyPageTitle,
} from "@/components/typography";

const SLIDE_COUNT = 10;

const slides = Array.from({ length: SLIDE_COUNT }, (_, i) => {
  const n = i + 1;
  return {
    id: n,
    title: `Slide ${n}`,
    description: `Placeholder card ${n} of ${SLIDE_COUNT}`,
    value: n,
    caption: `Item ${n} of ${SLIDE_COUNT}`,
  };
});

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

      <CardCarouselPanel
        title="Preview"
        description={
          <>
            Numbered placeholder slides. Item width uses responsive{" "}
            <TypographyInlineCode>basis</TypographyInlineCode> so multiple slides peek in on larger
            viewports.
          </>
        }
        items={slides}
        getItemKey={(item) => item.id}
        renderItem={(item) => (
          <CardCarouselNumberedSlide
            title={item.title}
            description={item.description}
            value={item.value}
            caption={item.caption}
          />
        )}
      />
    </div>
  );
}
