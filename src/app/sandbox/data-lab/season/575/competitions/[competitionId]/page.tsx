"use client";

import { useParams } from "next/navigation";

import { Surface } from "@/components/ui/container";
import { useSeasonHubCompetition, useSeasonHubCompetitionGrades } from "@/lib/api/hooks/season-hub";

import {
  SeasonLabFrame,
  SeasonLabLinkList,
  SeasonLabRowLink,
  SeasonLabStatus,
} from "../../_components/season-lab-frame";

const ACCOUNT_ID = "575";

export default function DataLabSeasonCompetitionPage() {
  const params = useParams<{ competitionId: string }>();
  const competitionId = String(params.competitionId ?? "");

  const competition = useSeasonHubCompetition(ACCOUNT_ID, competitionId, {
    enabled: Boolean(competitionId),
  });
  const grades = useSeasonHubCompetitionGrades(ACCOUNT_ID, competitionId, {
    enabled: Boolean(competitionId),
  });

  const isPending = competition.isPending || grades.isPending;
  const isFetching = competition.isFetching || grades.isFetching;
  const isError = competition.isError || grades.isError;
  const firstError = competition.error ?? grades.error;
  const gradeRows = (grades.data?.data ?? []).map((row, index) => {
    const parsed = row as { id?: number | string; name?: string };
    return {
      id: String(parsed.id ?? `unknown-${index}`),
      name: parsed.name ?? "Unnamed grade",
    };
  });

  return (
    <SeasonLabFrame
      title={`Season — Competition (canonical) #${competitionId || "?"}`}
      description="Tests canonical competition detail + competition grades endpoints."
      endpoints={[
        `GET /api/season-hub/575/competitions/${competitionId || ":competitionId"}`,
        `GET /api/season-hub/575/competitions/${competitionId || ":competitionId"}/grades`,
      ]}
      onRefetch={() => {
        void competition.refetch();
        void grades.refetch();
      }}
      isFetching={isFetching}
    >
      <SeasonLabStatus
        isPending={isPending}
        isError={isError}
        errorMessage={firstError instanceof Error ? firstError.message : "Request failed"}
        pendingLabel="Loading competition data..."
      />

      {!isPending && !isError ? (
        <div className="space-y-6">
          <SeasonLabLinkList
            title="Grade links"
            emptyLabel="No grades returned for this competition."
          >
            {gradeRows.map((grade) => (
              <li key={grade.id}>
                <SeasonLabRowLink
                  href={`/sandbox/data-lab/season/575/competitions/${competitionId}/grades/${grade.id}`}
                  title={grade.name}
                  subtitle={`Grade #${grade.id}`}
                />
              </li>
            ))}
          </SeasonLabLinkList>

          <Surface className="overflow-hidden p-0">
            <div className="bg-muted border-b px-6 py-4">
              <p className="text-sm font-semibold">Competition payload</p>
            </div>
            <div className="p-6">
              <pre className="text-foreground text-xs leading-relaxed wrap-break-word whitespace-pre-wrap">
                {JSON.stringify(competition.data?.data ?? null, null, 2)}
              </pre>
            </div>
          </Surface>
        </div>
      ) : null}
    </SeasonLabFrame>
  );
}
