import { parseGeneralAccountGroup } from "@/lib/sponsors/parse-general-account-group";

import { countEntityAllocationsForSponsor } from "./sponsorship-allocation-entity";
import {
  ALL_POSITION_SLOT_IDS,
  POSITION_ALLOCATION_CATEGORY,
  PRIMARY_POSITION_SLOT_IDS,
} from "../_constants/sponsor-position-slots";

import type { ManageSponsorsWorkspaceSponsor } from "../_types/manage-sponsors";

export type { GeneralAccountGroup } from "@/lib/sponsors/parse-general-account-group";
export { parseGeneralAccountGroup } from "@/lib/sponsors/parse-general-account-group";

/**
 * Extract `accountGroup` from allocation JSON if this row is a general allocation
 * (has `accountGroup`, no root `entity`).
 */
export function isGeneralAllocationRow(allocation: unknown): boolean {
  return parseGeneralAccountGroup(allocation) != null;
}

/** Minimal body for POST general allocation (`{ allocation: { accountGroup } }`). */
export function buildGeneralPositionAllocationBody(slot: { id: string; title: string }): {
  allocation: { accountGroup: { category: string; id: string; level: string; name: string } };
} {
  return {
    allocation: {
      accountGroup: {
        category: POSITION_ALLOCATION_CATEGORY,
        id: slot.id,
        level: slot.title,
        name: slot.title,
      },
    },
  };
}

export type SlotOccupant = {
  sponsorId: number;
  allocationId: number;
};

/**
 * Map position slot id → holder for a fixed category + allowed slot ids.
 */
export function collectPositionSlotOccupants(
  sponsors: ManageSponsorsWorkspaceSponsor[],
  slotIds: ReadonlySet<string>,
): Map<string, SlotOccupant> {
  const map = new Map<string, SlotOccupant>();
  for (const sponsor of sponsors) {
    if (typeof sponsor.id !== "number" || !Number.isFinite(sponsor.id) || sponsor.id <= 0) continue;
    for (const row of sponsor.sponsorshipAllocations) {
      const ag = parseGeneralAccountGroup(row.allocation);
      if (!ag || ag.category !== POSITION_ALLOCATION_CATEGORY) continue;
      if (!slotIds.has(ag.id)) continue;
      if (!map.has(ag.id)) {
        map.set(ag.id, { sponsorId: sponsor.id, allocationId: row.id });
      }
    }
  }
  return map;
}

export function countPositionSlotAllocationsForSponsor(
  sponsor: ManageSponsorsWorkspaceSponsor,
): number {
  let n = 0;
  for (const row of sponsor.sponsorshipAllocations) {
    const ag = parseGeneralAccountGroup(row.allocation);
    if (ag && ag.category === POSITION_ALLOCATION_CATEGORY && ALL_POSITION_SLOT_IDS.has(ag.id)) {
      n++;
    }
  }
  return n;
}

/** True when the sponsor counts as “placed” in pool filters/stats (not pool-only). */
export function sponsorHasPoolPlacement(sponsor: ManageSponsorsWorkspaceSponsor): boolean {
  return (
    Boolean(sponsor.isPrimary) ||
    sponsor.rank != null ||
    countPositionSlotAllocationsForSponsor(sponsor) > 0 ||
    countEntityAllocationsForSponsor(sponsor) > 0
  );
}

export function sponsorHasPrimaryPositionSlot(sponsor: ManageSponsorsWorkspaceSponsor): boolean {
  for (const row of sponsor.sponsorshipAllocations) {
    const ag = parseGeneralAccountGroup(row.allocation);
    if (
      ag &&
      ag.category === POSITION_ALLOCATION_CATEGORY &&
      PRIMARY_POSITION_SLOT_IDS.has(ag.id)
    ) {
      return true;
    }
  }
  return false;
}
