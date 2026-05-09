import type { BillingUiMode } from "../../_core/billing-state";
import type { BillingInvoiceRequestBodyFields } from "../../_types/invoice-request/billingInvoiceRequest";
import type {
  AvailableBillingTier,
  PostAccountBillingInvoiceRequestBody,
} from "@/types/api/account";

export function formatBillingInvoiceTierMoney(
  amount: number | null,
  currency: string | null,
): string {
  if (amount == null) return "—";
  const c = currency?.trim() || "AUD";
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c }).format(amount);
  } catch {
    return `${amount} ${c}`;
  }
}

/** Local `datetime-local` minimum: `YYYY-MM-DDTHH:mm` in the user's timezone. */
export function localBillingInvoiceDatetimeInputMin(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
}

export function truncateBillingInvoiceDescription(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

export function billingInvoiceTierKey(tier: AvailableBillingTier): string {
  return String(tier.id);
}

export type ShouldShowInvoiceRequestOptions = {
  /** Hide invoice funnel when the account is already in a paid-active UI state. */
  billingUiMode?: BillingUiMode;
};

/**
 * Show invoice request when API allows it, or when `availableActions` is absent / empty
 * (flags not yet returned by CMS).
 */
export function shouldShowInvoiceRequest(
  actions: Partial<Record<string, boolean>> | undefined,
  options?: ShouldShowInvoiceRequestOptions,
): boolean {
  if (options?.billingUiMode === "paid_active") {
    return false;
  }
  if (actions == null) {
    return true;
  }
  if (actions["canRequestInvoice"] === true || actions["can_request_invoice"] === true) {
    return true;
  }
  return Object.keys(actions).length === 0;
}

export function buildBillingInvoiceRequestBody(
  fields: BillingInvoiceRequestBodyFields,
): PostAccountBillingInvoiceRequestBody {
  const {
    selectedTierId,
    startParsed,
    billingContactName,
    billingEmail,
    billingOrganisationName,
    notes,
  } = fields;

  if (!selectedTierId || Number.isNaN(startParsed.getTime())) {
    throw new Error("Invalid form state");
  }

  const body: PostAccountBillingInvoiceRequestBody = {
    subscriptionTierId: selectedTierId,
    requestedStartDate: startParsed.toISOString(),
    billingContactName: billingContactName.trim(),
    billingEmail: billingEmail.trim(),
    billingOrganisationName: billingOrganisationName.trim(),
  };
  const n = notes.trim();
  if (n.length > 0) {
    body.notes = n;
  }
  return body;
}

export function parseBillingInvoiceStartLocal(requestedStartLocal: string): Date | null {
  if (requestedStartLocal.length === 0) return null;
  return new Date(requestedStartLocal);
}

const START_GRACE_MS = 60_000;

export function isBillingInvoiceRequestedStartValid(startParsed: Date | null): boolean {
  return (
    startParsed != null &&
    !Number.isNaN(startParsed.getTime()) &&
    startParsed.getTime() >= Date.now() - START_GRACE_MS
  );
}

export function isBillingInvoiceRequestRequiredFilled(fields: {
  billingContactName: string;
  billingEmail: string;
  billingOrganisationName: string;
}): boolean {
  return (
    fields.billingContactName.trim().length > 0 &&
    fields.billingEmail.trim().length > 0 &&
    fields.billingOrganisationName.trim().length > 0
  );
}
