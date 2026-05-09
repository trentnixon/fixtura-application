import {
  TypographyBodySmall,
  TypographyCardDescription,
  TypographyCardTitle,
  TypographyTableCell,
  TypographyTableHeading,
} from "@/components/typography";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { getHistoryOrderStatus } from "../../_utils/orders/billingHistoryOrderUtils";
import {
  formatBillingHistoryDate,
  formatBillingHistoryMoney,
  parseBillingHistoryOrderTotal,
} from "../_utils/formatBillingHistory";

import type { AccountBillingOrderHistoryDto } from "@/types/api/account";

export function BillingHistoryOrdersTableCard({
  orders,
  loadError,
  onRetry,
}: {
  orders: AccountBillingOrderHistoryDto[];
  loadError: Error | null;
  onRetry: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <TypographyCardTitle className="font-brand">Order history</TypographyCardTitle>
        <TypographyCardDescription>
          All orders for this account (newest first).
        </TypographyCardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        {loadError ? (
          <ErrorState
            title="Could not load orders"
            description={loadError.message || AUTH_ERROR_MESSAGES.network}
            onRetry={onRetry}
          />
        ) : orders.length === 0 ? (
          <TypographyBodySmall role="status">No orders recorded yet.</TypographyBodySmall>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <TypographyTableHeading className="px-3 py-2">ID</TypographyTableHeading>
                  <TypographyTableHeading className="px-3 py-2">Plan</TypographyTableHeading>
                  <TypographyTableHeading className="px-3 py-2">Started</TypographyTableHeading>
                  <TypographyTableHeading className="px-3 py-2">Total</TypographyTableHeading>
                  <TypographyTableHeading className="px-3 py-2">Status</TypographyTableHeading>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => (
                  <tr
                    key={`${order.id}-${index}`}
                    className="border-border/70 border-b last:border-b-0"
                  >
                    <TypographyTableCell className="px-3 py-2 font-mono text-xs">
                      {order.id}
                    </TypographyTableCell>
                    <TypographyTableCell className="px-3 py-2">
                      {order.subscriptionTier?.name ?? "—"}
                    </TypographyTableCell>
                    <TypographyTableCell className="px-3 py-2">
                      {formatBillingHistoryDate(order.startAt ?? null)}
                    </TypographyTableCell>
                    <TypographyTableCell className="px-3 py-2 tabular-nums">
                      {formatBillingHistoryMoney(
                        parseBillingHistoryOrderTotal(order.total),
                        order.currency,
                      )}
                    </TypographyTableCell>
                    <TypographyTableCell className="px-3 py-2">
                      {getHistoryOrderStatus(order)}
                    </TypographyTableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
