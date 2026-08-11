import { SPONSOR_PREVIEW_PANEL_COPY } from "../_constants/sponsor-preview-panel";

import type { SponsorPreviewSponsorProps } from "../_types/sponsor-preview-panel";

export function SponsorPreviewLogo({ sponsor }: SponsorPreviewSponsorProps) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-xl border bg-white">
      {sponsor.logoUrl ? (
        <img
          src={sponsor.logoUrl}
          alt={sponsor.logoAlt ?? sponsor.name}
          className="max-h-24 max-w-[12rem] object-contain"
        />
      ) : (
        <span className="text-muted-foreground text-sm">{SPONSOR_PREVIEW_PANEL_COPY.noLogo}</span>
      )}
    </div>
  );
}
