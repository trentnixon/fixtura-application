"use client";

import { Plus, Route, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { createContext, useContext, useEffect, useState } from "react";

import { TypographyCardTitle, TypographyCaption } from "@/components/typography";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import type { CSSProperties, ReactNode } from "react";

export type GridCardVisualPreset = "org" | "add" | "sandbox";

/** Visual styles for {@link GridCard}. Extend this union as new styles are added. */
export type GridCardVariant = "default" | "reverse";

/**
 * Semantic surface / state for {@link GridCard}. Composes with `variant` (layout / primary fill).
 * Use `loading` for in-flight actions; pair with a spinner in `visual` if needed.
 */
export type GridCardTone = "default" | "mute" | "error" | "success" | "warning" | "loading";

type GridCardSurfaceContextValue = {
  variant: GridCardVariant;
  tone: GridCardTone;
};

const GridCardSurfaceContext = createContext<GridCardSurfaceContextValue>({
  variant: "default",
  tone: "default",
});

export function useGridCardVariant(): GridCardVariant {
  return useContext(GridCardSurfaceContext).variant;
}

export function useGridCardTone(): GridCardTone {
  return useContext(GridCardSurfaceContext).tone;
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

/** Extra tile classes for `tone`; merged after base `variant` styles (tailwind-merge). */
const gridCardToneTile: Record<
  Exclude<GridCardTone, "default">,
  Record<GridCardVariant, string>
> = {
  mute: {
    default: cn(
      "bg-muted/50 text-muted-foreground ring-border/60",
      "hover:bg-muted/70 hover:shadow-lg",
      "focus-visible:ring-muted-foreground/40",
    ),
    reverse: cn(
      "bg-muted text-muted-foreground ring-border/40",
      "hover:bg-muted/90 hover:shadow-lg",
      "focus-visible:ring-muted-foreground/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    ),
  },
  error: {
    default: cn(
      "bg-destructive/5 text-card-foreground ring-destructive/25",
      "hover:bg-destructive/10 hover:shadow-xl",
      "focus-visible:ring-destructive",
    ),
    reverse: cn(
      "bg-destructive text-destructive-foreground ring-destructive-foreground/25",
      "hover:bg-destructive/90 hover:shadow-xl",
      "focus-visible:ring-destructive-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--destructive)]",
    ),
  },
  success: {
    default: cn(
      "bg-[var(--success)]/10 text-card-foreground ring-[color-mix(in_oklab,var(--success)_35%,transparent)]",
      "hover:bg-[var(--success)]/15 hover:shadow-xl",
      "focus-visible:ring-[var(--success)]",
    ),
    reverse: cn(
      "bg-[var(--success)] text-white ring-white/25",
      "hover:bg-[color-mix(in_oklab,var(--success)_92%,black)] hover:shadow-xl",
      "focus-visible:ring-white focus-visible:ring-offset-[var(--success)]",
    ),
  },
  warning: {
    default: cn(
      "bg-[var(--warning)]/10 text-card-foreground ring-[color-mix(in_oklab,var(--warning)_40%,transparent)]",
      "hover:bg-[var(--warning)]/18 hover:shadow-xl",
      "focus-visible:ring-[var(--warning)]",
    ),
    reverse: cn(
      "bg-[var(--warning)] text-neutral-900 ring-neutral-900/15",
      "hover:bg-[color-mix(in_oklab,var(--warning)_90%,black)] hover:shadow-xl",
      "focus-visible:ring-neutral-900 focus-visible:ring-offset-[var(--warning)]",
    ),
  },
  loading: {
    default: cn(
      "pointer-events-none cursor-wait opacity-80 animate-pulse shadow-lg",
      "hover:bg-card hover:shadow-lg",
    ),
    reverse: cn(
      "pointer-events-none cursor-wait opacity-80 animate-pulse shadow-lg",
      "hover:bg-primary hover:shadow-lg",
    ),
  },
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

const gridCardTitleTone: Record<
  Exclude<GridCardTone, "default">,
  Record<GridCardVariant, string>
> = {
  mute: {
    default: "text-muted-foreground",
    reverse: "text-muted-foreground",
  },
  error: {
    default: "text-destructive",
    reverse: "text-destructive-foreground",
  },
  success: {
    default: "text-[color-mix(in_oklab,var(--success)_55%,var(--foreground))]",
    reverse: "text-white",
  },
  warning: {
    default: "text-[color-mix(in_oklab,var(--warning)_45%,var(--foreground))]",
    reverse: "text-neutral-900",
  },
  loading: {
    default: "text-muted-foreground",
    reverse: "text-primary-foreground/90",
  },
};

const gridCardCtaTone: Record<Exclude<GridCardTone, "default">, Record<GridCardVariant, string>> = {
  mute: {
    default:
      "text-muted-foreground group-hover:text-muted-foreground underline-offset-4 group-hover:underline",
    reverse:
      "text-muted-foreground group-hover:text-muted-foreground underline-offset-4 group-hover:underline",
  },
  error: {
    default:
      "text-destructive group-hover:text-destructive/90 underline-offset-4 group-hover:underline",
    reverse:
      "text-destructive-foreground group-hover:text-destructive-foreground underline-offset-4 group-hover:underline",
  },
  success: {
    default:
      "text-[var(--success)] group-hover:text-[color-mix(in_oklab,var(--success)_85%,black)] underline-offset-4 group-hover:underline",
    reverse: "text-white/95 group-hover:text-white underline-offset-4 group-hover:underline",
  },
  warning: {
    default:
      "text-[var(--warning)] group-hover:text-[color-mix(in_oklab,var(--warning)_80%,black)] underline-offset-4 group-hover:underline",
    reverse:
      "text-neutral-900 group-hover:text-neutral-950 underline-offset-4 group-hover:underline",
  },
  loading: {
    default:
      "text-muted-foreground group-hover:text-muted-foreground underline-offset-4 group-hover:underline",
    reverse:
      "text-primary-foreground/80 group-hover:text-primary-foreground/80 underline-offset-4 group-hover:underline",
  },
};

function gridCardTileClass(variant: GridCardVariant, tone: GridCardTone, className?: string) {
  const base = gridCardTileVariants[variant];
  const toneExtra = tone === "default" ? undefined : gridCardToneTile[tone][variant];
  return cn(base, toneExtra, className);
}

function gridCardTitleClass(variant: GridCardVariant, tone: GridCardTone) {
  if (tone === "default") return gridCardTitleVariants[variant];
  return gridCardTitleTone[tone][variant];
}

function gridCardCtaClass(variant: GridCardVariant, tone: GridCardTone) {
  if (tone === "default") return gridCardCtaVariants[variant];
  return gridCardCtaTone[tone][variant];
}

type MediaEmphasis = "default" | "strong";

const gridCardMediaStrongHoverTone: Record<
  Exclude<GridCardTone, "default">,
  Record<GridCardVariant, string>
> = {
  mute: {
    default:
      "transition-all duration-300 ease-out group-hover:bg-muted group-hover:text-muted-foreground group-hover:shadow-md group-hover:ring-2 group-hover:ring-border/50 group-hover:ring-offset-2",
    reverse:
      "transition-all duration-300 ease-out group-hover:bg-muted/80 group-hover:text-muted-foreground group-hover:shadow-md group-hover:ring-2 group-hover:ring-border/40 group-hover:ring-offset-2 group-hover:ring-offset-background",
  },
  error: {
    default:
      "transition-all duration-300 ease-out group-hover:bg-destructive/20 group-hover:text-destructive group-hover:shadow-md group-hover:ring-2 group-hover:ring-destructive/40 group-hover:ring-offset-2",
    reverse:
      "transition-all duration-300 ease-out group-hover:bg-destructive-foreground/20 group-hover:text-destructive-foreground group-hover:shadow-md group-hover:ring-2 group-hover:ring-destructive-foreground/50 group-hover:ring-offset-2 group-hover:ring-offset-[var(--destructive)]",
  },
  success: {
    default:
      "transition-all duration-300 ease-out group-hover:bg-[var(--success)]/25 group-hover:text-[var(--success)] group-hover:shadow-md group-hover:ring-2 group-hover:ring-[color-mix(in_oklab,var(--success)_45%,transparent)] group-hover:ring-offset-2",
    reverse:
      "transition-all duration-300 ease-out group-hover:bg-white/25 group-hover:text-white group-hover:shadow-md group-hover:ring-2 group-hover:ring-white/50 group-hover:ring-offset-2 group-hover:ring-offset-[var(--success)]",
  },
  warning: {
    default:
      "transition-all duration-300 ease-out group-hover:bg-[var(--warning)]/25 group-hover:text-[var(--warning)] group-hover:shadow-md group-hover:ring-2 group-hover:ring-[color-mix(in_oklab,var(--warning)_45%,transparent)] group-hover:ring-offset-2",
    reverse:
      "transition-all duration-300 ease-out group-hover:bg-neutral-900/15 group-hover:text-neutral-900 group-hover:shadow-md group-hover:ring-2 group-hover:ring-neutral-900/30 group-hover:ring-offset-2 group-hover:ring-offset-[var(--warning)]",
  },
  loading: {
    default: "",
    reverse: "",
  },
};

const gridCardMediaBaseTone: Record<
  Exclude<GridCardTone, "default">,
  Record<GridCardVariant, Record<MediaEmphasis, string>>
> = {
  mute: {
    default: {
      strong: "size-16 bg-muted/50 text-muted-foreground",
      default: "size-14 bg-muted/30 text-muted-foreground",
    },
    reverse: {
      strong: "size-16 bg-muted/40 text-muted-foreground",
      default: "size-14 bg-muted/20 text-muted-foreground",
    },
  },
  error: {
    default: {
      strong: "size-16 bg-destructive/10 text-destructive",
      default: "size-14 bg-destructive/5 text-destructive",
    },
    reverse: {
      strong: "size-16 bg-destructive-foreground/15 text-destructive-foreground",
      default: "size-14 bg-destructive-foreground/10 text-destructive-foreground",
    },
  },
  success: {
    default: {
      strong: "size-16 bg-[var(--success)]/10 text-[var(--success)]",
      default: "size-14 bg-[var(--success)]/5 text-[var(--success)]",
    },
    reverse: {
      strong: "size-16 bg-white/20 text-white",
      default: "size-14 bg-white/15 text-white/90",
    },
  },
  warning: {
    default: {
      strong: "size-16 bg-[var(--warning)]/10 text-[var(--warning)]",
      default: "size-14 bg-[var(--warning)]/5 text-[var(--warning)]",
    },
    reverse: {
      strong: "size-16 bg-neutral-900/10 text-neutral-900",
      default: "size-14 bg-neutral-900/5 text-neutral-900",
    },
  },
  loading: {
    default: {
      strong: "size-16 bg-muted/40 text-muted-foreground",
      default: "size-14 bg-muted/30 text-muted-foreground",
    },
    reverse: {
      strong: "size-16 bg-primary-foreground/10 text-primary-foreground",
      default: "size-14 bg-primary-foreground/5 text-primary-foreground",
    },
  },
};

function gridCardSlotWrap(
  tone: GridCardTone,
  variant: GridCardVariant,
  emphasis: MediaEmphasis,
  className?: string,
) {
  if (tone === "default") {
    const strongHoverDefault =
      emphasis === "strong"
        ? "transition-all duration-300 ease-out group-hover:bg-primary/25 group-hover:text-primary group-hover:shadow-md group-hover:ring-2 group-hover:ring-primary/40 group-hover:ring-offset-2"
        : "";
    const strongHoverReverse =
      emphasis === "strong"
        ? "transition-all duration-300 ease-out group-hover:bg-primary-foreground/25 group-hover:text-primary-foreground group-hover:shadow-md group-hover:ring-2 group-hover:ring-primary-foreground/50 group-hover:ring-offset-2 group-hover:ring-offset-primary"
        : "";
    return cn(
      "flex shrink-0 items-center justify-center rounded-xl",
      variant === "reverse"
        ? emphasis === "strong"
          ? "size-16 bg-primary-foreground/15 text-primary-foreground"
          : "size-14 bg-primary-foreground/10 text-primary-foreground"
        : emphasis === "strong"
          ? "size-16 bg-primary/10 text-primary"
          : "size-14 bg-muted/40 text-foreground",
      emphasis === "strong"
        ? variant === "reverse"
          ? strongHoverReverse
          : strongHoverDefault
        : "",
      className,
    );
  }
  const em = emphasis;
  const base = gridCardMediaBaseTone[tone][variant][em];
  const hover =
    emphasis === "strong" && tone !== "loading" ? gridCardMediaStrongHoverTone[tone][variant] : "";
  const loadingDim = tone === "loading" ? "opacity-70" : "";
  return cn(
    "flex shrink-0 items-center justify-center rounded-xl",
    base,
    hover,
    loadingDim,
    className,
  );
}

const gridCardOrgInitialsByTone: Record<GridCardTone, Record<GridCardVariant, string>> = {
  default: {
    default: "border-border bg-muted/30 font-heading border text-sm font-bold text-foreground",
    reverse:
      "border-primary-foreground/25 bg-primary-foreground/10 font-heading border text-sm font-bold text-primary-foreground",
  },
  mute: {
    default:
      "border-border bg-muted/50 font-heading border text-sm font-bold text-muted-foreground",
    reverse:
      "border-muted-foreground/30 bg-muted/40 font-heading border text-sm font-bold text-muted-foreground",
  },
  error: {
    default:
      "border-destructive/30 bg-destructive/10 font-heading border text-sm font-bold text-destructive",
    reverse:
      "border-destructive-foreground/35 bg-destructive-foreground/10 font-heading border text-sm font-bold text-destructive-foreground",
  },
  success: {
    default:
      "border-[color-mix(in_oklab,var(--success)_40%,transparent)] bg-[var(--success)]/10 font-heading border text-sm font-bold text-[var(--success)]",
    reverse: "border-white/30 bg-white/15 font-heading border text-sm font-bold text-white",
  },
  warning: {
    default:
      "border-[color-mix(in_oklab,var(--warning)_45%,transparent)] bg-[var(--warning)]/10 font-heading border text-sm font-bold text-neutral-900",
    reverse:
      "border-neutral-900/25 bg-neutral-900/10 font-heading border text-sm font-bold text-neutral-900",
  },
  loading: {
    default:
      "border-border bg-muted/30 font-heading border text-sm font-bold text-muted-foreground opacity-70",
    reverse:
      "border-primary-foreground/25 bg-primary-foreground/10 font-heading border text-sm font-bold text-primary-foreground opacity-70",
  },
};

const gridCardAddBorderByTone: Record<GridCardTone, Record<GridCardVariant, string>> = {
  default: {
    default: "border-border border border-dashed",
    reverse: "border-primary-foreground/40 border border-dashed",
  },
  mute: {
    default: "border-border border border-dashed",
    reverse: "border-muted-foreground/40 border border-dashed",
  },
  error: {
    default: "border-destructive/40 border border-dashed",
    reverse: "border-destructive-foreground/45 border border-dashed",
  },
  success: {
    default: "border-[color-mix(in_oklab,var(--success)_50%,transparent)] border border-dashed",
    reverse: "border-white/40 border border-dashed",
  },
  warning: {
    default: "border-[color-mix(in_oklab,var(--warning)_50%,transparent)] border border-dashed",
    reverse: "border-neutral-900/35 border border-dashed",
  },
  loading: {
    default: "border-border border border-dashed opacity-70",
    reverse: "border-primary-foreground/35 border border-dashed opacity-70",
  },
};

function gridCardSandboxRing(tone: GridCardTone, variant: GridCardVariant): string {
  if (tone === "default") {
    return variant === "reverse"
      ? "ring-primary-foreground/30 ring-offset-primary ring-2 ring-offset-2"
      : "ring-primary/20 ring-2 ring-offset-2";
  }
  if (tone === "mute") {
    return variant === "reverse"
      ? "ring-muted-foreground/35 ring-offset-background ring-2 ring-offset-2"
      : "ring-border ring-2 ring-offset-2";
  }
  if (tone === "error") {
    return variant === "reverse"
      ? "ring-destructive-foreground/40 ring-offset-[var(--destructive)] ring-2 ring-offset-2"
      : "ring-destructive/30 ring-2 ring-offset-2";
  }
  if (tone === "success") {
    return variant === "reverse"
      ? "ring-white/40 ring-offset-[var(--success)] ring-2 ring-offset-2"
      : "ring-[color-mix(in_oklab,var(--success)_35%,transparent)] ring-2 ring-offset-2";
  }
  if (tone === "warning") {
    return variant === "reverse"
      ? "ring-neutral-900/30 ring-offset-[var(--warning)] ring-2 ring-offset-2"
      : "ring-[color-mix(in_oklab,var(--warning)_40%,transparent)] ring-2 ring-offset-2";
  }
  return variant === "reverse"
    ? "ring-primary-foreground/25 ring-offset-primary ring-2 ring-offset-2"
    : "ring-muted-foreground/25 ring-2 ring-offset-2";
}

const gridCardIconFrameDefault = cn(
  "flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
  "transition-all duration-300 ease-out group-hover:bg-primary/25 group-hover:text-primary group-hover:shadow-md group-hover:ring-2 group-hover:ring-primary/40 group-hover:ring-offset-2",
);

const gridCardIconFrameReverse = cn(
  "flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15 text-primary-foreground",
  "transition-all duration-300 ease-out group-hover:bg-primary-foreground/25 group-hover:text-primary-foreground group-hover:shadow-md group-hover:ring-2 group-hover:ring-primary-foreground/50 group-hover:ring-offset-2 group-hover:ring-offset-primary",
);

function gridCardIconFrameClass(tone: GridCardTone, variant: GridCardVariant): string {
  if (tone === "default") {
    return variant === "reverse" ? gridCardIconFrameReverse : gridCardIconFrameDefault;
  }
  return gridCardSlotWrap(tone, variant, "strong");
}

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
  /** Semantic accent / state (mute, error, success, warning, loading). Composes with `variant`. */
  tone?: GridCardTone;
  /** Non-interactive tile (e.g. coming soon). Only applies when `href` is not used. */
  disabled?: boolean;
  /** Applied to the root tile (Link or button). Use for e.g. custom `backgroundImage` gradients. */
  tileStyle?: CSSProperties;
  /** Merged after variant title tokens (e.g. `!text-white` on gradient tiles). */
  titleClassName?: string;
  /** Merged after variant CTA tokens. */
  ctaClassName?: string;
};

function buildAriaLabel(title: string, ctaLabel: string, description?: string) {
  if (description) return `${title}. ${description} ${ctaLabel}`;
  return `${title}. ${ctaLabel}`;
}

function buildSelectOrganisationAriaLabel(
  title: string,
  opts: {
    sport?: string;
    isActive?: boolean;
    isSetup?: boolean;
    isNew?: boolean;
    continueSetup?: boolean;
    /** Visible CTA text; omit when the tile has no separate CTA line. */
    ctaLabel?: string;
  },
) {
  const segments: string[] = [title];
  if (opts.sport) segments.push(opts.sport);
  if (opts.isNew) segments.push("New");
  if (opts.continueSetup) {
    segments.push("Continue setup");
  } else {
    if (opts.isActive === true) segments.push("Active");
    if (opts.isActive === false) segments.push("Inactive");
    if (opts.isSetup === true) segments.push("Setup complete");
    if (opts.isSetup === false) segments.push("Setup pending");
  }
  if (opts.ctaLabel) segments.push(opts.ctaLabel);
  return segments.join(". ");
}

function SelectOrgStatusRow({ ok, children }: { ok: boolean; children: string }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      <span
        className={cn("size-1.5 shrink-0 rounded-full", ok ? "bg-emerald-500" : "bg-red-500")}
        aria-hidden
      />
      <span className="text-muted-foreground text-[10px] leading-tight font-medium tracking-tight">
        {children}
      </span>
    </div>
  );
}

export const selectOrgGridTileSurfaceClass = cn(
  "group bg-card text-card-foreground relative mx-auto flex aspect-square w-full min-w-[min(100%,12rem)] max-w-[14rem] flex-col overflow-hidden rounded-[1.25rem] border-none text-center shadow-xl ring-1 ring-border transition-[transform,box-shadow] duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] motion-reduce:transition-none",
  "hover:-translate-y-1 hover:shadow-2xl motion-reduce:hover:translate-y-0",
);

const gridCardSelectOrganisationTileOverrides =
  "relative max-w-none min-w-0 justify-start gap-0 p-3 sm:p-4";

export function selectOrgBrandTileStyle(
  brand: { primary: string; secondary: string } | undefined,
): CSSProperties | undefined {
  if (!brand) return undefined;
  const { primary, secondary } = brand;
  return {
    backgroundImage: `linear-gradient(160deg, color-mix(in oklab, ${primary} 22%, white) 0%, color-mix(in oklab, ${secondary} 18%, white) 52%, white 100%)`,
    boxShadow: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 0 0 2px color-mix(in oklab, ${primary} 55%, transparent), 0 0 0 4px color-mix(in oklab, ${secondary} 28%, transparent)`,
  };
}

export type SelectOrgCardBrandColors = {
  primary: string;
  secondary: string;
};

export type GridCardSelectOrganisationProps = {
  title: string;
  /** Optional link label at bottom of tile; omit for icon/title-only affordance. */
  ctaLabel?: string;
  visual: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: GridCardVariant;
  tone?: GridCardTone;
  /** Organisation sport line (e.g. from `accountOrganisationDetails.Sport`). */
  sport?: string;
  isActive?: boolean;
  isSetup?: boolean;
  /** Replaces Active/Setup rows with a single Continue setup status (red dot). */
  continueSetup?: boolean;
  /** Shows a "New" badge when the account was recently created. */
  isNew?: boolean;
  /** Brand palette from me-row theme; tints card surface, ring, and visual. */
  brandColors?: SelectOrgCardBrandColors;
};

/**
 * Square tile for `/select-organisation`: logo, sport, org title, status rows, CTA.
 * Same surface tokens as {@link GridCard}, including `aspect-square`.
 */
export function GridCardSelectOrganisation({
  title,
  ctaLabel,
  visual,
  href,
  onClick,
  className,
  variant = "default",
  tone = "default",
  sport,
  isActive,
  isSetup,
  continueSetup,
  isNew,
  brandColors,
}: GridCardSelectOrganisationProps) {
  const ariaLabel = buildSelectOrganisationAriaLabel(title, {
    ...(sport ? { sport } : {}),
    ...(isNew ? { isNew } : {}),
    ...(continueSetup ? { continueSetup } : {}),
    ...(!continueSetup && isActive !== undefined ? { isActive } : {}),
    ...(!continueSetup && isSetup !== undefined ? { isSetup } : {}),
    ...(ctaLabel ? { ctaLabel } : {}),
  });
  const tileClass = gridCardTileClass(
    variant,
    tone,
    cn(gridCardSelectOrganisationTileOverrides, className),
  );
  const tileStyle = selectOrgBrandTileStyle(brandColors);

  const hasStatusRows = continueSetup === true || isActive !== undefined || isSetup !== undefined;
  const hasBottomBlock = hasStatusRows || Boolean(ctaLabel);

  const inner = (
    <>
      {brandColors ? (
        <div
          className="absolute inset-x-0 bottom-0 z-[1] h-1.5 rounded-b-[1.25rem]"
          style={{
            backgroundImage: `linear-gradient(90deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)`,
          }}
          aria-hidden
        />
      ) : null}
      {isNew ? (
        <Badge
          variant="destructive"
          className="absolute top-2 right-2 z-10 text-[10px] font-semibold tracking-wide uppercase"
        >
          New
        </Badge>
      ) : null}
      <div
        className={cn(
          "flex h-full min-h-0 w-full flex-col gap-2",
          hasBottomBlock ? "justify-between" : "justify-center",
        )}
      >
        <div className="flex min-h-0 flex-col items-center gap-1.5">
          <div className="transition-transform duration-300 ease-out will-change-transform group-hover:-translate-y-1 group-hover:scale-110">
            {visual}
          </div>
          {sport ? (
            <TypographyCaption className="line-clamp-1 w-full text-center">
              {sport}
            </TypographyCaption>
          ) : null}
          <TypographyCardTitle
            className={cn(
              "mt-auto line-clamp-2 w-full shrink-0 text-sm leading-none font-semibold sm:text-base",
              gridCardTitleClass(variant, tone),
            )}
          >
            {title}
          </TypographyCardTitle>
        </div>
        {hasBottomBlock ? (
          <div className="flex w-full min-w-0 flex-col items-center gap-1.5">
            {hasStatusRows ? (
              <div className="flex w-full min-w-0 flex-row flex-wrap items-center justify-center gap-x-3 gap-y-1">
                {continueSetup ? (
                  <SelectOrgStatusRow ok={false}>Continue setup</SelectOrgStatusRow>
                ) : (
                  <>
                    {isActive !== undefined ? (
                      <SelectOrgStatusRow ok={isActive}>
                        {isActive ? "Active" : "Inactive"}
                      </SelectOrgStatusRow>
                    ) : null}
                    {isSetup !== undefined ? (
                      <SelectOrgStatusRow ok={isSetup}>
                        {isSetup ? "Setup complete" : "Setup pending"}
                      </SelectOrgStatusRow>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}
            {ctaLabel ? (
              <span
                className={cn(
                  "cursor-pointer text-xs font-medium transition-colors",
                  gridCardCtaClass(variant, tone),
                )}
              >
                {ctaLabel}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );

  const busy = tone === "loading";

  const body = href ? (
    <Link
      href={href}
      className={tileClass}
      style={tileStyle}
      aria-label={ariaLabel}
      aria-busy={busy}
    >
      {inner}
    </Link>
  ) : (
    <button
      type="button"
      className={tileClass}
      style={tileStyle}
      aria-label={ariaLabel}
      aria-busy={busy}
      onClick={onClick}
    >
      {inner}
    </button>
  );

  return (
    <GridCardSurfaceContext.Provider value={{ variant, tone }}>
      {body}
    </GridCardSurfaceContext.Provider>
  );
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
  tone = "default",
  disabled = false,
  tileStyle,
  titleClassName,
  ctaClassName,
}: GridCardProps) {
  const ariaLabel = buildAriaLabel(title, ctaLabel, description);
  const tileClass = gridCardTileClass(
    variant,
    tone,
    cn(className, disabled && "cursor-not-allowed opacity-[0.72]"),
  );

  const inner = (
    <>
      <span
        className={cn(
          "line-clamp-2 w-full shrink-0 text-center text-base leading-snug font-semibold tracking-tight",
          gridCardTitleClass(variant, tone),
          titleClassName,
        )}
      >
        {title}
      </span>
      <div className="transition-transform duration-300 ease-out will-change-transform group-hover:-translate-y-1 group-hover:scale-110">
        {visual}
      </div>
      <span
        className={cn(
          "cursor-pointer text-xs font-medium transition-colors",
          gridCardCtaClass(variant, tone),
          ctaClassName,
        )}
      >
        {ctaLabel}
      </span>
    </>
  );

  const busy = tone === "loading";

  const body = href ? (
    <Link
      href={href}
      className={tileClass}
      style={tileStyle}
      aria-label={ariaLabel}
      aria-busy={busy}
    >
      {inner}
    </Link>
  ) : (
    <button
      type="button"
      className={tileClass}
      style={tileStyle}
      aria-label={ariaLabel}
      aria-busy={busy}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
    >
      {inner}
    </button>
  );

  return (
    <GridCardSurfaceContext.Provider value={{ variant, tone }}>
      {body}
    </GridCardSurfaceContext.Provider>
  );
}

type GridCardVisualSlotProps = {
  visual: GridCardVisualPreset;
  className?: string;
  emphasis?: "default" | "strong";
  /** When `visual` is `org`, overrides the default placeholder initials (e.g. `ND`). */
  initials?: string;
  /** When `visual` is `org`, show logo instead of initials (e.g. ParentLogo URL). */
  imageSrc?: string;
  /** Optional label for the logo image (defaults to empty decorative). */
  imageAlt?: string;
  /** Brand palette for org visual (initials fill / logo ring). */
  brandColors?: SelectOrgCardBrandColors;
};

/**
 * Preset visuals for {@link GridCard}. Use `emphasis="strong"` for the selected Members Area style.
 * Adapts to parent {@link GridCard} `variant` and `tone`.
 */
export function GridCardVisualSlot({
  visual,
  className,
  emphasis = "strong",
  initials,
  imageSrc,
  imageAlt,
  brandColors,
}: GridCardVisualSlotProps) {
  const cardVariant = useGridCardVariant();
  const tone = useGridCardTone();
  const [orgImageFailed, setOrgImageFailed] = useState(false);

  const wrap = gridCardSlotWrap(tone, cardVariant, emphasis, className);

  useEffect(() => {
    setOrgImageFailed(false);
  }, [imageSrc]);

  if (visual === "org") {
    const trimmedSrc = imageSrc?.trim();
    const brandFrameStyle = brandColors
      ? ({
          boxShadow: `0 0 0 2px ${brandColors.primary}, 0 0 0 4px color-mix(in oklab, ${brandColors.secondary} 55%, transparent)`,
        } satisfies CSSProperties)
      : undefined;
    if (trimmedSrc && !orgImageFailed) {
      return (
        <div
          className={cn(wrap, gridCardOrgInitialsByTone[tone][cardVariant], "overflow-hidden p-0")}
          style={brandFrameStyle}
        >
          <img
            src={trimmedSrc}
            alt={imageAlt ?? ""}
            className="size-full object-cover"
            loading="lazy"
            decoding="async"
            onError={() => setOrgImageFailed(true)}
          />
        </div>
      );
    }
    const raw = initials?.trim() ?? "";
    const mark = raw.length > 0 ? raw.slice(0, 2).toUpperCase() : "ND";
    const initialsStyle = brandColors
      ? ({
          backgroundImage: `linear-gradient(135deg, color-mix(in oklab, ${brandColors.primary} 28%, white) 0%, color-mix(in oklab, ${brandColors.secondary} 24%, white) 100%)`,
          color: brandColors.primary,
          borderColor: brandColors.secondary,
          boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${brandColors.primary} 35%, transparent)`,
        } satisfies CSSProperties)
      : undefined;
    return (
      <div className={cn(wrap, gridCardOrgInitialsByTone[tone][cardVariant])} style={initialsStyle}>
        {mark}
      </div>
    );
  }
  if (visual === "add") {
    return (
      <div className={cn(wrap, gridCardAddBorderByTone[tone][cardVariant])}>
        <Plus className={emphasis === "strong" ? "size-7" : "size-6"} strokeWidth={2} aria-hidden />
      </div>
    );
  }
  return (
    <div className={cn(wrap, emphasis === "strong" && gridCardSandboxRing(tone, cardVariant))}>
      <Route className={emphasis === "strong" ? "size-7" : "size-6"} aria-hidden />
    </div>
  );
}

/** Lucide icon inside the same media treatment as {@link GridCardVisualSlot} (strong). */
export function GridCardIcon({ icon: Icon }: { icon: LucideIcon }) {
  const variant = useGridCardVariant();
  const tone = useGridCardTone();
  const frame = gridCardIconFrameClass(tone, variant);
  return (
    <div className={frame}>
      <Icon className="size-7" aria-hidden />
    </div>
  );
}
