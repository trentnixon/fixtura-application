import {
  deriveBillingUiMode,
  getBillingDebugSnapshot,
  type BillingUiMode,
} from "../../../_core/billing-state";
import {
  parseOrderTotalRaw,
  resolveHistoryOrderTotalForDisplay,
} from "../../../_utils/orders/billingHistoryOrderUtils";
import {
  extractInvoiceLinksFromHistoryOrder,
  resolvePaidActiveInvoiceLinks,
} from "../../../_utils/orders/orderInvoiceLinks";
import { resolveHighlightedHistoryOrder } from "../pickHighlightedHistoryOrder";

import type { BillingDebugPanelSection } from "../../../_types/debug/billingDebugPanel";
import type {
  AccountBillingOrderHistoryDto,
  AccountBillingSummaryV1,
  InvoiceRequestSummary,
} from "@/types/api/account";

export type BillingHistoryDebugExtra = Record<string, string | number | boolean | null | undefined>;

export type BillingHistoryDebugQueryStatuses = {
  billing: string;
  invoiceRequests: string;
  orders: string;
};

export type BuildBillingHistoryDebugPanelInput = {
  summary: AccountBillingSummaryV1 | null;
  orders: AccountBillingOrderHistoryDto[];
  ordersMetaCount: number | null;
  invoiceRequests: InvoiceRequestSummary[];
  ordersLoadError: boolean;
  invoiceWithdrawError: string | null;
  cancelInvoiceRequestPending: boolean;
  queryStatuses: BillingHistoryDebugQueryStatuses;
  lifecycleExtra?: BillingHistoryDebugExtra;
};

function activeOrderFieldsPopulated(activeOrder: AccountBillingSummaryV1["activeOrder"]): boolean {
  if (!activeOrder) return false;
  return Boolean(
    activeOrder.stripe_status?.trim() ||
    activeOrder.payment_status?.trim() ||
    activeOrder.checkout_status?.trim(),
  );
}

function resolveCurrentOrderCardVariant(billingUiMode: BillingUiMode | null): string {
  if (billingUiMode === "paid_active") return "paid_active_status_card";
  if (billingUiMode === "active_trial") return "active_trial_status_card";
  return "legacy_detail";
}

function resolveEntitlementSource(
  snapshot: ReturnType<typeof getBillingDebugSnapshot> | null,
): string {
  if (!snapshot) return "unknown";
  const flags = snapshot.derivationFlags;
  if (flags.paidEntitlementFromSummaryActiveOrder) return "summary_active_order";
  if (flags.paidEntitlementFromOrderHistory) return "order_history";
  if (flags.paidEntitlementFromPlanOrBillingState) return "plan_or_billing_state";
  return "none";
}

function formatInvoiceRequestsByStatus(requests: InvoiceRequestSummary[]): string {
  const counts = new Map<string, number>();
  for (const request of requests) {
    const status = request.status?.trim() || "unknown";
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  if (counts.size === 0) return "—";
  return [...counts.entries()].map(([status, count]) => `${status}:${count}`).join(", ");
}

function isStripeChannel(channel: string | null | undefined): boolean {
  return channel?.trim().toLowerCase() === "stripe";
}

function boolLabel(value: boolean): string {
  return value ? "true" : "false";
}

export function buildBillingHistoryDebugPanel(input: BuildBillingHistoryDebugPanelInput): {
  extra: Record<string, string | number | boolean | null>;
  sections: BillingDebugPanelSection[];
} {
  const {
    summary,
    orders,
    ordersMetaCount,
    invoiceRequests,
    ordersLoadError,
    invoiceWithdrawError,
    cancelInvoiceRequestPending,
    queryStatuses,
    lifecycleExtra,
  } = input;

  const billingUiMode = summary ? deriveBillingUiMode(summary, { orders }) : null;
  const snapshot = summary ? getBillingDebugSnapshot(summary, { orders }) : null;
  const { order: highlightedOrder, matchReason } = resolveHighlightedHistoryOrder(
    orders,
    summary?.activeOrder ?? null,
  );
  const activeOrder = summary?.activeOrder ?? null;

  const highlightedRawTotal = highlightedOrder ? parseOrderTotalRaw(highlightedOrder.total) : null;
  const highlightedDisplayTotal = highlightedOrder
    ? resolveHistoryOrderTotalForDisplay(highlightedOrder)
    : null;
  const paidActiveInvoiceLinks = resolvePaidActiveInvoiceLinks(activeOrder, orders);

  const extra: Record<string, string | number | boolean | null> = {
    invoiceRequestsCount: invoiceRequests.length,
    ordersCount: orders.length,
    ordersQueryError: ordersLoadError,
    billingQueryStatus: queryStatuses.billing,
    invoiceRequestsQueryStatus: queryStatuses.invoiceRequests,
    ordersQueryStatus: queryStatuses.orders,
    ...lifecycleExtra,
  };

  const sections: BillingDebugPanelSection[] = [
    {
      title: "Alignment",
      entries: {
        summaryActiveOrderId: activeOrder?.id ?? null,
        historyHighlightedOrderId: highlightedOrder?.id ?? null,
        summaryStripeSubscriptionId: activeOrder?.stripe_subscription_id?.trim() || null,
        historyStripeSubscriptionId: highlightedOrder?.stripeSubscriptionId?.trim() || null,
        summaryVsHistoryIdsMatch: boolLabel(
          activeOrder?.id != null &&
            highlightedOrder?.id != null &&
            activeOrder.id === highlightedOrder.id,
        ),
        activeOrderFieldsPopulated: boolLabel(activeOrderFieldsPopulated(activeOrder)),
        entitlementSource: resolveEntitlementSource(snapshot),
      },
    },
    {
      title: "Current order UI",
      entries: {
        currentOrderCardVariant: billingUiMode
          ? resolveCurrentOrderCardVariant(billingUiMode)
          : "unknown",
        highlightedOrderMatchReason: matchReason,
        billingUiMode: billingUiMode ?? "null",
      },
    },
    {
      title: "Orders",
      entries: {
        ordersMetaCount,
        activeOrdersInHistoryCount: orders.filter((order) => order.isActive).length,
        stripeOrderCount: orders.filter((order) => isStripeChannel(order.paymentChannel)).length,
        nonStripeOrderCount: orders.filter((order) => !isStripeChannel(order.paymentChannel))
          .length,
        newestOrderId: orders[0]?.id ?? null,
        newestOrderStartAt: orders[0]?.startAt ?? null,
        highlightedOrderRawTotal: highlightedRawTotal,
        highlightedOrderDisplayTotal: highlightedDisplayTotal,
        highlightedOrderPaymentChannel: highlightedOrder?.paymentChannel ?? null,
        highlightedOrderTotalNormalizedFromCents: boolLabel(
          highlightedRawTotal != null &&
            highlightedDisplayTotal != null &&
            highlightedRawTotal !== highlightedDisplayTotal,
        ),
        summaryHostedInvoiceUrlPresent: boolLabel(Boolean(activeOrder?.hosted_invoice_url?.trim())),
        summaryInvoicePdfPresent: boolLabel(Boolean(activeOrder?.invoice_pdf?.trim())),
        highlightedOrderHostedInvoiceUrlPresent: boolLabel(
          highlightedOrder
            ? Boolean(extractInvoiceLinksFromHistoryOrder(highlightedOrder).hostedInvoiceUrl)
            : false,
        ),
        highlightedOrderInvoicePdfPresent: boolLabel(
          highlightedOrder
            ? Boolean(extractInvoiceLinksFromHistoryOrder(highlightedOrder).invoicePdfUrl)
            : false,
        ),
        resolvedPaidActiveInvoiceLinksPresent: boolLabel(
          Boolean(paidActiveInvoiceLinks.hostedInvoiceUrl || paidActiveInvoiceLinks.invoicePdfUrl),
        ),
      },
    },
    {
      title: "Invoice requests",
      entries: {
        invoiceRequestsByStatus: formatInvoiceRequestsByStatus(invoiceRequests),
        withdrawableCount: invoiceRequests.filter((request) => request.canWithdraw === true).length,
        latestSubmittedAt: invoiceRequests[0]?.submittedAt ?? null,
        latestRequestedStart: invoiceRequests[0]?.requestedStartDate ?? null,
        invoiceWithdrawError: invoiceWithdrawError ?? null,
        cancelInvoiceRequestPending: boolLabel(cancelInvoiceRequestPending),
        listMatchesSummaryLatest: boolLabel(
          (summary?.latestInvoiceRequest?.status ?? null) === (invoiceRequests[0]?.status ?? null),
        ),
      },
    },
  ];

  return { extra, sections };
}
