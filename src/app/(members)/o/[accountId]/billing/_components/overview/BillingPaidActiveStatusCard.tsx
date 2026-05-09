import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { BILLING_PAID_ACTIVE_STATUS_COPY } from "../../_constants/billingPaidActiveStatus";
import { BILLING_TRIAL_DETAILS_COPY } from "../../_constants/billingTrialDetails";
import { buildPaidActiveStatusCardViewModel } from "../../_utils/billingOverviewStatusCards";
import {
  billingTrialDetailsBadgeLabel,
  billingTrialDetailsBadgeVariant,
  formatPaidPeriodDaysRemainingLine,
} from "../../_utils/billingTrialDetails";
import { formatBillingDateLong } from "../../_utils/formatBillingDisplay";

import type { BillingPaidActiveStatusCardProps } from "../../_types/billingSections";

export function BillingPaidActiveStatusCard({
  activeOrder,
  currentPlan,
  orders,
}: BillingPaidActiveStatusCardProps) {
  const uiMode = "paid_active" as const;
  const { daysRemaining, endAt, hasPeriodBounds, remainingPercent, startAt, tierLabel } =
    buildPaidActiveStatusCardViewModel(activeOrder, currentPlan, orders);

  return (
    <Card className="overflow-hidden md:col-span-2">
      <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-linear-to-r" />
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="font-brand text-lg">Billing status</CardTitle>
          <Badge variant={billingTrialDetailsBadgeVariant(uiMode)}>
            {billingTrialDetailsBadgeLabel(uiMode)}
          </Badge>
        </div>
        <CardDescription>{BILLING_PAID_ACTIVE_STATUS_COPY.cardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-sm font-medium">
            {BILLING_TRIAL_DETAILS_COPY.assetProcessEnabledLabel}
          </span>
          <Badge
            variant="secondary"
            className="bg-success-600 hover:bg-success-600/90 border-transparent text-white"
          >
            {BILLING_TRIAL_DETAILS_COPY.assetProcessEnabledBadgeLabel}
          </Badge>
        </div>

        {hasPeriodBounds && startAt && endAt ? (
          <div className="border-border border-t pt-3">
            {tierLabel ? <p className="text-foreground mb-3 font-medium">{tierLabel}</p> : null}
            <dl className="text-muted-foreground grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-foreground text-xs font-medium">
                  {BILLING_PAID_ACTIVE_STATUS_COPY.periodStartedLabel}
                </dt>
                <dd className="mt-1 tabular-nums">{formatBillingDateLong(startAt)}</dd>
              </div>
              <div>
                <dt className="text-foreground text-xs font-medium">
                  {BILLING_PAID_ACTIVE_STATUS_COPY.periodEndsLabel}
                </dt>
                <dd className="mt-1 tabular-nums">{formatBillingDateLong(endAt)}</dd>
              </div>
            </dl>
            {remainingPercent != null ? (
              <div className="mt-4 grid gap-2">
                <div
                  aria-label={`Time remaining in billing period: ${Math.round(remainingPercent)} percent`}
                  aria-valuemax={100}
                  aria-valuemin={0}
                  aria-valuenow={Math.round(remainingPercent)}
                  className="bg-muted h-2 w-full overflow-hidden rounded-full"
                  role="progressbar"
                >
                  <div
                    className="bg-success-600 h-full rounded-full transition-[width] duration-300 ease-out"
                    style={{ width: `${remainingPercent}%` }}
                  />
                </div>
              </div>
            ) : null}
            {daysRemaining != null ? (
              <p className="text-muted-foreground mt-3 text-sm">
                {formatPaidPeriodDaysRemainingLine(daysRemaining)}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="border-border border-t pt-3">
            {tierLabel ? <p className="text-foreground mb-3 font-medium">{tierLabel}</p> : null}
            <p className="text-muted-foreground text-xs" role="status">
              {BILLING_PAID_ACTIVE_STATUS_COPY.noOrderDates}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
