import type { ManageSponsorsLibraryFilter } from "../../../_types/manage-sponsors";

export const SPONSOR_LIBRARY_FILTERS: Array<{
  value: ManageSponsorsLibraryFilter;
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "placed", label: "Placed" },
  { value: "unassigned", label: "Unassigned" },
  { value: "primary", label: "Primary" },
];
