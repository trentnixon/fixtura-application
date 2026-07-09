import {
  TypographyCaption,
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyDataLabel,
  TypographyDataValue,
  TypographyMuted,
} from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { BILLING_PAID_ACTIVE_STATUS_COPY } from "../../_constants/overview/billingPaidActiveStatus";
import { BILLING_TRIAL_DETAILS_COPY } from "../../_constants/trial/billingTrialDetails";
import { resolvePaidActiveInvoiceLinks } from "../../_utils/orders/orderInvoiceLinks";
import { buildPaidActiveStatusCardViewModel } from "../../_utils/overview/billingOverviewStatusCards";
import { formatBillingDateLong } from "../../_utils/overview/formatBillingDisplay";
import {
  billingTrialDetailsBadgeLabel,
  billingTrialDetailsBadgeVariant,
  formatPaidPeriodDaysRemainingLine,
} from "../../_utils/trial/billingTrialDetails";
import { OrdersTableInvoiceActions } from "../orders/OrdersTableInvoiceActions";

import type { BillingPaidActiveStatusCardProps } from "../../_types/overview/billingSections";

export function BillingPaidActiveStatusCard({
  activeOrder,
  currentPlan,
  orders,
}: BillingPaidActiveStatusCardProps) {
  const uiMode = "paid_active" as const;
  const { daysRemaining, endAt, hasPeriodBounds, remainingPercent, startAt, tierLabel } =
    buildPaidActiveStatusCardViewModel(activeOrder, currentPlan, orders);
  const invoiceLinks = resolvePaidActiveInvoiceLinks(activeOrder, orders);

  return (
    <Card className="overflow-hidden md:col-span-2">
      <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-linear-to-r" />
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <TypographyCardTitle className="font-brand">Billing status</TypographyCardTitle>
          <Badge variant={billingTrialDetailsBadgeVariant(uiMode)}>
            {billingTrialDetailsBadgeLabel(uiMode)}
          </Badge>
        </div>
        <TypographyCardDescription>
          {BILLING_PAID_ACTIVE_STATUS_COPY.cardDescription}
        </TypographyCardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <TypographyDataLabel as="span" className="font-medium">
            {BILLING_TRIAL_DETAILS_COPY.assetProcessEnabledLabel}
          </TypographyDataLabel>
          <Badge
            variant="secondary"
            className="bg-success-600 hover:bg-success-600/90 border-transparent text-white"
          >
            {BILLING_TRIAL_DETAILS_COPY.assetProcessEnabledBadgeLabel}
          </Badge>
        </div>

        {hasPeriodBounds && startAt && endAt ? (
          <div className="border-border border-t pt-3">
            {tierLabel ? (
              <TypographyDataValue as="p" className="mb-3">
                {tierLabel}
              </TypographyDataValue>
            ) : null}
            <dl className="text-muted-foreground grid gap-3 sm:grid-cols-2">
              <div>
                <TypographyDataLabel as="dt" className="text-foreground font-medium">
                  {BILLING_PAID_ACTIVE_STATUS_COPY.periodStartedLabel}
                </TypographyDataLabel>
                <TypographyDataValue as="dd" className="mt-1">
                  {formatBillingDateLong(startAt)}
                </TypographyDataValue>
              </div>
              <div>
                <TypographyDataLabel as="dt" className="text-foreground font-medium">
                  {BILLING_PAID_ACTIVE_STATUS_COPY.periodEndsLabel}
                </TypographyDataLabel>
                <TypographyDataValue as="dd" className="mt-1">
                  {formatBillingDateLong(endAt)}
                </TypographyDataValue>
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
              <TypographyMuted className="mt-3">
                {formatPaidPeriodDaysRemainingLine(daysRemaining)}
              </TypographyMuted>
            ) : null}
            {invoiceLinks.hostedInvoiceUrl || invoiceLinks.invoicePdfUrl ? (
              <div className="border-border mt-4 border-t pt-4">
                <OrdersTableInvoiceActions
                  hostedInvoiceUrl={invoiceLinks.hostedInvoiceUrl}
                  invoicePdfUrl={invoiceLinks.invoicePdfUrl}
                />
              </div>
            ) : null}
          </div>
        ) : (
          <div className="border-border border-t pt-3">
            {tierLabel ? (
              <TypographyDataValue as="p" className="mb-3">
                {tierLabel}
              </TypographyDataValue>
            ) : null}
            <TypographyCaption role="status">
              {BILLING_PAID_ACTIVE_STATUS_COPY.noOrderDates}
            </TypographyCaption>
            {invoiceLinks.hostedInvoiceUrl || invoiceLinks.invoicePdfUrl ? (
              <div className="mt-4">
                <OrdersTableInvoiceActions
                  hostedInvoiceUrl={invoiceLinks.hostedInvoiceUrl}
                  invoicePdfUrl={invoiceLinks.invoicePdfUrl}
                />
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
