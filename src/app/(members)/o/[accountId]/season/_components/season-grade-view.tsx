"use client";

import Link from "next/link";

import { ErrorState } from "@/components/ui/error-state";
import { useSeasonHubGrade, useSeasonHubGradeFixtures } from "@/lib/api/hooks/season-hub";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import { SEASON_LOADING_COPY } from "./_constants";
import { useSeasonGradeViewState } from "./_hooks";
import { SeasonEmptyPanel } from "./season-empty-panel";

import type { SeasonGradeViewProps } from "./_types";

export function SeasonGradeView({ accountId, competitionId, gradeId }: SeasonGradeViewProps) {
  const grade = useSeasonHubGrade(accountId, gradeId, { competitionId });
  const fixtures = useSeasonHubGradeFixtures(accountId, gradeId, {
    competitionId,
    enabled: grade.isSuccess,
  });

  const g = grade.data?.data;
  const rows = fixtures.data?.data ?? [];
  const { title, fixturesCountFromGrade, fixturesEmpty } = useSeasonGradeViewState({
    grade: g,
    gradeId,
    fixturesRows: rows,
    fixturesPending: fixtures.isPending,
  });

  const err = grade.error ?? fixtures.error;
  if ((grade.isError || fixtures.isError) && err) {
    return (
      <ErrorState
        title="Could not load grade"
        description={err instanceof Error ? err.message : "Something went wrong."}
        onRetry={() => void grade.refetch()}
      />
    );
  }

  if (grade.isPending) {
    return <p className="text-muted-foreground text-sm">{SEASON_LOADING_COPY.grade}</p>;
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-brand text-2xl font-semibold">{title}</h1>
        {fixtures.isPending ? (
          <p className="text-muted-foreground mt-2 text-sm">{SEASON_LOADING_COPY.fixtures}</p>
        ) : null}
      </div>

      <div>
        <h2 className="font-brand text-lg font-semibold">Fixtures</h2>
        {fixturesEmpty ? (
          <div className="mt-3">
            <SeasonEmptyPanel
              title="No fixtures for this grade"
              description={
                fixturesCountFromGrade === 0
                  ? "This grade has no fixtures in season hub yet. When the draw is published, matches will show here."
                  : "We could not load fixtures for this grade. Try refreshing, or go back to the competition if the problem continues."
              }
              action={{
                label: "Back to competition",
                href: `${accountScopedRoutes.season(accountId)}/competitions/${competitionId}`,
              }}
            />
          </div>
        ) : (
          <ul className="mt-3 divide-y rounded-lg border">
            {rows.map((f) => {
              const href = `${accountScopedRoutes.season(accountId)}/competitions/${competitionId}/grades/${gradeId}/fixtures/${f.id}`;
              const when = f.date ? new Date(f.date).toLocaleString() : "TBC";
              return (
                <li key={f.id}>
                  <Link
                    href={href}
                    className="hover:bg-accent/40 block px-4 py-3 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">
                        {f.teams.home ?? "Home"} vs {f.teams.away ?? "Away"}
                      </span>
                      <span className="text-muted-foreground text-sm">{f.status ?? "—"}</span>
                    </div>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {when}
                      {f.round ? ` · ${f.round}` : ""}
                      {f.venue.ground ? ` · ${f.venue.ground}` : ""}
                    </p>
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
