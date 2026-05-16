import { buildEntityTargetKey } from "../../../_utils/sponsorship-allocation-entity";

import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";
import type { EntityTargetAllocation } from "../../../_utils/sponsorship-allocation-entity";
import type { EntityPreviewCard } from "../_types/sponsor-entity-asset-preview";
import type { AccountSponsorEntityTarget } from "@/types/api/account";

export function getEntityTargetLabel(target: AccountSponsorEntityTarget) {
  return target.label || target.name || `${target.type} target`;
}

export function getEntityPreviewCardKey({ target }: EntityPreviewCard) {
  return buildEntityTargetKey(target);
}

export function buildEntityPreviewCards({
  allocationsByTarget,
  previewTargets,
  sponsorByNumericId,
}: {
  allocationsByTarget: Map<string, EntityTargetAllocation[]>;
  previewTargets: AccountSponsorEntityTarget[];
  sponsorByNumericId: Map<number, ManageSponsorsWorkspaceSponsor>;
}): EntityPreviewCard[] {
  return previewTargets.flatMap((target) => {
    const assignment = allocationsByTarget.get(buildEntityTargetKey(target))?.[0] ?? null;
    if (!assignment) return [];

    return [
      {
        target,
        sponsor: sponsorByNumericId.get(assignment.sponsorId) ?? null,
      },
    ];
  });
}
