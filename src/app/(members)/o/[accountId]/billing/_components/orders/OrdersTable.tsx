import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { OrdersTableRow } from "./OrdersTableRow";
import {
  ORDERS_TABLE_SECTION_MIN_WIDTH_PX,
  ordersTableSectionCopy,
} from "../../_constants/ordersTableSection";
import { getOrdersTableRowKey } from "../../_utils/ordersTableSectionTableUtils";

import type { OrdersTableProps } from "../../_types/ordersTableSection";

export function OrdersTable({ orders, activeOrder }: OrdersTableProps) {
  return (
    <div className="bg-background overflow-hidden rounded-lg border">
      <Table className="min-w-0" style={{ minWidth: ORDERS_TABLE_SECTION_MIN_WIDTH_PX }}>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead>{ordersTableSectionCopy.planColumn}</TableHead>
            <TableHead>{ordersTableSectionCopy.startedColumn}</TableHead>
            <TableHead>{ordersTableSectionCopy.endedColumn}</TableHead>
            <TableHead className="text-right tabular-nums">
              {ordersTableSectionCopy.daysColumn}
            </TableHead>
            <TableHead>{ordersTableSectionCopy.activeColumn}</TableHead>
            <TableHead>{ordersTableSectionCopy.statusColumn}</TableHead>
            <TableHead className="text-right">{ordersTableSectionCopy.totalColumn}</TableHead>
            <TableHead className="text-right">{ordersTableSectionCopy.actionsColumn}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order, index) => (
            <OrdersTableRow
              key={getOrdersTableRowKey(order, index)}
              order={order}
              activeOrder={activeOrder}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
