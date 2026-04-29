"use client";

import { Calendar, Users, type LucideIcon } from "lucide-react";

import { Surface } from "@/components/ui/container";
import { SectionBlock } from "@/components/ui/section";

import type { SeasonGradeCoverageSummarySectionProps } from "../_types";

export function SeasonGradeCoverageSummarySection({
  teamCount,
  fixtureCount,
}: SeasonGradeCoverageSummarySectionProps) {
  return (
    <SectionBlock variant="inset" spacing="sm">
      <div>
        <p className="text-sm font-semibold">Coverage summary</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(
          [
            [teamCount, "Teams", Users],
            [fixtureCount, "Fixtures", Calendar],
          ] as Array<[number, string, LucideIcon]>
        ).map(([value, label, Icon]) => (
          <Surface
            key={label}
            className="flex min-h-16 items-center justify-between gap-3 py-3 shadow-none"
          >
            <div className="flex min-w-0 items-baseline gap-3">
              <span className="text-2xl leading-none font-bold tabular-nums">{value}</span>
              <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                {label}
              </span>
            </div>
            <Icon className="text-primary size-4 shrink-0" aria-hidden />
          </Surface>
        ))}
      </div>
    </SectionBlock>
  );
}
