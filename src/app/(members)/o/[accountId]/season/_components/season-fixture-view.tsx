"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { ErrorState } from "@/components/ui/error-state";
import { useTriggerResultSingleScrape } from "@/lib/api/hooks/account/useTriggerResultSingleScrape";
import { useSeasonHubFixture, useSeasonHubGradeFixtures } from "@/lib/api/hooks/season-hub";
import { toastError, toastSuccess } from "@/lib/notify";

import { SEASON_LOADING_COPY } from "./_constants";
import { useSeasonFixtureViewModel } from "./_hooks";
import { SeasonFixtureDetailTabsSection } from "./_sections/season-fixture-detail-tabs-section";
import { SeasonFixtureGradeFixturesErrorBanner } from "./_sections/season-fixture-grade-fixtures-error-banner";
import { SeasonFixtureResultSyncDialog } from "./_sections/season-fixture-result-sync-dialog";
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

  const cmsFixtureNumericId = Number.parseInt(fixtureId, 10);
  const canQueueResultSync = Number.isInteger(cmsFixtureNumericId) && cmsFixtureNumericId > 0;
  const resultSingle = useTriggerResultSingleScrape(accountId, competitionId, gradeId, fixtureId);
  const [resultSyncDialogOpen, setResultSyncDialogOpen] = useState(false);

  const isFetching = fixture.isFetching || gradeFixtures.isFetching;

  const seasonBase = buildSeasonOverviewHref(accountId);
  const competitionHref = buildSeasonCompetitionHref(accountId, competitionId);
  const gradeHref = buildSeasonGradeHref(accountId, competitionId, gradeId);

  const handleRefetch = () => {
    void fixture.refetch();
    void gradeFixtures.refetch();
  };

  const handleConfirmResultSync = async () => {
    if (!canQueueResultSync) {
      return;
    }
    try {
      await resultSingle.mutateAsync({ cmsFixtureId: cmsFixtureNumericId });
      toastSuccess(
        "Result scrape queued",
        "This may take about 30–60 seconds. Data will update after processing.",
      );
      setResultSyncDialogOpen(false);
    } catch (error) {
      toastError(error, "Could not queue result scrape");
    }
  };

  if (fixture.isError && fixture.error) {
    return (
      <ErrorState
        title="Could not load fixture"
        description={
          fixture.error instanceof Error ? fixture.error.message : "Something went wrong."
        }
        onRetry={handleRefetch}
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
        canQueueResultSync={canQueueResultSync}
        onReload={handleRefetch}
        onOpenSync={() => setResultSyncDialogOpen(true)}
      />

      <SeasonFixtureResultSyncDialog
        open={resultSyncDialogOpen}
        onOpenChange={setResultSyncDialogOpen}
        isSyncMutating={resultSingle.isPending}
        onConfirm={handleConfirmResultSync}
      />

      <SeasonFixtureDetailTabsSection model={fixtureModel} />

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
