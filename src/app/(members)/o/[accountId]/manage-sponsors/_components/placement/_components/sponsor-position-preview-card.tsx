import { Surface } from "@/components/ui/container";
import { cn } from "@/lib/utils";

import { SponsorPositionLogoGridCell } from "./sponsor-position-logo-grid-cell";

import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";
import type { SlotOccupant } from "../../../_utils/sponsorship-allocation-general";
import type { SponsorPositionPreviewCell } from "../_types/sponsor-position-asset-preview";

export function SponsorPositionPreviewCard({
  pageCells,
  pageIndex,
  previewPageCount,
  occupants,
  sponsorByNumericId,
  primary,
  secondary,
  footerTextClass,
  footerBorderClass,
}: {
  pageCells: SponsorPositionPreviewCell[];
  pageIndex: number;
  previewPageCount: number;
  occupants: Map<string, SlotOccupant>;
  sponsorByNumericId: Map<number, ManageSponsorsWorkspaceSponsor>;
  primary: string;
  secondary: string;
  footerTextClass: string;
  footerBorderClass: string;
}) {
  return (
    <Surface className="ring-border overflow-hidden p-0 shadow-sm ring-1">
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
              aria-label={`Sponsor logos by position, card ${pageIndex + 1} of ${previewPageCount}`}
            >
              {pageCells.map((slot, index) => {
                if (!slot) {
                  return (
                    <div
                      key={`preview-pad-${pageIndex}-${index}`}
                      className="min-h-0 min-w-0"
                      aria-hidden
                    >
                      <SponsorPositionLogoGridCell sponsor={null} />
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
                    <SponsorPositionLogoGridCell sponsor={assigned} />
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
  );
}
