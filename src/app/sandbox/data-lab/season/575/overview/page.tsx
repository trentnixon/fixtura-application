"use client";

import { Calendar, Layers, Shield, Trophy } from "lucide-react";

import { TypographyMuted } from "@/components/typography";
import { Surface } from "@/components/ui/container";
import {
  useSeasonHubCompetitions,
  useSeasonHubRecon,
  useSeasonHubStats,
} from "@/lib/api/hooks/season-hub";

import { SeasonLabFrame, SeasonLabRowLink, SeasonLabStatus } from "../_components/season-lab-frame";

const ACCOUNT_ID = "575";

export default function DataLabSeasonOverviewPage() {
  const recon = useSeasonHubRecon(ACCOUNT_ID);
  const stats = useSeasonHubStats(ACCOUNT_ID);
  const competitions = useSeasonHubCompetitions(ACCOUNT_ID, { page: 1, pageSize: 25 });

  const isPending = recon.isPending || stats.isPending || competitions.isPending;
  const isFetching = recon.isFetching || stats.isFetching || competitions.isFetching;
  const isError = recon.isError || stats.isError || competitions.isError;
  const firstError = recon.error ?? stats.error ?? competitions.error;

  return (
    <SeasonLabFrame
      title="Season — Overview (account 575)"
      description="Exercises the recommended first load for season-hub: recon, stats, and competitions list."
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
      <SeasonLabStatus
        isPending={isPending}
        isError={isError}
        errorMessage={firstError instanceof Error ? firstError.message : "Request failed"}
        pendingLabel="Loading season overview..."
      />

      {!isPending && !isError ? (
        <div className="grid gap-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Surface className="flex flex-col gap-2">
              <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                <Trophy className="size-4" />
              </div>
              <p className="text-2xl font-bold">{recon.data?.data.counts.competitions ?? 0}</p>
              <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
                Competitions
              </TypographyMuted>
            </Surface>
            <Surface className="flex flex-col gap-2">
              <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                <Layers className="size-4" />
              </div>
              <p className="text-2xl font-bold">{recon.data?.data.counts.grades ?? 0}</p>
              <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
                Grades
              </TypographyMuted>
            </Surface>
            <Surface className="flex flex-col gap-2">
              <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                <Shield className="size-4" />
              </div>
              <p className="text-2xl font-bold">{stats.data?.data.summary.teams ?? 0}</p>
              <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
                Teams
              </TypographyMuted>
            </Surface>
            <Surface className="flex flex-col gap-2">
              <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
                <Calendar className="size-4" />
              </div>
              <p className="text-2xl font-bold">{stats.data?.data.summary.fixtures ?? 0}</p>
              <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
                Fixtures
              </TypographyMuted>
            </Surface>
          </div>

          <Surface className="overflow-hidden p-0">
            <div className="bg-muted border-b px-6 py-4">
              <p className="text-sm font-semibold">Competition links</p>
            </div>
            {(competitions.data?.data ?? []).length === 0 ? (
              <div className="p-6">
                <TypographyMuted className="text-sm">
                  No competitions returned for account 575.
                </TypographyMuted>
              </div>
            ) : (
              <ul>
                {(competitions.data?.data ?? []).map((competition) => (
                  <li key={competition.id}>
                    <SeasonLabRowLink
                      href={`/sandbox/data-lab/season/575/competitions/${competition.id}`}
                      title={competition.name}
                      subtitle={competition.season ?? "No season label"}
                    />
                  </li>
                ))}
              </ul>
            )}
          </Surface>
        </div>
      ) : null}
    </SeasonLabFrame>
  );
}
