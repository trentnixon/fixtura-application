"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

import { resolveCarouselItemBasisClass } from "../carousel-items-in-view";

import type { CarouselItemsInViewConfig } from "../carousel-items-in-view";
import type { ComponentProps, ReactNode } from "react";

export type CardCarouselProps<TItem> = {
  items: TItem[];
  renderItem: (item: TItem, index: number) => ReactNode;
  getItemKey?: (item: TItem, index: number) => string | number;
  /** Slides visible in the viewport at once (default: 1 mobile, 2 md, 3 lg). */
  itemsInView?: CarouselItemsInViewConfig;
  contentClassName?: string;
  itemClassName?: string;
  previousClassName?: string;
  nextClassName?: string;
} & Omit<ComponentProps<typeof Carousel>, "children">;

const defaultPreviousClassName = "max-sm:-left-2 sm:-left-4 md:-left-6";
const defaultNextClassName = "max-sm:-right-2 sm:-right-4 md:-right-6";
const defaultContentClassName = "-ml-2 md:-ml-4";
const defaultItemLayoutClassName = "py-1 pl-2 md:py-2 md:pl-4";
const defaultItemClassName = `${defaultItemLayoutClassName} md:basis-1/2 lg:basis-1/3`;

export function CardCarousel<TItem>({
  items,
  renderItem,
  getItemKey,
  itemsInView,
  className,
  contentClassName,
  itemClassName,
  previousClassName,
  nextClassName,
  opts = { align: "start" },
  ...carouselProps
}: CardCarouselProps<TItem>) {
  const itemsInViewBasisClass = resolveCarouselItemBasisClass(itemsInView);

  return (
    <Carousel className={cn("mx-auto w-full max-w-4xl", className)} opts={opts} {...carouselProps}>
      <CarouselContent className={cn(defaultContentClassName, contentClassName)}>
        {items.map((item, index) => (
          <CarouselItem
            key={getItemKey?.(item, index) ?? index}
            className={cn(
              itemsInViewBasisClass != null ? defaultItemLayoutClassName : defaultItemClassName,
              itemsInViewBasisClass,
              itemClassName,
            )}
          >
            {renderItem(item, index)}
          </CarouselItem>
        ))}
      </CarouselContent>
      {items.length > 1 ? (
        <>
          <CarouselPrevious className={cn(defaultPreviousClassName, previousClassName)} />
          <CarouselNext className={cn(defaultNextClassName, nextClassName)} />
        </>
      ) : null}
    </Carousel>
  );
}
