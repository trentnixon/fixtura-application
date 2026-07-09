import type { CarouselItemsInViewConfig } from "@/components/carousel";

/** Template builder preview shell — single source for preview container classes. */

/** Desktop height cap (used for docs / future JS if needed). */
export const TEMPLATE_BUILDER_PREVIEW_MAX_HEIGHT = "400px";

/** Slides visible in the preview viewport (total frames still scrollable). */
export const TEMPLATE_BUILDER_PREVIEW_ITEMS_IN_VIEW: CarouselItemsInViewConfig = {
  base: 1,
  xl: 4,
};

/** Full-width column: poster stage + asset select underneath. */
export const TEMPLATE_BUILDER_PREVIEW_SECTION_CLASS = "flex w-full min-w-0 flex-col gap-2";

/** Stage spans the full template-builder content width. */
export const TEMPLATE_BUILDER_PREVIEW_STAGE_CLASS = "w-full min-w-0";

/** Surface chrome on the fitted preview — matches `Surface` in `@/components/ui/container` (no padding). */
export const TEMPLATE_BUILDER_PREVIEW_REMOTION_SURFACE_CLASS =
  "bg-card text-card-foreground border-border ring-border rounded-2xl shadow-xl ring-1";

/**
 * Fitted `[data-remotion-preview-root]`: 4:5 aspect, height cap, width from aspect (`w-auto`).
 * Full container border + drop shadow hug the Remotion still, not the carousel slide width.
 */
export const TEMPLATE_BUILDER_PREVIEW_REMOTION_ROOT_CLASS = [
  TEMPLATE_BUILDER_PREVIEW_REMOTION_SURFACE_CLASS,
  "relative mx-auto my-3 aspect-[1080/1350] h-[min(42vh,260px)] max-h-[min(42vh,260px)] w-auto max-w-full overflow-hidden",
  "sm:h-[min(48vh,340px)] sm:max-h-[min(48vh,340px)]",
  "md:h-[min(55vh,400px)] md:max-h-[min(55vh,400px)]",
].join(" ");

/** Vertical inset on the carousel track so `shadow-xl` is not clipped by Embla overflow. */
export const TEMPLATE_BUILDER_PREVIEW_CAROUSEL_CONTENT_CLASS = "py-4";

/** Row under preview: asset select + branding summary. */
export const TEMPLATE_BUILDER_PREVIEW_TOOLBAR_CLASS =
  "flex w-full min-w-0 flex-wrap items-center justify-between gap-x-4 gap-y-2";
