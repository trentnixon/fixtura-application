"use client";

import { Calendar, ShieldCheck, Users, type LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Surface } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { SectionBlock } from "@/components/ui/section";
import { cn } from "@/lib/utils";

import { SEASON_LOADING_COPY } from "../_constants";
import { buildSeasonGradeHref, isSeasonStatusActive } from "../_utils";
import { SeasonEmptyPanel } from "../season-empty-panel";
import { SeasonRowLink } from "../shared/season-row-link";

import type { SeasonCompetitionTrackedGradesSectionProps } from "../_types";

export function SeasonCompetitionTrackedGradesSection({
  accountId,
  competitionId,
  seasonOverviewHref,
  gradesPending,
  gradesEmpty,
  gradesCountFromDetail,
  normalizedGrades,
  filteredGradeRows,
  gradeSearchQuery,
  onGradeSearchChange,
}: SeasonCompetitionTrackedGradesSectionProps) {
  return (
    <SectionBlock variant="inset" spacing="sm">
      <div>
        <p className="text-sm font-semibold">Tracked grades</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Open a grade to confirm teams, fixtures, and fixture-level drill-downs for this
          competition.
        </p>
      </div>
      {gradesPending ? (
        <p className="text-muted-foreground text-sm">{SEASON_LOADING_COPY.grades}</p>
      ) : null}
      {!gradesPending && gradesEmpty ? (
        <SeasonEmptyPanel
          title="No grades for this competition"
          description={
            gradesCountFromDetail === 0
              ? "This competition has no grades in season hub yet. When grades are published for this draw, they will appear here."
              : "We could not load any grades for this competition. If you expected a list, try again in a moment or return to season overview."
          }
          action={{
            label: "Back to season overview",
            href: seasonOverviewHref,
          }}
        />
      ) : null}
      {!gradesPending && !gradesEmpty ? (
        <>
          <div className="flex justify-end">
            <p className="text-muted-foreground text-xs">
              Showing {filteredGradeRows.length} of {normalizedGrades.length} grades
            </p>
          </div>
          <Input
            value={gradeSearchQuery}
            onChange={(event) => onGradeSearchChange(event.target.value)}
            placeholder="Search by name, gender, age group, status"
            aria-label="Search grades"
          />
          {normalizedGrades.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No grades returned for this competition.
            </p>
          ) : filteredGradeRows.length === 0 ? (
            <p className="text-muted-foreground text-sm">No grades match the current search.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredGradeRows.map((grade) => {
                const gradeIsActive = isSeasonStatusActive(grade.status);
                const gradeHref = buildSeasonGradeHref(accountId, competitionId, grade.id);
                return (
                  <Card key={`summary-${grade.id}`} className="gap-0 overflow-hidden p-0">
                    <CardHeader className="bg-primary-950 border-b border-white/15 pt-6 pb-6 text-white">
                      <CardAction>
                        <ShieldCheck className="size-5 text-white" aria-hidden />
                      </CardAction>
                      <p className="text-xl leading-none font-semibold text-white">{grade.name}</p>
                      <p className="text-sm text-white/80">
                        Grade #{grade.id} - {grade.gender} - {grade.ageGroup}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-5 py-6">
                      <div className="flex justify-end">
                        <Badge
                          className={cn(
                            "border-transparent text-white hover:opacity-90",
                            gradeIsActive ? "bg-success-600" : "bg-error-600",
                          )}
                        >
                          {grade.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {(
                          [
                            [grade.teamCount, "Teams", Users],
                            [grade.fixtureCount, "Fixtures", Calendar],
                          ] as Array<[string | number, string, LucideIcon]>
                        ).map(([value, label, Icon]) => (
                          <Surface
                            key={`${grade.id}-${label}`}
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
                        href={gradeHref}
                        title="Open grade"
                        subtitle={`Continue to fixtures for ${grade.name}.`}
                      />
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : null}
    </SectionBlock>
  );
}
