import { FolderKanban } from "lucide-react";

import { SponsorPoolSummaryMetric } from "./_components/sponsor-pool-summary-metric";
import {
  SPONSOR_POOL_SUMMARY_COPY,
  SPONSOR_POOL_SUMMARY_METRICS,
} from "./_constants/sponsor-pool-summary-cards";
import {
  MANAGE_SPONSORS_CONTAINER_HEADER_CLASS_NAME,
  ManageSponsorsContainerHeaderTitle,
} from "../shared/manage-sponsors-container-header-title";

import type { SponsorPoolSummaryCardsProps } from "./_types/sponsor-pool-summary-cards";

export function SponsorPoolSummaryCards({ stats }: SponsorPoolSummaryCardsProps) {
  return (
    <div className="bg-card text-card-foreground ring-border overflow-hidden rounded-2xl border-none shadow-xl ring-1">
      <div className={MANAGE_SPONSORS_CONTAINER_HEADER_CLASS_NAME}>
        <ManageSponsorsContainerHeaderTitle
          icon={<FolderKanban className="size-5" aria-hidden />}
          title={SPONSOR_POOL_SUMMARY_COPY.title}
          description={SPONSOR_POOL_SUMMARY_COPY.description}
        />
      </div>
      <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
        {SPONSOR_POOL_SUMMARY_METRICS.map(({ label, statKey }) => (
          <SponsorPoolSummaryMetric key={label} label={label} value={stats[statKey]} />
        ))}
      </div>
    </div>
  );
}
