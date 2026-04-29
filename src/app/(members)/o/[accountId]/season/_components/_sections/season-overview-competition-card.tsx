"use client";

import { Calendar, Layers, ShieldCheck, Users, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Surface } from "@/components/ui/container";
import { cn } from "@/lib/utils";

import { buildSeasonCompetitionHref, isSeasonStatusActive } from "../_utils";
import { SeasonRowLink } from "../shared/season-row-link";

import type { SeasonOverviewCompetitionCardProps } from "../_types";

export function SeasonOverviewCompetitionCard({
  accountId,
  competition,
}: SeasonOverviewCompetitionCardProps) {
  const statusLabel = competition.status ?? "Unknown";
  const isActive = isSeasonStatusActive(statusLabel);
  const href = buildSeasonCompetitionHref(accountId, competition.id);

  return (
    <Card className="gap-0 overflow-hidden p-0">
      <CardHeader className="bg-primary-950 border-b border-white/15 pt-6 pb-6 text-white">
        <CardAction>
          <ShieldCheck className="size-5 text-white" aria-hidden />
        </CardAction>
        <p className="text-xl leading-none font-semibold text-white">{competition.name}</p>
        <p className="text-sm text-white/80">
          {competition.season ?? "No season"} - {competition.association.name ?? "Association"}
        </p>
      </CardHeader>
      <CardContent className="space-y-5 py-6">
        <div className="flex justify-end">
          <Badge
            className={cn(
              "border-transparent text-white hover:opacity-90",
              isActive ? "bg-success-600" : "bg-error-600",
            )}
          >
            {statusLabel}
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(
            [
              [competition.counts.grades, "Grades", Layers],
              [competition.counts.teams, "Teams", Users],
              [competition.counts.fixtures, "Fixtures", Calendar],
            ] as Array<[number, string, LucideIcon]>
          ).map(([value, label, Icon]) => (
            <Surface
              key={`${competition.id}-${label}`}
              className="bg-primary/5 ring-primary/10 flex min-h-16 items-center justify-between gap-4 py-3 shadow-none ring-1"
            >
              <div className="flex min-w-0 items-baseline gap-3">
                <span className="text-primary text-2xl leading-none font-bold tabular-nums">
                  {value}
                </span>
                <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
                  {label}
                </span>
              </div>
              <Icon className="text-primary size-4 shrink-0" aria-hidden />
            </Surface>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex w-full min-w-0 flex-col items-stretch gap-0 border-t pt-6 pb-6">
        <SeasonRowLink
          href={href}
          title="Review competition coverage"
          subtitle="Open this competition to confirm tracked grades, teams, and fixtures."
        />
      </CardFooter>
    </Card>
  );
}
