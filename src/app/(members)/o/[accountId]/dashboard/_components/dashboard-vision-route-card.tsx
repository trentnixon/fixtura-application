"use client";

import { IconEye } from "@tabler/icons-react";
import Link from "next/link";

import { TypographyH4, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { useSeasonHubRecon, useSeasonHubStats } from "@/lib/api/hooks/season-hub";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { TrackingSummary } from "../../season/_components/shared/tracking-summary";

/** `container.header.stacked-actions.default` — header, content, wrapping action row. */
export function DashboardVisionRouteCard({ accountId }: { accountId: string }) {
  const seasonStatsQuery = useSeasonHubStats(accountId);
  const seasonReconQuery = useSeasonHubRecon(accountId);

  const isPending = seasonStatsQuery.isPending || seasonReconQuery.isPending;
  const reconData = seasonReconQuery.data?.data;
  const statsData = seasonStatsQuery.data?.data;

  return (
    <div className="bg-background rounded-lg border p-5">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <TypographyH4 className="text-sm font-semibold">Vision</TypographyH4>
          <TypographyMuted className="text-xs">
            Competitions, grades, and fixtures Fixtura tracks for this organisation.
          </TypographyMuted>
        </div>
        <IconEye className="text-primary size-5 shrink-0" stroke={1.5} aria-hidden />
      </div>

      <div className="mt-4">
        <TrackingSummary
          shell="none"
          showTitle={false}
          counts={{
            competitions: reconData?.counts.competitions ?? statsData?.summary.competitions ?? 0,
            grades: reconData?.counts.grades ?? statsData?.summary.grades ?? 0,
            teams: statsData?.summary.teams ?? reconData?.counts.teams ?? 0,
            fixtures: statsData?.summary.fixtures ?? reconData?.counts.fixtures ?? 0,
          }}
          lastUpdatedAt={statsData?.freshness?.lastUpdatedAt}
          isPending={isPending}
        />
      </div>

      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button variant="outline" size="sm" asChild disabled={isPending}>
          <Link href={accountScopedRoutes.season(accountId)}>Open Vision</Link>
        </Button>
      </div>
    </div>
  );
}
