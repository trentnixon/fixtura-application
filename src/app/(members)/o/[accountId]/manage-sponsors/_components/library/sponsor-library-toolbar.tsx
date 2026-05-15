"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { SponsorLibrarySearch } from "./sponsor-library-search";

import type { ManageSponsorsLibraryFilter } from "../../_types/manage-sponsors";

const FILTERS: Array<{ value: ManageSponsorsLibraryFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "placed", label: "Placed" },
  { value: "unassigned", label: "Unassigned" },
  { value: "primary", label: "Primary" },
];

const SEARCH_FIELD_ID = "sponsor-pool-search";

export function SponsorLibraryToolbar({
  searchValue,
  onSearchChange,
  activeFilter,
  onFilterChange,
  disabled = false,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  activeFilter: ManageSponsorsLibraryFilter;
  onFilterChange: (value: ManageSponsorsLibraryFilter) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid min-w-0 grid-cols-[minmax(10rem,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <SponsorLibrarySearch
            id={SEARCH_FIELD_ID}
            value={searchValue}
            onChange={onSearchChange}
            disabled={disabled}
            aria-label="Search sponsors by name or tagline"
          />
        </div>

        <fieldset
          aria-label="Filter by placement"
          className="max-w-full min-w-0 border-0 px-4 py-3 sm:px-5"
        >
          <div className="overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <ToggleGroup
              type="single"
              variant="outline"
              spacing={0}
              size="sm"
              className="inline-flex w-max"
              value={activeFilter}
              onValueChange={(value) => {
                onFilterChange((value || "all") as ManageSponsorsLibraryFilter);
              }}
              disabled={disabled}
            >
              {FILTERS.map((filter) => (
                <ToggleGroupItem
                  key={filter.value}
                  value={filter.value}
                  className="min-w-21 shrink-0 px-2 text-xs sm:px-3 sm:text-sm"
                >
                  {filter.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </fieldset>
      </div>
    </div>
  );
}
