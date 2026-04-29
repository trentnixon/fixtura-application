"use client";

import { TypographyBodySmall, TypographyCaption } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionBlock } from "@/components/ui/section";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SEASON_FILTER_ALL, SEASON_OVERVIEW_COVERAGE_OPTIONS } from "../_constants";
import { SeasonEmptyPanel } from "../season-empty-panel";
import { SeasonOverviewCompetitionCard } from "./season-overview-competition-card";

import type { SeasonOverviewTrackedCompetitionsSectionProps } from "../_types";

export function SeasonOverviewTrackedCompetitionsSection({
  accountId,
  competitionsUnavailable,
  allResourceZeros,
  pagination,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  seasonFilter,
  setSeasonFilter,
  associationFilter,
  setAssociationFilter,
  coverageFilter,
  setCoverageFilter,
  statusOptions,
  seasonOptions,
  associationOptions,
  hasActiveFilters,
  clearFilters,
  sortedCompetitionRows,
  filteredCompetitionRows,
}: SeasonOverviewTrackedCompetitionsSectionProps) {
  return (
    <SectionBlock variant="inset" spacing="sm">
      <div>
        <TypographyBodySmall className="font-semibold">Tracked competitions</TypographyBodySmall>
        <TypographyCaption className="mt-1">
          Verify season hub coverage for each competition before drilling into grades and fixtures.
        </TypographyCaption>
      </div>

      {competitionsUnavailable ? (
        <SeasonEmptyPanel
          title="Competitions are not available"
          description="Season hub is not exposing competition listings for this account. You can still use other members areas; ask your administrator if competitions should appear here."
        />
      ) : null}

      {!competitionsUnavailable && sortedCompetitionRows.length > 0 ? (
        <>
          <div className="flex justify-end">
            <TypographyCaption>
              Showing {filteredCompetitionRows.length} of {sortedCompetitionRows.length}{" "}
              competitions
            </TypographyCaption>
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_auto]">
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name, season, association, status"
              aria-label="Search competitions"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] min-w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEASON_FILTER_ALL}>All statuses</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={seasonFilter} onValueChange={setSeasonFilter}>
                <SelectTrigger className="w-[160px] min-w-[140px]">
                  <SelectValue placeholder="Season" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEASON_FILTER_ALL}>All seasons</SelectItem>
                  {seasonOptions.map((season) => (
                    <SelectItem key={season} value={season}>
                      {season}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={associationFilter} onValueChange={setAssociationFilter}>
                <SelectTrigger className="w-[180px] min-w-[140px]">
                  <SelectValue placeholder="Association" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SEASON_FILTER_ALL}>All associations</SelectItem>
                  {associationOptions.map((association) => (
                    <SelectItem key={association} value={association}>
                      {association}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={coverageFilter} onValueChange={(value) => setCoverageFilter(value)}>
                <SelectTrigger className="w-[180px] min-w-[140px]">
                  <SelectValue placeholder="Coverage" />
                </SelectTrigger>
                <SelectContent>
                  {SEASON_OVERVIEW_COVERAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      {!competitionsUnavailable && sortedCompetitionRows.length === 0 && !allResourceZeros ? (
        <TypographyBodySmall tone="muted">
          No competitions in this scope for the current filters.
        </TypographyBodySmall>
      ) : null}

      {!competitionsUnavailable && sortedCompetitionRows.length > 0 ? (
        filteredCompetitionRows.length === 0 ? (
          <div className="space-y-3">
            <TypographyBodySmall tone="muted">
              No competitions match the current filters.
            </TypographyBodySmall>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredCompetitionRows.map((competition) => (
              <SeasonOverviewCompetitionCard
                key={`summary-${competition.id}`}
                accountId={accountId}
                competition={competition}
              />
            ))}
          </div>
        )
      ) : null}

      {pagination && pagination.total > pagination.pageSize ? (
        <TypographyCaption>
          Showing page {pagination.page} of {pagination.pageCount} ({pagination.total} total)
        </TypographyCaption>
      ) : null}
    </SectionBlock>
  );
}
