"use client";

import Autoplay from "embla-carousel-autoplay";
import * as React from "react";

import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export function CarouselPanel() {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <h3 className="text-sm font-medium">Carousel</h3>
        <p className="text-muted-foreground text-sm">Basic slides with previous/next controls.</p>
        <Carousel
          className="w-full max-w-3xl"
          opts={{ loop: true }}
          plugins={[Autoplay({ delay: 2500 })]}
        >
          <CarouselContent>
            {Array.from({ length: 8 }).map((_, i) => (
              <CarouselItem key={i} className="md:basis-1/2 lg:basis-1/3">
                <Card>
                  <CardContent className="flex h-40 items-center justify-center p-6">
                    <span className="text-sm">Slide {i + 1}</span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </div>
  );
}
