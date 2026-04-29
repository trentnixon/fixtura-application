import { MetricComparisonCard } from "@/components/cards/MetricComparisonCard";
import { TypographyMuted } from "@/components/typography";
import { Surface } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

import type { AccountAnalyticsRollup } from "@/types/api/account";

type DashboardKpiStripProps = {
  isPending: boolean;
  rollup: AccountAnalyticsRollup | null;
  percentageComplete: number | undefined;
};

function KpiTile({ label, value }: { label: string; value: number }) {
  return (
    <Surface className="p-4">
      <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
        {label}
      </TypographyMuted>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
    </Surface>
  );
}

export function DashboardKpiStrip({
  isPending,
  rollup,
  percentageComplete,
}: DashboardKpiStripProps) {
  if (isPending) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!rollup) {
    return (
      <Surface className="border-dashed p-6">
        <TypographyMuted className="text-sm">No analytics in this range yet.</TypographyMuted>
      </Surface>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiTile label="Total renders" value={rollup.totalRenders} />
        <KpiTile label="Completed" value={rollup.totalCompleteRenders} />
        <KpiTile label="Processing" value={rollup.totalProcessingRenders} />
        <KpiTile label="Downloads" value={rollup.totalDownloads} />
        <KpiTile label="Emails sent" value={rollup.totalEmailsSent} />
        <KpiTile label="AI articles" value={rollup.totalAiArticles} />
      </div>
      <MetricComparisonCard
        title="Renders: complete vs processing"
        layout="surface"
        primary={{ label: "Complete", value: rollup.totalCompleteRenders }}
        secondary={{ label: "Processing", value: rollup.totalProcessingRenders }}
        footer={
          percentageComplete != null && !Number.isNaN(percentageComplete)
            ? `${percentageComplete.toFixed(1)}% complete (in range)`
            : "Share of renders that finished in this window"
        }
      />
    </div>
  );
}
