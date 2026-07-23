import {
  TypographyBodySmall,
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyDataLabel,
  TypographyDataValue,
} from "@/components/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { OrdersTableInvoiceActions } from "../../_components/orders/OrdersTableInvoiceActions";
import { BillingActiveTrialStatusCard } from "../../_components/overview/BillingActiveTrialStatusCard";
import { BillingPaidActiveStatusCard } from "../../_components/overview/BillingPaidActiveStatusCard";
import { deriveBillingUiMode } from "../../_core/billing-state";
import {
  getHistoryOrderStatus,
  resolveHistoryOrderTotalForDisplay,
  resolveSummaryOrderTotalForDisplay,
} from "../../_utils/orders/billingHistoryOrderUtils";
import {
  extractInvoiceLinksFromSummaryOrder,
  resolveHistoryOrderInvoiceLinks,
} from "../../_utils/orders/orderInvoiceLinks";
import {
  formatBillingHistoryDate,
  formatBillingHistoryMoney,
} from "../_utils/formatBillingHistory";
import { pickHighlightedHistoryOrder } from "../_utils/pickHighlightedHistoryOrder";

import type {
  AccountBillingOrderDto,
  AccountBillingOrderHistoryDto,
  AccountBillingSummaryV1,
} from "@/types/api/account";

function HistoryOrderDetailSection({
  order,
  activeOrder,
}: {
  order: AccountBillingOrderHistoryDto;
  activeOrder: AccountBillingOrderDto | null;
}) {
  const tierLabel = order.subscriptionTier?.name ?? null;
  const status = getHistoryOrderStatus(order);
  const invoiceLinks = resolveHistoryOrderInvoiceLinks(order, activeOrder);

  return (
    <dl className="grid gap-2">
      {tierLabel ? (
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
          <TypographyDataLabel as="dt" className="text-foreground font-medium">
            Plan
          </TypographyDataLabel>
          <TypographyDataValue as="dd" className="text-right">
            {tierLabel}
          </TypographyDataValue>
        </div>
      ) : null}
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <TypographyDataLabel as="dt" className="text-foreground font-medium">
          Name
        </TypographyDataLabel>
        <TypographyDataValue as="dd" className="text-right">
          {order.name ?? "—"}
        </TypographyDataValue>
      </div>
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <TypographyDataLabel as="dt" className="text-foreground font-medium">
          Started
        </TypographyDataLabel>
        <TypographyDataValue as="dd" className="text-right">
          {formatBillingHistoryDate(order.startAt ?? null)}
        </TypographyDataValue>
      </div>
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <TypographyDataLabel as="dt" className="text-foreground font-medium">
          Total
        </TypographyDataLabel>
        <TypographyDataValue as="dd" className="text-right">
          {formatBillingHistoryMoney(resolveHistoryOrderTotalForDisplay(order), order.currency)}
        </TypographyDataValue>
      </div>
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <TypographyDataLabel as="dt" className="text-foreground font-medium">
          Status
        </TypographyDataLabel>
        <TypographyDataLabel as="dd" className="text-right">
          {status}
        </TypographyDataLabel>
      </div>
      {invoiceLinks.hostedInvoiceUrl || invoiceLinks.invoicePdfUrl ? (
        <div className="pt-2">
          <OrdersTableInvoiceActions
            hostedInvoiceUrl={invoiceLinks.hostedInvoiceUrl}
            invoicePdfUrl={invoiceLinks.invoicePdfUrl}
          />
        </div>
      ) : null}
    </dl>
  );
}

function ActiveOrderSection({ order }: { order: AccountBillingOrderDto }) {
  const status = order.stripe_status ?? order.payment_status ?? "—";
  const invoiceLinks = extractInvoiceLinksFromSummaryOrder(order);

  return (
    <dl className="grid gap-2">
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <TypographyDataLabel as="dt" className="text-foreground font-medium">
          Name
        </TypographyDataLabel>
        <TypographyDataValue as="dd" className="text-right">
          {order.Name ?? "—"}
        </TypographyDataValue>
      </div>
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <TypographyDataLabel as="dt" className="text-foreground font-medium">
          Started
        </TypographyDataLabel>
        <TypographyDataValue as="dd" className="text-right">
          {formatBillingHistoryDate(order.startOrderAt ?? null)}
        </TypographyDataValue>
      </div>
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <TypographyDataLabel as="dt" className="text-foreground font-medium">
          Total
        </TypographyDataLabel>
        <TypographyDataValue as="dd" className="text-right">
          {formatBillingHistoryMoney(resolveSummaryOrderTotalForDisplay(order), order.currency)}
        </TypographyDataValue>
      </div>
      <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
        <TypographyDataLabel as="dt" className="text-foreground font-medium">
          Status
        </TypographyDataLabel>
        <TypographyDataLabel as="dd" className="text-right">
          {status}
        </TypographyDataLabel>
      </div>
      {invoiceLinks.hostedInvoiceUrl || invoiceLinks.invoicePdfUrl ? (
        <div className="pt-2">
          <OrdersTableInvoiceActions
            hostedInvoiceUrl={invoiceLinks.hostedInvoiceUrl}
            invoicePdfUrl={invoiceLinks.invoicePdfUrl}
          />
        </div>
      ) : null}
    </dl>
  );
}

function LegacyCurrentOrderCard({
  activeOrder,
  orders,
}: {
  activeOrder: AccountBillingOrderDto | null | undefined;
  orders: AccountBillingOrderHistoryDto[];
}) {
  const highlightedOrder = pickHighlightedHistoryOrder(orders, activeOrder ?? null);

  return (
    <Card>
      <CardHeader>
        <TypographyCardTitle className="font-brand">Current order</TypographyCardTitle>
        <TypographyCardDescription>
          Primary subscription order (from order history when available, otherwise billing summary).
        </TypographyCardDescription>
      </CardHeader>
      <CardContent>
        {highlightedOrder ? (
          <HistoryOrderDetailSection order={highlightedOrder} activeOrder={activeOrder ?? null} />
        ) : activeOrder ? (
          <ActiveOrderSection order={activeOrder} />
        ) : (
          <TypographyBodySmall role="status">No current order on file.</TypographyBodySmall>
        )}
      </CardContent>
    </Card>
  );
}

/** Matches billing overview status cards when paid active or on trial; otherwise legacy order row. */
export function BillingHistoryCurrentOrderCard({
  summary,
  orders,
}: {
  summary: AccountBillingSummaryV1;
  orders: AccountBillingOrderHistoryDto[];
}) {
  const billingUiMode = deriveBillingUiMode(summary, { orders });

  if (billingUiMode === "paid_active") {
    return (
      <BillingPaidActiveStatusCard
        activeOrder={summary.activeOrder}
        currentPlan={summary.currentPlan}
        orders={orders}
      />
    );
  }

  if (billingUiMode === "active_trial") {
    return <BillingActiveTrialStatusCard trial={summary.trial} />;
  }

  return <LegacyCurrentOrderCard activeOrder={summary.activeOrder} orders={orders} />;
}
