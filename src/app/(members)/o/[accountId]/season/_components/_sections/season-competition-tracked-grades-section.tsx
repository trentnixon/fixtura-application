"use client";

import { Calendar, LayoutGrid, List, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Surface } from "@/components/ui/container";
import { Input } from "@/components/ui/input";
import { SectionBlock } from "@/components/ui/section";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

import { SEASON_LOADING_COPY } from "../_constants";
import { buildSeasonGradeHref, isSeasonStatusActive } from "../_utils";
import { SeasonEmptyPanel } from "../season-empty-panel";
import { SeasonRowLink } from "../shared/season-row-link";

import type { SeasonCompetitionTrackedGradesSectionProps } from "../_types";

type GradeViewMode = "cards" | "table";

const GRADE_VIEW_MODE_STORAGE_KEY = "fixtura:season-competition:grades-view";

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
  const [viewMode, setViewMode] = useState<GradeViewMode>("table");

  useEffect(() => {
    const storedViewMode = window.localStorage.getItem(GRADE_VIEW_MODE_STORAGE_KEY);
    if (storedViewMode === "cards" || storedViewMode === "table") {
      setViewMode(storedViewMode);
    }
  }, []);

  const handleViewModeChange = (value: string) => {
    if (value !== "cards" && value !== "table") {
      return;
    }

    setViewMode(value);
    window.localStorage.setItem(GRADE_VIEW_MODE_STORAGE_KEY, value);
  };

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
              ? "This competition has no grades tracked in Vision yet. When grades are published for this draw, they will appear here."
              : "We could not load any grades for this competition. If you expected a list, try again in a moment or return to Vision."
          }
          action={{
            label: "Back to Vision",
            href: seasonOverviewHref,
          }}
        />
      ) : null}
      {!gradesPending && !gradesEmpty ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground text-xs">
              Showing {filteredGradeRows.length} of {normalizedGrades.length} grades
            </p>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={handleViewModeChange}
              variant="outline"
              size="sm"
              aria-label="Grade display"
              className="self-start sm:self-auto"
            >
              <ToggleGroupItem value="cards" aria-label="Show card grid">
                <LayoutGrid className="size-4" aria-hidden />
                Cards
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Show table list">
                <List className="size-4" aria-hidden />
                Table
              </ToggleGroupItem>
            </ToggleGroup>
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
          ) : viewMode === "cards" ? (
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
          ) : (
            <div className="bg-background border-primary/10 overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary-950 hover:bg-primary-950 border-b border-white/15">
                    <TableHead className="min-w-64 text-white/90">Grade</TableHead>
                    <TableHead className="text-white/90">Gender</TableHead>
                    <TableHead className="text-white/90">Age group</TableHead>
                    <TableHead className="text-right text-white/90">Teams</TableHead>
                    <TableHead className="text-right text-white/90">Fixtures</TableHead>
                    <TableHead className="text-white/90">Status</TableHead>
                    <TableHead className="text-right text-white/90">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGradeRows.map((grade) => {
                    const gradeIsActive = isSeasonStatusActive(grade.status);
                    const gradeHref = buildSeasonGradeHref(accountId, competitionId, grade.id);

                    return (
                      <TableRow
                        key={`row-${grade.id}`}
                        className="hover:bg-primary/5 transition-colors"
                      >
                        <TableCell className="max-w-80">
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="truncate text-sm font-medium">{grade.name}</span>
                            <span className="text-muted-foreground text-xs">Grade #{grade.id}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-36 truncate text-sm">
                          {grade.gender}
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-40 truncate text-sm">
                          {grade.ageGroup}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {grade.teamCount}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm tabular-nums">
                          {grade.fixtureCount}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "border-transparent text-white hover:opacity-90",
                              gradeIsActive ? "bg-success-600" : "bg-error-600",
                            )}
                          >
                            {grade.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="accent" size="compact" asChild>
                            <Link href={gradeHref}>Open</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      ) : null}
    </SectionBlock>
  );
}
