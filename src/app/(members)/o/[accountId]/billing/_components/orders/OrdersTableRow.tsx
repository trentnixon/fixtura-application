import { TableCell, TableRow } from "@/components/ui/table";

import { OrdersTableInvoiceActions } from "./OrdersTableInvoiceActions";
import { ordersTableSectionCopy } from "../../_constants/orders/ordersTableSection";
import {
  getHistoryOrderStatus,
  getHistoryOrderSubscriptionDayCount,
  resolveHistoryOrderTotalForDisplay,
} from "../../_utils/orders/billingHistoryOrderUtils";
import { getOrdersTableInvoiceLinks } from "../../_utils/orders/ordersTableSectionTableUtils";
import { formatBillingDateTable, formatMoney } from "../../_utils/overview/formatBillingDisplay";

import type { OrdersTableRowProps } from "../../_types/orders/ordersTableSection";

export function OrdersTableRow({ order, activeOrder }: OrdersTableRowProps) {
  const { hostedInvoiceUrl, invoicePdfUrl } = getOrdersTableInvoiceLinks(order, activeOrder);
  const dayCount = getHistoryOrderSubscriptionDayCount(order);

  return (
    <TableRow className="hover:bg-transparent">
      <TableCell>{order.subscriptionTier?.name ?? ordersTableSectionCopy.missingName}</TableCell>
      <TableCell>{formatBillingDateTable(order.startAt)}</TableCell>
      <TableCell>{formatBillingDateTable(order.endAt)}</TableCell>
      <TableCell className="text-right tabular-nums">
        {dayCount == null ? ordersTableSectionCopy.missingName : dayCount}
      </TableCell>
      <TableCell>
        {order.isActive ? ordersTableSectionCopy.activeYes : ordersTableSectionCopy.activeNo}
      </TableCell>
      <TableCell>{getHistoryOrderStatus(order)}</TableCell>
      <TableCell className="text-right tabular-nums">
        {formatMoney(resolveHistoryOrderTotalForDisplay(order), order.currency ?? null)}
      </TableCell>
      <TableCell className="text-right">
        <OrdersTableInvoiceActions
          hostedInvoiceUrl={hostedInvoiceUrl}
          invoicePdfUrl={invoicePdfUrl}
        />
      </TableCell>
    </TableRow>
  );
}
