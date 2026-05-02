"use client";

import { useParams } from "next/navigation";

import { useSeasonHubGrade, useSeasonHubGradeFixtures } from "@/lib/api/hooks/season-hub";

import {
  SeasonLabFrame,
  SeasonLabLinkList,
  SeasonLabPayloadCard,
  SeasonLabRowLink,
  SeasonLabStatus,
} from "../../_components/season-lab-frame";

const ACCOUNT_ID = "575";

export default function DataLabSeasonGradeAliasPage() {
  const params = useParams<{ gradeId: string }>();
  const gradeId = String(params.gradeId ?? "");

  const grade = useSeasonHubGrade(ACCOUNT_ID, gradeId, { enabled: Boolean(gradeId) });
  const fixtures = useSeasonHubGradeFixtures(ACCOUNT_ID, gradeId, { enabled: Boolean(gradeId) });

  const isPending = grade.isPending || fixtures.isPending;
  const isFetching = grade.isFetching || fixtures.isFetching;
  const isError = grade.isError || fixtures.isError;
  const firstError = grade.error ?? fixtures.error;

  return (
    <SeasonLabFrame
      title={`Season — Grade (alias) #${gradeId || "?"}`}
      description="Tests the alias grade routes that omit competitionId."
      endpoints={[
        `GET /api/season-hub/575/grades/${gradeId || ":gradeId"}`,
        `GET /api/season-hub/575/grades/${gradeId || ":gradeId"}/fixtures`,
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
        pendingLabel="Loading grade alias data..."
      />

      {!isPending && !isError ? (
        <div className="space-y-6">
          <SeasonLabPayloadCard
            title="Grade payload (alias path)"
            payload={grade.data?.data ?? null}
          />

          <SeasonLabLinkList
            title="Fixture links (alias)"
            emptyLabel="No fixtures returned for this alias grade path."
          >
            {(fixtures.data?.data ?? []).map((fixture) => (
              <li key={fixture.id}>
                <SeasonLabRowLink
                  href={`/sandbox/data-lab/season/575/grades/${gradeId}/fixtures/${fixture.id}`}
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
