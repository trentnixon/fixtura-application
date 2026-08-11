"use client";

import { TypographyMuted } from "@/components/typography";
import { cn } from "@/lib/utils";

export type BrandColorPreviewVariant = "asset-card" | "button-only" | "full";

export type BrandColorPreviewCardProps = {
  /** Normalised `#RRGGBB` for accents. */
  accentHex: string;
  variant?: BrandColorPreviewVariant;
  className?: string;
};

/**
 * Compact mock of a branded asset surface — header, CTA, chip, text on colour (PDR §7).
 */
export function BrandColorPreviewCard({
  accentHex,
  variant = "asset-card",
  className,
}: BrandColorPreviewCardProps) {
  const isFull = variant === "full";
  const isAsset = variant === "asset-card" || variant === "full";
  const isButtonOnly = variant === "button-only";

  return (
    <div
      className={cn(
        "border-border bg-card/80 overflow-hidden rounded-2xl border shadow-sm",
        className,
      )}
    >
      <div className="bg-muted/40 space-y-3 p-4">
        <TypographyMuted className="text-[10px] font-semibold tracking-wide uppercase">
          Preview
        </TypographyMuted>

        {isAsset ? (
          <div className="space-y-2">
            <div
              className="flex items-center justify-between rounded-lg px-3 py-2.5"
              style={{ backgroundColor: accentHex }}
            >
              <span className="text-sm font-semibold text-white drop-shadow-sm">
                Sample fixture title
              </span>
              <span className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white">
                Live
              </span>
            </div>
            <div className="bg-background flex flex-wrap items-center gap-2 rounded-lg border p-3">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm"
                style={{ backgroundColor: accentHex }}
              >
                Primary action
              </button>
              <span
                className="rounded-md border px-2 py-1 text-[11px] font-medium"
                style={{ borderColor: accentHex, color: accentHex }}
              >
                Sponsor
              </span>
            </div>
          </div>
        ) : null}

        {isButtonOnly ? (
          <div className="bg-background flex justify-center rounded-lg border p-6">
            <button
              type="button"
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-md"
              style={{ backgroundColor: accentHex }}
            >
              Button only
            </button>
          </div>
        ) : null}

        {isFull ? (
          <div className="bg-muted/60 text-muted-foreground rounded-lg p-3 text-xs leading-relaxed">
            Neutral body copy shows balance against the accent. Text on the header uses white to
            surface contrast issues.
          </div>
        ) : null}
      </div>
    </div>
  );
}
