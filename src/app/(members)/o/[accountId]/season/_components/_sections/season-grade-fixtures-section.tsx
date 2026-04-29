"use client";

import { SectionBlock } from "@/components/ui/section";

import { SeasonEmptyPanel } from "../season-empty-panel";
import { SeasonGradeFixturesTable } from "./season-grade-fixtures-table";
import { SeasonGradeFixturesToolbar } from "./season-grade-fixtures-toolbar";

import type { SeasonGradeFixturesSectionProps } from "../_types";

export function SeasonGradeFixturesSection({
  accountId,
  competitionId,
  gradeId,
  competitionHref,
  fixturesEmpty,
  fixturesCountFromGrade,
  fixtureRows,
  filteredRows,
  search,
  setSearch,
  team,
  setTeam,
  venue,
  setVenue,
  date,
  setDate,
  status,
  setStatus,
  options,
  hasActiveFilters,
  clearFilters,
}: SeasonGradeFixturesSectionProps) {
  return (
    <SectionBlock variant="inset" spacing="sm">
      <div>
        <p className="text-sm font-semibold">Fixtures</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Filter fixtures in the toolbar, then open a row for fixture-level detail.
        </p>
      </div>
      {fixturesEmpty ? (
        <SeasonEmptyPanel
          title="No fixtures for this grade"
          description={
            fixturesCountFromGrade === 0
              ? "This grade has no fixtures in season hub yet. When the draw is published, matches will show here."
              : "We could not load fixtures for this grade. Try refreshing, or go back to the competition if the problem continues."
          }
          action={{
            label: "Back to competition",
            href: competitionHref,
          }}
        />
      ) : (
        <div className="bg-background border-primary/10 overflow-hidden rounded-lg border">
          <SeasonGradeFixturesToolbar
            search={search}
            onSearchChange={setSearch}
            team={team}
            onTeamChange={setTeam}
            venue={venue}
            onVenueChange={setVenue}
            date={date}
            onDateChange={setDate}
            status={status}
            onStatusChange={setStatus}
            options={options}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
            filteredCount={filteredRows.length}
            totalCount={fixtureRows.length}
          />
          {fixtureRows.length === 0 ? (
            <div className="px-4 py-8">
              <p className="text-muted-foreground text-sm">No fixtures returned for this grade.</p>
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="px-4 py-8">
              <p className="text-muted-foreground text-sm">No fixtures match the current filter.</p>
            </div>
          ) : (
            <SeasonGradeFixturesTable
              accountId={accountId}
              competitionId={competitionId}
              gradeId={gradeId}
              filteredRows={filteredRows}
            />
          )}
        </div>
      )}
    </SectionBlock>
  );
}
