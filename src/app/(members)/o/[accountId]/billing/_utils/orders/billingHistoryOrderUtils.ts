import { getInvoiceOrderPresentation, toInvoiceOrderStateFromHistory } from "./invoiceOrderState";
import { resolveHistoryOrderSeasonPassStatus } from "./orderSeasonPassDisplayState";
import { normalizeBillingCode } from "../overview/billingSummaryLabels";

import type { AccountBillingOrderDto, AccountBillingOrderHistoryDto } from "@/types/api/account";

/** Stable match key for billing-summary `activeOrder` rows. */
export function normalizeSummaryOrderKey(order: AccountBillingOrderDto): string {
  const raw = order.id ?? order.invoice_number ?? order.stripe_subscription_id ?? order.Name ?? "";
  return String(raw).trim().toLowerCase();
}

export function normalizeHistoryOrderKey(order: AccountBillingOrderHistoryDto): string {
  const raw = order.id ?? order.stripeSubscriptionId ?? order.name ?? "";
  return String(raw).trim().toLowerCase();
}

export type ResolveOrderTotalForDisplayInput = {
  total: string | number | null;
  paymentChannel?: string | null;
  payment_channel?: string | null;
  subscriptionTierPrice?: number | null;
};

/** Parse CMS order total (string on history rows, number on billing summary). */
export function parseOrderTotalRaw(total: string | number | null): number | null {
  if (total == null) return null;
  if (typeof total === "number") {
    return Number.isFinite(total) ? total : null;
  }
  const trimmed = String(total).trim();
  if (trimmed === "") return null;
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizePaymentChannel(channel: string | null | undefined): string {
  return channel?.trim().toLowerCase() ?? "";
}

function isStripePaymentChannel(channel: string | null | undefined): boolean {
  return normalizePaymentChannel(channel) === "stripe";
}

/**
 * Display amount in currency units (e.g. AUD dollars).
 * Some Stripe-backed CMS rows store cents in `total`; reconcile using tier price when possible.
 */
export function resolveOrderTotalForDisplay(
  input: ResolveOrderTotalForDisplayInput,
): number | null {
  const parsed = parseOrderTotalRaw(input.total);
  if (parsed == null) return null;

  const tierPrice = input.subscriptionTierPrice;
  if (tierPrice != null && Number.isFinite(tierPrice)) {
    const centsCandidate = tierPrice * 100;
    if (parsed === centsCandidate) {
      return tierPrice;
    }
  }

  const paymentChannel = input.paymentChannel ?? input.payment_channel;
  if (
    isStripePaymentChannel(paymentChannel) &&
    tierPrice != null &&
    Number.isFinite(tierPrice) &&
    parsed >= 1000 &&
    Number.isInteger(parsed) &&
    parsed / 100 === tierPrice
  ) {
    return tierPrice;
  }

  return parsed;
}

export function resolveHistoryOrderTotalForDisplay(
  order: AccountBillingOrderHistoryDto,
): number | null {
  return resolveOrderTotalForDisplay({
    total: order.total,
    paymentChannel: order.paymentChannel,
    subscriptionTierPrice: order.subscriptionTier?.price ?? null,
  });
}

export function resolveSummaryOrderTotalForDisplay(order: AccountBillingOrderDto): number | null {
  return resolveOrderTotalForDisplay({
    total: order.total,
    payment_channel: order.payment_channel,
    subscriptionTierPrice: order.subscriptionTier?.price ?? null,
  });
}

/** @deprecated Prefer resolveHistoryOrderTotalForDisplay for UI formatting. */
export function parseHistoryOrderTotal(total: string | null): number | null {
  return parseOrderTotalRaw(total);
}

export function getHistoryOrderStatus(order: AccountBillingOrderHistoryDto): string {
  const seasonPassStatus = resolveHistoryOrderSeasonPassStatus(order);
  if (seasonPassStatus != null) {
    return seasonPassStatus;
  }

  const presentation = getInvoiceOrderPresentation(toInvoiceOrderStateFromHistory(order));
  if (presentation.awaitingPayment || presentation.paidActive || presentation.cancelled) {
    return presentation.statusLabel;
  }

  const raw = order.stripeStatus ?? order.paymentStatus ?? order.checkoutStatus ?? "—";
  if (raw === "—") return raw;
  if (normalizeBillingCode(raw) === "invoice_issued") {
    return "Invoice issued";
  }
  return raw;
}

export function historyRowMatchesSummaryActiveOrder(
  row: AccountBillingOrderHistoryDto,
  active: AccountBillingOrderDto | null,
): boolean {
  if (!active) return false;
  const aSub = active.stripe_subscription_id?.trim().toLowerCase() ?? "";
  const rSub = row.stripeSubscriptionId?.trim().toLowerCase() ?? "";
  if (aSub && rSub && aSub === rSub) return true;
  if (active.id != null && row.id === active.id) return true;
  const ak = normalizeSummaryOrderKey(active);
  const rk = normalizeHistoryOrderKey(row);
  return ak !== "" && rk !== "" && ak === rk;
}

function trimIso(value: string | null | undefined): string | null {
  const t = value?.trim() ?? "";
  return t !== "" ? t : null;
}

/**
 * Billing summary uses `startOrderAt` / `endOrderAt`; GET /orders uses `startAt` / `endAt`.
 * Merge both so the overview can show the current period when either API returns dates.
 */
export function resolvePaidSubscriptionPeriodBounds(
  activeOrder: AccountBillingOrderDto | null,
  orders: AccountBillingOrderHistoryDto[] | null | undefined,
): { startIso: string | null; endIso: string | null } {
  const fromSummaryStart = trimIso(activeOrder?.startOrderAt ?? null);
  const fromSummaryEnd = trimIso(activeOrder?.endOrderAt ?? null);
  if (fromSummaryStart && fromSummaryEnd) {
    return { startIso: fromSummaryStart, endIso: fromSummaryEnd };
  }

  const list = orders ?? [];
  const paidActive = list.filter((row) => row.isPaid === true && row.isActive === true);

  let row: AccountBillingOrderHistoryDto | undefined;
  if (activeOrder) {
    row = paidActive.find((r) => historyRowMatchesSummaryActiveOrder(r, activeOrder));
  }
  if (!row && paidActive.length > 0) {
    row = paidActive.find((r) => trimIso(r.startAt) && trimIso(r.endAt)) ?? paidActive[0];
  }

  const fromHistoryStart = row ? trimIso(row.startAt) : null;
  const fromHistoryEnd = row ? trimIso(row.endAt) : null;

  const startIso = fromSummaryStart || fromHistoryStart;
  const endIso = fromSummaryEnd || fromHistoryEnd;

  if (startIso && endIso) {
    return { startIso, endIso };
  }

  return {
    startIso: startIso ?? null,
    endIso: endIso ?? null,
  };
}

/**
 * Inclusive calendar-day span of the subscription window (UTC date boundaries).
 * Uses `endAt` when set; if missing and the order is active, uses `referenceDate` (default: now).
 */
export function getHistoryOrderSubscriptionDayCount(
  order: AccountBillingOrderHistoryDto,
  referenceDate: Date = new Date(),
): number | null {
  const rawStart = order.startAt?.trim() ?? "";
  if (rawStart === "") return null;
  const startMs = Date.parse(rawStart);
  if (Number.isNaN(startMs)) return null;

  let endMs: number;
  const rawEnd = order.endAt?.trim() ?? "";
  if (rawEnd !== "") {
    const parsed = Date.parse(rawEnd);
    if (Number.isNaN(parsed)) return null;
    endMs = parsed;
  } else if (order.isActive) {
    endMs = referenceDate.getTime();
  } else {
    return null;
  }

  const s = new Date(startMs);
  const e = new Date(endMs);
  const d0 = Date.UTC(s.getUTCFullYear(), s.getUTCMonth(), s.getUTCDate());
  const d1 = Date.UTC(e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate());
  const between = Math.round((d1 - d0) / 86400000);
  if (between < 0) return null;
  return between + 1;
}
