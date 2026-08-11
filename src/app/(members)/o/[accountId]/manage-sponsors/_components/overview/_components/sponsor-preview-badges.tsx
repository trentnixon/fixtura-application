import { Badge } from "@/components/ui/badge";

import { SPONSOR_PREVIEW_PANEL_COPY } from "../_constants/sponsor-preview-panel";

import type { SponsorPreviewSponsorProps } from "../_types/sponsor-preview-panel";

export function SponsorPreviewBadges({ sponsor }: SponsorPreviewSponsorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge>{sponsor.placementLabel}</Badge>
      {sponsor.usageLabel.trim().length > 0 ? (
        <Badge variant="outline">{sponsor.usageLabel}</Badge>
      ) : null}
      {!sponsor.isActive ? (
        <Badge variant="outline">{SPONSOR_PREVIEW_PANEL_COPY.archivedBadge}</Badge>
      ) : null}
    </div>
  );
}
