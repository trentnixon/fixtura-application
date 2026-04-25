"use client";

import { useParams } from "next/navigation";

import { useSeasonHubGrade, useSeasonHubGradeFixtures } from "@/lib/api/hooks/season-hub";

import {
  SeasonLabFrame,
  SeasonLabLinkList,
  SeasonLabPayloadCard,
  SeasonLabRowLink,
  SeasonLabStatus,
} from "../../../../_components/season-lab-frame";

const ACCOUNT_ID = "575";

export default function DataLabSeasonGradeCanonicalPage() {
  const params = useParams<{ competitionId: string; gradeId: string }>();
  const competitionId = String(params.competitionId ?? "");
  const gradeId = String(params.gradeId ?? "");

  const grade = useSeasonHubGrade(ACCOUNT_ID, gradeId, {
    competitionId,
    enabled: Boolean(competitionId && gradeId),
  });
  const fixtures = useSeasonHubGradeFixtures(ACCOUNT_ID, gradeId, {
    competitionId,
    enabled: Boolean(competitionId && gradeId),
  });

  const isPending = grade.isPending || fixtures.isPending;
  const isFetching = grade.isFetching || fixtures.isFetching;
  const isError = grade.isError || fixtures.isError;
  const firstError = grade.error ?? fixtures.error;

  return (
    <SeasonLabFrame
      title={`Season — Grade (canonical) #${gradeId || "?"}`}
      description="Tests canonical grade detail and fixture listing under competition context."
      endpoints={[
        `GET /api/season-hub/575/competitions/${competitionId || ":competitionId"}/grades/${gradeId || ":gradeId"}`,
        `GET /api/season-hub/575/competitions/${competitionId || ":competitionId"}/grades/${gradeId || ":gradeId"}/fixtures`,
      ]}
      onRefetch={() => {
        void grade.refetch();
        void fixtures.refetch();
      }}
      isFetching={isFetching}
    >
      <SeasonLabStatus
        isPending={isPending}
        isError={isError}
        errorMessage={firstError instanceof Error ? firstError.message : "Request failed"}
        pendingLabel="Loading grade data..."
      />

      {!isPending && !isError ? (
        <div className="space-y-6">
          <SeasonLabPayloadCard title="Grade payload" payload={grade.data?.data ?? null} />

          <SeasonLabLinkList
            title="Fixture links (canonical)"
            emptyLabel="No fixtures returned for this grade."
          >
            {(fixtures.data?.data ?? []).map((fixture) => (
              <li key={fixture.id}>
                <SeasonLabRowLink
                  href={`/sandbox/data-lab/season/575/competitions/${competitionId}/grades/${gradeId}/fixtures/${fixture.id}`}
                  title={`Fixture #${fixture.id}`}
                  subtitle={`${fixture.teams.home ?? "Home"} vs ${fixture.teams.away ?? "Away"}`}
                />
              </li>
            ))}
          </SeasonLabLinkList>
        </div>
      ) : null}
    </SeasonLabFrame>
  );
}
