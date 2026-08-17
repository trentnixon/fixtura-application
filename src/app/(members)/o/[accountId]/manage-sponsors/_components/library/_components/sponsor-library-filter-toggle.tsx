import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { SPONSOR_LIBRARY_FILTERS } from "../_constants/sponsor-library-filters";

import type { ManageSponsorsLibraryFilter } from "../../../_types/manage-sponsors";
import type { SponsorLibraryFilterToggleProps } from "../_types/sponsor-library";

export function SponsorLibraryFilterToggle({
  activeFilter,
  onFilterChange,
  disabled = false,
}: SponsorLibraryFilterToggleProps) {
  return (
    <fieldset
      aria-label="Filter by placement"
      className="max-w-full min-w-0 border-0 px-4 py-3 sm:px-5"
    >
      <div className="[scrollbar-width:none] overflow-x-auto pb-0.5 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
          {SPONSOR_LIBRARY_FILTERS.map((filter) => (
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
  );
}
