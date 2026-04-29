"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { ErrorState } from "@/components/ui/error-state";
import { useTriggerOrgSingleScrape } from "@/lib/api/hooks/account/useTriggerOrgSingleScrape";
import {
  useSeasonHubCompetitions,
  useSeasonHubRecon,
  useSeasonHubStats,
} from "@/lib/api/hooks/season-hub";

import { SEASON_LOADING_COPY } from "./_constants";
import { useSeasonOverviewFilters, useSeasonOverviewState } from "./_hooks";
import { SeasonOverviewEmptyStates } from "./_sections/season-overview-empty-states";
import { SeasonOverviewHeader } from "./_sections/season-overview-header";
import { SeasonOverviewSummarySection } from "./_sections/season-overview-summary-section";
import { SeasonOverviewSyncDialog } from "./_sections/season-overview-sync-dialog";
import { SeasonOverviewTrackedCompetitionsSection } from "./_sections/season-overview-tracked-competitions-section";

export function SeasonOverview({ accountId }: { accountId: string }) {
  const recon = useSeasonHubRecon(accountId);
  const stats = useSeasonHubStats(accountId);
  const competitions = useSeasonHubCompetitions(accountId, { page: 1, pageSize: 25 });
  const orgSync = useTriggerOrgSingleScrape(accountId);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);

  const anyError = recon.isError || stats.isError || competitions.isError;
  const firstError = recon.error ?? stats.error ?? competitions.error;
  const loading = recon.isPending || stats.isPending || competitions.isPending;
  const reconData = recon.data?.data;
  const statsData = stats.data?.data;
  const competitionDataList = competitions.data?.data;
  const pagination = competitions.data?.meta?.pagination;
  const { allResourceZeros, competitionsUnavailable, listEmptyButScopeShowsCompetitions } =
    useSeasonOverviewState({
      reconData,
      competitionListLength: competitionDataList?.length ?? 0,
      competitionsPending: competitions.isPending,
    });

  const filterState = useSeasonOverviewFilters({
    rows: competitionDataList ?? [],
  });

  const runRefresh = () => {
    void recon.refetch();
    void stats.refetch();
    void competitions.refetch();
  };

  if (anyError && firstError) {
    return (
      <ErrorState
        title="Could not load season"
        description={firstError instanceof Error ? firstError.message : "Something went wrong."}
        onRetry={() => {
          void recon.refetch();
          void stats.refetch();
          void competitions.refetch();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="bg-card flex items-center gap-2 rounded-lg border p-4">
        <Loader2 className="text-muted-foreground size-4 animate-spin" aria-hidden />
        <p className="text-muted-foreground text-sm">{SEASON_LOADING_COPY.season}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <SeasonOverviewHeader
        accountId={accountId}
        loading={loading}
        orgSyncPending={orgSync.isPending}
        onRefresh={runRefresh}
        onOpenSync={() => setSyncDialogOpen(true)}
      />
      <SeasonOverviewSyncDialog
        open={syncDialogOpen}
        onOpenChange={setSyncDialogOpen}
        orgSync={orgSync}
      />
      {reconData ? (
        <SeasonOverviewSummarySection reconData={reconData} statsData={statsData} />
      ) : null}
      <SeasonOverviewEmptyStates
        reconPresent={Boolean(reconData)}
        allResourceZeros={allResourceZeros}
        competitionsUnavailable={competitionsUnavailable}
        listEmptyButScopeShowsCompetitions={listEmptyButScopeShowsCompetitions}
        onRefetchCompetitions={() => void competitions.refetch()}
      />
      <SeasonOverviewTrackedCompetitionsSection
        accountId={accountId}
        competitionsUnavailable={competitionsUnavailable}
        allResourceZeros={allResourceZeros}
        pagination={pagination}
        {...filterState}
      />
    </div>
  );
}
