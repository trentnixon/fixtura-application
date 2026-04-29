"use client";

import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SEASON_FILTER_ALL } from "../_constants";
import { formatFixtureDateDisplay } from "../_utils";

import type { SeasonGradeFixturesToolbarProps } from "../_types";

export function SeasonGradeFixturesToolbar({
  search,
  onSearchChange,
  team,
  onTeamChange,
  venue,
  onVenueChange,
  date,
  onDateChange,
  status,
  onStatusChange,
  options,
  hasActiveFilters,
  onClearFilters,
  filteredCount,
  totalCount,
}: SeasonGradeFixturesToolbarProps) {
  return (
    <div className="bg-muted/35 flex flex-col gap-4 border-b px-4 py-3">
      <div className="flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full sm:max-w-80">
          <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" aria-hidden />
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search fixtures..."
            className="h-9 rounded-lg pl-10"
            aria-label="Search fixtures"
          />
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 shrink-0"
              onClick={onClearFilters}
            >
              Clear filters
            </Button>
          ) : null}
          <p className="text-muted-foreground text-sm sm:text-right">
            Showing {filteredCount} of {totalCount} fixtures
          </p>
        </div>
      </div>
      {totalCount > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-medium">Team</p>
            <Select value={team} onValueChange={onTeamChange}>
              <SelectTrigger className="h-9 w-full" aria-label="Filter by team">
                <SelectValue placeholder="All teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SEASON_FILTER_ALL}>All teams</SelectItem>
                {options.teams.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-medium">Venue</p>
            <Select value={venue} onValueChange={onVenueChange}>
              <SelectTrigger className="h-9 w-full" aria-label="Filter by venue">
                <SelectValue placeholder="All venues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SEASON_FILTER_ALL}>All venues</SelectItem>
                {options.venues.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-medium">Date</p>
            <Select value={date} onValueChange={onDateChange}>
              <SelectTrigger className="h-9 w-full" aria-label="Filter by date">
                <SelectValue placeholder="All dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SEASON_FILTER_ALL}>All dates</SelectItem>
                {options.dates.map((raw) => (
                  <SelectItem key={raw} value={raw}>
                    {formatFixtureDateDisplay(raw)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="text-muted-foreground text-xs font-medium">Status</p>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="h-9 w-full" aria-label="Filter by status">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SEASON_FILTER_ALL}>All statuses</SelectItem>
                {options.statuses.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      ) : null}
    </div>
  );
}
