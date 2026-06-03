"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

import type { ComponentProps, ReactNode } from "react";

export type CardCarouselProps<TItem> = {
  items: TItem[];
  renderItem: (item: TItem, index: number) => ReactNode;
  getItemKey?: (item: TItem, index: number) => string | number;
  contentClassName?: string;
  itemClassName?: string;
  previousClassName?: string;
  nextClassName?: string;
} & Omit<ComponentProps<typeof Carousel>, "children">;

const defaultPreviousClassName = "max-sm:-left-2 sm:-left-4 md:-left-6";
const defaultNextClassName = "max-sm:-right-2 sm:-right-4 md:-right-6";
const defaultContentClassName = "-ml-2 md:-ml-4";
const defaultItemClassName = "py-1 pl-2 md:basis-1/2 md:py-2 md:pl-4 lg:basis-1/3";

export function CardCarousel<TItem>({
  items,
  renderItem,
  getItemKey,
  className,
  contentClassName,
  itemClassName,
  previousClassName,
  nextClassName,
  opts = { align: "start" },
  ...carouselProps
}: CardCarouselProps<TItem>) {
  return (
    <Carousel className={cn("mx-auto w-full max-w-4xl", className)} opts={opts} {...carouselProps}>
      <CarouselContent className={cn(defaultContentClassName, contentClassName)}>
        {items.map((item, index) => (
          <CarouselItem
            key={getItemKey?.(item, index) ?? index}
            className={cn(defaultItemClassName, itemClassName)}
          >
            {renderItem(item, index)}
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className={cn(defaultPreviousClassName, previousClassName)} />
      <CarouselNext className={cn(defaultNextClassName, nextClassName)} />
    </Carousel>
  );
}
