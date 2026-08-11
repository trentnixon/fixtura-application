"use client";

import { useMemo } from "react";

import { templateModeUsesDarkTitlesOnGradient } from "@/components/pickers/template-mode/_utils";
import { cn } from "@/lib/utils";

import { SponsorPositionPreviewCard } from "./_components/sponsor-position-preview-card";
import { useStableSponsorPreviewColors } from "./_hooks/use-stable-sponsor-preview-colors";
import { chunkPositionPreviewSlots } from "./_utils/sponsor-position-preview";

import type { SponsorPositionAssetPreviewProps } from "./_types/sponsor-position-asset-preview";

export type { SponsorPositionAssetPreviewProps } from "./_types/sponsor-position-asset-preview";

export function SponsorPositionAssetPreview({
  primaryHex,
  secondaryHex,
  templateModeSlug,
  occupants,
  sponsorByNumericId,
  previewSlots,
  className,
}: SponsorPositionAssetPreviewProps) {
  const { primary, secondary } = useStableSponsorPreviewColors({ primaryHex, secondaryHex });

  const gradientHeroTitlesDark = templateModeUsesDarkTitlesOnGradient(templateModeSlug);
  const footerTextClass = gradientHeroTitlesDark
    ? "text-zinc-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.45)]"
    : "text-white/90";
  const footerBorderClass = gradientHeroTitlesDark ? "border-black/20" : "border-white/25";

  const previewPages = useMemo(() => chunkPositionPreviewSlots(previewSlots), [previewSlots]);

  return (
    <div
      className={cn(
        "grid w-full gap-4",
        previewPages.length > 1 ? "md:grid-cols-2 xl:grid-cols-3" : "mx-auto max-w-md grid-cols-1",
        className,
      )}
    >
      {previewPages.map((pageCells, pageIndex) => (
        <SponsorPositionPreviewCard
          key={`sponsor-position-preview-${pageIndex}`}
          pageCells={pageCells}
          pageIndex={pageIndex}
          previewPageCount={previewPages.length}
          occupants={occupants}
          sponsorByNumericId={sponsorByNumericId}
          primary={primary}
          secondary={secondary}
          footerTextClass={footerTextClass}
          footerBorderClass={footerBorderClass}
        />
      ))}
    </div>
  );
}
