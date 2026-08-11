export const TABBER_SEGMENTED_RAIL_PRIMARY_LIST_CLASS =
  "text-muted-foreground grid w-full max-w-md grid-cols-2 border border-primary/25 bg-primary/10 p-1 shadow-none";

export const TABBER_SEGMENTED_RAIL_PRIMARY_TRIGGER_CLASS =
  "shadow-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground";

import type { AssignmentRowFilter, SlotKindFilter } from "../_types/sponsor-slot-placement-panel";

export const SPONSOR_SLOT_ASSIGNMENT_ROW_FILTER_OPTIONS: Array<{
  value: AssignmentRowFilter;
  label: string;
}> = [
  { value: "all", label: "All positions" },
  { value: "empty", label: "Empty only" },
  { value: "filled", label: "Filled only" },
];

export const SPONSOR_SLOT_KIND_FILTER_OPTIONS: Array<{
  value: SlotKindFilter;
  label: string;
}> = [
  { value: "all", label: "All types" },
  { value: "primary", label: "Primary" },
  { value: "general", label: "General" },
];
