"use client";

import { useRef } from "react";

import { TypographyMuted } from "@/components/typography";
import { Surface } from "@/components/ui/container";
import { tryNormalizeHex } from "@/lib/brand-color";
import { cn } from "@/lib/utils";

export type FixturaAssetColorPreviewProps = {
  primaryHex: string;
  secondaryHex: string;
  /** Optional logo (e.g. cropped upload blob URL or remote onboarding logo) shown on the mock asset. */
  logoSrc?: string | null;
  className?: string;
};

const FALLBACK_PRIMARY = "#64748B";
const FALLBACK_SECONDARY = "#94A3B8";

/**
 * 4:5 gradient mock of a Fixtura asset — primary → secondary diagonal blend with white / dark text samples.
 * Shell matches the colour-picker `Surface` (header strip + body).
 */
export function FixturaAssetColorPreview({
  primaryHex,
  secondaryHex,
  logoSrc,
  className,
}: FixturaAssetColorPreviewProps) {
  const lastPrimaryRef = useRef<string>(FALLBACK_PRIMARY);
  const lastSecondaryRef = useRef<string>(FALLBACK_SECONDARY);

  const np = tryNormalizeHex(primaryHex);
  const ns = tryNormalizeHex(secondaryHex);
  if (np) lastPrimaryRef.current = np;
  if (ns) lastSecondaryRef.current = ns;

  const primary = np ?? lastPrimaryRef.current;
  const secondary = ns ?? lastSecondaryRef.current;

  return (
    <Surface className={cn("ring-border overflow-hidden p-0 shadow-sm ring-1", className)}>
      <header className="border-border space-y-2 border-b px-6 py-5">
        <TypographyMuted className="text-xs font-medium tracking-wide uppercase">
          Asset preview
        </TypographyMuted>
      </header>

      <div className="min-w-0">
        <div
          className="flex aspect-4/5 min-h-0 w-full flex-col justify-between gap-4 p-5 text-left"
          style={{
            background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
          }}
        >
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] font-semibold tracking-[0.2em] text-white drop-shadow-sm">
              WEEKEND RESULTS
            </p>
            <p className="text-sm font-bold text-white drop-shadow-sm">Round 6</p>
          </div>

          {logoSrc ? (
            <div className="flex w-full shrink-0 justify-center">
              <div className="flex max-h-28 w-4/5 items-center justify-center overflow-hidden rounded-lg border border-white/35 bg-black/25 shadow-sm">
                <img src={logoSrc} alt="" className="max-h-full w-full object-contain p-1" />
              </div>
            </div>
          ) : null}

          <div className="mt-auto space-y-3">
            <div className="rounded-lg bg-black/20 px-3 py-2 backdrop-blur-[2px]">
              <p className="text-xs font-medium text-white">Home 42 — Away 38</p>
            </div>
            <div className="rounded-md bg-white/95 px-3 py-2 shadow-sm">
              <p className="text-[11px] font-medium" style={{ color: "#111" }}>
                Match summary
              </p>
            </div>
            <div className="border-t border-white/25 pt-3">
              <p className="text-[10px] font-medium text-white/90">Fixtura</p>
            </div>
          </div>
        </div>
      </div>
    </Surface>
  );
}
