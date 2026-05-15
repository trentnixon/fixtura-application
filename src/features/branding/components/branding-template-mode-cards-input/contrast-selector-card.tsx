"use client";

import { Contrast } from "lucide-react";

import { MetricComparisonCard } from "@/components/cards";
import { TypographyH4, TypographyMuted } from "@/components/typography";

import { CONTRAST_SELECTOR_BYLINE_COPY } from "./_consts";

import type { ContrastSelectorCardProps } from "./_types";

export function ContrastSelectorCard({
  headerDescription,
  children,
  footer,
}: ContrastSelectorCardProps) {
  return (
    <MetricComparisonCard
      className="w-full min-w-0 shadow-sm"
      layout="card"
      titleRowClassName="items-start"
      title={
        <div className="min-w-0 flex-1 space-y-1.5">
          <TypographyH4 className="text-sm font-semibold">2. Contrast selector</TypographyH4>
          <TypographyMuted className="text-muted-foreground max-w-none text-xs leading-relaxed">
            {CONTRAST_SELECTOR_BYLINE_COPY}
          </TypographyMuted>
        </div>
      }
      icon={<Contrast className="text-primary mt-0.5 size-5 shrink-0" aria-hidden />}
      body={
        <div className="space-y-5">
          {headerDescription ? <div className="space-y-3">{headerDescription}</div> : null}
          {children}
        </div>
      }
      footer={footer}
    />
  );
}
