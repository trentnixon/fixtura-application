"use client";

import { IconCreditCard } from "@tabler/icons-react";
import Link from "next/link";

import { MetricComparisonCard } from "@/components/cards";
import { TypographyDataLabel, TypographyH4, TypographyMuted } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { captureUserAction } from "@/lib/analytics";
import {
  isAccountBillingGatewayRedirect,
  useAccountBilling,
} from "@/lib/api/hooks/account/useAccountBilling";
import {
  isAccountBillingOrdersGatewayRedirect,
  useAccountBillingOrders,
} from "@/lib/api/hooks/account/useAccountBillingOrders";
import { cn } from "@/lib/utils";

import { useBillingProductStateSnapshot } from "../../billing/_hooks/useBillingProductStateSnapshot";
import { billingProductStateBadgeSurfaceClass } from "../../billing/_utils/overview/billingProductStateDisplay";
import { buildBillingRouteCard } from "../_utils/build-organisation-route-cards";

import type { BillingRouteCardMetric } from "../_utils/build-organisation-route-cards";

function ComparisonMetricCell({ label, value }: BillingRouteCardMetric) {
  return (
    <div className="border-border/50 bg-muted/50 flex flex-col overflow-hidden rounded-lg border p-0">
      <div className="border-border/40 border-b px-3 py-2">
        <TypographyMuted className="text-[10px] font-semibold tracking-tight uppercase">
          {label}
        </TypographyMuted>
      </div>
      <div className="mt-1 px-3 pb-3 text-base leading-snug font-semibold tabular-nums">
        {value}
      </div>
    </div>
  );
}

function BillingMetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <Skeleton key={index} className="h-19 rounded-lg" />
      ))}
    </div>
  );
}

function BillingPeriodProgress({ percent, ariaLabel }: { percent: number; ariaLabel: string }) {
  const rounded = Math.round(percent);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="text-muted-foreground">Period remaining</span>
        <span className="text-muted-foreground tabular-nums">{rounded}%</span>
      </div>
      <div
        className="bg-muted h-2 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuenow={rounded}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={ariaLabel}
      >
        <div
          className={cn("bg-success h-full rounded-full transition-[width]")}
          style={{ width: `${rounded}%` }}
        />
      </div>
    </div>
  );
}

/** `card.metric.comparison-card` — billing subscription and trial overview. */
export function DashboardBillingRouteCard({ accountId }: { accountId: string }) {
  const snapshot = useBillingProductStateSnapshot(accountId);
  const billingQuery = useAccountBilling(accountId, {
    enabled: snapshot.status !== "unavailable",
  });
  const billingReady = Boolean(
    billingQuery.isSuccess &&
    billingQuery.data &&
    !isAccountBillingGatewayRedirect(billingQuery.data),
  );
  const ordersQuery = useAccountBillingOrders(accountId, {
    enabled: billingReady,
  });

  if (snapshot.status === "unavailable") {
    return null;
  }

  const isPending =
    snapshot.status === "loading" ||
    billingQuery.isPending ||
    (billingReady && ordersQuery.isPending);

  const billingSummary =
    billingQuery.data && !isAccountBillingGatewayRedirect(billingQuery.data)
      ? billingQuery.data.data
      : null;

  const ordersPayload =
    ordersQuery.isSuccess &&
    ordersQuery.data &&
    !isAccountBillingOrdersGatewayRedirect(ordersQuery.data)
      ? ordersQuery.data.orders
      : [];

  const view =
    snapshot.status === "ready" && billingSummary
      ? buildBillingRouteCard({
          accountId,
          billingUiMode: snapshot.billingUiMode,
          productState: snapshot.productState,
          billingSummary,
          orders: ordersPayload,
        })
      : null;

  const body = isPending ? (
    <BillingMetricsSkeleton />
  ) : view ? (
    <div className="space-y-3">
      <Badge
        variant="outline"
        className={cn(
          "text-xs font-medium",
          billingProductStateBadgeSurfaceClass(view.productState),
        )}
        aria-label={`Billing status: ${view.statusLabel}`}
      >
        {view.statusLabel}
      </Badge>

      <div className={cn("grid gap-3", view.secondaryMetric ? "grid-cols-2" : "grid-cols-1")}>
        <ComparisonMetricCell {...view.primaryMetric} />
        {view.secondaryMetric ? <ComparisonMetricCell {...view.secondaryMetric} /> : null}
      </div>

      {view.detailRows.length > 0 ? (
        <dl className="space-y-2 text-sm">
          {view.detailRows.map((row) => (
            <div key={row.label} className="flex items-baseline justify-between gap-3">
              <TypographyDataLabel as="dt" className="text-xs">
                {row.label}
              </TypographyDataLabel>
              <dd className="text-right text-sm font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {view.progressPercent != null && view.progressAriaLabel ? (
        <BillingPeriodProgress percent={view.progressPercent} ariaLabel={view.progressAriaLabel} />
      ) : null}

      {view.showEndingNotice && view.endingNoticeText ? (
        <TypographyMuted className="text-xs">{view.endingNoticeText}</TypographyMuted>
      ) : null}

      {view.bodyFallback ? (
        <TypographyMuted className="text-sm">{view.bodyFallback}</TypographyMuted>
      ) : null}
    </div>
  ) : (
    <TypographyMuted className="text-sm">Billing summary unavailable.</TypographyMuted>
  );

  return (
    <MetricComparisonCard
      className="h-full"
      data-card="card.metric.comparison-card"
      layout="card"
      titleRowClassName="items-start"
      title={
        <div className="min-w-0 space-y-1">
          <TypographyH4 className="text-sm font-semibold">{view?.title ?? "Billing"}</TypographyH4>
          <TypographyMuted className="text-xs">
            {view?.description ?? "Subscription, trial, and payment status."}
          </TypographyMuted>
        </div>
      }
      icon={<IconCreditCard className="text-primary size-5 shrink-0" stroke={1.5} aria-hidden />}
      body={body}
      footer={
        view ? (
          <Button variant="brand" className="w-full" asChild disabled={isPending}>
            <Link
              href={view.href}
              onClick={() =>
                captureUserAction("dashboard_route_clicked", {
                  destination: "billing",
                  accountId,
                })
              }
            >
              {view.ctaLabel}
            </Link>
          </Button>
        ) : null
      }
    />
  );
}
