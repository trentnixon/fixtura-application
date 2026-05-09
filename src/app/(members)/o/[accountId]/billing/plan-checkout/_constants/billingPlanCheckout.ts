/** Max characters for tier description preview in the plan checkout tier list. */
export const BILLING_PLAN_CHECKOUT_TIER_DESCRIPTION_MAX = 220;

/** Stable `id` / `htmlFor` values for the plan checkout form. */
export const billingPlanCheckoutFormIds = {
  startDate: "billing-start-date",
} as const;

/** User-visible copy for the plan checkout form (labels, hints, status text). */
export const billingPlanCheckoutFormCopy = {
  choosePlanTitle: "Choose a plan",
  choosePlanDescription:
    "Select a subscription tier and start date, then continue to Stripe to pay by card.",
  noPlansAvailable: "No plans are available for this account right now.",
  tierRadiogroupAriaLabel: "Subscription tier",
  startDate: {
    label: "Subscription start date",
    hint: "Must be today or a future date.",
  },
  missingCheckoutUrl:
    "Checkout URL missing from the server response. Please try again or contact support.",
  continueToPayment: "Continue to payment",
  startingCheckout: "Starting checkout...",
} as const;

export const billingPlanCheckoutDateInputClass =
  "border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-full border px-4 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

/** Tier radiogroup container (`role="radiogroup"`). */
export const billingPlanCheckoutTierRadiogroupClass = "grid gap-2";

/** Tier option button base + selected ring (`role="radio"`). */
export const billingPlanCheckoutTierRadioButtonBaseClass =
  "border-border hover:bg-muted/40 rounded-lg border p-4 text-left transition-colors";

export const billingPlanCheckoutTierRadioButtonSelectedClass = "border-primary ring-ring ring-2";

/** No-tiers empty state line (matches other form status text weight). */
export const billingPlanCheckoutTierEmptyStatusClass = "text-muted-foreground text-sm";

/** Typography for text inside a tier radio card. */
export const billingPlanCheckoutTierRadioTextClass = {
  primary: "text-foreground font-medium",
  title: "text-muted-foreground mt-0.5 text-sm",
  description: "text-muted-foreground mt-2 text-xs leading-relaxed",
  price: "mt-2 text-sm font-medium tabular-nums",
} as const;
