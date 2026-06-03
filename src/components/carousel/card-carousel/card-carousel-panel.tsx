"use client";

import { TypographySectionDescription, TypographySubsectionTitle } from "@/components/typography";
import { Surface } from "@/components/ui/container";
import { cn } from "@/lib/utils";

import { CardCarousel } from "./card-carousel";

import type { CardCarouselProps } from "./card-carousel";
import type { ReactNode } from "react";

export type CardCarouselPanelProps<TItem> = {
  title?: ReactNode;
  description?: ReactNode;
  headerClassName?: string;
  /** Merged with default `max-w-2xl` on header description (e.g. `max-w-none` for wide debug). */
  headerDescriptionClassName?: string;
  bodyClassName?: string;
  surfaceClassName?: string;
} & Omit<CardCarouselProps<TItem>, "title">;

export function CardCarouselPanel<TItem>({
  title,
  description,
  headerClassName,
  headerDescriptionClassName,
  bodyClassName,
  surfaceClassName,
  ...carouselProps
}: CardCarouselPanelProps<TItem>) {
  const hasHeader = title != null || description != null;

  return (
    <Surface className={cn("p-0", surfaceClassName)}>
      {hasHeader ? (
        <div
          className={cn("border-border space-y-1.5 border-b px-6 py-5 md:px-8", headerClassName)}
        >
          {title ? <TypographySubsectionTitle>{title}</TypographySubsectionTitle> : null}
          {description ? (
            <TypographySectionDescription
              as="div"
              className={cn("max-w-2xl", headerDescriptionClassName)}
            >
              {description}
            </TypographySectionDescription>
          ) : null}
        </div>
      ) : null}

      <div className={cn("relative px-6 py-8 sm:px-10 sm:py-10 md:px-14 md:py-10", bodyClassName)}>
        <CardCarousel {...carouselProps} />
      </div>
    </Surface>
  );
}
