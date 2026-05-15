import type { ManageSponsorsWorkspaceSponsor } from "../_types/manage-sponsors";
import type { AccountSponsorEntityTarget, AccountSponsorEntityType } from "@/types/api/account";

export type EntityTargetKey = `${AccountSponsorEntityType}:${number}`;

export type EntityTargetAllocation = {
  allocationId: number;
  sponsorId: number;
  sponsorName: string;
};

function targetKey(entityType: AccountSponsorEntityType, entityId: number): EntityTargetKey {
  return `${entityType}:${entityId}`;
}

function readEntityAllocation(
  allocation: unknown,
): { type: AccountSponsorEntityType; id: number } | null {
  if (!allocation || typeof allocation !== "object") return null;
  const entity = (allocation as Record<string, unknown>)["entity"];
  if (!entity || typeof entity !== "object") return null;

  const entityRecord = entity as Record<string, unknown>;
  const type = entityRecord["type"];
  const id = entityRecord["id"];
  if (type !== "club" && type !== "team" && type !== "grade") return null;
  if (typeof id !== "number" || !Number.isFinite(id) || id <= 0) return null;
  return { type, id };
}

export function buildEntityTargetKey(target: AccountSponsorEntityTarget): EntityTargetKey {
  return targetKey(target.type, target.id);
}

export function collectEntityTargetAllocations(
  sponsors: ManageSponsorsWorkspaceSponsor[],
): Map<EntityTargetKey, EntityTargetAllocation[]> {
  const allocationsByTarget = new Map<EntityTargetKey, EntityTargetAllocation[]>();

  for (const sponsor of sponsors) {
    if (typeof sponsor.id !== "number" || sponsor.id <= 0) continue;

    for (const row of sponsor.sponsorshipAllocations) {
      const entity = readEntityAllocation(row.allocation);
      if (!entity) continue;

      const key = targetKey(entity.type, entity.id);
      const current = allocationsByTarget.get(key) ?? [];
      current.push({
        allocationId: row.id,
        sponsorId: sponsor.id,
        sponsorName: sponsor.name,
      });
      allocationsByTarget.set(key, current);
    }
  }

  return allocationsByTarget;
}

export function countEntityAllocationsForSponsor(sponsor: ManageSponsorsWorkspaceSponsor): number {
  return sponsor.sponsorshipAllocations.filter((row) => readEntityAllocation(row.allocation))
    .length;
}
