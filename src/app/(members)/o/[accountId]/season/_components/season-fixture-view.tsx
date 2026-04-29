"use client";

import { Loader2 } from "lucide-react";

import { ErrorState } from "@/components/ui/error-state";
import { useSeasonHubFixture, useSeasonHubGradeFixtures } from "@/lib/api/hooks/season-hub";

import { SEASON_LOADING_COPY } from "./_constants";
import { useSeasonFixtureViewModel } from "./_hooks";
import { SeasonFixtureContextMetaSection } from "./_sections/season-fixture-context-meta-section";
import { SeasonFixtureGradeContextSection } from "./_sections/season-fixture-grade-context-section";
import { SeasonFixtureGradeFixturesErrorBanner } from "./_sections/season-fixture-grade-fixtures-error-banner";
import { SeasonFixtureMatchSummarySection } from "./_sections/season-fixture-match-summary-section";
import { SeasonFixtureOutputsSection } from "./_sections/season-fixture-outputs-section";
import { SeasonFixtureTeamsSection } from "./_sections/season-fixture-teams-section";
import { SeasonFixtureViewHeader } from "./_sections/season-fixture-view-header";
import {
  buildSeasonCompetitionHref,
  buildSeasonGradeHref,
  buildSeasonOverviewHref,
} from "./_utils";

import type { SeasonFixtureViewProps } from "./_types";

export function SeasonFixtureView({
  accountId,
  competitionId,
  gradeId,
  fixtureId,
}: SeasonFixtureViewProps) {
  const fixture = useSeasonHubFixture(
    {
      accountId,
      competitionId,
      gradeId,
      fixtureId,
    },
    { enabled: Boolean(gradeId && fixtureId) },
  );
  const gradeFixtures = useSeasonHubGradeFixtures(accountId, gradeId, {
    competitionId,
    enabled: Boolean(gradeId),
  });

  const fixtureModel = useSeasonFixtureViewModel(fixture.data, gradeId, fixtureId, competitionId);

  const isFetching = fixture.isFetching || gradeFixtures.isFetching;

  const seasonBase = buildSeasonOverviewHref(accountId);
  const competitionHref = buildSeasonCompetitionHref(accountId, competitionId);
  const gradeHref = buildSeasonGradeHref(accountId, competitionId, gradeId);

  const handleSync = () => {
    void fixture.refetch();
    void gradeFixtures.refetch();
  };

  if (fixture.isError && fixture.error) {
    return (
      <ErrorState
        title="Could not load fixture"
        description={
          fixture.error instanceof Error ? fixture.error.message : "Something went wrong."
        }
        onRetry={handleSync}
      />
    );
  }

  if (fixture.isPending) {
    return (
      <div className="bg-card flex items-center gap-2 rounded-lg border p-4">
        <Loader2 className="text-muted-foreground size-4 animate-spin" aria-hidden />
        <p className="text-muted-foreground text-sm">{SEASON_LOADING_COPY.fixture}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <SeasonFixtureViewHeader
        accountId={accountId}
        seasonBase={seasonBase}
        competitionHref={competitionHref}
        gradeHref={gradeHref}
        model={fixtureModel}
        isFetching={isFetching}
        onSync={handleSync}
      />

      <SeasonFixtureMatchSummarySection model={fixtureModel} />

      <SeasonFixtureGradeContextSection model={fixtureModel} gradeHref={gradeHref} />

      <SeasonFixtureTeamsSection model={fixtureModel} />

      <SeasonFixtureOutputsSection model={fixtureModel} />

      <SeasonFixtureContextMetaSection model={fixtureModel} />

      {gradeFixtures.isError ? (
        <SeasonFixtureGradeFixturesErrorBanner
          message={
            gradeFixtures.error instanceof Error ? gradeFixtures.error.message : "Unknown error"
          }
        />
      ) : null}
    </div>
  );
}
