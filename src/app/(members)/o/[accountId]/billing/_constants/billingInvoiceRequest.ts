/** Max characters for tier description preview in the invoice request tier list. */
export const BILLING_INVOICE_REQUEST_TIER_DESCRIPTION_MAX = 220;

/** Stable `id` / `htmlFor` values for the invoice request form. */
export const billingInvoiceRequestFormIds = {
  requestedStart: "invoice-requested-start",
  contactName: "invoice-contact-name",
  billingEmail: "invoice-billing-email",
  organisationName: "invoice-org-name",
  notes: "invoice-notes",
} as const;

/** User-visible copy for the invoice request form (labels, hints, status text). */
export const billingInvoiceRequestFormCopy = {
  noPlansAvailable: "No plans are available for this account right now.",
  tierRadiogroupAriaLabel: "Subscription tier",
  requestedStart: {
    label: "Requested subscription start",
    hintLocalUtc: "(local time, stored as UTC ISO)",
    help: "Must be now or a future time.",
  },
  billingContactName: "Billing contact name",
  billingEmail: "Billing email",
  organisationName: "Organisation name",
  notesOptional: "Notes (optional)",
  submit: "Submit invoice request",
  submitting: "Submitting…",
} as const;

export const billingInvoiceRequestInputClass =
  "border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-full border px-4 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

export const billingInvoiceRequestTextareaClass =
  "border-input bg-background ring-offset-background focus-visible:ring-ring min-h-[88px] w-full rounded-lg border px-4 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

/** Tier radiogroup container (`role="radiogroup"`). */
export const billingInvoiceRequestTierRadiogroupClass = "grid gap-2";

/** Tier option button base + selected ring (`role="radio"`). */
export const billingInvoiceRequestTierRadioButtonBaseClass =
  "border-border hover:bg-muted/40 rounded-lg border p-4 text-left transition-colors";

export const billingInvoiceRequestTierRadioButtonSelectedClass = "border-primary ring-ring ring-2";

/** No-tiers empty state line (matches other form status text weight). */
export const billingInvoiceRequestTierEmptyStatusClass = "text-muted-foreground text-sm";

/** Typography for text inside a tier radio card. */
export const billingInvoiceRequestTierRadioTextClass = {
  primary: "text-foreground font-medium",
  title: "text-muted-foreground mt-0.5 text-sm",
  description: "text-muted-foreground mt-2 text-xs leading-relaxed",
  price: "mt-2 text-sm font-medium tabular-nums",
} as const;
