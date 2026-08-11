"use client";

import { useSeasonHubFixture } from "@/lib/api/hooks/season-hub";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import {
  SeasonRouteLabFrame,
  SeasonRouteLabPayloadCard,
  SeasonRouteLabStatus,
} from "../../../../../../_components/season-route-lab-frame";

const ACCOUNT_ID = "575";
const COMPETITION_ID = "18031";
const GRADE_ID = "71337";
const FIXTURE_ID = "3571729";

export default function RouteLabSeasonFixtureCanonicalPage() {
  const fixture = useSeasonHubFixture(
    {
      accountId: ACCOUNT_ID,
      competitionId: COMPETITION_ID,
      gradeId: GRADE_ID,
      fixtureId: FIXTURE_ID,
    },
    { enabled: true },
  );

  return (
    <SeasonRouteLabFrame
      title="Season - Fixture (canonical) #3571729"
      description="Canonical fixture detail endpoint with full drill-down path."
      productionRoute={`${accountScopedRoutes.season(ACCOUNT_ID)}/competitions/${COMPETITION_ID}/grades/${GRADE_ID}/fixtures/${FIXTURE_ID}`}
      endpoints={["GET /api/season-hub/575/competitions/18031/grades/71337/fixtures/3571729"]}
      onRefetch={() => {
        void fixture.refetch();
      }}
      isFetching={fixture.isFetching}
    >
      <SeasonRouteLabStatus
        isPending={fixture.isPending}
        isError={fixture.isError}
        errorMessage={fixture.error instanceof Error ? fixture.error.message : "Request failed"}
        pendingLabel="Loading fixture detail..."
      />

      {!fixture.isPending && !fixture.isError ? (
        <SeasonRouteLabPayloadCard
          title="Fixture payload (canonical)"
          payload={fixture.data ?? null}
        />
      ) : null}
    </SeasonRouteLabFrame>
  );
}
