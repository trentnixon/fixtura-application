import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { ManageSponsorsLibraryFilter } from "../../_types/manage-sponsors";

const FILTERS: Array<{ value: ManageSponsorsLibraryFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "placed", label: "Placed" },
  { value: "unassigned", label: "Unassigned" },
  { value: "primary", label: "Primary" },
  { value: "inactive", label: "Inactive" },
];

export function SponsorLibraryFilters({
  activeFilter,
  onChange,
}: {
  activeFilter: ManageSponsorsLibraryFilter;
  onChange: (value: ManageSponsorsLibraryFilter) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <button key={filter.value} type="button" onClick={() => onChange(filter.value)}>
          <Badge
            variant={activeFilter === filter.value ? "secondary" : "outline"}
            className={cn(activeFilter === filter.value && "ring-primary/20 ring-2")}
          >
            {filter.label}
          </Badge>
        </button>
      ))}
    </div>
  );
}
