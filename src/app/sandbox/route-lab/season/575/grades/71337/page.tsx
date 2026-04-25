"use client";

import { useSeasonHubGrade, useSeasonHubGradeFixtures } from "@/lib/api/hooks/season-hub";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import {
  SeasonRouteLabFrame,
  SeasonRouteLabLinkList,
  SeasonRouteLabPayloadCard,
  SeasonRouteLabRowLink,
  SeasonRouteLabStatus,
} from "../../_components/season-route-lab-frame";

const ACCOUNT_ID = "575";
const GRADE_ID = "71337";

export default function RouteLabSeasonGradeAliasPage() {
  const grade = useSeasonHubGrade(ACCOUNT_ID, GRADE_ID, { enabled: true });
  const fixtures = useSeasonHubGradeFixtures(ACCOUNT_ID, GRADE_ID, { enabled: true });

  const isPending = grade.isPending || fixtures.isPending;
  const isFetching = grade.isFetching || fixtures.isFetching;
  const isError = grade.isError || fixtures.isError;
  const firstError = grade.error ?? fixtures.error;

  return (
    <SeasonRouteLabFrame
      title="Season - Grade (alias) #71337"
      description="Grade alias path that omits competition context."
      productionRoute={`${accountScopedRoutes.season(ACCOUNT_ID)}/grades/${GRADE_ID}`}
      endpoints={[
        "GET /api/season-hub/575/grades/71337",
        "GET /api/season-hub/575/grades/71337/fixtures",
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
        pendingLabel="Loading grade alias data..."
      />

      {!isPending && !isError ? (
        <div className="space-y-6">
          <SeasonRouteLabPayloadCard
            title="Grade payload (alias path)"
            payload={grade.data?.data ?? null}
          />
          <SeasonRouteLabLinkList
            title="Fixture links (alias)"
            emptyLabel="No fixtures returned for this grade."
          >
            {(fixtures.data?.data ?? []).map((fixture) => (
              <li key={fixture.id}>
                <SeasonRouteLabRowLink
                  href={`/sandbox/route-lab/season/575/grades/71337/fixtures/${fixture.id}`}
                  title={`Fixture #${fixture.id}`}
                  subtitle={`${fixture.teams.home ?? "Home"} vs ${fixture.teams.away ?? "Away"}`}
                />
              </li>
            ))}
          </SeasonRouteLabLinkList>
        </div>
      ) : null}
    </SeasonRouteLabFrame>
  );
}
