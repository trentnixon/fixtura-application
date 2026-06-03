"use client";

import { Calendar, Clock, Flag, Hash, MapPin, Shield, Trophy, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Surface } from "@/components/ui/container";
import { SectionBlock, SectionDivider } from "@/components/ui/section";
import { cn } from "@/lib/utils";

import { fixtureStatusBadgeClass } from "../_utils";

import type { SeasonFixtureMatchSummarySectionProps } from "../_types";

function displayValue(value: string | undefined): string {
  return value && value.trim().length > 0 && value !== "â€”" ? value : "-";
}

function scoreValue(value: string | undefined): string {
  return value && value.trim().length > 0 ? value : "-";
}

function TeamLogo({ name, logoUrl }: { name: string; logoUrl?: string | null | undefined }) {
  if (!logoUrl?.trim()) {
    return (
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-xs font-bold text-white"
        aria-hidden
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={logoUrl}
      alt=""
      className="size-10 shrink-0 rounded-full border border-white/20 object-cover"
    />
  );
}

export function SeasonFixtureMatchSummarySection({ model }: SeasonFixtureMatchSummarySectionProps) {
  const timeTypeLabel = [model.timeLabel, model.type].filter(Boolean).join(" - ");
  const compactDetails: Array<[string, string, LucideIcon]> = [
    ["Round", displayValue(model.round), Hash],
    ["Date", displayValue(model.dateLabel), Calendar],
    ["Time / Type", displayValue(timeTypeLabel), Clock],
  ];
  if (model.tossLine?.trim()) {
    compactDetails.push(["Toss", model.tossLine.trim(), Flag]);
  }

  return (
    <>
      <SectionDivider variant="labeled" label="Match summary" />
      <SectionBlock variant="inset" spacing="sm">
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="bg-primary-950 border-b border-white/15 px-4 py-4 text-white sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Trophy className="size-4 text-white/80" aria-hidden />
                  <p className="truncate text-sm font-semibold text-white">
                    {model.competitionName}
                  </p>
                </div>
                <p className="mt-1 text-xs text-white/75">{model.gradeName}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {model.status && model.status.trim().length > 0 ? (
                  <Badge
                    className={cn(
                      "w-fit border-transparent text-white hover:opacity-90",
                      fixtureStatusBadgeClass(model.status),
                    )}
                  >
                    {model.status}
                  </Badge>
                ) : (
                  <span className="text-xs text-white/70">No status</span>
                )}
                {model.isFinished ? (
                  <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                    Finished
                  </Badge>
                ) : null}
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="bg-primary-950 grid text-white lg:grid-cols-[1fr_auto_1fr]">
              <div className="flex min-h-36 flex-col justify-between gap-4 border-t border-white/10 px-5 py-5 lg:border-t-0 lg:border-r">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-white/65 uppercase">
                  <Shield className="size-4" aria-hidden />
                  Home
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <TeamLogo name={model.homeTeam} logoUrl={model.homeLogoUrl} />
                    <p className="text-xl leading-tight font-bold text-pretty sm:text-2xl">
                      {model.homeTeam}
                    </p>
                  </div>
                  <p className="font-mono text-3xl leading-none font-bold tabular-nums sm:text-4xl">
                    {scoreValue(model.homeScoreLine)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-center border-t border-white/10 px-6 py-3 lg:border-t-0">
                <div className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold tracking-wider text-white/70 uppercase">
                  vs
                </div>
              </div>
              <div className="flex min-h-36 flex-col justify-between gap-4 border-t border-white/10 px-5 py-5 lg:border-t-0 lg:border-l">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-white/65 uppercase">
                  <Shield className="size-4" aria-hidden />
                  Away
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <TeamLogo name={model.awayTeam} logoUrl={model.awayLogoUrl} />
                    <p className="text-xl leading-tight font-bold text-pretty sm:text-2xl">
                      {model.awayTeam}
                    </p>
                  </div>
                  <p className="font-mono text-3xl leading-none font-bold tabular-nums sm:text-4xl">
                    {scoreValue(model.awayScoreLine)}
                  </p>
                </div>
              </div>
            </div>
            {model.resultStatement ? (
              <Surface className="mx-4 mb-0 rounded-lg border-0 bg-white/10 p-4 text-white ring-1 ring-white/15 sm:mx-5">
                <p className="text-xs font-medium tracking-wide text-white/70 uppercase">Result</p>
                <p className="mt-1 text-sm font-semibold break-words">{model.resultStatement}</p>
              </Surface>
            ) : null}
            <div className="p-4 sm:p-5">
              <dl className="grid grid-cols-1 gap-3">
                <Surface className="bg-background/80 ring-border rounded-lg p-4 shadow-none ring-1">
                  <div className="grid gap-3">
                    {compactDetails.map(([label, value, Icon]) => (
                      <div
                        key={label}
                        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                      >
                        <dt className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
                          <span className="bg-primary/10 text-primary rounded-md p-1.5">
                            <Icon className="size-3.5" aria-hidden />
                          </span>
                          {label}
                        </dt>
                        <dd className="text-sm font-semibold break-words sm:text-right">{value}</dd>
                      </div>
                    ))}
                  </div>
                </Surface>
                <Surface className="bg-background/80 ring-border flex items-start gap-3 rounded-lg p-4 shadow-none ring-1">
                  <span className="bg-primary/10 text-primary mt-0.5 rounded-md p-2">
                    <MapPin className="size-4" aria-hidden />
                  </span>
                  <div className="min-w-0 space-y-1">
                    <dt className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Venue
                    </dt>
                    <dd className="text-sm font-semibold break-words">
                      {displayValue(model.venueGround)}
                    </dd>
                  </div>
                </Surface>
              </dl>
            </div>
          </CardContent>
        </Card>
      </SectionBlock>
    </>
  );
}
