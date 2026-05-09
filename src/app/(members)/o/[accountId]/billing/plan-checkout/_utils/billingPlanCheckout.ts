import type { AvailableBillingTier } from "@/types/api/account";

export function formatBillingPlanCheckoutMoney(
  amount: number | null,
  currency: string | null,
): string {
  if (amount == null) return "--";
  const c = currency?.trim() || "AUD";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(amount);
  } catch {
    return `${amount} ${c}`;
  }
}

/** True when `startDate` is a non-empty YYYY-MM-DD on or after `minDate` (same format). */
export function isBillingPlanCheckoutStartDateValid(startDate: string, minDate: string): boolean {
  return startDate.length > 0 && startDate >= minDate;
}

/** YYYY-MM-DD for `<input type="date" min="..." />` in local calendar. */
export function localBillingPlanCheckoutDateInputToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function truncateBillingPlanCheckoutDescription(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 3)}...`;
}

export function billingPlanCheckoutTierKey(tier: AvailableBillingTier): string {
  return String(tier.id);
}

/**
 * Show plan checkout when API explicitly allows it, or when `availableActions` is absent / empty
 * (flags not yet returned by CMS).
 * Strapi billing v1 may expose hosted checkout via `canStartCheckout` / `can_start_checkout`.
 */
export function shouldShowPlanCheckout(
  actions: Partial<Record<string, boolean>> | undefined,
): boolean {
  if (actions == null) {
    return true;
  }
  if (
    actions["canCheckout"] === true ||
    actions["can_checkout"] === true ||
    actions["canSubscribe"] === true ||
    actions["can_subscribe"] === true ||
    actions["canStartCheckout"] === true ||
    actions["can_start_checkout"] === true
  ) {
    return true;
  }
  return Object.keys(actions).length === 0;
}
