import { parseInstant } from "./billing-state-helpers";
import { DAY_IN_MS } from "../_constants/billing-state";

import type { DeriveBillingUiModeOptions } from "../_types/billing-state";

/**
 * Whole days remaining from reference date until `endDate` (exclusive of partial last day).
 * Returns `null` if end is missing or invalid.
 */
export function trialDaysRemaining(
  endDateIso: string | null | undefined,
  options?: DeriveBillingUiModeOptions,
): number | null {
  const referenceDate = options?.referenceDate ?? new Date();
  const endMs = parseInstant(endDateIso ?? null);
  if (endMs === null) {
    return null;
  }
  const diffMs = endMs - referenceDate.getTime();
  if (diffMs <= 0) {
    return 0;
  }
  return Math.ceil(diffMs / DAY_IN_MS);
}

/**
 * Trial progress 0-100 aligned with {@link trialDaysRemaining} (whole-day model): elapsed days /
 * total whole days between start and end. Returns `null` if bounds are missing or invalid.
 */
export function trialElapsedProgressPercent(
  startDateIso: string | null | undefined,
  endDateIso: string | null | undefined,
  options?: DeriveBillingUiModeOptions,
): number | null {
  const startMs = parseInstant(startDateIso ?? null);
  const endMs = parseInstant(endDateIso ?? null);
  if (startMs === null || endMs === null) {
    return null;
  }
  const totalMs = endMs - startMs;
  if (totalMs <= 0) {
    return null;
  }
  const totalDays = Math.max(1, Math.ceil(totalMs / DAY_IN_MS));
  const remaining = trialDaysRemaining(endDateIso, options);
  if (remaining === null) {
    return null;
  }
  const elapsedDays = Math.min(totalDays, Math.max(0, totalDays - remaining));
  return Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
}

/**
 * Whole days left inside `[startDateIso, endDateIso]` - counts only up to renewal from the
 * later of reference date or period start (so we never report more days than the subscribed
 * window, e.g. when today is before `startOrderAt`).
 */
export function billingPeriodDaysRemaining(
  startDateIso: string | null | undefined,
  endDateIso: string | null | undefined,
  options?: DeriveBillingUiModeOptions,
): number | null {
  const startMs = parseInstant(startDateIso ?? null);
  const endMs = parseInstant(endDateIso ?? null);
  if (startMs === null || endMs === null || endMs <= startMs) {
    return null;
  }
  const refMs = (options?.referenceDate ?? new Date()).getTime();
  const effectiveRefMs = Math.max(refMs, startMs);
  const diffMs = endMs - effectiveRefMs;
  if (diffMs <= 0) {
    return 0;
  }
  return Math.ceil(diffMs / DAY_IN_MS);
}

/** Continuous 0-100% elapsed through the billing window (`start`->`end`), clamped by reference date. */
export function billingPeriodElapsedProgressPercent(
  startDateIso: string | null | undefined,
  endDateIso: string | null | undefined,
  options?: DeriveBillingUiModeOptions,
): number | null {
  const startMs = parseInstant(startDateIso ?? null);
  const endMs = parseInstant(endDateIso ?? null);
  if (startMs === null || endMs === null || endMs <= startMs) {
    return null;
  }
  const refMs = (options?.referenceDate ?? new Date()).getTime();
  if (refMs <= startMs) {
    return 0;
  }
  if (refMs >= endMs) {
    return 100;
  }
  const elapsed = refMs - startMs;
  const total = endMs - startMs;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}
