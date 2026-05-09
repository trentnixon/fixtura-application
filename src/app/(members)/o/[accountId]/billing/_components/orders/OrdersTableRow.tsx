import { TableCell, TableRow } from "@/components/ui/table";

import { OrdersTableInvoiceActions } from "./OrdersTableInvoiceActions";
import { ordersTableSectionCopy } from "../../_constants/ordersTableSection";
import {
  getHistoryOrderStatus,
  getHistoryOrderSubscriptionDayCount,
  parseHistoryOrderTotal,
} from "../../_utils/billingHistoryOrderUtils";
import { formatBillingDateTable, formatMoney } from "../../_utils/formatBillingDisplay";
import { getOrdersTableInvoiceLinks } from "../../_utils/ordersTableSectionTableUtils";

import type { OrdersTableRowProps } from "../../_types/ordersTableSection";

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
        {formatMoney(parseHistoryOrderTotal(order.total), order.currency ?? null)}
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
