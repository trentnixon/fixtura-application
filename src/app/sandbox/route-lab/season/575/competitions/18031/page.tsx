"use client";

import { Surface } from "@/components/ui/container";
import { useSeasonHubCompetition, useSeasonHubCompetitionGrades } from "@/lib/api/hooks/season-hub";

import {
  SeasonRouteLabFrame,
  SeasonRouteLabPayloadCard,
  SeasonRouteLabRowLink,
  SeasonRouteLabStatus,
} from "../../_components/season-route-lab-frame";

const ACCOUNT_ID = "575";
const COMPETITION_ID = "18031";

export default function RouteLabSeasonCompetitionPage() {
  const competition = useSeasonHubCompetition(ACCOUNT_ID, COMPETITION_ID, { enabled: true });
  const grades = useSeasonHubCompetitionGrades(ACCOUNT_ID, COMPETITION_ID, { enabled: true });

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
  const competitionData = competition.data?.data;
  const associationName = competitionData?.association?.name ?? "Association";
  const seasonLabel = competitionData?.season ?? "No season label";
  const competitionStatus = competitionData?.status ?? "Unknown status";
  const gradeCount = competitionData?.counts?.grades ?? gradeRows.length;
  const teamCount = competitionData?.counts?.teams ?? 0;
  const fixtureCount = competitionData?.counts?.fixtures ?? 0;

  return (
    <SeasonRouteLabFrame
      title="Season - Competition"
      endpoints={[
        "GET /api/season-hub/575/competitions/18031",
        "GET /api/season-hub/575/competitions/18031/grades",
      ]}
      onRefetch={() => {
        void competition.refetch();
        void grades.refetch();
      }}
      isFetching={isFetching}
    >
      <SeasonRouteLabStatus
        isPending={isPending}
        isError={isError}
        errorMessage={firstError instanceof Error ? firstError.message : "Request failed"}
        pendingLabel="Loading competition data..."
      />

      {!isPending && !isError ? (
        <div className="space-y-6">
          <Surface className="space-y-1 shadow-none">
            <p className="text-xl font-semibold tracking-tight">
              {competitionData?.name ?? "Competition"}
            </p>
            <p className="text-muted-foreground text-sm">
              {seasonLabel} · {associationName} · {competitionStatus}
            </p>
          </Surface>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
              <span className="text-2xl leading-none font-bold tabular-nums">{gradeCount}</span>
              <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                Grades
              </span>
            </Surface>

            <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
              <span className="text-2xl leading-none font-bold tabular-nums">{teamCount}</span>
              <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                Teams
              </span>
            </Surface>

            <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
              <span className="text-2xl leading-none font-bold tabular-nums">{fixtureCount}</span>
              <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                Fixtures
              </span>
            </Surface>
          </div>

          <Surface className="overflow-hidden p-0 shadow-none">
            <div className="bg-muted border-b px-6 py-4">
              <p className="text-sm font-semibold">Grade links</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Open a grade in this competition to continue the season route.
              </p>
            </div>
            {gradeRows.length === 0 ? (
              <div className="px-6 py-4">
                <p className="text-muted-foreground text-sm">
                  No grades returned for this competition.
                </p>
              </div>
            ) : (
              <ul>
                {gradeRows.map((grade) => (
                  <li key={grade.id}>
                    <SeasonRouteLabRowLink
                      href={`/sandbox/route-lab/season/575/competitions/18031/grades/${grade.id}`}
                      title={grade.name}
                      subtitle={`Grade #${grade.id}`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Surface>

          <SeasonRouteLabPayloadCard
            title="Debugging: competition payload"
            payload={competitionData ?? null}
          />
        </div>
      ) : null}
    </SeasonRouteLabFrame>
  );
}
