import { Surface } from "@/components/ui/container";
import { cn } from "@/lib/utils";

import { PrimarySponsorLogoPreview } from "./primary-sponsor-logo-preview";
import { SponsorLogoPreview } from "./sponsor-logo-preview";
import { getEntityTargetLabel } from "../_utils/sponsor-entity-preview";

import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";
import type { EntityPreviewCard } from "../_types/sponsor-entity-asset-preview";

export function SponsorEntityPreviewCard({
  previewCard,
  primarySponsors,
  primary,
  secondary,
  footerTextClass,
  footerBorderClass,
}: {
  previewCard: EntityPreviewCard;
  primarySponsors: ManageSponsorsWorkspaceSponsor[];
  primary: string;
  secondary: string;
  footerTextClass: string;
  footerBorderClass: string;
}) {
  const { target, sponsor } = previewCard;

  return (
    <Surface className="ring-border overflow-hidden p-0 shadow-sm ring-1">
      <div className="min-w-0">
        <div
          className="flex aspect-4/5 min-h-0 w-full flex-col justify-between gap-2 overflow-hidden text-left"
          style={{
            background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)`,
          }}
        >
          <div className="flex min-h-0 flex-1 items-start p-3 sm:p-4">
            <p
              className={cn(
                "max-w-[16rem] text-2xl leading-tight font-semibold text-balance",
                footerTextClass,
              )}
            >
              {getEntityTargetLabel(target)}
            </p>
          </div>

          <div
            className={cn(
              "mt-auto grid h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t p-2 sm:gap-3 sm:p-2.5",
              footerBorderClass,
            )}
          >
            <div
              className="flex min-w-0 items-center gap-1.5 overflow-hidden"
              aria-label="Primary sponsors"
            >
              {primarySponsors.slice(0, 4).map((primarySponsor, index) => (
                <PrimarySponsorLogoPreview
                  key={`primary-sponsor-${index}`}
                  sponsor={primarySponsor}
                />
              ))}
            </div>
            <SponsorLogoPreview
              sponsor={sponsor}
              className="h-14 w-20 flex-none rounded-md border-0 bg-transparent"
              imageClassName="p-0"
            />
          </div>
        </div>
      </div>
    </Surface>
  );
}
