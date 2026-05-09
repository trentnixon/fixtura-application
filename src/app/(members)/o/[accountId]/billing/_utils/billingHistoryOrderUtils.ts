import { normalizeBillingCode } from "./billingSummaryLabels";

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

export function parseHistoryOrderTotal(total: string | null): number | null {
  if (total == null || String(total).trim() === "") return null;
  const n = Number.parseFloat(String(total));
  return Number.isFinite(n) ? n : null;
}

export function getHistoryOrderStatus(order: AccountBillingOrderHistoryDto): string {
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
