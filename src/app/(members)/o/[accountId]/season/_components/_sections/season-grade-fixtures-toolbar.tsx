"use client";

import { Button } from "@/components/ui/button";
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
  showFilterFields,
}: SeasonGradeFixturesToolbarProps) {
  return (
    <div className="px-4 py-3">
      {showFilterFields ? (
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[140px] flex-1 space-y-1.5 sm:max-w-[220px]">
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
          <div className="min-w-[140px] flex-1 space-y-1.5 sm:max-w-[220px]">
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
          <div className="min-w-[140px] flex-1 space-y-1.5 sm:max-w-[220px]">
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
          <div className="min-w-[140px] flex-1 space-y-1.5 sm:max-w-[220px]">
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
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="warningOutline"
              size="sm"
              className="h-9 shrink-0"
              onClick={onClearFilters}
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
