"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import {
  useSeasonHubCompetitions,
  useSeasonHubRecon,
  useSeasonHubStats,
} from "@/lib/api/hooks/season-hub";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { SEASON_LOADING_COPY } from "./_constants";
import { useSeasonOverviewState } from "./_hooks";
import { SeasonEmptyPanel } from "./season-empty-panel";
import { SummaryTile } from "./shared/summary-tile";

export function SeasonOverview({ accountId }: { accountId: string }) {
  const recon = useSeasonHubRecon(accountId);
  const stats = useSeasonHubStats(accountId);
  const competitions = useSeasonHubCompetitions(accountId, { page: 1, pageSize: 25 });

  const anyError = recon.isError || stats.isError || competitions.isError;
  const firstError = recon.error ?? stats.error ?? competitions.error;
  const loading = recon.isPending || stats.isPending || competitions.isPending;
  const reconData = recon.data?.data;
  const statsData = stats.data?.data;
  const list = competitions.data?.data ?? [];
  const pagination = competitions.data?.meta?.pagination;
  const { allResourceZeros, competitionsUnavailable, listEmptyButScopeShowsCompetitions } =
    useSeasonOverviewState({
      reconData,
      competitionListLength: list.length,
      competitionsPending: competitions.isPending,
    });

  if (anyError && firstError) {
    return (
      <ErrorState
        title="Could not load season"
        description={firstError instanceof Error ? firstError.message : "Something went wrong."}
        onRetry={() => void recon.refetch()}
      />
    );
  }

  if (loading) {
    return <p className="text-muted-foreground text-sm">{SEASON_LOADING_COPY.season}</p>;
  }

  return (
    <div className="grid gap-6">
      {reconData ? (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Scope</CardDescription>
              <CardTitle className="text-base">
                {reconData.account.sport ?? "Sport"} · {reconData.account.orgType ?? "Organisation"}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Account #{reconData.account.id}
            </CardContent>
          </Card>
          <SummaryTile
            label="Competitions"
            value={reconData.counts.competitions}
            available={reconData.available.competitions}
          />
          <SummaryTile
            label="Grades"
            value={reconData.counts.grades}
            available={reconData.available.grades}
          />
          <SummaryTile
            label="Teams"
            value={reconData.counts.teams}
            available={reconData.available.teams}
          />
          <SummaryTile
            label="Fixtures"
            value={reconData.counts.fixtures}
            available={reconData.available.fixtures}
          />
        </div>
      ) : null}

      {reconData && allResourceZeros && !competitionsUnavailable ? (
        <SeasonEmptyPanel
          title="Nothing to show yet"
          description="Counts are all zero: no competitions, grades, teams, or fixtures are in scope for this account. When your administrator links competitions and fixtures, they will show up here."
        />
      ) : null}

      {listEmptyButScopeShowsCompetitions ? (
        <SeasonEmptyPanel
          title="No competitions in this list"
          description="Recon reports competitions for this account, but the list endpoint returned none. You can refresh the list, or try again after the next data sync."
          footer={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void competitions.refetch()}
            >
              Refresh list
            </Button>
          }
        />
      ) : null}

      {statsData ? (
        <p className="text-muted-foreground text-xs">
          Stats snapshot: {statsData.summary.competitions} competitions, {statsData.summary.grades}{" "}
          grades, {statsData.summary.teams} teams, {statsData.summary.fixtures} fixtures
          {statsData.freshness?.lastUpdatedAt
            ? ` · updated ${new Date(statsData.freshness.lastUpdatedAt).toLocaleString()}`
            : ""}
        </p>
      ) : null}

      <div>
        <h2 className="font-brand text-lg font-semibold">Competitions</h2>
        {competitionsUnavailable ? (
          <div className="mt-3">
            <SeasonEmptyPanel
              title="Competitions are not available"
              description="Season hub is not exposing competition listings for this account. You can still use other members areas; ask your administrator if competitions should appear here."
            />
          </div>
        ) : null}
        {!competitionsUnavailable && list.length === 0 && !allResourceZeros ? (
          <p className="text-muted-foreground mt-3 text-sm">
            No competitions in this scope for the current filters.
          </p>
        ) : null}
        {!competitionsUnavailable && list.length > 0 ? (
          <ul className="mt-3 grid gap-2">
            {list.map((c) => (
              <li key={c.id}>
                <Link
                  href={`${accountScopedRoutes.season(accountId)}/competitions/${c.id}`}
                  className="bg-card hover:bg-accent/50 block rounded-lg border p-4 transition-colors"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium">{c.name}</span>
                    <span className="text-muted-foreground text-sm">{c.season ?? "—"}</span>
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {c.association.name ?? "Association"}
                  </p>
                  <p className="text-muted-foreground mt-2 text-xs">
                    {c.counts.grades} grades · {c.counts.teams} teams · {c.counts.fixtures} fixtures
                    {c.counts.grades === 0 && c.counts.fixtures === 0 ? " · no draws yet" : ""}
                    {c.status ? ` · ${c.status}` : ""}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
        {pagination && pagination.total > pagination.pageSize ? (
          <p className="text-muted-foreground mt-2 text-xs">
            Showing page {pagination.page} of {pagination.pageCount} ({pagination.total} total)
          </p>
        ) : null}
      </div>
    </div>
  );
}
