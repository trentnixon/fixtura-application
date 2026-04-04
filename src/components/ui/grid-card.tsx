"use client";

import { Plus, Route, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { createContext, useContext } from "react";

import { TypographyH3 } from "@/components/typography";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export type GridCardVisualPreset = "org" | "add" | "sandbox";

/** Visual styles for {@link GridCard}. Extend this union as new styles are added. */
export type GridCardVariant = "default" | "reverse";

const GridCardVariantContext = createContext<GridCardVariant>("default");

export function useGridCardVariant(): GridCardVariant {
  return useContext(GridCardVariantContext);
}

const gridCardTileVariants: Record<GridCardVariant, string> = {
  default: cn(
    "group bg-card text-card-foreground focus-visible:ring-primary/40 mx-auto flex aspect-square w-full min-w-[min(100%,12rem)] max-w-[14rem] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-[1.25rem] border-none p-4 text-center shadow-xl ring-1 ring-border transition-[box-shadow,background-color]",
    "hover:bg-muted/30 hover:shadow-2xl",
    "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none",
  ),
  reverse: cn(
    "group bg-primary text-primary-foreground focus-visible:ring-primary-foreground/50 mx-auto flex aspect-square w-full min-w-[min(100%,12rem)] max-w-[14rem] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-[1.25rem] border-none p-4 text-center shadow-lg ring-1 ring-primary-foreground/20 transition-[box-shadow,background-color]",
    "hover:bg-primary/90 hover:shadow-xl",
    "focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary focus-visible:outline-none",
  ),
};

const gridCardTitleVariants: Record<GridCardVariant, string> = {
  default: "text-foreground",
  reverse: "text-primary-foreground",
};

const gridCardCtaVariants: Record<GridCardVariant, string> = {
  default: "text-primary group-hover:text-primary/90 underline-offset-4 group-hover:underline",
  reverse:
    "text-primary-foreground/90 group-hover:text-primary-foreground underline-offset-4 group-hover:underline",
};

export type GridCardProps = {
  title: string;
  ctaLabel: string;
  /** Included in `aria-label` when present; omit for shorter announcements. */
  description?: string;
  /** Logo, icon, initials, or use `GridCardVisualSlot` presets. */
  visual: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  /** Surface style. Defaults to `default`; more variants added over time. */
  variant?: GridCardVariant;
};

function buildAriaLabel(title: string, ctaLabel: string, description?: string) {
  if (description) return `${title}. ${description} ${ctaLabel}`;
  return `${title}. ${ctaLabel}`;
}

/**
 * Square 1×1 grid tile for organisation pickers, add/create, and shortcuts.
 * Selected pattern (Variation 1): centered title, media, CTA; ring + shadow surface; icon hover lift.
 * Width is clamped (min ~12rem, max 14rem) and centered in the grid cell via `mx-auto`.
 */
export function GridCard({
  title,
  ctaLabel,
  description,
  visual,
  href,
  onClick,
  className,
  variant = "default",
}: GridCardProps) {
  const ariaLabel = buildAriaLabel(title, ctaLabel, description);
  const tileClass = cn(gridCardTileVariants[variant], className);

  const inner = (
    <>
      <TypographyH3
        className={cn(
          "line-clamp-2 w-full shrink-0 text-base leading-snug font-semibold",
          gridCardTitleVariants[variant],
        )}
      >
        {title}
      </TypographyH3>
      <div className="transition-transform duration-300 ease-out will-change-transform group-hover:-translate-y-1 group-hover:scale-110">
        {visual}
      </div>
      <span
        className={cn(
          "cursor-pointer text-xs font-medium transition-colors",
          gridCardCtaVariants[variant],
        )}
      >
        {ctaLabel}
      </span>
    </>
  );

  const body = href ? (
    <Link href={href} className={tileClass} aria-label={ariaLabel}>
      {inner}
    </Link>
  ) : (
    <button type="button" className={tileClass} aria-label={ariaLabel} onClick={onClick}>
      {inner}
    </button>
  );

  return <GridCardVariantContext.Provider value={variant}>{body}</GridCardVariantContext.Provider>;
}

type GridCardVisualSlotProps = {
  visual: GridCardVisualPreset;
  className?: string;
  emphasis?: "default" | "strong";
  /** When `visual` is `org`, overrides the default placeholder initials (e.g. `ND`). */
  initials?: string;
};

/**
 * Preset visuals for {@link GridCard}. Use `emphasis="strong"` for the selected Members Area style.
 * Adapts to parent {@link GridCard} `variant` (e.g. `reverse` inverts icon surface).
 */
export function GridCardVisualSlot({
  visual,
  className,
  emphasis = "strong",
  initials,
}: GridCardVisualSlotProps) {
  const cardVariant = useGridCardVariant();

  const strongHoverDefault =
    emphasis === "strong"
      ? "transition-all duration-300 ease-out group-hover:bg-primary/25 group-hover:text-primary group-hover:shadow-md group-hover:ring-2 group-hover:ring-primary/40 group-hover:ring-offset-2"
      : "";

  const strongHoverReverse =
    emphasis === "strong"
      ? "transition-all duration-300 ease-out group-hover:bg-primary-foreground/25 group-hover:text-primary-foreground group-hover:shadow-md group-hover:ring-2 group-hover:ring-primary-foreground/50 group-hover:ring-offset-2 group-hover:ring-offset-primary"
      : "";

  const wrapDefault = cn(
    "flex shrink-0 items-center justify-center rounded-xl",
    emphasis === "strong"
      ? "size-16 bg-primary/10 text-primary"
      : "size-14 bg-muted/40 text-foreground",
    strongHoverDefault,
    className,
  );

  const wrapReverse = cn(
    "flex shrink-0 items-center justify-center rounded-xl",
    emphasis === "strong"
      ? "size-16 bg-primary-foreground/15 text-primary-foreground"
      : "size-14 bg-primary-foreground/10 text-primary-foreground",
    strongHoverReverse,
    className,
  );

  const wrap = cardVariant === "reverse" ? wrapReverse : wrapDefault;

  if (visual === "org") {
    const raw = initials?.trim() ?? "";
    const mark = raw.length > 0 ? raw.slice(0, 2).toUpperCase() : "ND";
    return (
      <div
        className={cn(
          wrap,
          cardVariant === "reverse"
            ? "border-primary-foreground/25 bg-primary-foreground/10 font-heading border text-sm font-bold"
            : "border-border bg-muted/30 font-heading border text-sm font-bold",
        )}
      >
        {mark}
      </div>
    );
  }
  if (visual === "add") {
    return (
      <div
        className={cn(
          wrap,
          cardVariant === "reverse"
            ? "border-primary-foreground/40 border border-dashed"
            : "border-border border border-dashed",
        )}
      >
        <Plus className={emphasis === "strong" ? "size-7" : "size-6"} strokeWidth={2} aria-hidden />
      </div>
    );
  }
  return (
    <div
      className={cn(
        wrap,
        emphasis === "strong" &&
          (cardVariant === "reverse"
            ? "ring-primary-foreground/30 ring-offset-primary ring-2 ring-offset-2"
            : "ring-primary/20 ring-2 ring-offset-2"),
      )}
    >
      <Route className={emphasis === "strong" ? "size-7" : "size-6"} aria-hidden />
    </div>
  );
}

const gridCardIconFrameDefault = cn(
  "flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
  "transition-all duration-300 ease-out group-hover:bg-primary/25 group-hover:text-primary group-hover:shadow-md group-hover:ring-2 group-hover:ring-primary/40 group-hover:ring-offset-2",
);

const gridCardIconFrameReverse = cn(
  "flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15 text-primary-foreground",
  "transition-all duration-300 ease-out group-hover:bg-primary-foreground/25 group-hover:text-primary-foreground group-hover:shadow-md group-hover:ring-2 group-hover:ring-primary-foreground/50 group-hover:ring-offset-2 group-hover:ring-offset-primary",
);

/** Lucide icon inside the same media treatment as {@link GridCardVisualSlot} (strong). */
export function GridCardIcon({ icon: Icon }: { icon: LucideIcon }) {
  const variant = useGridCardVariant();
  const frame = variant === "reverse" ? gridCardIconFrameReverse : gridCardIconFrameDefault;
  return (
    <div className={frame}>
      <Icon className="size-7" aria-hidden />
    </div>
  );
}
