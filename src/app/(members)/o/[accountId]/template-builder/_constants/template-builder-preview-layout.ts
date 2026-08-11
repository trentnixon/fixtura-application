import type { CarouselItemsInViewConfig } from "@/components/carousel";

/** Template builder preview shell — single source for preview container classes. */

/** Desktop height cap (docs / future JS). */
export const TEMPLATE_BUILDER_PREVIEW_MAX_HEIGHT = "480px";

/**
 * Show as many frames as will fit across the canvas column.
 * Cap at 4 so Remotion stills stay readable.
 */
export const TEMPLATE_BUILDER_PREVIEW_ITEMS_IN_VIEW: CarouselItemsInViewConfig = {
  base: 1,
  sm: 2,
  md: 3,
  lg: 3,
  xl: 4,
};

/** Canvas column: stage + chrome. */
export const TEMPLATE_BUILDER_PREVIEW_SECTION_CLASS = "flex w-full min-w-0 flex-col gap-2";

/** Stage fills the canvas column so the carousel can pack multiple frames. */
export const TEMPLATE_BUILDER_PREVIEW_STAGE_CLASS = "w-full min-w-0 overflow-hidden";

/** Surface chrome on the fitted preview — matches `Surface` in `@/components/ui/container` (no padding). */
export const TEMPLATE_BUILDER_PREVIEW_REMOTION_SURFACE_CLASS =
  "bg-card text-card-foreground border-border ring-border rounded-2xl shadow-xl ring-1";

/**
 * Each still fills its carousel slide (`basis-*` from itemsInView).
 * Width drives height via 4:5 aspect; max-height keeps a single mobile slide from dominating.
 */
export const TEMPLATE_BUILDER_PREVIEW_REMOTION_ROOT_CLASS = [
  TEMPLATE_BUILDER_PREVIEW_REMOTION_SURFACE_CLASS,
  "relative mx-auto my-2 aspect-[1080/1350] w-full max-w-full overflow-hidden",
  "max-h-[min(50vh,420px)]",
].join(" ");

/** Vertical inset on the carousel track so `shadow-xl` is not clipped by Embla overflow. */
export const TEMPLATE_BUILDER_PREVIEW_CAROUSEL_CONTENT_CLASS = "py-4";

/** Row under preview: asset select + branding summary. */
export const TEMPLATE_BUILDER_PREVIEW_TOOLBAR_CLASS =
  "flex w-full min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2";
