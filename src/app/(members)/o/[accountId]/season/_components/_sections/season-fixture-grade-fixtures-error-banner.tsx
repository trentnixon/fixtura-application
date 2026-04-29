"use client";

import { Surface } from "@/components/ui/container";

import type { SeasonFixtureGradeFixturesErrorBannerProps } from "../_types";

export function SeasonFixtureGradeFixturesErrorBanner({
  message,
}: SeasonFixtureGradeFixturesErrorBannerProps) {
  return (
    <Surface className="shadow-none">
      <p className="text-destructive text-sm">Could not refresh grade fixtures list: {message}</p>
    </Surface>
  );
}
