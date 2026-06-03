import { Eye } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

import { SponsorPreviewBadges } from "./_components/sponsor-preview-badges";
import { SponsorPreviewLogo } from "./_components/sponsor-preview-logo";
import { SPONSOR_PREVIEW_PANEL_COPY } from "./_constants/sponsor-preview-panel";
import {
  MANAGE_SPONSORS_CONTAINER_HEADER_CLASS_NAME,
  ManageSponsorsContainerHeaderTitle,
} from "../shared/manage-sponsors-container-header-title";

import type { SponsorPreviewPanelProps } from "./_types/sponsor-preview-panel";

export function SponsorPreviewPanel({ sponsor }: SponsorPreviewPanelProps) {
  return (
    <Card className="ring-border overflow-hidden rounded-2xl border-none p-0 shadow-xl ring-1">
      <CardHeader className={MANAGE_SPONSORS_CONTAINER_HEADER_CLASS_NAME}>
        <ManageSponsorsContainerHeaderTitle
          icon={<Eye className="size-5" aria-hidden />}
          title={SPONSOR_PREVIEW_PANEL_COPY.title}
          description={SPONSOR_PREVIEW_PANEL_COPY.description}
        />
      </CardHeader>
      <CardContent className="px-6 py-6">
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
