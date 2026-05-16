"use client";

import { SponsorLibraryFilterToggle } from "./_components/sponsor-library-filter-toggle";
import { SponsorLibrarySearch } from "./_components/sponsor-library-search";
import { SPONSOR_LIBRARY_SEARCH_FIELD_ID } from "./_constants/sponsor-library-search";

import type { SponsorLibraryToolbarProps } from "./_types/sponsor-library";

export function SponsorLibraryToolbar({
  searchValue,
  onSearchChange,
  activeFilter,
  onFilterChange,
  disabled = false,
}: SponsorLibraryToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid min-w-0 grid-cols-[minmax(10rem,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <SponsorLibrarySearch
            id={SPONSOR_LIBRARY_SEARCH_FIELD_ID}
            value={searchValue}
            onChange={onSearchChange}
            disabled={disabled}
            aria-label="Search sponsors by name or tagline"
          />
        </div>

        <SponsorLibraryFilterToggle
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
