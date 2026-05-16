import { FolderKanban } from "lucide-react";

import { TypographyH4, TypographyMuted } from "@/components/typography";

import { SponsorPoolSummaryMetric } from "./_components/sponsor-pool-summary-metric";
import {
  SPONSOR_POOL_SUMMARY_COPY,
  SPONSOR_POOL_SUMMARY_METRICS,
} from "./_constants/sponsor-pool-summary-cards";

import type { SponsorPoolSummaryCardsProps } from "./_types/sponsor-pool-summary-cards";

export function SponsorPoolSummaryCards({ stats }: SponsorPoolSummaryCardsProps) {
  return (
    <div className="bg-card text-card-foreground ring-border rounded-xl border-none p-5 shadow-sm ring-1">
      <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <TypographyH4 className="text-sm font-semibold">
            {SPONSOR_POOL_SUMMARY_COPY.title}
          </TypographyH4>
          <TypographyMuted className="text-xs">
            {SPONSOR_POOL_SUMMARY_COPY.description}
          </TypographyMuted>
        </div>
        <div className="shrink-0">
          <FolderKanban className="text-primary size-5" aria-hidden />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SPONSOR_POOL_SUMMARY_METRICS.map(({ label, statKey }) => (
          <SponsorPoolSummaryMetric key={label} label={label} value={stats[statKey]} />
        ))}
      </div>
    </div>
  );
}
