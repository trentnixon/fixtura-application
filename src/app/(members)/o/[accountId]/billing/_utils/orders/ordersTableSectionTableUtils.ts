import { normalizeHistoryOrderKey } from "./billingHistoryOrderUtils";
import { resolveHistoryOrderInvoiceLinks } from "./orderInvoiceLinks";

import type { AccountBillingOrderDto, AccountBillingOrderHistoryDto } from "@/types/api/account";

export function getOrdersTableRowKey(order: AccountBillingOrderHistoryDto, index: number): string {
  return `${normalizeHistoryOrderKey(order) || "order"}-${index}`;
}

/** Stripe invoice links from the history row or matching billing summary active order. */
export function getOrdersTableInvoiceLinks(
  order: AccountBillingOrderHistoryDto,
  activeOrder: AccountBillingOrderDto | null,
): { hostedInvoiceUrl: string | null; invoicePdfUrl: string | null } {
  return resolveHistoryOrderInvoiceLinks(order, activeOrder);
}
