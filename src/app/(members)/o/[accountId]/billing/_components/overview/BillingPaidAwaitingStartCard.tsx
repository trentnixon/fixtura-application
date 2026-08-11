import {
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyDataLabel,
  TypographyDataValue,
  TypographyMuted,
} from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { ORDER_PAID_AWAITING_START_COPY } from "../../_constants/orders/orderSeasonPassDisplay";
import { BILLING_TRIAL_DETAILS_COPY } from "../../_constants/trial/billingTrialDetails";
import { extractInvoiceLinksFromHistoryOrder } from "../../_utils/orders/orderInvoiceLinks";
import { formatPaidAwaitingStartDaysLine } from "../../_utils/orders/orderSeasonPassDisplayState";
import { formatBillingDateLong } from "../../_utils/overview/formatBillingDisplay";
import { OrdersTableInvoiceActions } from "../orders/OrdersTableInvoiceActions";

import type { AccountBillingOrderHistoryDto } from "@/types/api/account";

export type BillingPaidAwaitingStartCardProps = {
  daysUntilStart: number;
  order: AccountBillingOrderHistoryDto;
};

/** Primary overview card when a Season Pass is paid but not yet active. */
export function BillingPaidAwaitingStartCard({
  daysUntilStart,
  order,
}: BillingPaidAwaitingStartCardProps) {
  const tierLabel = order.subscriptionTier?.name ?? null;
  const startAt = order.startAt ?? null;
  const endAt = order.endAt ?? null;
  const hasPeriodBounds = Boolean(startAt && endAt);
  const invoiceLinks = extractInvoiceLinksFromHistoryOrder(order);

  return (
    <Card className="overflow-hidden md:col-span-2" data-testid="billing-paid-awaiting-start-card">
      <div className="from-primary via-brand-secondary to-brand-accent h-2 w-full bg-linear-to-r" />
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <TypographyCardTitle className="font-brand">Billing status</TypographyCardTitle>
          <Badge variant="secondary">{ORDER_PAID_AWAITING_START_COPY.badgeLabel}</Badge>
        </div>
        <TypographyCardDescription>
          {ORDER_PAID_AWAITING_START_COPY.cardDescription}
        </TypographyCardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm">
        <TypographyMuted>{formatPaidAwaitingStartDaysLine(daysUntilStart)}</TypographyMuted>

        <div className="border-border border-t pt-3">
          {tierLabel ? (
            <TypographyDataValue as="p" className="mb-3">
              {tierLabel}
            </TypographyDataValue>
          ) : null}
          {hasPeriodBounds && startAt && endAt ? (
            <dl className="text-muted-foreground grid gap-3 sm:grid-cols-2">
              <div>
                <TypographyDataLabel as="dt" className="text-foreground font-medium">
                  {ORDER_PAID_AWAITING_START_COPY.periodStartsLabel}
                </TypographyDataLabel>
                <TypographyDataValue as="dd" className="mt-1">
                  {formatBillingDateLong(startAt)}
                </TypographyDataValue>
              </div>
              <div>
                <TypographyDataLabel as="dt" className="text-foreground font-medium">
                  {ORDER_PAID_AWAITING_START_COPY.periodEndsLabel}
                </TypographyDataLabel>
                <TypographyDataValue as="dd" className="mt-1">
                  {formatBillingDateLong(endAt)}
                </TypographyDataValue>
              </div>
            </dl>
          ) : startAt ? (
            <dl className="text-muted-foreground grid gap-3 sm:grid-cols-2">
              <div>
                <TypographyDataLabel as="dt" className="text-foreground font-medium">
                  {ORDER_PAID_AWAITING_START_COPY.periodStartsLabel}
                </TypographyDataLabel>
                <TypographyDataValue as="dd" className="mt-1">
                  {formatBillingDateLong(startAt)}
                </TypographyDataValue>
              </div>
            </dl>
          ) : null}
          <div className="mt-4 grid gap-2">
            <div
              aria-label="Season Pass has not started yet"
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={0}
              className="bg-muted h-2 w-full overflow-hidden rounded-full"
              role="progressbar"
            >
              <div className="bg-muted-foreground/30 h-full rounded-full" style={{ width: "0%" }} />
            </div>
          </div>
          {invoiceLinks.hostedInvoiceUrl || invoiceLinks.invoicePdfUrl ? (
            <div className="border-border mt-4 border-t pt-4">
              <OrdersTableInvoiceActions
                hostedInvoiceUrl={invoiceLinks.hostedInvoiceUrl}
                invoicePdfUrl={invoiceLinks.invoicePdfUrl}
              />
            </div>
          ) : null}
        </div>

        <div className="border-border flex flex-wrap items-center gap-2 border-t pt-3">
          <TypographyDataLabel as="span" className="font-medium">
            {BILLING_TRIAL_DETAILS_COPY.assetProcessEnabledLabel}
          </TypographyDataLabel>
          <Badge variant="secondary">
            {ORDER_PAID_AWAITING_START_COPY.processingNotYetActiveBadge}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
