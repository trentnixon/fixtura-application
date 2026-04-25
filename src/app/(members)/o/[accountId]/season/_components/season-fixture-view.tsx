"use client";

import { ErrorState } from "@/components/ui/error-state";
import { useSeasonHubFixture } from "@/lib/api/hooks/season-hub";

import { SEASON_LOADING_COPY } from "./_constants";
import { extractFixtureRecord, resolveFixtureHeadline } from "./_utils";

import type { SeasonFixtureViewProps } from "./_types";

export function SeasonFixtureView({
  accountId,
  competitionId,
  gradeId,
  fixtureId,
}: SeasonFixtureViewProps) {
  const q = useSeasonHubFixture({
    accountId,
    competitionId,
    gradeId,
    fixtureId,
  });

  if (q.isError && q.error) {
    return (
      <ErrorState
        title="Could not load fixture"
        description={q.error instanceof Error ? q.error.message : "Something went wrong."}
        onRetry={() => void q.refetch()}
      />
    );
  }

  if (q.isPending) {
    return <p className="text-muted-foreground text-sm">{SEASON_LOADING_COPY.fixture}</p>;
  }

  const fixture = extractFixtureRecord(q.data);
  const headline = resolveFixtureHeadline(fixture, fixtureId);

  return (
    <div className="grid gap-4">
      <h1 className="font-brand text-2xl font-semibold">{headline}</h1>
      <p className="text-muted-foreground text-sm">
        Full fixture payload is available for future layout; key blocks include{" "}
        <code className="text-xs">fixture</code>, <code className="text-xs">teamsData</code>, and{" "}
        <code className="text-xs">downloads</code>.
      </p>
    </div>
  );
}
