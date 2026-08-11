import { TypographyMuted } from "@/components/typography";

import type { SponsorPoolSummaryMetricProps } from "../_types/sponsor-pool-summary-cards";

export function SponsorPoolSummaryMetric({ label, value }: SponsorPoolSummaryMetricProps) {
  return (
    <div className="space-y-1">
      <div className="text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      <TypographyMuted className="text-xs">{label}</TypographyMuted>
    </div>
  );
}
