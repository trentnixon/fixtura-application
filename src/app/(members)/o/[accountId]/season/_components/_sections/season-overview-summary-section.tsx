"use client";

import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/ui/container";
import { SectionBlock, SectionLabel } from "@/components/ui/section";

import type { SeasonOverviewSummarySectionProps } from "../_types";

export function SeasonOverviewSummarySection({
  reconData,
  statsData,
}: SeasonOverviewSummarySectionProps) {
  return (
    <SectionBlock variant="inset" className="bg-slate-100 text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel
          variant="kicker"
          className="text-sm font-semibold tracking-normal text-slate-900 normal-case"
        >
          Season summary
        </SectionLabel>
        {statsData?.freshness?.lastUpdatedAt ? (
          <Badge
            variant="secondary"
            className="border-white/20 bg-white/10 px-2 py-1 text-slate-900"
          >
            Updated{" "}
            {new Date(statsData.freshness.lastUpdatedAt).toLocaleString(undefined, {
              dateStyle: "short",
              timeStyle: "short",
            })}
          </Badge>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
          <SectionLabel
            variant="kicker"
            className="text-foreground text-2xl leading-none font-bold tracking-normal normal-case tabular-nums"
          >
            {reconData.counts.competitions}
          </SectionLabel>
          <SectionLabel
            variant="kicker"
            className="text-muted-foreground truncate text-sm tracking-tight uppercase"
          >
            Competitions
          </SectionLabel>
        </Surface>
        <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
          <SectionLabel
            variant="kicker"
            className="text-foreground text-2xl leading-none font-bold tracking-normal normal-case tabular-nums"
          >
            {reconData.counts.grades}
          </SectionLabel>
          <SectionLabel
            variant="kicker"
            className="text-muted-foreground truncate text-sm tracking-tight uppercase"
          >
            Grades
          </SectionLabel>
        </Surface>
        <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
          <SectionLabel
            variant="kicker"
            className="text-foreground text-2xl leading-none font-bold tracking-normal normal-case tabular-nums"
          >
            {statsData?.summary.teams ?? 0}
          </SectionLabel>
          <SectionLabel
            variant="kicker"
            className="text-muted-foreground truncate text-sm tracking-tight uppercase"
          >
            Teams
          </SectionLabel>
        </Surface>
        <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
          <SectionLabel
            variant="kicker"
            className="text-foreground text-2xl leading-none font-bold tracking-normal normal-case tabular-nums"
          >
            {statsData?.summary.fixtures ?? 0}
          </SectionLabel>
          <SectionLabel
            variant="kicker"
            className="text-muted-foreground truncate text-sm tracking-tight uppercase"
          >
            Fixtures
          </SectionLabel>
        </Surface>
      </div>
    </SectionBlock>
  );
}
