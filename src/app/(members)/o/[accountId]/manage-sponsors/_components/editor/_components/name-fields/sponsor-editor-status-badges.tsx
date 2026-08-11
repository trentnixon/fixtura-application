"use client";

import { Badge } from "@/components/ui/badge";

import { SPONSOR_EDITOR_NAME_FIELDS_COPY } from "../../_constants/sponsor-editor-name-fields";

import type { ManageSponsorsWorkspaceSponsor } from "../../../../_types/manage-sponsors";

export function SponsorEditorStatusBadges({
  sponsor,
  isActive,
}: {
  sponsor: ManageSponsorsWorkspaceSponsor;
  isActive: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {sponsor.isDraft ? (
        <Badge variant="secondary">{SPONSOR_EDITOR_NAME_FIELDS_COPY.draftBadge}</Badge>
      ) : null}
      {isActive ? null : (
        <Badge variant="outline">{SPONSOR_EDITOR_NAME_FIELDS_COPY.archivedBadge}</Badge>
      )}
      <Badge variant="outline">{sponsor.placementLabel}</Badge>
    </div>
  );
}
