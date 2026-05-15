"use client";

import { LayoutTemplate } from "lucide-react";
import { type ReactNode, useRef } from "react";

import { MetricComparisonCard } from "@/components/cards";
import {
  templateModeUsesDarkLogoBackdrop,
  templateModeUsesDarkTitlesOnGradient,
} from "@/components/pickers/template-mode/_utils";
import { TypographyMuted } from "@/components/typography";
import { tryNormalizeHex } from "@/lib/brand-color";
import { cn } from "@/lib/utils";

export type FixturaAssetColorPreviewProps = {
  primaryHex: string;
  secondaryHex: string;
  /** Optional logo (e.g. cropped upload blob URL or remote onboarding logo) shown on the mock asset. */
  logoSrc?: string | null;
  /** CMS template mode slug — hero titles, logo strip, and lower mock discs follow light vs dark UI preset. */
  templateModeSlug?: string | null;
  className?: string;
  /**
   * Replaces the default note under “Asset preview” (contrast / template disclaimer).
   * Use for route labs or shells that need context-specific copy without wrapping an extra header.
   */
  previewNote?: ReactNode;
};

const FALLBACK_PRIMARY = "#64748B";
const FALLBACK_SECONDARY = "#94A3B8";

/**
 * 4:5 gradient mock of a Fixtura asset — primary → secondary diagonal blend; hero titles and logo
 * backdrop, and lower container discs follow optional template mode slug.
 */
export function FixturaAssetColorPreview({
  primaryHex,
  secondaryHex,
  logoSrc,
  templateModeSlug,
  className,
  previewNote,
}: FixturaAssetColorPreviewProps) {
  const lastPrimaryRef = useRef<string>(FALLBACK_PRIMARY);
  const lastSecondaryRef = useRef<string>(FALLBACK_SECONDARY);

  const np = tryNormalizeHex(primaryHex);
  const ns = tryNormalizeHex(secondaryHex);
  if (np) lastPrimaryRef.current = np;
  if (ns) lastSecondaryRef.current = ns;

  const primary = np ?? lastPrimaryRef.current;
  const secondary = ns ?? lastSecondaryRef.current;

  const gradientHeroTitlesDark = templateModeUsesDarkTitlesOnGradient(templateModeSlug);
  const gradientHeroTitleClass = gradientHeroTitlesDark
    ? "text-zinc-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)]"
    : "text-white drop-shadow-sm";

  /** Dark preset (`dark` / `dark-alt`): dark surfaces + light copy on discs; light preset: light surfaces + dark copy. */
  const darkSurfacePreset = templateModeUsesDarkLogoBackdrop(templateModeSlug);

  return (
    <MetricComparisonCard
      className={cn("min-w-0 shadow-sm", className)}
      layout="card"
      title="Asset preview"
      icon={<LayoutTemplate className="text-primary size-5 shrink-0" aria-hidden />}
      bodyClassName="p-0"
      body={
        <>
          <div className="space-y-3 px-6 pt-6 pb-4">
            <TypographyMuted className="text-sm leading-relaxed">
              {previewNote ??
                "This asset preview is a guide to how you would like contrast to work; it may change depending on the template selected."}
            </TypographyMuted>
          </div>

          <div className="min-w-0">
            <div
              className="flex aspect-4/5 min-h-0 w-full flex-col justify-between gap-4 p-5 text-left"
              style={{
                background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
              }}
            >
              <div className="min-w-0 space-y-1">
                <p
                  className={cn(
                    "text-[11px] font-semibold tracking-[0.2em]",
                    gradientHeroTitleClass,
                  )}
                >
                  WEEKEND RESULTS
                </p>
                <p className={cn("text-sm font-bold", gradientHeroTitleClass)}>Round 6</p>
              </div>

              {logoSrc ? (
                <div className="flex w-full shrink-0 justify-center">
                  <div
                    className={cn(
                      "flex max-h-28 w-4/5 items-center justify-center overflow-hidden rounded-lg shadow-sm",
                      darkSurfacePreset
                        ? "border border-white/15 bg-black/70"
                        : "border border-white/45 bg-white/25 backdrop-blur-[2px]",
                    )}
                  >
                    <img src={logoSrc} alt="" className="max-h-full w-full object-contain p-1" />
                  </div>
                </div>
              ) : null}

              <div className="mt-auto space-y-3">
                <div
                  className={cn(
                    "rounded-lg px-3 py-2 backdrop-blur-md",
                    darkSurfacePreset
                      ? "border border-white/20 bg-black/30"
                      : "border border-white/45 bg-white/25",
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-medium",
                      darkSurfacePreset ? "text-white" : "text-zinc-950",
                    )}
                  >
                    Home 42 — Away 38
                  </p>
                </div>
                <div
                  className={cn(
                    "rounded-md px-3 py-2 shadow-sm",
                    darkSurfacePreset
                      ? "border border-white/10 bg-zinc-950 text-white"
                      : "border border-black/10 bg-white text-zinc-950",
                  )}
                >
                  <p className="text-[11px] font-medium">Match summary</p>
                </div>
                <div
                  className={cn(
                    "border-t pt-3",
                    darkSurfacePreset ? "border-white/25" : "border-black/20",
                  )}
                >
                  <p
                    className={cn(
                      "text-[10px] font-medium",
                      darkSurfacePreset
                        ? "text-white/90"
                        : "text-zinc-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.45)]",
                    )}
                  >
                    Fixtura
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      }
    />
  );
}
