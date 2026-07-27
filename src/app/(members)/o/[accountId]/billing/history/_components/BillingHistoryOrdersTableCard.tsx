import { Receipt } from "lucide-react";

import {
  TypographyBodySmall,
  TypographyTableCell,
  TypographyTableHeading,
} from "@/components/typography";
import { ErrorState } from "@/components/ui/error-state";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { AccountSectionShell } from "../../../account/_components/AccountSectionShell";
import { OrdersTableInvoiceActions } from "../../_components/orders/OrdersTableInvoiceActions";
import { ordersTableSectionCopy } from "../../_constants/orders/ordersTableSection";
import { getHistoryOrderStatus } from "../../_utils/orders/billingHistoryOrderUtils";
import { resolveHistoryOrderTotalForDisplay } from "../../_utils/orders/billingHistoryOrderUtils";
import {
  getInvoiceOrderPresentation,
  toInvoiceOrderStateFromHistory,
} from "../../_utils/orders/invoiceOrderState";
import { getOrdersTableInvoiceLinks } from "../../_utils/orders/ordersTableSectionTableUtils";
import { formatBillingDateTable } from "../../_utils/overview/formatBillingDisplay";
import { formatBillingHistoryMoney } from "../_utils/formatBillingHistory";

import type { AccountBillingOrderDto, AccountBillingOrderHistoryDto } from "@/types/api/account";

export function BillingHistoryOrdersTableCard({
  orders,
  activeOrder,
  loadError,
  onRetry,
}: {
  orders: AccountBillingOrderHistoryDto[];
  activeOrder: AccountBillingOrderDto | null;
  loadError: Error | null;
  onRetry: () => void;
}) {
  return (
    <AccountSectionShell
      title="Order history"
      description="All orders for this account (newest first)."
      icon={<Receipt className="size-5" aria-hidden />}
      headerTone="brand"
    >
      <div className="px-6 py-5">
        {loadError ? (
          <ErrorState
            title="Could not load orders"
            description={loadError.message || AUTH_ERROR_MESSAGES.network}
            onRetry={onRetry}
          />
        ) : orders.length === 0 ? (
          <TypographyBodySmall role="status">No orders recorded yet.</TypographyBodySmall>
        ) : (
          <div className="-mx-2 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-border border-b text-left">
                  <TypographyTableHeading className="px-3 py-2">Plan</TypographyTableHeading>
                  <TypographyTableHeading className="px-3 py-2">Started</TypographyTableHeading>
                  <TypographyTableHeading className="px-3 py-2">Total</TypographyTableHeading>
                  <TypographyTableHeading className="px-3 py-2">Status</TypographyTableHeading>
                  <TypographyTableHeading className="px-3 py-2 text-right">
                    {ordersTableSectionCopy.actionsColumn}
                  </TypographyTableHeading>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, index) => {
                  const links = getOrdersTableInvoiceLinks(order, activeOrder);
                  const presentation = getInvoiceOrderPresentation(
                    toInvoiceOrderStateFromHistory(order),
                  );
                  const hostedInvoiceUrl = presentation.hostedInvoiceUrl ?? links.hostedInvoiceUrl;
                  const invoicePdfUrl = presentation.invoicePdfUrl ?? links.invoicePdfUrl;

                  return (
                    <tr
                      key={`${order.id}-${index}`}
                      className="border-border/70 border-b last:border-b-0"
                    >
                      <TypographyTableCell className="px-3 py-2">
                        {order.subscriptionTier?.name ?? "—"}
                      </TypographyTableCell>
                      <TypographyTableCell className="px-3 py-2">
                        {formatBillingDateTable(order.startAt)}
                      </TypographyTableCell>
                      <TypographyTableCell className="px-3 py-2 tabular-nums">
                        {formatBillingHistoryMoney(
                          resolveHistoryOrderTotalForDisplay(order),
                          order.currency,
                        )}
                      </TypographyTableCell>
                      <TypographyTableCell className="px-3 py-2">
                        {getHistoryOrderStatus(order)}
                      </TypographyTableCell>
                      <TypographyTableCell className="px-3 py-2 text-right">
                        <OrdersTableInvoiceActions
                          hostedInvoiceUrl={hostedInvoiceUrl}
                          invoicePdfUrl={invoicePdfUrl}
                          showPayAction={presentation.showPayAction}
                        />
                      </TypographyTableCell>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AccountSectionShell>
  );
}
