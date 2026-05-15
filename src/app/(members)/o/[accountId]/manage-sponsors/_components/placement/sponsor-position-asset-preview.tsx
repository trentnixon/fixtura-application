"use client";

import { useMemo, useRef } from "react";

import { templateModeUsesDarkTitlesOnGradient } from "@/components/pickers/template-mode/_utils";
import { Surface } from "@/components/ui/container";
import { tryNormalizeHex } from "@/lib/brand-color";
import { cn } from "@/lib/utils";

import type { SponsorPositionSlotDef } from "../../_constants/sponsor-position-slots";
import type { ManageSponsorsWorkspaceSponsor } from "../../_types/manage-sponsors";
import type { SlotOccupant } from "../../_utils/sponsorship-allocation-general";

export type SponsorPositionAssetPreviewProps = {
  primaryHex: string;
  secondaryHex: string;
  templateModeSlug?: string | null;
  occupants: Map<string, SlotOccupant>;
  sponsorByNumericId: Map<number, ManageSponsorsWorkspaceSponsor>;
  previewSlots: SponsorPositionSlotDef[];
  className?: string;
};

const FALLBACK_PRIMARY = "#64748B";
const FALLBACK_SECONDARY = "#94A3B8";
const PREVIEW_PAGE_SIZE = 8;

function chunkPreviewSlots(slots: SponsorPositionSlotDef[]): (SponsorPositionSlotDef | null)[][] {
  const chunks: (SponsorPositionSlotDef | null)[][] = [];
  const source = slots.length > 0 ? slots : [];

  for (
    let index = 0;
    index < Math.max(source.length, PREVIEW_PAGE_SIZE);
    index += PREVIEW_PAGE_SIZE
  ) {
    const cells: (SponsorPositionSlotDef | null)[] = source.slice(index, index + PREVIEW_PAGE_SIZE);
    while (cells.length < PREVIEW_PAGE_SIZE) cells.push(null);
    chunks.push(cells);
  }

  return chunks;
}

function SponsorLogoGridCell({ sponsor }: { sponsor: ManageSponsorsWorkspaceSponsor | null }) {
  const src = sponsor?.logoUrl;

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden rounded-md",
        !src && "border border-dashed border-white/35 bg-white/15",
      )}
    >
      {src ? (
        <img src={src} alt="" className="size-full max-h-full max-w-full object-contain p-1" />
      ) : null}
    </div>
  );
}

export function SponsorPositionAssetPreview({
  primaryHex,
  secondaryHex,
  templateModeSlug,
  occupants,
  sponsorByNumericId,
  previewSlots,
  className,
}: SponsorPositionAssetPreviewProps) {
  const lastPrimaryRef = useRef<string>(FALLBACK_PRIMARY);
  const lastSecondaryRef = useRef<string>(FALLBACK_SECONDARY);

  const np = tryNormalizeHex(primaryHex);
  const ns = tryNormalizeHex(secondaryHex);
  if (np) lastPrimaryRef.current = np;
  if (ns) lastSecondaryRef.current = ns;

  const primary = np ?? lastPrimaryRef.current;
  const secondary = ns ?? lastSecondaryRef.current;

  const gradientHeroTitlesDark = templateModeUsesDarkTitlesOnGradient(templateModeSlug);
  const footerTextClass = gradientHeroTitlesDark
    ? "text-zinc-950 drop-shadow-[0_1px_2px_rgba(255,255,255,0.45)]"
    : "text-white/90";
  const footerBorderClass = gradientHeroTitlesDark ? "border-black/20" : "border-white/25";

  const previewPages = useMemo(() => chunkPreviewSlots(previewSlots), [previewSlots]);

  return (
    <div
      className={cn(
        "grid w-full gap-4",
        previewPages.length > 1 ? "md:grid-cols-2 xl:grid-cols-3" : "mx-auto max-w-md grid-cols-1",
        className,
      )}
    >
      {previewPages.map((pageCells, pageIndex) => (
        <Surface
          key={`sponsor-position-preview-${pageIndex}`}
          className="ring-border overflow-hidden p-0 shadow-sm ring-1"
        >
          <div className="min-w-0">
            <div
              className="flex aspect-4/5 min-h-0 w-full flex-col justify-between gap-2 overflow-hidden p-2 text-left sm:p-3"
              style={{
                background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
              }}
            >
              <div className="flex min-h-0 flex-1 flex-col gap-1.5">
                <div
                  className="grid min-h-0 flex-1 grid-cols-2 grid-rows-4 gap-1.5"
                  role="list"
                  aria-label={`Sponsor logos by position, card ${pageIndex + 1} of ${previewPages.length}`}
                >
                  {pageCells.map((slot, index) => {
                    if (!slot) {
                      return (
                        <div
                          key={`preview-pad-${pageIndex}-${index}`}
                          className="min-h-0 min-w-0"
                          aria-hidden
                        >
                          <SponsorLogoGridCell sponsor={null} />
                        </div>
                      );
                    }

                    const occupant = occupants.get(slot.id);
                    const assigned = occupant
                      ? (sponsorByNumericId.get(occupant.sponsorId) ?? null)
                      : null;

                    return (
                      <div
                        key={slot.id}
                        className="min-h-0 min-w-0"
                        role="listitem"
                        aria-label={slot.title}
                      >
                        <SponsorLogoGridCell sponsor={assigned} />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={cn("mt-auto border-t pt-2", footerBorderClass)}>
                <p className={cn("text-[10px] font-medium", footerTextClass)}>Fixtura</p>
              </div>
            </div>
          </div>
        </Surface>
      ))}
    </div>
  );
}
