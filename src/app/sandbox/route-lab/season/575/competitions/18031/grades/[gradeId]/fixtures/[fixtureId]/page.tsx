"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { TypographyMuted } from "@/components/typography";
import { useSeasonHubFixture, useSeasonHubGradeFixtures } from "@/lib/api/hooks/season-hub";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import {
  SeasonRouteLabFrame,
  SeasonRouteLabPayloadCard,
  SeasonRouteLabStatus,
} from "../../../../../../_components/season-route-lab-frame";

const ACCOUNT_ID = "575";
const COMPETITION_ID = "18031";

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

  useEffect(() => {
    if (!gradeFixtures.isSuccess || !gradeFixtures.data) return;
    const rows = gradeFixtures.data.data ?? [];
    console.info("[route-lab] grade fixtures reversed (debug)", [...rows].reverse());
  }, [gradeFixtures.isSuccess, gradeFixtures.dataUpdatedAt, gradeFixtures.data]);

  return (
    <SeasonRouteLabFrame
      title={`Season - Fixture (canonical) #${fixtureId || "?"}`}
      description="Canonical fixture detail endpoint with full drill-down path."
      productionRoute={`${accountScopedRoutes.season(ACCOUNT_ID)}/competitions/${COMPETITION_ID}/grades/${gradeId || ":gradeId"}/fixtures/${fixtureId || ":fixtureId"}`}
      endpoints={[
        `GET /api/season-hub/575/competitions/18031/grades/${gradeId || ":gradeId"}/fixtures/${fixtureId || ":fixtureId"}`,
        `GET /api/season-hub/575/competitions/18031/grades/${gradeId || ":gradeId"}/fixtures`,
      ]}
      onRefetch={() => {
        void fixture.refetch();
        void gradeFixtures.refetch();
      }}
      isFetching={fixture.isFetching || gradeFixtures.isFetching}
    >
      <SeasonRouteLabStatus
        isPending={fixture.isPending}
        isError={fixture.isError}
        errorMessage={fixture.error instanceof Error ? fixture.error.message : "Request failed"}
        pendingLabel="Loading fixture detail..."
      />

      {!fixture.isPending && !fixture.isError ? (
        <div className="space-y-6">
          <SeasonRouteLabPayloadCard
            title="Fixture payload (canonical)"
            payload={fixture.data ?? null}
          />
          {gradeFixtures.isPending ? (
            <div className="bg-card rounded-lg border px-4 py-3">
              <TypographyMuted className="text-sm">
                Loading grade fixtures for debug (reversed list)…
              </TypographyMuted>
            </div>
          ) : null}
          {gradeFixtures.isError ? (
            <div className="bg-card rounded-lg border px-4 py-3">
              <TypographyMuted className="text-destructive text-sm">
                Grade fixtures debug request failed:{" "}
                {gradeFixtures.error instanceof Error
                  ? gradeFixtures.error.message
                  : "Unknown error"}
              </TypographyMuted>
            </div>
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
