import { CardDescription, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { OrdersTable } from "./OrdersTable";
import { ordersTableSectionCopy } from "../../_constants/ordersTableSection";

import type { OrdersTableSectionProps } from "../../_types/ordersTableSection";

export function OrdersTableSection({
  orders,
  activeOrder,
  loadError,
  onRetry,
}: OrdersTableSectionProps) {
  return (
    <div className="bg-muted/35 flex flex-col gap-6 rounded-lg border border-transparent p-5">
      <div className="space-y-1.5">
        <CardTitle className="font-brand text-lg">{ordersTableSectionCopy.cardTitle}</CardTitle>
        <CardDescription>{ordersTableSectionCopy.cardDescription}</CardDescription>
      </div>
      {loadError ? (
        <ErrorState
          title={ordersTableSectionCopy.errorTitle}
          description={loadError.message || AUTH_ERROR_MESSAGES.network}
          onRetry={onRetry}
        />
      ) : orders.length === 0 ? (
        <p className="text-muted-foreground text-sm" role="status">
          {ordersTableSectionCopy.emptyState}
        </p>
      ) : (
        <OrdersTable orders={orders} activeOrder={activeOrder} />
      )}
    </div>
  );
}
