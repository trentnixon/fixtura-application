"use client";

import { TrackingSummary } from "../shared/tracking-summary";

import type { SeasonOverviewSummarySectionProps } from "../_types";

export function SeasonOverviewSummarySection({
  reconData,
  statsData,
}: SeasonOverviewSummarySectionProps) {
  return (
    <TrackingSummary
      counts={{
        competitions: reconData.counts.competitions,
        grades: reconData.counts.grades,
        teams: statsData?.summary.teams ?? 0,
        fixtures: statsData?.summary.fixtures ?? 0,
      }}
      lastUpdatedAt={statsData?.freshness?.lastUpdatedAt}
    />
  );
}
