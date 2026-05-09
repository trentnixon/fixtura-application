/**
 * Presentation helpers for GET /billing — maps API codes to readable copy.
 */

import {
  ACCESS_STATUS_LABELS,
  BILLING_AVAILABLE_ACTION_LABELS,
  BILLING_STATUS_LABELS,
} from "../_constants/billingSummaryLabels";

import type { BillingAccessBadgeVariant } from "../_types/billingSummaryLabels";

/** Normalise API status strings for dictionary lookup (case- and separator-agnostic). */
export function normalizeBillingCode(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function humanizeUnderscoreCode(key: string): string {
  return key
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * User-facing label for `billingStatus`. Falls back to Title Case from snake_case.
 */
export function labelForBillingStatus(code: string): string {
  const k = normalizeBillingCode(code);
  return BILLING_STATUS_LABELS[k] ?? humanizeUnderscoreCode(k);
}

/**
 * User-facing label for `accessStatus`.
 */
export function labelForAccessStatus(code: string): string {
  const k = normalizeBillingCode(code);
  return ACCESS_STATUS_LABELS[k] ?? humanizeUnderscoreCode(k);
}

/**
 * Subtle badge treatment for access — avoid strong colours unless clearly denied.
 */
export function accessStatusBadgeVariant(code: string): BillingAccessBadgeVariant {
  const k = normalizeBillingCode(code);
  if (k.includes("denied") || k === "locked" || k === "none") {
    return "destructive";
  }
  if (k === "pending") {
    return "outline";
  }
  if (k.includes("granted") || k === "full" || k === "active" || k === "trial") {
    return "secondary";
  }
  return "outline";
}

function normalizeActionKey(key: string): string {
  return key.trim();
}

/**
 * Returns a user-facing label for an available-action flag, or `null` if unmapped.
 */
export function labelForAvailableAction(key: string): string | null {
  const raw = normalizeActionKey(key);
  if (BILLING_AVAILABLE_ACTION_LABELS[raw] !== undefined) {
    return BILLING_AVAILABLE_ACTION_LABELS[raw] ?? null;
  }
  const k = normalizeBillingCode(raw);
  const underscored = raw.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
  return BILLING_AVAILABLE_ACTION_LABELS[k] ?? BILLING_AVAILABLE_ACTION_LABELS[underscored] ?? null;
}
