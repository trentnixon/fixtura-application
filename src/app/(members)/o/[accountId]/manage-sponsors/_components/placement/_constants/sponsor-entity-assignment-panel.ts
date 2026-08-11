import type { EntityRowFilter, EntityTypeFilter } from "../_types/sponsor-entity-assignment-panel";

export const TABBER_SEGMENTED_RAIL_PRIMARY_LIST_CLASS =
  "text-muted-foreground grid w-full max-w-md grid-cols-2 border border-primary/25 bg-primary/10 p-1 shadow-none";

export const TABBER_SEGMENTED_RAIL_PRIMARY_TRIGGER_CLASS =
  "shadow-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

export const SPONSOR_ENTITY_ROW_FILTER_OPTIONS: Array<{
  value: EntityRowFilter;
  label: string;
}> = [
  { value: "all", label: "All entities" },
  { value: "assigned", label: "Targeted only" },
  { value: "unassigned", label: "Empty only" },
];

export const SPONSOR_ENTITY_TYPE_FILTER_OPTIONS: Array<{
  value: EntityTypeFilter;
  label: string;
}> = [
  { value: "all", label: "All types" },
  { value: "club", label: "Club" },
  { value: "team", label: "Team" },
  { value: "grade", label: "Grade" },
];
