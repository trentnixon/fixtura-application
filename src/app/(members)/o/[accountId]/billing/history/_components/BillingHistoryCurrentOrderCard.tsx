import {
  TypographyBodySmall,
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyDataLabel,
  TypographyDataValue,
} from "@/components/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { getHistoryOrderStatus } from "../../_utils/orders/billingHistoryOrderUtils";
import {
  formatBillingHistoryDate,
  formatBillingHistoryMoney,
  parseBillingHistoryOrderTotal,
} from "../_utils/formatBillingHistory";
import { pickHighlightedHistoryOrder } from "../_utils/pickHighlightedHistoryOrder";

import type { AccountBillingOrderDto, AccountBillingOrderHistoryDto } from "@/types/api/account";

function HistoryOrderDetailSection({ order }: { order: AccountBillingOrderHistoryDto }) {
  const tierLabel = order.subscriptionTier?.name ?? null;
  const status = getHistoryOrderStatus(order);

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
          {formatBillingHistoryMoney(parseBillingHistoryOrderTotal(order.total), order.currency)}
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
    </dl>
  );
}

function ActiveOrderSection({ order }: { order: AccountBillingOrderDto }) {
  const status = order.stripe_status ?? order.payment_status ?? "—";

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
          {formatBillingHistoryMoney(order.total, order.currency)}
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
      {order.hosted_invoice_url ? (
        <div className="pt-1">
          <a
            href={order.hosted_invoice_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm underline-offset-4 hover:underline"
          >
            View hosted invoice
          </a>
        </div>
      ) : null}
      {order.invoice_pdf ? (
        <div>
          <a
            href={order.invoice_pdf}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary text-sm underline-offset-4 hover:underline"
          >
            Download invoice PDF
          </a>
        </div>
      ) : null}
    </dl>
  );
}

export function BillingHistoryCurrentOrderCard({
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
          <HistoryOrderDetailSection order={highlightedOrder} />
        ) : activeOrder ? (
          <ActiveOrderSection order={activeOrder} />
        ) : (
          <TypographyBodySmall role="status">No current order on file.</TypographyBodySmall>
        )}
      </CardContent>
    </Card>
  );
}
