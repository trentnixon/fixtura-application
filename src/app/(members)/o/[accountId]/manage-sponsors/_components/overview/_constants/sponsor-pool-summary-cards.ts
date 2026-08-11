import type { SponsorPoolSummaryMetricDefinition } from "../_types/sponsor-pool-summary-cards";

export const SPONSOR_POOL_SUMMARY_COPY = {
  title: "Sponsor pool summary",
  description: "Counts across your organisation's sponsor library.",
} as const;

export const SPONSOR_POOL_SUMMARY_METRICS = [
  { label: "Total sponsors", statKey: "total" },
  { label: "Placed", statKey: "placed" },
  { label: "Unassigned", statKey: "unassigned" },
  { label: "Archived", statKey: "archived" },
] as const satisfies readonly SponsorPoolSummaryMetricDefinition[];
