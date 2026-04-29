"use client";

import { Calendar, Clock, ExternalLink, Hash, MapPin, Trophy, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card";
import { Surface } from "@/components/ui/container";
import { SectionBlock, SectionDivider } from "@/components/ui/section";
import { cn } from "@/lib/utils";

import { fixtureStatusBadgeClass } from "../_utils";

import type { SeasonFixtureMatchSummarySectionProps } from "../_types";
import type { ReactNode } from "react";

function tileSurface(value: ReactNode, label: string, Icon: LucideIcon, valueClassName?: string) {
  return (
    <Surface
      key={label}
      className="bg-primary/5 ring-primary/10 flex min-h-16 items-center justify-between gap-4 py-3 shadow-none ring-1"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
        <span
          className={cn(
            "text-primary leading-snug font-bold",
            valueClassName ?? "text-2xl leading-none tabular-nums",
          )}
        >
          {value}
        </span>
        <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
          {label}
        </span>
      </div>
      <Icon className="text-primary size-4 shrink-0" aria-hidden />
    </Surface>
  );
}

export function SeasonFixtureMatchSummarySection({ model }: SeasonFixtureMatchSummarySectionProps) {
  return (
    <>
      <SectionDivider variant="labeled" label="Match summary" />
      <SectionBlock variant="inset" spacing="sm">
        <Card className="gap-0 overflow-hidden p-0">
          <CardHeader className="bg-primary-950 border-b border-white/15 pt-6 pb-6 text-white">
            <CardAction>
              <Trophy className="size-5 text-white" aria-hidden />
            </CardAction>
            <p className="text-xl leading-snug font-semibold text-white">
              {model.homeTeam} vs {model.awayTeam}
            </p>
            {model.homeScoreLine || model.awayScoreLine ? (
              <p className="text-base font-medium text-white/95">
                <span className="text-white/90">{model.homeTeam}</span> {model.homeScoreLine ?? "—"}
                <span className="text-white/60"> · </span>
                <span className="text-white/90">{model.awayTeam}</span> {model.awayScoreLine ?? "—"}
              </p>
            ) : null}
            <p className="text-sm text-white/80">
              {model.competitionName}
              {model.gradeName ? ` - ${model.gradeName}` : ""}
            </p>
          </CardHeader>
          <CardContent className="space-y-5 py-6">
            {model.scorecardUrl ? (
              <div>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={model.scorecardUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <ExternalLink className="size-4" aria-hidden />
                    Scorecard (PlayHQ)
                  </a>
                </Button>
              </div>
            ) : null}
            <div className="flex justify-end">
              {model.status && model.status.trim().length > 0 ? (
                <Badge
                  className={cn(
                    "border-transparent text-white hover:opacity-90",
                    fixtureStatusBadgeClass(model.status),
                  )}
                >
                  {model.status}
                </Badge>
              ) : (
                <span className="text-muted-foreground text-sm">No status</span>
              )}
            </div>
            <p className="text-muted-foreground text-sm">
              Match detail from season hub for this fixture. Use Sync to refresh data.
            </p>
          </CardContent>
        </Card>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tileSurface(model.round && model.round.trim() ? model.round : "—", "Round", Hash)}
          {tileSurface(model.dateLabel, "Date", Calendar, "text-base font-semibold sm:text-lg")}
          {tileSurface(model.type && model.type.trim() ? model.type : "—", "Type", Clock)}
          {tileSurface(
            model.venueGround && model.venueGround.trim() ? model.venueGround : "—",
            "Venue",
            MapPin,
            "text-base font-semibold sm:text-lg",
          )}
        </div>
        {model.gameId ? (
          <p className="text-muted-foreground mt-4 font-mono text-xs">Game ID: {model.gameId}</p>
        ) : null}
      </SectionBlock>
    </>
  );
}
