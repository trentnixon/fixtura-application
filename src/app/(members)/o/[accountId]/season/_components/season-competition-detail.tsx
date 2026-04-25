"use client";

import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { useSeasonHubCompetition, useSeasonHubCompetitionGrades } from "@/lib/api/hooks/season-hub";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { SEASON_LOADING_COPY } from "./_constants";
import { useSeasonCompetitionDetailState } from "./_hooks";
import { pickId, pickString } from "./_utils";
import { SeasonEmptyPanel } from "./season-empty-panel";

import type { SeasonCompetitionDetailProps } from "./_types";

export function SeasonCompetitionDetail({
  accountId,
  competitionId,
}: SeasonCompetitionDetailProps) {
  const competition = useSeasonHubCompetition(accountId, competitionId);
  const grades = useSeasonHubCompetitionGrades(accountId, competitionId, {
    enabled: competition.isSuccess,
  });
  const { title, gradeRows, gradesCountFromDetail, gradesEmpty } = useSeasonCompetitionDetailState({
    competitionRaw: competition.data?.data,
    competitionId,
    gradesData: grades.data?.data,
    gradesPending: grades.isPending,
  });

  const err = competition.error ?? grades.error;
  if ((competition.isError || grades.isError) && err) {
    return (
      <ErrorState
        title="Could not load competition"
        description={err instanceof Error ? err.message : "Something went wrong."}
        onRetry={() => void competition.refetch()}
      />
    );
  }

  if (competition.isPending) {
    return <p className="text-muted-foreground text-sm">{SEASON_LOADING_COPY.competition}</p>;
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-brand text-2xl font-semibold">{title}</h1>
        {grades.isPending ? (
          <p className="text-muted-foreground mt-2 text-sm">{SEASON_LOADING_COPY.grades}</p>
        ) : null}
      </div>

      <div>
        <h2 className="font-brand text-lg font-semibold">Grades</h2>
        {gradesEmpty ? (
          <div className="mt-3">
            <SeasonEmptyPanel
              title="No grades for this competition"
              description={
                gradesCountFromDetail === 0
                  ? "This competition has no grades in season hub yet. When grades are published for this draw, they will appear here."
                  : "We could not load any grades for this competition. If you expected a list, try again in a moment or return to season overview."
              }
              action={{
                label: "Back to season overview",
                href: accountScopedRoutes.season(accountId),
              }}
            />
          </div>
        ) : (
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {gradeRows.map((row, idx) => {
              const gradeId = pickId(row);
              const name =
                pickString(row, ["name", "title", "label"]) ??
                (gradeId ? `Grade ${gradeId}` : `Grade ${idx + 1}`);
              if (!gradeId) {
                return (
                  <li key={idx}>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{name}</CardTitle>
                      </CardHeader>
                    </Card>
                  </li>
                );
              }
              return (
                <li key={gradeId}>
                  <Link
                    href={`${accountScopedRoutes.season(accountId)}/competitions/${competitionId}/grades/${gradeId}`}
                    className="block"
                  >
                    <Card className="hover:bg-accent/50 h-full transition-colors">
                      <CardHeader className="pb-2">
                        <CardDescription>Grade</CardDescription>
                        <CardTitle className="text-base">{name}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-muted-foreground text-xs">
                        View fixtures
                      </CardContent>
                    </Card>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
