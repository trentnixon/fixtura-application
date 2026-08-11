import { cn } from "@/lib/utils";

const BASIS_CLASS_BY_COUNT: Record<number, string> = {
  1: "basis-full",
  2: "basis-1/2",
  3: "basis-1/3",
  4: "basis-1/4",
  5: "basis-1/5",
  6: "basis-1/6",
};

type CarouselItemsInViewBreakpoint = "base" | "sm" | "md" | "lg" | "xl";

const BREAKPOINT_PREFIX: Record<Exclude<CarouselItemsInViewBreakpoint, "base">, string> = {
  sm: "sm:",
  md: "md:",
  lg: "lg:",
  xl: "xl:",
};

/** How many carousel slides are visible at once (per breakpoint). */
export type CarouselItemsInViewConfig =
  | number
  | Partial<Record<CarouselItemsInViewBreakpoint, number>>;

function clampItemsInView(count: number): number {
  return Math.max(1, Math.min(6, Math.floor(count)));
}

function basisClassForCount(count: number): string {
  return BASIS_CLASS_BY_COUNT[clampItemsInView(count)] ?? "basis-full";
}

/** Maps `itemsInView` to Tailwind `basis-*` classes on each `CarouselItem`. */
export function resolveCarouselItemBasisClass(
  itemsInView?: CarouselItemsInViewConfig,
): string | undefined {
  if (itemsInView == null) {
    return undefined;
  }

  if (typeof itemsInView === "number") {
    return basisClassForCount(itemsInView);
  }

  const classes: string[] = [];
  const order: CarouselItemsInViewBreakpoint[] = ["base", "sm", "md", "lg", "xl"];

  for (const breakpoint of order) {
    const count = itemsInView[breakpoint];
    if (count == null) {
      continue;
    }

    const basis = basisClassForCount(count);
    classes.push(breakpoint === "base" ? basis : `${BREAKPOINT_PREFIX[breakpoint]}${basis}`);
  }

  return classes.length > 0 ? cn(...classes) : undefined;
}

export function carouselShowsMultipleItemsInView(itemsInView?: CarouselItemsInViewConfig): boolean {
  if (itemsInView == null) {
    return false;
  }

  if (typeof itemsInView === "number") {
    return itemsInView > 1;
  }

  return Object.values(itemsInView).some((count) => count != null && count > 1);
}

/** Gutter classes for embedded carousels — only at breakpoints where count > 1. */
export function resolveCarouselEmbeddedGutterClasses(itemsInView?: CarouselItemsInViewConfig): {
  contentClassName: string;
  itemClassName: string;
} | null {
  if (itemsInView == null) {
    return null;
  }

  const contentParts: string[] = [];
  const itemParts: string[] = [];
  const order: CarouselItemsInViewBreakpoint[] = ["base", "sm", "md", "lg", "xl"];

  const appendGutter = (breakpoint: CarouselItemsInViewBreakpoint, count: number) => {
    if (count <= 1) {
      return;
    }

    const prefix = breakpoint === "base" ? "" : BREAKPOINT_PREFIX[breakpoint];
    contentParts.push(`${prefix}-ml-1.5`);
    itemParts.push(`${prefix}pl-1.5`);
  };

  if (typeof itemsInView === "number") {
    appendGutter("base", itemsInView);
  } else {
    for (const breakpoint of order) {
      const count = itemsInView[breakpoint];
      if (count != null) {
        appendGutter(breakpoint, count);
      }
    }
  }

  if (contentParts.length === 0) {
    return null;
  }

  return {
    contentClassName: cn(...contentParts),
    itemClassName: cn(...itemParts),
  };
}
