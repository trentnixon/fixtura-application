"use client";

import {
  TypographyCaption,
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyMetricValue,
} from "@/components/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import type { ReactNode } from "react";

export type CardCarouselNumberedSlideProps = {
  title: ReactNode;
  description?: ReactNode;
  value?: ReactNode;
  caption?: ReactNode;
};

export function CardCarouselNumberedSlide({
  title,
  description,
  value,
  caption,
}: CardCarouselNumberedSlideProps) {
  return (
    <Card className="ring-border/60 h-full min-h-44 justify-between shadow-md ring-1">
      <CardHeader className="space-y-1 pb-2">
        <TypographyCardTitle as="p" className="text-base">
          {title}
        </TypographyCardTitle>
        {description ? (
          <TypographyCardDescription as="p" className="text-xs sm:text-sm">
            {description}
          </TypographyCardDescription>
        ) : null}
      </CardHeader>
      {value != null || caption ? (
        <CardContent className="flex flex-1 flex-col items-center justify-center gap-2 pt-0 pb-8">
          {value != null ? (
            <TypographyMetricValue className="tabular-nums">{value}</TypographyMetricValue>
          ) : null}
          {caption ? <TypographyCaption>{caption}</TypographyCaption> : null}
        </CardContent>
      ) : null}
    </Card>
  );
}
