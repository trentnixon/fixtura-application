"use client";

import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { SeasonFixtureContentNoteSection } from "@/app/(members)/o/[accountId]/season/_components/_sections/season-fixture-content-note-section";
import { SeasonFixtureContextMetaSection } from "@/app/(members)/o/[accountId]/season/_components/_sections/season-fixture-context-meta-section";
import { SeasonFixtureGradeContextSection } from "@/app/(members)/o/[accountId]/season/_components/_sections/season-fixture-grade-context-section";
import { SeasonFixtureMatchSummarySection } from "@/app/(members)/o/[accountId]/season/_components/_sections/season-fixture-match-summary-section";
import { SeasonFixtureOutputsSection } from "@/app/(members)/o/[accountId]/season/_components/_sections/season-fixture-outputs-section";
import { SeasonFixtureScorecardsSection } from "@/app/(members)/o/[accountId]/season/_components/_sections/season-fixture-scorecards-section";
import { SeasonFixtureTeamsSection } from "@/app/(members)/o/[accountId]/season/_components/_sections/season-fixture-teams-section";
import { buildSeasonFixtureViewModel } from "@/app/(members)/o/[accountId]/season/_components/_utils/season-fixture-view-model";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/ui/container";
import { SectionBlock } from "@/components/ui/section";
import { useSeasonHubFixture, useSeasonHubGradeFixtures } from "@/lib/api/hooks/season-hub";
import { accountScopedRoutes } from "@/lib/config/account-routes";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils";

import {
  SeasonRouteLabFrame,
  SeasonRouteLabPayloadCard,
  SeasonRouteLabStatus,
} from "../../../../../../_components/season-route-lab-frame";

const ACCOUNT_ID = "575";
const COMPETITION_ID = "18031";

const COMPETITION_LAB_PATH = `/sandbox/route-lab/season/${ACCOUNT_ID}/competitions/${COMPETITION_ID}`;

/** Map fixture status copy to badge colors (sports-style lifecycle). */
function fixtureStatusBadgeClass(status: string): string {
  const s = status.trim().toLowerCase();
  if (/\b(cancel|abandon|postpone|void|forfeit|wash)\b/.test(s)) {
    return "bg-error-600";
  }
  if (/\b(complete|completed|final|full\s*time|played|closed)\b/.test(s)) {
    return "bg-error-600";
  }
  if (/\bupcoming\b/.test(s)) {
    return "bg-success-600";
  }
  if (/\b(active|live|in\s*progress|playing)\b/.test(s)) {
    return "bg-success-600";
  }
  if (/\b(scheduled|pending|tbc|drawn)\b/.test(s)) {
    return "bg-warning-600";
  }
  return "bg-muted-foreground";
}

export default function RouteLabSeasonFixtureCanonicalDynamicPage() {
  const params = useParams<{ gradeId: string; fixtureId: string }>();
  const gradeId = String(params.gradeId ?? "");
  const fixtureId = String(params.fixtureId ?? "");

  const fixture = useSeasonHubFixture(
    {
      accountId: ACCOUNT_ID,
      competitionId: COMPETITION_ID,
      gradeId,
      fixtureId,
    },
    { enabled: Boolean(gradeId && fixtureId) },
  );
  const gradeFixtures = useSeasonHubGradeFixtures(ACCOUNT_ID, gradeId, {
    competitionId: COMPETITION_ID,
    enabled: Boolean(gradeId),
  });
  const fixtureRows = gradeFixtures.data?.data ?? [];
  const fixturesReversed = [...fixtureRows].reverse();

  const isFetching = fixture.isFetching || gradeFixtures.isFetching;

  const fixtureModel = useMemo(
    () =>
      buildSeasonFixtureViewModel(fixture.data, {
        gradeId,
        fixtureId,
        competitionId: COMPETITION_ID,
      }),
    [fixture.data, gradeId, fixtureId],
  );

  const gradeLabHref = `${COMPETITION_LAB_PATH}/grades/${gradeId || ":gradeId"}`;
  const frameTitle =
    !fixture.isPending && !fixture.isError
      ? fixtureModel.headline
      : `Season - Fixture (canonical) #${fixtureId || "?"}`;

  return (
    <SeasonRouteLabFrame
      title={frameTitle}
      description="Canonical fixture detail endpoint with full drill-down path."
      productionRoute={`${accountScopedRoutes.season(ACCOUNT_ID)}/competitions/${COMPETITION_ID}/grades/${gradeId || ":gradeId"}/fixtures/${fixtureId || ":fixtureId"}`}
      header={
        <header className="border-border border-b pb-8">
          <div className="space-y-4">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={ROUTES.sandbox}>Sandbox</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={ROUTES.routeLab}>Route lab</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={`/sandbox/route-lab/season/${ACCOUNT_ID}/overview`}>
                      Season overview
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={COMPETITION_LAB_PATH} className="max-w-[min(100%,20rem)] truncate">
                      {fixtureModel.competitionBreadcrumbLabel}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href={gradeLabHref} className="max-w-[min(100%,20rem)] truncate">
                      {gradeId ? fixtureModel.gradeName : "Grade"}
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[min(100%,28rem)] truncate">
                    {fixtureId ? fixtureModel.headline : "Fixture"}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-start gap-3">
                  <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                    {fixtureModel.headline}
                  </h1>
                  {!fixture.isPending &&
                  !fixture.isError &&
                  fixtureModel.status &&
                  fixtureModel.status.trim().length > 0 ? (
                    <Badge
                      className={cn(
                        "shrink-0 border-transparent text-white hover:opacity-90",
                        fixtureStatusBadgeClass(fixtureModel.status),
                      )}
                    >
                      {fixtureModel.status}
                    </Badge>
                  ) : null}
                </div>
                {fixtureModel.headerContextLine ? (
                  <p className="text-muted-foreground max-w-3xl text-sm">
                    {fixtureModel.headerContextLine}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-2 sm:shrink-0 sm:flex-row sm:items-center">
                <Button variant="outline" asChild>
                  <Link href={gradeLabHref}>Back</Link>
                </Button>
                <Button
                  variant="accent"
                  disabled={isFetching}
                  onClick={() => {
                    void fixture.refetch();
                    void gradeFixtures.refetch();
                  }}
                >
                  {isFetching ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <RefreshCw className="size-4" aria-hidden />
                  )}
                  Sync
                </Button>
              </div>
            </div>
          </div>
        </header>
      }
      endpoints={[
        `GET /api/season-hub/575/competitions/18031/grades/${gradeId || ":gradeId"}/fixtures/${fixtureId || ":fixtureId"}`,
        `GET /api/season-hub/575/competitions/18031/grades/${gradeId || ":gradeId"}/fixtures`,
      ]}
      onRefetch={() => {
        void fixture.refetch();
        void gradeFixtures.refetch();
      }}
      isFetching={isFetching}
    >
      <SeasonRouteLabStatus
        isPending={fixture.isPending}
        isError={fixture.isError}
        errorMessage={fixture.error instanceof Error ? fixture.error.message : "Request failed"}
        pendingLabel="Loading fixture detail..."
      />

      {!fixture.isPending && !fixture.isError ? (
        <div className="grid gap-6">
          <SeasonFixtureMatchSummarySection model={fixtureModel} />
          <SeasonFixtureScorecardsSection model={fixtureModel} />
          {fixtureModel.scorecardUrl ? (
            <SectionBlock variant="inset" spacing="sm">
              <Button variant="outline" size="sm" asChild>
                <a
                  href={fixtureModel.scorecardUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <ExternalLink className="size-4" aria-hidden />
                  Scorecard (PlayHQ)
                </a>
              </Button>
              {fixtureModel.gameId ? (
                <p className="text-muted-foreground mt-3 font-mono text-xs">
                  Game ID: {fixtureModel.gameId}
                </p>
              ) : null}
            </SectionBlock>
          ) : null}
          <SeasonFixtureGradeContextSection model={fixtureModel} />
          <SectionBlock variant="inset" spacing="sm">
            <Button variant="outline" asChild className="w-fit">
              <Link href={gradeLabHref}>Back to grade</Link>
            </Button>
          </SectionBlock>
          <SeasonFixtureTeamsSection model={fixtureModel} />
          <SeasonFixtureOutputsSection model={fixtureModel} />
          <SeasonFixtureContextMetaSection model={fixtureModel} />
          <SeasonFixtureContentNoteSection model={fixtureModel} />

          <SeasonRouteLabPayloadCard
            title="Debugging: fixture payload"
            payload={fixture.data ?? null}
          />
          {gradeFixtures.isPending ? (
            <Surface className="shadow-none">
              <p className="text-muted-foreground text-sm">
                Loading grade fixtures for debug (reversed list)...
              </p>
            </Surface>
          ) : null}
          {gradeFixtures.isError ? (
            <Surface className="shadow-none">
              <p className="text-destructive text-sm">
                Grade fixtures debug request failed:{" "}
                {gradeFixtures.error instanceof Error
                  ? gradeFixtures.error.message
                  : "Unknown error"}
              </p>
            </Surface>
          ) : null}
          {!gradeFixtures.isPending && !gradeFixtures.isError ? (
            <SeasonRouteLabPayloadCard
              title={`Grade fixtures debug (reversed: ${fixturesReversed.length} rows, bottom of list → top)`}
              payload={fixturesReversed}
            />
          ) : null}
        </div>
      ) : null}
    </SeasonRouteLabFrame>
  );
}
