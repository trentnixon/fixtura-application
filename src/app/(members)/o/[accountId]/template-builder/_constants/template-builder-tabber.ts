import { cn } from "@/lib/utils";

/** card.standard.promo-premium surface — rounded to match pill CTAs */
export const CARD_STANDARD_PROMO_PREMIUM_SURFACE_CLASS =
  "rounded-full border-none bg-primary/5 ring-1 ring-primary/20";

/** Promo toolbar shell — step tabs + actions row */
export const TEMPLATE_BUILDER_PROMO_TOOLBAR_SURFACE_CLASS = cn(
  CARD_STANDARD_PROMO_PREMIUM_SURFACE_CLASS,
  "p-2",
);

/** Promo toolbar shell — preview asset select + branding summary */
export const TEMPLATE_BUILDER_PREVIEW_TOOLBAR_SURFACE_CLASS = cn(
  TEMPLATE_BUILDER_PROMO_TOOLBAR_SURFACE_CLASS,
  "mx-2",
);

/** Sub-picker shell — background asset row; rounded-lg matches inner tiles */
export const TEMPLATE_BUILDER_SUB_PICKER_SURFACE_CLASS = cn(
  "rounded-lg border-none bg-primary/10 ring-1 ring-primary/25",
  "mx-2 px-2 py-1.5",
);

/** tabber.pill.borderless.brand-accent — see sandbox/kitchen-sink/tabber/page.tsx */
export const TABBER_PILL_BORDERLESS_BRAND_ACCENT_LIST_CLASS =
  "flex h-auto flex-wrap items-center gap-2 border-0 bg-transparent p-0 shadow-none";

export const TABBER_PILL_BORDERLESS_BRAND_ACCENT_TRIGGER_CLASS =
  "cursor-pointer rounded-full border border-[var(--brand-accent)]/40 bg-brand-accent/10 px-4 py-1.5 text-xs text-muted-foreground shadow-none sm:px-6 sm:py-2 sm:text-sm lg:px-8 data-[state=active]:border-[var(--brand-accent)] data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-white data-[state=active]:shadow-none";
