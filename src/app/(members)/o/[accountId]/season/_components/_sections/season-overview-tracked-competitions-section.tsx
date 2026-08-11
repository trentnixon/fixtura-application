"use client";

import { LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

import { SEASON_FILTER_ALL } from "../_constants";
import { buildSeasonCompetitionHref, isSeasonStatusActive } from "../_utils";
import { SeasonEmptyPanel } from "../season-empty-panel";
import { SeasonOverviewCompetitionCard } from "./season-overview-competition-card";

import type { SeasonOverviewTrackedCompetitionsSectionProps } from "../_types";

type CompetitionViewMode = "cards" | "table";

const COMPETITION_VIEW_MODE_STORAGE_KEY = "fixtura:season-overview:competitions-view";

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
  statusOptions,
  seasonOptions,
  associationOptions,
  hasActiveFilters,
  clearFilters,
  sortedCompetitionRows,
  filteredCompetitionRows,
}: SeasonOverviewTrackedCompetitionsSectionProps) {
  const [viewMode, setViewMode] = useState<CompetitionViewMode>("table");

  useEffect(() => {
    const storedViewMode = window.localStorage.getItem(COMPETITION_VIEW_MODE_STORAGE_KEY);
    if (storedViewMode === "cards" || storedViewMode === "table") {
      setViewMode(storedViewMode);
    }
  }, []);

  const handleViewModeChange = (value: string) => {
    if (value !== "cards" && value !== "table") {
      return;
    }

    setViewMode(value);
    window.localStorage.setItem(COMPETITION_VIEW_MODE_STORAGE_KEY, value);
  };

  return (
    <SectionBlock variant="plain" spacing="sm">
      {competitionsUnavailable ? (
        <SeasonEmptyPanel
          title="Competitions are not available"
          description="Vision is not exposing competition listings for this account. You can still use other members areas; ask your administrator if competitions should appear here."
        />
      ) : null}

      {!competitionsUnavailable && sortedCompetitionRows.length > 0 ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TypographyCaption>
              Showing {filteredCompetitionRows.length} of {sortedCompetitionRows.length}{" "}
              competitions
            </TypographyCaption>
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={handleViewModeChange}
              variant="outline"
              size="sm"
              aria-label="Competition display"
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
        ) : viewMode === "cards" ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredCompetitionRows.map((competition) => (
              <SeasonOverviewCompetitionCard
                key={`summary-${competition.id}`}
                accountId={accountId}
                competition={competition}
              />
            ))}
          </div>
        ) : (
          <div className="bg-background border-primary/10 overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary-950 hover:bg-primary-950 border-b border-white/15">
                  <TableHead className="min-w-64 text-white/90">Competition</TableHead>
                  <TableHead className="text-white/90">Association</TableHead>
                  <TableHead className="text-white/90">Season</TableHead>
                  <TableHead className="text-right text-white/90">Grades</TableHead>
                  <TableHead className="text-right text-white/90">Teams</TableHead>
                  <TableHead className="text-right text-white/90">Fixtures</TableHead>
                  <TableHead className="text-right text-white/90">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompetitionRows.map((competition) => {
                  const statusLabel = competition.status ?? "Unknown";
                  const isActive = isSeasonStatusActive(statusLabel);
                  const href = buildSeasonCompetitionHref(accountId, competition.id);

                  return (
                    <TableRow
                      key={`row-${competition.id}`}
                      className="hover:bg-primary/5 transition-colors"
                    >
                      <TableCell className="max-w-80">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={cn(
                              "size-2 shrink-0 rounded-full",
                              isActive ? "bg-success-600" : "bg-error-600",
                            )}
                            title={statusLabel}
                            aria-label={`Status: ${statusLabel}`}
                          />
                          <span className="truncate text-sm font-medium">
                            {competition.name ?? "Unnamed competition"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-52 truncate text-sm">
                        {competition.association.name ?? "Association"}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-36 truncate text-sm">
                        {competition.season ?? "No season"}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums">
                        {competition.counts.grades}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums">
                        {competition.counts.teams}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums">
                        {competition.counts.fixtures}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="accent" size="compact" asChild>
                          <Link href={href}>Open</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
