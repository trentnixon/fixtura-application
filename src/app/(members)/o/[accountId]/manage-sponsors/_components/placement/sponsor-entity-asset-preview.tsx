"use client";

import { useMemo } from "react";

import { templateModeUsesDarkTitlesOnGradient } from "@/components/pickers/template-mode/_utils";
import { cn } from "@/lib/utils";

import { SponsorEntityPreviewCard } from "./_components/sponsor-entity-preview-card";
import { useStableSponsorPreviewColors } from "./_hooks/use-stable-sponsor-preview-colors";
import { buildEntityPreviewCards, getEntityPreviewCardKey } from "./_utils/sponsor-entity-preview";

import type { SponsorEntityAssetPreviewProps } from "./_types/sponsor-entity-asset-preview";

export function SponsorEntityAssetPreview({
  primaryHex,
  secondaryHex,
  templateModeSlug,
  allocationsByTarget,
  sponsorByNumericId,
  primarySponsors,
  previewTargets,
  className,
}: SponsorEntityAssetPreviewProps) {
  const { primary, secondary } = useStableSponsorPreviewColors({ primaryHex, secondaryHex });

  const gradientHeroTitlesDark = templateModeUsesDarkTitlesOnGradient(templateModeSlug);
  const footerTextClass = gradientHeroTitlesDark
    ? "text-zinc-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.45)]"
    : "text-white/90";
  const footerBorderClass = gradientHeroTitlesDark ? "border-black/20" : "border-white/25";

  const previewCards = useMemo(
    () => buildEntityPreviewCards({ allocationsByTarget, previewTargets, sponsorByNumericId }),
    [allocationsByTarget, previewTargets, sponsorByNumericId],
  );

  if (previewCards.length === 0) {
    return (
      <div className="bg-card text-muted-foreground flex min-h-64 items-center justify-center rounded-xl border p-6 text-sm shadow-sm">
        No targeted entities yet.
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid w-full gap-4",
        previewCards.length > 1 ? "md:grid-cols-2 xl:grid-cols-3" : "mx-auto max-w-md grid-cols-1",
        className,
      )}
    >
      {previewCards.map((previewCard) => (
        <SponsorEntityPreviewCard
          key={getEntityPreviewCardKey(previewCard)}
          previewCard={previewCard}
          primarySponsors={primarySponsors}
          primary={primary}
          secondary={secondary}
          footerTextClass={footerTextClass}
          footerBorderClass={footerBorderClass}
        />
      ))}
    </div>
  );
}
