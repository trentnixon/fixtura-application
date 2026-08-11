import {
  TypographyBodySmall,
  TypographyCardDescription,
  TypographyCardTitle,
} from "@/components/typography";
import { ErrorState } from "@/components/ui/error-state";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { OrdersTable } from "./OrdersTable";
import { ordersTableSectionCopy } from "../../_constants/orders/ordersTableSection";

import type { OrdersTableSectionProps } from "../../_types/orders/ordersTableSection";

export function OrdersTableSection({
  orders,
  activeOrder,
  loadError,
  onRetry,
}: OrdersTableSectionProps) {
  return (
    <div className="bg-muted/35 flex flex-col gap-6 rounded-lg border border-transparent p-5">
      <div className="space-y-1.5">
        <TypographyCardTitle className="font-brand">
          {ordersTableSectionCopy.cardTitle}
        </TypographyCardTitle>
        <TypographyCardDescription>
          {ordersTableSectionCopy.cardDescription}
        </TypographyCardDescription>
      </div>
      {loadError ? (
        <ErrorState
          title={ordersTableSectionCopy.errorTitle}
          description={loadError.message || AUTH_ERROR_MESSAGES.network}
          onRetry={onRetry}
        />
      ) : orders.length === 0 ? (
        <TypographyBodySmall role="status">{ordersTableSectionCopy.emptyState}</TypographyBodySmall>
      ) : (
        <OrdersTable orders={orders} activeOrder={activeOrder} />
      )}
    </div>
  );
}
