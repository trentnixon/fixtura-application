"use client";

import { useParams } from "next/navigation";

import { useSeasonHubFixture } from "@/lib/api/hooks/season-hub";

import {
  SeasonLabFrame,
  SeasonLabPayloadCard,
  SeasonLabStatus,
} from "../../../../_components/season-lab-frame";

const ACCOUNT_ID = "575";

export default function DataLabSeasonFixtureAliasPage() {
  const params = useParams<{ gradeId: string; fixtureId: string }>();
  const gradeId = String(params.gradeId ?? "");
  const fixtureId = String(params.fixtureId ?? "");

  const fixture = useSeasonHubFixture(
    { accountId: ACCOUNT_ID, gradeId, fixtureId },
    { enabled: Boolean(gradeId && fixtureId) },
  );

  return (
    <SeasonLabFrame
      title={`Season — Fixture (alias) #${fixtureId || "?"}`}
      description="Tests the grade-only fixture alias endpoint."
      endpoints={[
        `GET /api/season-hub/575/grades/${gradeId || ":gradeId"}/fixtures/${fixtureId || ":fixtureId"}`,
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
        pendingLabel="Loading fixture alias detail..."
      />

      {!fixture.isPending && !fixture.isError ? (
        <SeasonLabPayloadCard title="Fixture payload (alias)" payload={fixture.data ?? null} />
      ) : null}
    </SeasonLabFrame>
  );
}
