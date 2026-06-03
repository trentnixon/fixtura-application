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
    <div className="flex flex-col gap-4 px-4 py-3">
      {hasActiveFilters ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 shrink-0"
            onClick={onClearFilters}
          >
            Clear filters
          </Button>
        </div>
      ) : null}
      {showFilterFields ? (
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
