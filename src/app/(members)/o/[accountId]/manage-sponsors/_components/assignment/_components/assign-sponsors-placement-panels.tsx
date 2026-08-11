"use client";

import { SponsorEntityAssignmentPanel } from "../../placement/sponsor-entity-assignment-panel";
import { SponsorSlotPlacementPanel } from "../../placement/sponsor-slot-placement-panel";

import type { AssignSponsorsPlacementPanelsProps } from "../_types/assign-sponsors-workspace";

export function AssignSponsorsPlacementPanels({
  accountId,
  mode,
  sponsors,
}: AssignSponsorsPlacementPanelsProps) {
  return (
    <div className="grid gap-4">
      {mode === "position" ? (
        <SponsorSlotPlacementPanel accountId={accountId} sponsors={sponsors} />
      ) : null}
      {mode === "entity" ? (
        <SponsorEntityAssignmentPanel accountId={accountId} sponsors={sponsors} />
      ) : null}
    </div>
  );
}
