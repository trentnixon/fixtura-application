"use client";

import { Surface } from "@/components/ui/container";
import {
  useSeasonHubCompetitions,
  useSeasonHubRecon,
  useSeasonHubStats,
} from "@/lib/api/hooks/season-hub";

import {
  SeasonRouteLabFrame,
  SeasonRouteLabRowLink,
  SeasonRouteLabStatus,
} from "../_components/season-route-lab-frame";

const ACCOUNT_ID = "575";

export default function RouteLabSeasonOverviewPage() {
  const recon = useSeasonHubRecon(ACCOUNT_ID);
  const stats = useSeasonHubStats(ACCOUNT_ID);
  const competitions = useSeasonHubCompetitions(ACCOUNT_ID, { page: 1, pageSize: 25 });

  const isPending = recon.isPending || stats.isPending || competitions.isPending;
  const isFetching = recon.isFetching || stats.isFetching || competitions.isFetching;
  const isError = recon.isError || stats.isError || competitions.isError;
  const firstError = recon.error ?? stats.error ?? competitions.error;
  const statsData = stats.data?.data;
  const competitionRows = competitions.data?.data ?? [];

  return (
    <SeasonRouteLabFrame
      title="Season - Overview"
      endpoints={[
        "GET /api/season-hub/575/recon",
        "GET /api/season-hub/575/stats",
        "GET /api/season-hub/575/competitions?page=1&pageSize=25",
      ]}
      onRefetch={() => {
        void recon.refetch();
        void stats.refetch();
        void competitions.refetch();
      }}
      isFetching={isFetching}
    >
      <SeasonRouteLabStatus
        isPending={isPending}
        isError={isError}
        errorMessage={firstError instanceof Error ? firstError.message : "Request failed"}
        pendingLabel="Loading season overview..."
      />

      {!isPending && !isError ? (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
              <span className="text-2xl leading-none font-bold tabular-nums">
                {recon.data?.data.counts.competitions ?? 0}
              </span>
              <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                Competitions
              </span>
            </Surface>

            <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
              <span className="text-2xl leading-none font-bold tabular-nums">
                {recon.data?.data.counts.grades ?? 0}
              </span>
              <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                Grades
              </span>
            </Surface>

            <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
              <span className="text-2xl leading-none font-bold tabular-nums">
                {statsData?.summary.teams ?? 0}
              </span>
              <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                Teams
              </span>
            </Surface>

            <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
              <span className="text-2xl leading-none font-bold tabular-nums">
                {statsData?.summary.fixtures ?? 0}
              </span>
              <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                Fixtures
              </span>
            </Surface>
          </div>

          <Surface className="overflow-hidden p-0">
            <div className="bg-muted border-b px-6 py-4">
              <p className="text-sm font-semibold">Competitions</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Open competition details and compare season labels, coverage, and status.
              </p>
            </div>
            {competitionRows.length === 0 ? (
              <div className="p-6">
                <p className="text-muted-foreground text-sm">
                  No competitions returned for account 575.
                </p>
              </div>
            ) : (
              <ul>
                {competitionRows.map((competition) => (
                  <li key={competition.id}>
                    <SeasonRouteLabRowLink
                      href="/sandbox/route-lab/season/575/competitions/18031"
                      title={competition.name}
                      subtitle={`${competition.season ?? "No season"} · ${competition.association.name ?? "Association"} · ${competition.counts.grades} grades · ${competition.counts.teams} teams · ${competition.counts.fixtures} fixtures · ${competition.status ?? "Unknown status"}`}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Surface>
        </div>
      ) : null}
    </SeasonRouteLabFrame>
  );
}
