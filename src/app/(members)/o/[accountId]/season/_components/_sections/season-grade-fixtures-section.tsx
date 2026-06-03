"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  TABBER_PILL_BORDERLESS_DEFAULT_LIST_CLASS,
  TABBER_PILL_BORDERLESS_DEFAULT_TRIGGER_CLASS,
} from "../_constants";
import { SeasonEmptyPanel } from "../season-empty-panel";
import { SeasonGradeFixturesTable } from "./season-grade-fixtures-table";
import { SeasonGradeFixturesToolbar } from "./season-grade-fixtures-toolbar";

import type { SeasonGradeFixturesSectionProps } from "../_types";
import type { SeasonHubFixtureListItem } from "@/types/api/season-hub";

type FixtureTimelinePanelProps = {
  accountId: string;
  competitionId: string;
  gradeId: string;
  description: string;
  rows: SeasonHubFixtureListItem[];
  defaultCount: number;
  allCount: number;
  showAll: boolean;
  onShowAllChange: (value: boolean) => void;
  expandLabel: string;
  collapseLabel: string;
  emptyLabel: string;
};

function FixtureTimelinePanel({
  accountId,
  competitionId,
  gradeId,
  description,
  rows,
  defaultCount,
  allCount,
  showAll,
  onShowAllChange,
  expandLabel,
  collapseLabel,
  emptyLabel,
}: FixtureTimelinePanelProps) {
  const canExpand = allCount > defaultCount;

  return (
    <>
      <div className="bg-muted/20 flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-xs">
          {description} Shows {rows.length} of {allCount}.
        </p>
        {canExpand ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => onShowAllChange(!showAll)}
          >
            {showAll ? collapseLabel : expandLabel}
          </Button>
        ) : null}
      </div>
      {rows.length === 0 ? (
        <div className="px-4 py-8">
          <p className="text-muted-foreground text-sm">{emptyLabel}</p>
        </div>
      ) : (
        <SeasonGradeFixturesTable
          accountId={accountId}
          competitionId={competitionId}
          gradeId={gradeId}
          filteredRows={rows}
        />
      )}
    </>
  );
}

export function SeasonGradeFixturesSection({
  accountId,
  competitionId,
  gradeId,
  competitionHref,
  fixturesEmpty,
  fixturesCountFromGrade,
  fixtureRows,
  filteredRows: _filteredRows,
  previousRows,
  upcomingRows,
  previousDefaultCount,
  upcomingDefaultCount,
  allPreviousCount,
  allUpcomingCount,
  showAllPrevious,
  setShowAllPrevious,
  showAllUpcoming,
  setShowAllUpcoming,
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
  const toolbarProps = {
    team,
    onTeamChange: setTeam,
    venue,
    onVenueChange: setVenue,
    date,
    onDateChange: setDate,
    status,
    onStatusChange: setStatus,
    options,
    hasActiveFilters,
    onClearFilters: clearFilters,
    showFilterFields: fixtureRows.length > 0,
  };

  return (
    <div className="grid gap-4">
      {fixturesEmpty ? (
        <SeasonEmptyPanel
          title="No fixtures for this grade"
          description={
            fixturesCountFromGrade === 0
              ? "This grade has no fixtures tracked in Vision yet. When the draw is published, matches will show here."
              : "We could not load fixtures for this grade. Try refreshing, or go back to the competition if the problem continues."
          }
          action={{
            label: "Back to competition",
            href: competitionHref,
          }}
        />
      ) : (
        <div className="grid gap-4">
          {fixtureRows.length === 0 ? (
            <p className="text-muted-foreground text-sm">No fixtures returned for this grade.</p>
          ) : (
            <Tabs defaultValue="previous" className="grid w-full gap-4">
              <TabsList
                aria-label="Fixture timeline"
                className={TABBER_PILL_BORDERLESS_DEFAULT_LIST_CLASS}
              >
                <TabsTrigger
                  value="previous"
                  className={TABBER_PILL_BORDERLESS_DEFAULT_TRIGGER_CLASS}
                >
                  Completed Fixtures ({previousRows.length})
                </TabsTrigger>
                <TabsTrigger
                  value="upcoming"
                  className={TABBER_PILL_BORDERLESS_DEFAULT_TRIGGER_CLASS}
                >
                  Upcoming Fixtures ({upcomingRows.length})
                </TabsTrigger>
              </TabsList>

              <div className="bg-background border-primary/10 overflow-hidden rounded-lg border">
                <SeasonGradeFixturesToolbar {...toolbarProps} />
              </div>

              <div className="bg-background border-primary/10 overflow-hidden rounded-lg border">
                <TabsContent value="previous" className="mt-0">
                  <FixtureTimelinePanel
                    accountId={accountId}
                    competitionId={competitionId}
                    gradeId={gradeId}
                    description="Fixtures played in the past 7 days."
                    rows={previousRows}
                    defaultCount={previousDefaultCount}
                    allCount={allPreviousCount}
                    showAll={showAllPrevious}
                    onShowAllChange={setShowAllPrevious}
                    expandLabel={`View all ${allPreviousCount} previous`}
                    collapseLabel="Show past 7 days"
                    emptyLabel="No previous fixtures match the current filter."
                  />
                </TabsContent>
                <TabsContent value="upcoming" className="mt-0">
                  <FixtureTimelinePanel
                    accountId={accountId}
                    competitionId={competitionId}
                    gradeId={gradeId}
                    description="Fixtures scheduled in the next 7 days."
                    rows={upcomingRows}
                    defaultCount={upcomingDefaultCount}
                    allCount={allUpcomingCount}
                    showAll={showAllUpcoming}
                    onShowAllChange={setShowAllUpcoming}
                    expandLabel={`View all ${allUpcomingCount} upcoming`}
                    collapseLabel="Show next 7 days"
                    emptyLabel="No upcoming fixtures match the current filter."
                  />
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      )}
    </div>
  );
}
