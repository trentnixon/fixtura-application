import { IconChartBar } from "@tabler/icons-react";
import Link from "next/link";

import { TypographyH3, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { accountScopedRoutes } from "@/lib/config/account-routes";

import type { AccountAnalyticsOverviewMeta, AccountAnalyticsRollup } from "@/types/api/account";
import type { ReactNode } from "react";

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

function KpiMetricCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-muted/50 rounded-lg p-3">
      <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
        {label}
      </TypographyMuted>
      <div className="mt-1 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function SummaryCardShell({
  accountId,
  analyticsMeta,
  footerDisabled,
  children,
}: {
  accountId: string;
  analyticsMeta: AccountAnalyticsOverviewMeta | null;
  footerDisabled?: boolean;
  children: ReactNode;
}) {
  const bundlesHref = accountScopedRoutes.bundles(accountId);

  return (
    <Card className="h-full" data-card="composite.summary">
      <CardHeader>
        <CardAction>
          <IconChartBar className="text-muted-foreground size-5" aria-hidden />
        </CardAction>
        <TypographyH3 className="text-xl leading-none font-semibold">Render summary</TypographyH3>
        <TypographyMuted>{summaryByline(analyticsMeta)}</TypographyMuted>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
      <CardFooter className="flex flex-wrap gap-2 border-t pt-6">
        <Button variant="brand" asChild disabled={footerDisabled}>
          <Link href={bundlesHref}>View bundles</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

/** `card.composite.summary` — grouped metrics inside a single summary card. */
export function DashboardKpiStrip({
  accountId,
  isPending,
  rollup,
  analyticsMeta,
}: DashboardKpiStripProps) {
  if (isPending) {
    return (
      <SummaryCardShell accountId={accountId} analyticsMeta={analyticsMeta} footerDisabled>
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-17 rounded-lg" />
          ))}
        </div>
      </SummaryCardShell>
    );
  }

  if (!rollup) {
    return (
      <SummaryCardShell accountId={accountId} analyticsMeta={analyticsMeta}>
        <TypographyMuted className="text-sm">No analytics in this range yet.</TypographyMuted>
      </SummaryCardShell>
    );
  }

  return (
    <SummaryCardShell accountId={accountId} analyticsMeta={analyticsMeta}>
      <div className="grid grid-cols-2 gap-3">
        {KPI_ITEMS.map(({ key, label }) => (
          <KpiMetricCell key={key} label={label} value={rollup[key]} />
        ))}
      </div>
    </SummaryCardShell>
  );
}
