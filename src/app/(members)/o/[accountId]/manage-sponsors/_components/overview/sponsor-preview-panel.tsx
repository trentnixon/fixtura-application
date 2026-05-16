import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { SponsorPreviewBadges } from "./_components/sponsor-preview-badges";
import { SponsorPreviewLogo } from "./_components/sponsor-preview-logo";
import { SPONSOR_PREVIEW_PANEL_COPY } from "./_constants/sponsor-preview-panel";

import type { SponsorPreviewPanelProps } from "./_types/sponsor-preview-panel";

export function SponsorPreviewPanel({ sponsor }: SponsorPreviewPanelProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>{SPONSOR_PREVIEW_PANEL_COPY.title}</CardTitle>
        <CardDescription>{SPONSOR_PREVIEW_PANEL_COPY.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {sponsor ? (
          <div className="grid gap-4">
            <SponsorPreviewLogo sponsor={sponsor} />
            <SponsorPreviewBadges sponsor={sponsor} />
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{SPONSOR_PREVIEW_PANEL_COPY.emptyState}</p>
        )}
      </CardContent>
    </Card>
  );
}
