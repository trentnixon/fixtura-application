import {
  ORDER_ACCOUNT_EXPIRING_SOON_COPY,
  ORDER_PAID_AWAITING_START_COPY,
  ORDER_SEASON_PASS_ENDING_SOON_MAX_DAYS,
} from "../../_constants/orders/orderSeasonPassDisplay";
import { normalizeBillingCode } from "../overview/billingSummaryLabels";

import type { AccountBillingOrderDto, AccountBillingOrderHistoryDto } from "@/types/api/account";

const SYDNEY_TZ = "Australia/Sydney";
const YMD_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type SeasonPassOrderDisplayInput = {
  orderPaid: boolean;
  isActive: boolean;
  paymentStatus: string | null;
  checkoutStatus: string | null;
  startOrderAt: string | null;
  endOrderAt: string | null;
};

export type SeasonPassDisplayOptions = {
  referenceDate?: Date;
};

export type EndingSoonContext = {
  daysUntilEnd: number;
  endIso: string | null;
};

function normalizedStatus(value: string | null | undefined): string {
  if (value == null || value === "") return "";
  return normalizeBillingCode(value);
}

/** Extract CMS date-only `YYYY-MM-DD` from an ISO or date string. */
export function parseOrderCalendarDate(value: string | null | undefined): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  if (trimmed.length < 10) return null;
  const ymd = trimmed.slice(0, 10);
  return YMD_PATTERN.test(ymd) ? ymd : null;
}

/** Today's calendar date in Australia/Sydney as `YYYY-MM-DD`. */
export function sydneyTodayYmd(options?: SeasonPassDisplayOptions): string {
  return formatSydneyYmd(options?.referenceDate ?? new Date());
}

function formatSydneyYmd(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SYDNEY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function ymdToUtcMs(ymd: string): number {
  const [year, month, day] = ymd.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/** Whole calendar days from `fromYmd` to `toYmd` (both inclusive YYYY-MM-DD). */
export function sydneyCalendarDayDiff(fromYmd: string, toYmd: string): number {
  return Math.round((ymdToUtcMs(toYmd) - ymdToUtcMs(fromYmd)) / 86400000);
}

/** Days from Sydney today until `targetYmd`; negative when target is in the past. */
export function sydneyDaysUntil(targetYmd: string, options?: SeasonPassDisplayOptions): number {
  return sydneyCalendarDayDiff(sydneyTodayYmd(options), targetYmd);
}

export function formatDaysCountLine(days: number, singular: string, plural: string): string {
  if (days === 1) return `1 ${singular}`;
  return `${days} ${plural}`;
}

export function formatPaidAwaitingStartStatus(daysUntilStart: number): string {
  const dayPart = formatDaysCountLine(daysUntilStart, "day", "days");
  return `${ORDER_PAID_AWAITING_START_COPY.statusPrefix}${dayPart}${ORDER_PAID_AWAITING_START_COPY.statusSuffix}`;
}

export function formatPaidAwaitingStartDaysLine(daysUntilStart: number): string {
  if (daysUntilStart === 0) {
    return "Your Season Pass starts today.";
  }
  return `About ${daysUntilStart} day${daysUntilStart === 1 ? "" : "s"} until your Season Pass starts.`;
}

export function paidAwaitingStartBadgeLabel(): string {
  return ORDER_PAID_AWAITING_START_COPY.badgeLabel;
}

export function formatAccountExpiringSoonStatus(daysUntilEnd: number): string {
  const dayPart = formatDaysCountLine(daysUntilEnd, "day", "days");
  return `${ORDER_ACCOUNT_EXPIRING_SOON_COPY.bodyPrefix}${dayPart}${ORDER_ACCOUNT_EXPIRING_SOON_COPY.bodySuffix}`;
}

export function formatAccountExpiringSoonBannerBody(daysUntilEnd: number): string {
  return formatAccountExpiringSoonStatus(daysUntilEnd);
}

export function hasPaidAwaitingStartInOrders(
  orders: AccountBillingOrderHistoryDto[] | null | undefined,
  options?: SeasonPassDisplayOptions,
): boolean {
  return findPaidAwaitingStartOrder(orders, options) != null;
}

export function toSeasonPassOrderDisplayFromHistory(
  order: AccountBillingOrderHistoryDto,
): SeasonPassOrderDisplayInput {
  return {
    orderPaid: order.isPaid === true || order.orderPaid === true,
    isActive: order.isActive === true,
    paymentStatus: order.paymentStatus ?? null,
    checkoutStatus: order.checkoutStatus ?? null,
    startOrderAt: order.startAt ?? null,
    endOrderAt: order.endAt ?? null,
  };
}

export function toSeasonPassOrderDisplayFromSummary(
  order: AccountBillingOrderDto,
): SeasonPassOrderDisplayInput {
  return {
    orderPaid: order.OrderPaid === true,
    isActive: order.isActive === true,
    paymentStatus: order.payment_status ?? null,
    checkoutStatus: order.checkout_status ?? null,
    startOrderAt: order.startOrderAt ?? null,
    endOrderAt: order.endOrderAt ?? null,
  };
}

/**
 * Paid + complete checkout + inactive with a future Sydney start date.
 * Matches CMS paid-awaiting-start lifecycle before activation cron runs.
 */
export function isOrderPaidAwaitingStart(
  order: SeasonPassOrderDisplayInput,
  options?: SeasonPassDisplayOptions,
): boolean {
  if (order.orderPaid !== true) return false;
  if (order.isActive === true) return false;

  const pay = normalizedStatus(order.paymentStatus);
  const checkout = normalizedStatus(order.checkoutStatus);
  if (pay !== "paid") return false;
  if (checkout !== "complete") return false;

  const startYmd = parseOrderCalendarDate(order.startOrderAt);
  if (startYmd == null) return false;

  return sydneyDaysUntil(startYmd, options) > 0;
}

export function paidAwaitingStartDaysUntil(
  order: SeasonPassOrderDisplayInput,
  options?: SeasonPassDisplayOptions,
): number | null {
  if (!isOrderPaidAwaitingStart(order, options)) return null;
  const startYmd = parseOrderCalendarDate(order.startOrderAt);
  if (startYmd == null) return null;
  return sydneyDaysUntil(startYmd, options);
}

/**
 * Active paid pass within the ending-soon window (≤7 Sydney calendar days to end).
 */
export function isOrderEndingSoon(
  order: SeasonPassOrderDisplayInput,
  options?: SeasonPassDisplayOptions,
): boolean {
  if (order.orderPaid !== true) return false;
  if (order.isActive !== true) return false;

  const pay = normalizedStatus(order.paymentStatus);
  const checkout = normalizedStatus(order.checkoutStatus);
  if (pay !== "paid") return false;
  if (checkout !== "active") return false;

  const endYmd = parseOrderCalendarDate(order.endOrderAt);
  if (endYmd == null) return false;

  const daysUntilEnd = sydneyDaysUntil(endYmd, options);
  return daysUntilEnd >= 0 && daysUntilEnd <= ORDER_SEASON_PASS_ENDING_SOON_MAX_DAYS;
}

export function endingSoonDaysUntil(
  order: SeasonPassOrderDisplayInput,
  options?: SeasonPassDisplayOptions,
): number | null {
  if (!isOrderEndingSoon(order, options)) return null;
  const endYmd = parseOrderCalendarDate(order.endOrderAt);
  if (endYmd == null) return null;
  return sydneyDaysUntil(endYmd, options);
}

export function findPaidAwaitingStartOrder(
  orders: AccountBillingOrderHistoryDto[] | null | undefined,
  options?: SeasonPassDisplayOptions,
): AccountBillingOrderHistoryDto | null {
  if (!orders?.length) return null;
  return (
    orders.find((row) =>
      isOrderPaidAwaitingStart(toSeasonPassOrderDisplayFromHistory(row), options),
    ) ?? null
  );
}

export function paidAwaitingStartDaysForOrder(
  order: AccountBillingOrderHistoryDto,
  options?: SeasonPassDisplayOptions,
): number | null {
  return paidAwaitingStartDaysUntil(toSeasonPassOrderDisplayFromHistory(order), options);
}

export function resolveEndingSoonContext(
  activeOrder: AccountBillingOrderDto | null,
  orders: AccountBillingOrderHistoryDto[] | null | undefined,
  options?: SeasonPassDisplayOptions,
): EndingSoonContext | null {
  if (activeOrder) {
    const display = toSeasonPassOrderDisplayFromSummary(activeOrder);
    const daysUntilEnd = endingSoonDaysUntil(display, options);
    if (daysUntilEnd != null) {
      return { daysUntilEnd, endIso: activeOrder.endOrderAt ?? null };
    }
  }

  const activeHistory = orders?.find((row) =>
    isOrderEndingSoon(toSeasonPassOrderDisplayFromHistory(row), options),
  );
  if (!activeHistory) return null;

  const daysUntilEnd = endingSoonDaysUntil(
    toSeasonPassOrderDisplayFromHistory(activeHistory),
    options,
  );
  if (daysUntilEnd == null) return null;

  return { daysUntilEnd, endIso: activeHistory.endAt ?? null };
}

export function shouldShowAccountExpiringSoonBanner(
  billingUiMode: string,
  activeOrder: AccountBillingOrderDto | null,
  orders: AccountBillingOrderHistoryDto[] | null | undefined,
  options?: SeasonPassDisplayOptions,
): boolean {
  if (billingUiMode !== "paid_active") return false;
  return resolveEndingSoonContext(activeOrder, orders, options) != null;
}

export function resolveHistoryOrderSeasonPassStatus(
  order: AccountBillingOrderHistoryDto,
  options?: SeasonPassDisplayOptions,
): string | null {
  const display = toSeasonPassOrderDisplayFromHistory(order);
  const awaitingDays = paidAwaitingStartDaysUntil(display, options);
  if (awaitingDays != null) {
    return formatPaidAwaitingStartStatus(awaitingDays);
  }
  const endingDays = endingSoonDaysUntil(display, options);
  if (endingDays != null) {
    return formatAccountExpiringSoonStatus(endingDays);
  }
  return null;
}

export function resolveSummaryOrderSeasonPassStatus(
  order: AccountBillingOrderDto,
  options?: SeasonPassDisplayOptions,
): string | null {
  const display = toSeasonPassOrderDisplayFromSummary(order);
  const awaitingDays = paidAwaitingStartDaysUntil(display, options);
  if (awaitingDays != null) {
    return formatPaidAwaitingStartStatus(awaitingDays);
  }
  const endingDays = endingSoonDaysUntil(display, options);
  if (endingDays != null) {
    return formatAccountExpiringSoonStatus(endingDays);
  }
  return null;
}
