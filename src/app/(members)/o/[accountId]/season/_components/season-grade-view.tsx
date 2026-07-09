"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { ErrorState } from "@/components/ui/error-state";
import { useTriggerFixtureDiscoveryGrade } from "@/lib/api/hooks/account/useTriggerFixtureDiscoveryGrade";
import { useTriggerGradesLookupTeamsSingleScrape } from "@/lib/api/hooks/account/useTriggerGradesLookupTeamsSingleScrape";
import { useSeasonHubGrade, useSeasonHubGradeFixtures } from "@/lib/api/hooks/season-hub";

import { SEASON_LOADING_COPY } from "./_constants";
import { useSeasonGradeFixtureFilters, useSeasonGradeViewState } from "./_hooks";
import { SeasonGradeCoverageSummarySection } from "./_sections/season-grade-coverage-summary-section";
import { SeasonGradeFixturesSection } from "./_sections/season-grade-fixtures-section";
import { SeasonGradeSyncDialog } from "./_sections/season-grade-sync-dialog";
import { SeasonGradeViewHeader } from "./_sections/season-grade-view-header";
import { buildSeasonCompetitionHref, buildSeasonGradeFixtureBuckets } from "./_utils";

import type { SeasonGradeViewProps } from "./_types";

export function SeasonGradeView({ accountId, competitionId, gradeId }: SeasonGradeViewProps) {
  const teamsLookup = useTriggerGradesLookupTeamsSingleScrape(accountId, competitionId, gradeId);
  const fixtureDiscovery = useTriggerFixtureDiscoveryGrade(accountId, competitionId, gradeId);
  const cmsCompetitionNumericId = Number.parseInt(competitionId, 10);
  const cmsGradeNumericId = Number.parseInt(gradeId, 10);
  const canQueueTeamsRefresh =
    Number.isInteger(cmsCompetitionNumericId) && cmsCompetitionNumericId > 0;
  const canQueueFixturesRefresh = Number.isInteger(cmsGradeNumericId) && cmsGradeNumericId > 0;
  const canQueueCombinedSync = canQueueTeamsRefresh && canQueueFixturesRefresh;
  const isSyncMutating = teamsLookup.isPending || fixtureDiscovery.isPending;
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [showAllPrevious, setShowAllPrevious] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  const grade = useSeasonHubGrade(accountId, gradeId, { competitionId, enabled: Boolean(gradeId) });
  const fixtures = useSeasonHubGradeFixtures(accountId, gradeId, {
    competitionId,
    enabled: Boolean(gradeId),
  });

  const isPending = grade.isPending || fixtures.isPending;
  const isFetching = grade.isFetching || fixtures.isFetching;
  const isError = grade.isError || fixtures.isError;
  const firstError = grade.error ?? fixtures.error;
  const fixtureRows = useMemo(() => fixtures.data?.data ?? [], [fixtures.data?.data]);

  const g = grade.data?.data;
  const { fixturesCountFromGrade, fixturesEmpty, displayModel } = useSeasonGradeViewState({
    grade: g,
    gradeId,
    competitionId,
    fixturesRows: fixtureRows,
    fixturesPending: fixtures.isPending,
  });

  const {
    team,
    setTeam,
    venue,
    setVenue,
    date,
    setDate,
    status,
    setStatus,
    options,
    filteredRows,
    hasActiveFilters,
    clearFilters,
  } = useSeasonGradeFixtureFilters({ rows: fixtureRows });
  const fixtureBuckets = useMemo(
    () => buildSeasonGradeFixtureBuckets(filteredRows),
    [filteredRows],
  );
  const previousRows = showAllPrevious
    ? fixtureBuckets.allPreviousRows
    : fixtureBuckets.previousRows;
  const upcomingRows = showAllUpcoming
    ? fixtureBuckets.allUpcomingRows
    : fixtureBuckets.upcomingRows;
  const clearFixtureFilters = () => {
    clearFilters();
    setShowAllPrevious(false);
    setShowAllUpcoming(false);
  };

  const competitionHref = buildSeasonCompetitionHref(accountId, competitionId);

  if (isError && firstError) {
    return (
      <ErrorState
        title="Could not load grade"
        description={firstError instanceof Error ? firstError.message : "Something went wrong."}
        onRetry={() => {
          void grade.refetch();
          void fixtures.refetch();
        }}
      />
    );
  }

  if (isPending) {
    return (
      <div className="bg-card flex items-center gap-2 rounded-lg border p-4">
        <Loader2 className="text-muted-foreground size-4 animate-spin" aria-hidden />
        <p className="text-muted-foreground text-sm">{SEASON_LOADING_COPY.grade}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <SeasonGradeViewHeader
        accountId={accountId}
        competitionHref={competitionHref}
        displayModel={displayModel}
        isFetching={isFetching}
        canQueueCombinedSync={canQueueCombinedSync}
        onReload={() => {
          void grade.refetch();
          void fixtures.refetch();
        }}
        onOpenSync={() => setSyncDialogOpen(true)}
      />

      <SeasonGradeSyncDialog
        open={syncDialogOpen}
        onOpenChange={setSyncDialogOpen}
        isSyncMutating={isSyncMutating}
        cmsCompetitionNumericId={cmsCompetitionNumericId}
        cmsGradeNumericId={cmsGradeNumericId}
        teamsMutateAsync={teamsLookup.mutateAsync}
        fixturesMutateAsync={fixtureDiscovery.mutateAsync}
        onSynced={() => {
          void grade.refetch();
          void fixtures.refetch();
          setSyncDialogOpen(false);
        }}
      />

      <SeasonGradeFixturesSection
        accountId={accountId}
        competitionId={competitionId}
        gradeId={gradeId}
        competitionHref={competitionHref}
        fixturesEmpty={fixturesEmpty}
        fixturesCountFromGrade={fixturesCountFromGrade}
        fixtureRows={fixtureRows}
        filteredRows={filteredRows}
        previousRows={previousRows}
        upcomingRows={upcomingRows}
        previousDefaultCount={fixtureBuckets.previousRows.length}
        upcomingDefaultCount={fixtureBuckets.upcomingRows.length}
        allPreviousCount={fixtureBuckets.allPreviousRows.length}
        allUpcomingCount={fixtureBuckets.allUpcomingRows.length}
        showAllPrevious={showAllPrevious}
        setShowAllPrevious={setShowAllPrevious}
        showAllUpcoming={showAllUpcoming}
        setShowAllUpcoming={setShowAllUpcoming}
        team={team}
        setTeam={setTeam}
        venue={venue}
        setVenue={setVenue}
        date={date}
        setDate={setDate}
        status={status}
        setStatus={setStatus}
        options={options}
        hasActiveFilters={hasActiveFilters || showAllPrevious || showAllUpcoming}
        clearFilters={clearFixtureFilters}
      />

      <SeasonGradeCoverageSummarySection
        teamCount={displayModel.teamCount}
        fixtureCount={displayModel.fixtureCount}
      />
    </div>
  );
}
