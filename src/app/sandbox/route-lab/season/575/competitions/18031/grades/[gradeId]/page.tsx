"use client";

import { useParams } from "next/navigation";

import { useSeasonHubGrade, useSeasonHubGradeFixtures } from "@/lib/api/hooks/season-hub";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import {
  SeasonRouteLabFrame,
  SeasonRouteLabLinkList,
  SeasonRouteLabPayloadCard,
  SeasonRouteLabRowLink,
  SeasonRouteLabStatus,
} from "../../../../_components/season-route-lab-frame";

const ACCOUNT_ID = "575";
const COMPETITION_ID = "18031";

export default function RouteLabSeasonGradeCanonicalDynamicPage() {
  const params = useParams<{ gradeId: string }>();
  const gradeId = String(params.gradeId ?? "");

  const grade = useSeasonHubGrade(ACCOUNT_ID, gradeId, {
    competitionId: COMPETITION_ID,
    enabled: Boolean(gradeId),
  });
  const fixtures = useSeasonHubGradeFixtures(ACCOUNT_ID, gradeId, {
    competitionId: COMPETITION_ID,
    enabled: Boolean(gradeId),
  });

  const isPending = grade.isPending || fixtures.isPending;
  const isFetching = grade.isFetching || fixtures.isFetching;
  const isError = grade.isError || fixtures.isError;
  const firstError = grade.error ?? fixtures.error;
  const fixtureRows = fixtures.data?.data ?? [];
  /** Same rows as the link list, reversed for route-lab debugging (last API row shown first). */
  const fixturesReversed = [...fixtureRows].reverse();

  return (
    <SeasonRouteLabFrame
      title={`Season - Grade (canonical) #${gradeId || "?"}`}
      description="Canonical grade detail and fixture listing under competition context."
      productionRoute={`${accountScopedRoutes.season(ACCOUNT_ID)}/competitions/${COMPETITION_ID}/grades/${gradeId || ":gradeId"}`}
      endpoints={[
        `GET /api/season-hub/575/competitions/18031/grades/${gradeId || ":gradeId"}`,
        `GET /api/season-hub/575/competitions/18031/grades/${gradeId || ":gradeId"}/fixtures`,
      ]}
      onRefetch={() => {
        void grade.refetch();
        void fixtures.refetch();
      }}
      isFetching={isFetching}
    >
      <SeasonRouteLabStatus
        isPending={isPending}
        isError={isError}
        errorMessage={firstError instanceof Error ? firstError.message : "Request failed"}
        pendingLabel="Loading grade data..."
      />

      {!isPending && !isError ? (
        <div className="space-y-6">
          <SeasonRouteLabPayloadCard title="Grade payload" payload={grade.data?.data ?? null} />
          <SeasonRouteLabLinkList
            title="Fixture links (canonical)"
            emptyLabel="No fixtures returned for this grade."
          >
            {fixtureRows.map((fixture) => (
              <li key={fixture.id}>
                <SeasonRouteLabRowLink
                  href={`/sandbox/route-lab/season/575/competitions/18031/grades/${gradeId}/fixtures/${fixture.id}`}
                  title={`Fixture #${fixture.id}`}
                  subtitle={`${fixture.teams.home ?? "Home"} vs ${fixture.teams.away ?? "Away"}`}
                />
              </li>
            ))}
          </SeasonRouteLabLinkList>
          <SeasonRouteLabPayloadCard
            title={`Fixtures debug (reversed: ${fixturesReversed.length} rows, bottom of list → top)`}
            payload={fixturesReversed}
          />
        </div>
      ) : null}
    </SeasonRouteLabFrame>
  );
}
