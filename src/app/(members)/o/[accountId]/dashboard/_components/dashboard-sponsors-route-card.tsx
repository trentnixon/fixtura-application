"use client";

import { IconMoneybag } from "@tabler/icons-react";
import Link from "next/link";

import { MetricComparisonCard } from "@/components/cards";
import { TypographyH4, TypographyMuted } from "@/components/typography";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  isAccountSponsorsGatewayRedirect,
  useAccountSponsors,
} from "@/lib/api/hooks/account/useAccountSponsors";
import { cn } from "@/lib/utils";

import { buildSponsorsRouteCard } from "../_utils/build-organisation-route-cards";

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

function ActiveSponsorsProgress({ active, total }: { active: number; total: number }) {
  const pct = total > 0 ? Math.round((active / total) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">
          {total > 0 ? `${active} of ${total} active` : "No sponsors to measure"}
        </span>
        <span className="text-muted-foreground tabular-nums">{pct}%</span>
      </div>
      <div
        className="bg-muted h-2 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct}% of sponsors active`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width]",
            pct === 100 ? "bg-success" : "bg-primary",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SponsorsMetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <Skeleton key={index} className="h-19 rounded-lg" />
      ))}
    </div>
  );
}

/** `card.metric.comparison-card` — sponsor pool and active totals. */
export function DashboardSponsorsRouteCard({ accountId }: { accountId: string }) {
  const sponsorsQuery = useAccountSponsors(accountId);

  const sponsorsData =
    sponsorsQuery.data && !isAccountSponsorsGatewayRedirect(sponsorsQuery.data)
      ? sponsorsQuery.data.data.items
      : null;

  const view = buildSponsorsRouteCard({ accountId, sponsors: sponsorsData });
  const isPending = sponsorsQuery.isPending;

  const body = isPending ? (
    <SponsorsMetricsSkeleton />
  ) : (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <ComparisonMetricCell label="In pool" value={view.poolCount} />
        <ComparisonMetricCell label="Active" value={view.activeCount} />
      </div>
      {view.poolCount > 0 ? (
        <ActiveSponsorsProgress active={view.activeCount} total={view.poolCount} />
      ) : (
        <TypographyMuted className="text-sm">No sponsors in pool yet.</TypographyMuted>
      )}
    </div>
  );

  return (
    <MetricComparisonCard
      className="h-full"
      data-card="card.metric.comparison-card"
      layout="card"
      titleRowClassName="items-start"
      title={
        <div className="min-w-0 space-y-1">
          <TypographyH4 className="text-sm font-semibold">{view.title}</TypographyH4>
          <TypographyMuted className="text-xs">{view.description}</TypographyMuted>
        </div>
      }
      icon={<IconMoneybag className="text-primary size-5 shrink-0" stroke={1.5} aria-hidden />}
      body={body}
      footer={
        <Button variant="brand" className="w-full" asChild disabled={isPending}>
          <Link href={view.href}>{view.ctaLabel}</Link>
        </Button>
      }
    />
  );
}
