"use client";

import { useParams } from "next/navigation";

import { useSeasonHubFixture } from "@/lib/api/hooks/season-hub";

import {
  SeasonLabFrame,
  SeasonLabPayloadCard,
  SeasonLabStatus,
} from "../../../../../../_components/season-lab-frame";

const ACCOUNT_ID = "575";

export default function DataLabSeasonFixtureCanonicalPage() {
  const params = useParams<{ competitionId: string; gradeId: string; fixtureId: string }>();
  const competitionId = String(params.competitionId ?? "");
  const gradeId = String(params.gradeId ?? "");
  const fixtureId = String(params.fixtureId ?? "");

  const fixture = useSeasonHubFixture(
    { accountId: ACCOUNT_ID, competitionId, gradeId, fixtureId },
    { enabled: Boolean(competitionId && gradeId && fixtureId) },
  );

  return (
    <SeasonLabFrame
      title={`Season — Fixture (canonical) #${fixtureId || "?"}`}
      description="Tests canonical fixture detail endpoint with full drill-down path."
      endpoints={[
        `GET /api/season-hub/575/competitions/${competitionId || ":competitionId"}/grades/${gradeId || ":gradeId"}/fixtures/${fixtureId || ":fixtureId"}`,
      ]}
      onRefetch={() => {
        void fixture.refetch();
      }}
      isFetching={fixture.isFetching}
    >
      <SeasonLabStatus
        isPending={fixture.isPending}
        isError={fixture.isError}
        errorMessage={fixture.error instanceof Error ? fixture.error.message : "Request failed"}
        pendingLabel="Loading fixture detail..."
      />

      {!fixture.isPending && !fixture.isError ? (
        <SeasonLabPayloadCard title="Fixture payload (canonical)" payload={fixture.data ?? null} />
      ) : null}
    </SeasonLabFrame>
  );
}
