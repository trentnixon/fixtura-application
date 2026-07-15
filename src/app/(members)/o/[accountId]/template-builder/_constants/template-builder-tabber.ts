import { cn } from "@/lib/utils";

/** card.standard.promo-premium surface — rounded to match pill CTAs */
export const CARD_STANDARD_PROMO_PREMIUM_SURFACE_CLASS =
  "rounded-full border-none bg-primary/5 ring-1 ring-primary/20";

/** Promo toolbar shell — preview asset select + branding summary */
export const TEMPLATE_BUILDER_PREVIEW_TOOLBAR_SURFACE_CLASS = cn(
  CARD_STANDARD_PROMO_PREMIUM_SURFACE_CLASS,
  "p-2",
);

/** Workspace top bar — Reset / Save + status */
export const TEMPLATE_BUILDER_WORKSPACE_HEADER_CLASS =
  "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between";

/** Desktop split: tool rail | preview canvas */
export const TEMPLATE_BUILDER_WORKSPACE_GRID_CLASS =
  "grid gap-4 lg:grid-cols-[minmax(280px,22rem)_minmax(0,1fr)] lg:items-start lg:gap-6";

/** Left tool rail — sticky on desktop, scrolls independently */
export const TEMPLATE_BUILDER_TOOL_RAIL_CLASS = cn(
  "border-white/15 bg-primary-950 flex min-w-0 flex-col gap-3 rounded-xl border p-3 text-white",
  "lg:sticky lg:top-4 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto",
);

/** Vertical (desktop) / horizontal (mobile) group nav — matches options surface */
export const TEMPLATE_BUILDER_RAIL_NAV_SURFACE_CLASS = cn(
  "rounded-lg border-none bg-white/10 ring-1 ring-white/20",
  "p-1.5",
);

export const TEMPLATE_BUILDER_RAIL_NAV_LIST_CLASS =
  "grid grid-cols-2 gap-1.5 border-0 bg-transparent p-0 shadow-none";

export const TEMPLATE_BUILDER_RAIL_NAV_TRIGGER_CLASS = cn(
  "cursor-pointer flex items-center justify-start rounded-md border border-transparent px-3 py-2 text-left text-sm font-medium text-white/70 shadow-none transition-colors",
  "hover:bg-white/10 hover:text-white",
  "data-[state=active]:border-white/20 data-[state=active]:bg-white/20 data-[state=active]:text-white",
  "w-full",
);

/** Sub-picker shell inside the rail — mid blue from same primary scale as rail */
export const TEMPLATE_BUILDER_SUB_PICKER_SURFACE_CLASS = cn(
  "rounded-lg border-none bg-primary-50 text-neutral-900 ring-1 ring-black/10",
  "px-2 py-1.5",
  "[&_.text-muted-foreground]:text-neutral-600",
);

/** @deprecated Prefer TEMPLATE_BUILDER_WORKSPACE_HEADER_CLASS / rail nav */
export const TEMPLATE_BUILDER_PROMO_TOOLBAR_SURFACE_CLASS = cn(
  CARD_STANDARD_PROMO_PREMIUM_SURFACE_CLASS,
  "p-2",
);

/** @deprecated Prefer TEMPLATE_BUILDER_RAIL_NAV_* */
export const TABBER_PILL_BORDERLESS_BRAND_ACCENT_LIST_CLASS =
  "flex h-auto flex-wrap items-center gap-2 border-0 bg-transparent p-0 shadow-none";

/** @deprecated Prefer TEMPLATE_BUILDER_RAIL_NAV_TRIGGER_CLASS */
export const TABBER_PILL_BORDERLESS_BRAND_ACCENT_TRIGGER_CLASS =
  "cursor-pointer rounded-full border border-[var(--brand-accent)]/40 bg-brand-accent/10 px-4 py-1.5 text-xs text-muted-foreground shadow-none sm:px-6 sm:py-2 sm:text-sm lg:px-8 data-[state=active]:border-[var(--brand-accent)] data-[state=active]:bg-[var(--brand-accent)] data-[state=active]:text-white data-[state=active]:shadow-none";
