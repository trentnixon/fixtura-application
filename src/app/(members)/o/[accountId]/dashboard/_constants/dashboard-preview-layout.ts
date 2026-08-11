import type { CarouselItemsInViewConfig } from "@/components/carousel";

/** Compact dashboard preview — smaller than template builder. */

export const DASHBOARD_PREVIEW_ITEMS_IN_VIEW: CarouselItemsInViewConfig = {
  base: 2,
  sm: 3,
  md: 4,
  lg: 5,
  xl: 6,
};

/** Vertical inset so carousel shadows are not clipped. Tight horizontal gap between slides. */
export const DASHBOARD_PREVIEW_CAROUSEL_CONTENT_CLASS = "!ml-0 gap-1.5 py-1";

/** Auto-width slides hug each thumbnail instead of fractional basis slots. */
export const DASHBOARD_PREVIEW_CAROUSEL_ITEM_CLASS =
  "!basis-auto shrink-0 !grow-0 !p-0 !py-0 !pl-0";

export const DASHBOARD_PREVIEW_REMOTION_SURFACE_CLASS =
  "bg-card text-card-foreground border-border ring-border rounded-lg shadow-md ring-1";

/** Fitted Remotion still / video root — 4:5 aspect with a modest height cap. */
export const DASHBOARD_PREVIEW_REMOTION_ROOT_CLASS = [
  DASHBOARD_PREVIEW_REMOTION_SURFACE_CLASS,
  "relative aspect-[1080/1350] h-[216px] max-h-[216px] w-auto max-w-full shrink-0 overflow-hidden",
  "sm:h-[245px] sm:max-h-[245px]",
  "md:h-[274px] md:max-h-[274px]",
].join(" ");
