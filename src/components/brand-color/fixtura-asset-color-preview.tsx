"use client";

import { LayoutTemplate } from "lucide-react";
import { type ReactNode, useRef } from "react";

import { MetricComparisonCard } from "@/components/cards";
import {
  templateModeUsesDarkCopyOnDarkSurface,
  templateModeUsesDarkCopyOnLightSurface,
  templateModeUsesDarkLogoBackdrop,
  templateModeUsesDarkTitlesOnGradient,
} from "@/components/pickers/template-mode/_utils";
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
   * `card` — full MetricComparisonCard with “Asset preview” header (sidebar).
   * `inline` — gradient mock only, full width, no panel chrome.
   */
  variant?: "card" | "inline";
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
function AssetPreviewMock({
  primary,
  secondary,
  logoSrc,
  templateModeSlug,
  className,
}: {
  primary: string;
  secondary: string;
  logoSrc?: string | null;
  templateModeSlug?: string | null;
  className?: string;
}) {
  const gradientHeroTitlesDark = templateModeUsesDarkTitlesOnGradient(templateModeSlug);
  const gradientHeroTitleClass = gradientHeroTitlesDark
    ? "text-zinc-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.5)]"
    : "text-white drop-shadow-sm";

  const darkSurfacePreset = templateModeUsesDarkLogoBackdrop(templateModeSlug);
  const lightSurfaceDarkCopy = templateModeUsesDarkCopyOnLightSurface(templateModeSlug);
  const darkSurfaceDarkCopy = templateModeUsesDarkCopyOnDarkSurface(templateModeSlug);
  const lightSurfaceCopyClass = lightSurfaceDarkCopy
    ? "text-zinc-950"
    : "text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]";
  const darkSurfaceCopyClass = darkSurfaceDarkCopy
    ? "text-zinc-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.45)]"
    : "text-white";

  return (
    <div className={cn("min-w-0", className)}>
      <div
        className="flex aspect-4/5 min-h-0 w-full flex-col justify-between gap-4 p-5 text-left"
        style={{
          background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
        }}
      >
        <div className="min-w-0 space-y-1">
          <p className={cn("text-[11px] font-semibold tracking-[0.2em]", gradientHeroTitleClass)}>
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
                darkSurfacePreset ? darkSurfaceCopyClass : lightSurfaceCopyClass,
              )}
            >
              Home 42 — Away 38
            </p>
          </div>
          <div
            className={cn(
              "rounded-md px-3 py-2 shadow-sm",
              darkSurfacePreset
                ? cn("border border-white/10 bg-zinc-950", darkSurfaceCopyClass)
                : cn("border border-black/10 bg-white", lightSurfaceCopyClass),
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
                darkSurfacePreset ? darkSurfaceCopyClass : lightSurfaceCopyClass,
              )}
            >
              Fixtura
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FixturaAssetColorPreview({
  primaryHex,
  secondaryHex,
  logoSrc,
  templateModeSlug,
  className,
  variant = "card",
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

  if (variant === "inline") {
    return (
      <AssetPreviewMock
        primary={primary}
        secondary={secondary}
        {...(logoSrc !== undefined ? { logoSrc } : {})}
        {...(templateModeSlug !== undefined ? { templateModeSlug } : {})}
        {...(className !== undefined ? { className } : {})}
      />
    );
  }

  return (
    <MetricComparisonCard
      className={cn("ring-border min-w-0 rounded-2xl border-none shadow-xl ring-1", className)}
      layout="card"
      headerClassName="bg-zinc-950 border-zinc-900/80 text-white px-6 py-5"
      titleRowClassName="items-start"
      title={
        <div className="flex w-full items-start gap-3">
          <span className="mt-0.5 shrink-0 text-zinc-400">
            <LayoutTemplate className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xl leading-none font-semibold text-white">Asset preview</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              Colours and template mode follow your branding settings.
            </p>
          </div>
        </div>
      }
      bodyClassName="p-0"
      body={
        <>
          <div className="space-y-3 px-6 pt-6 pb-4">
            {previewNote == null ? (
              <>
                <p className="text-sm leading-relaxed">
                  This asset preview is a guide to how you would like contrast to work; it may
                  change depending on the template selected.
                </p>
              </>
            ) : typeof previewNote === "string" ? (
              <p className="text-sm leading-relaxed">{previewNote}</p>
            ) : (
              <div className="space-y-3">{previewNote}</div>
            )}
          </div>

          <AssetPreviewMock
            primary={primary}
            secondary={secondary}
            {...(logoSrc !== undefined ? { logoSrc } : {})}
            {...(templateModeSlug !== undefined ? { templateModeSlug } : {})}
          />
        </>
      }
    />
  );
}
