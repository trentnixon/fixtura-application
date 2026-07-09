import { IconChartBar } from "@tabler/icons-react";
import Link from "next/link";

import { MetricComparisonCard } from "@/components/cards";
import { TypographyH4, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import type { AccountAnalyticsOverviewMeta, AccountAnalyticsRollup } from "@/types/api/account";

type DashboardKpiStripProps = {
  accountId: string;
  isPending: boolean;
  rollup: AccountAnalyticsRollup | null;
  analyticsMeta: AccountAnalyticsOverviewMeta | null;
};

const KPI_ITEMS = [
  { key: "totalRenders", label: "Total renders" },
  { key: "totalCompleteRenders", label: "Completed" },
  { key: "totalProcessingRenders", label: "Processing" },
  { key: "totalDownloads", label: "Downloads" },
] as const satisfies ReadonlyArray<{
  key: keyof Pick<
    AccountAnalyticsRollup,
    "totalRenders" | "totalCompleteRenders" | "totalProcessingRenders" | "totalDownloads"
  >;
  label: string;
}>;

function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function summaryByline(meta: AccountAnalyticsOverviewMeta | null): string {
  if (meta?.from && meta?.to) {
    return `Render and download totals for ${formatShortDate(meta.from)} – ${formatShortDate(meta.to)}.`;
  }
  return "Render and download totals for your organisation.";
}

function ComparisonMetricCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-border/50 bg-muted/50 flex flex-col overflow-hidden rounded-lg border p-0">
      <div className="border-border/40 border-b px-3 py-2">
        <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
          {label}
        </TypographyMuted>
      </div>
      <div className="mt-1 px-3 pb-3 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function RenderSummaryMetricsGrid({ rollup }: { rollup: AccountAnalyticsRollup }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {KPI_ITEMS.map(({ key, label }) => (
        <ComparisonMetricCell key={key} label={label} value={rollup[key]} />
      ))}
    </div>
  );
}

function RenderSummaryMetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-19 rounded-lg" />
      ))}
    </div>
  );
}

/** `card.metric.comparison-card` — render totals in comparison metric cells. */
export function DashboardKpiStrip({
  accountId,
  isPending,
  rollup,
  analyticsMeta,
}: DashboardKpiStripProps) {
  const bundlesHref = accountScopedRoutes.bundles(accountId);

  const body = isPending ? (
    <RenderSummaryMetricsSkeleton />
  ) : rollup ? (
    <RenderSummaryMetricsGrid rollup={rollup} />
  ) : (
    <TypographyMuted className="text-sm">No analytics in this range yet.</TypographyMuted>
  );

  return (
    <MetricComparisonCard
      className="h-full"
      data-card="card.metric.comparison-card"
      layout="card"
      titleRowClassName="items-start"
      title={
        <div className="min-w-0 space-y-1">
          <TypographyH4 className="text-sm font-semibold">Render summary</TypographyH4>
          <TypographyMuted className="text-xs">{summaryByline(analyticsMeta)}</TypographyMuted>
        </div>
      }
      icon={<IconChartBar className="text-primary size-5 shrink-0" aria-hidden />}
      body={body}
      footer={
        <Button variant="brand" className="w-full" asChild disabled={isPending}>
          <Link href={bundlesHref}>View bundles</Link>
        </Button>
      }
    />
  );
}
