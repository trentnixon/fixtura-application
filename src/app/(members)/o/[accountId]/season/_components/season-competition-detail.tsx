"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { ErrorState } from "@/components/ui/error-state";
import { useTriggerGradesCompsSingleScrape } from "@/lib/api/hooks/account/useTriggerGradesCompsSingleScrape";
import { useSeasonHubCompetition, useSeasonHubCompetitionGrades } from "@/lib/api/hooks/season-hub";

import { SEASON_LOADING_COPY } from "./_constants";
import { useSeasonCompetitionDetailState } from "./_hooks";
import { SeasonCompetitionCoverageSummarySection } from "./_sections/season-competition-coverage-summary-section";
import { SeasonCompetitionDetailHeader } from "./_sections/season-competition-detail-header";
import { SeasonCompetitionSyncGradesDialog } from "./_sections/season-competition-sync-grades-dialog";
import { SeasonCompetitionTrackedGradesSection } from "./_sections/season-competition-tracked-grades-section";
import {
  asRecord,
  buildSeasonOverviewHref,
  extractCompetitionTitle,
  formatSeasonHubDate,
  pickString,
  resolveCompetitionTitle,
} from "./_utils";

import type { SeasonCompetitionDetailProps, SeasonCompetitionNormalizedGrade } from "./_types";

export function SeasonCompetitionDetail({
  accountId,
  competitionId,
}: SeasonCompetitionDetailProps) {
  const competition = useSeasonHubCompetition(accountId, competitionId);
  const grades = useSeasonHubCompetitionGrades(accountId, competitionId, { enabled: true });
  const gradesSync = useTriggerGradesCompsSingleScrape(accountId, competitionId);
  const cmsCompetitionNumericId = Number.parseInt(competitionId, 10);
  const canQueueGradesRefresh =
    Number.isInteger(cmsCompetitionNumericId) && cmsCompetitionNumericId > 0;
  const [gradesRefreshDialogOpen, setGradesRefreshDialogOpen] = useState(false);

  const isFetching = competition.isFetching || grades.isFetching;
  const {
    gradeRows: rawGradeRows,
    gradesCountFromDetail,
    gradesEmpty,
  } = useSeasonCompetitionDetailState({
    competitionRaw: competition.data?.data,
    competitionId,
    gradesData: grades.data?.data,
    gradesPending: grades.isPending,
  });

  const competitionRaw = asRecord(competition.data?.data);
  const metaRecord = asRecord(competitionRaw?.["meta"]);
  const competitionStatus =
    (metaRecord ? pickString(metaRecord, ["status"]) : undefined) ??
    (typeof competitionRaw?.["status"] === "string" ? competitionRaw["status"] : undefined) ??
    "Unknown status";

  const competitionData = competition.data?.data as
    | {
        name?: string;
        counts?: { grades?: number; teams?: number; fixtures?: number };
      }
    | undefined;

  const gradeCount = competitionData?.counts?.grades ?? 0;
  const teamCount = competitionData?.counts?.teams ?? 0;
  const fixtureCount = competitionData?.counts?.fixtures ?? 0;

  const normalizedGrades: SeasonCompetitionNormalizedGrade[] = useMemo(() => {
    return rawGradeRows.map((row, index) => {
      const parsed = row as {
        id?: number | string;
        name?: string;
        gender?: string;
        ageGroup?: string;
        counts?: { teams?: number; fixtures?: number };
        competition?: { status?: string; name?: string };
      };
      const competitionName =
        typeof parsed.competition?.name === "string" && parsed.competition.name.trim().length > 0
          ? parsed.competition.name.trim()
          : undefined;
      const base = {
        id: String(parsed.id ?? `unknown-${index}`),
        name: parsed.name ?? "Unnamed grade",
        gender: parsed.gender ?? "Unknown gender",
        ageGroup: parsed.ageGroup ?? "Unknown age group",
        teamCount: parsed.counts?.teams ?? 0,
        fixtureCount: parsed.counts?.fixtures ?? 0,
        status: parsed.competition?.status ?? competitionStatus,
      };
      return competitionName !== undefined ? { ...base, competitionName } : { ...base };
    });
  }, [rawGradeRows, competitionStatus]);

  const gradeCountFromRows = normalizedGrades.length;
  const teamCountFromRows = normalizedGrades.reduce((total, g) => total + g.teamCount, 0);
  const fixtureCountFromRows = normalizedGrades.reduce((total, g) => total + g.fixtureCount, 0);

  const statGradeCount = grades.isSuccess ? gradeCountFromRows : gradeCount;
  const statTeamCount = grades.isSuccess ? teamCountFromRows : teamCount;
  const statFixtureCount = grades.isSuccess ? fixtureCountFromRows : fixtureCount;

  const [gradeSearchQuery, setGradeSearchQuery] = useState("");
  const normalizedGradeSearch = gradeSearchQuery.trim().toLocaleLowerCase();
  const filteredGradeRows = useMemo(() => {
    if (normalizedGradeSearch.length === 0) {
      return normalizedGrades;
    }
    return normalizedGrades.filter((grade) => {
      const searchable = [grade.name, grade.gender, grade.ageGroup, String(grade.status)]
        .join(" ")
        .toLocaleLowerCase();
      return searchable.includes(normalizedGradeSearch);
    });
  }, [normalizedGrades, normalizedGradeSearch]);

  const competitionPageTitle =
    extractCompetitionTitle(competitionRaw) ??
    normalizedGrades.find((g) => g.competitionName)?.competitionName ??
    resolveCompetitionTitle(competitionRaw, competitionId);

  const competitionMeta = useMemo(() => {
    if (!competitionRaw) {
      return null;
    }
    const meta = asRecord(competitionRaw["meta"]);
    const association = asRecord(competitionRaw["association"]);
    const timeframe = meta ? asRecord(meta["timeframe"]) : undefined;
    if (!meta && !association) {
      return null;
    }
    return {
      season: meta ? pickString(meta, ["season"]) : undefined,
      status: meta ? pickString(meta, ["status"]) : undefined,
      isActive: typeof meta?.["isActive"] === "boolean" ? meta["isActive"] : undefined,
      timeframeStart: timeframe ? pickString(timeframe, ["start"]) : undefined,
      timeframeEnd: timeframe ? pickString(timeframe, ["end"]) : undefined,
      associationName: association ? pickString(association, ["name"]) : undefined,
    };
  }, [competitionRaw]);

  const headerContextLine = useMemo(() => {
    const parts = [competitionMeta?.season, competitionMeta?.associationName].filter(
      (p): p is string => Boolean(p && p.length > 0),
    );
    return parts.length > 0 ? parts.join(" - ") : null;
  }, [competitionMeta?.associationName, competitionMeta?.season]);

  const timeframeLine = useMemo(() => {
    const { timeframeStart: start, timeframeEnd: end } = competitionMeta ?? {};
    const startLabel = formatSeasonHubDate(start);
    const endLabel = formatSeasonHubDate(end);
    if (startLabel && endLabel) {
      return `${startLabel} - ${endLabel}`;
    }
    if (startLabel) {
      return `From ${startLabel}`;
    }
    if (endLabel) {
      return `Until ${endLabel}`;
    }
    return null;
  }, [competitionMeta]);

  const seasonOverviewHref = buildSeasonOverviewHref(accountId);

  const err = competition.error ?? grades.error;
  if ((competition.isError || grades.isError) && err) {
    return (
      <ErrorState
        title="Could not load competition"
        description={err instanceof Error ? err.message : "Something went wrong."}
        onRetry={() => {
          void competition.refetch();
          void grades.refetch();
        }}
      />
    );
  }

  if (competition.isPending) {
    return (
      <div className="bg-card flex items-center gap-2 rounded-lg border p-4">
        <Loader2 className="text-muted-foreground size-4 animate-spin" aria-hidden />
        <p className="text-muted-foreground text-sm">{SEASON_LOADING_COPY.competition}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <SeasonCompetitionDetailHeader
        accountId={accountId}
        competitionPageTitle={competitionPageTitle}
        headerContextLine={headerContextLine}
        timeframeLine={timeframeLine}
        seasonOverviewHref={seasonOverviewHref}
        isFetching={isFetching}
        canQueueGradesRefresh={canQueueGradesRefresh}
        onReload={() => {
          void competition.refetch();
          void grades.refetch();
        }}
        onOpenSyncGrades={() => setGradesRefreshDialogOpen(true)}
      />
      <SeasonCompetitionSyncGradesDialog
        open={gradesRefreshDialogOpen}
        onOpenChange={setGradesRefreshDialogOpen}
        cmsCompetitionNumericId={cmsCompetitionNumericId}
        isPending={gradesSync.isPending}
        mutateAsync={gradesSync.mutateAsync}
      />
      <SeasonCompetitionCoverageSummarySection
        statGradeCount={statGradeCount}
        statTeamCount={statTeamCount}
        statFixtureCount={statFixtureCount}
      />
      <SeasonCompetitionTrackedGradesSection
        accountId={accountId}
        competitionId={competitionId}
        seasonOverviewHref={seasonOverviewHref}
        gradesPending={grades.isPending}
        gradesEmpty={gradesEmpty}
        gradesCountFromDetail={gradesCountFromDetail}
        normalizedGrades={normalizedGrades}
        filteredGradeRows={filteredGradeRows}
        gradeSearchQuery={gradeSearchQuery}
        onGradeSearchChange={setGradeSearchQuery}
      />
    </div>
  );
}
