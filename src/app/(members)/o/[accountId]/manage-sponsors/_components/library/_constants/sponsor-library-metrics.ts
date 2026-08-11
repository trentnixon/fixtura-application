import type { SponsorPoolStats } from "../_types/sponsor-library";

export const SPONSOR_POOL_METRIC_LABELS: Array<{
  key: keyof SponsorPoolStats;
  label: string;
}> = [
  { key: "total", label: "Total sponsors" },
  { key: "placed", label: "Placed" },
  { key: "unassigned", label: "Unassigned" },
  { key: "archived", label: "Archived" },
];
