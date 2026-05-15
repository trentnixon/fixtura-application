import { countEntityAllocationsForSponsor } from "./sponsorship-allocation-entity";
import {
  ALL_POSITION_SLOT_IDS,
  POSITION_ALLOCATION_CATEGORY,
  PRIMARY_POSITION_SLOT_IDS,
} from "../_constants/sponsor-position-slots";

import type { ManageSponsorsWorkspaceSponsor } from "../_types/manage-sponsors";

/** Parsed `accountGroup` from a general allocation JSON blob. */
export type GeneralAccountGroup = {
  category: string;
  id: string;
};

/**
 * Extract `accountGroup` from allocation JSON if this row is a general allocation
 * (has `accountGroup`, no root `entity`).
 */
export function parseGeneralAccountGroup(allocation: unknown): GeneralAccountGroup | null {
  if (!allocation || typeof allocation !== "object") return null;
  const o = allocation as Record<string, unknown>;
  if (o["entity"] != null && typeof o["entity"] === "object") return null;
  const ag = o["accountGroup"];
  if (ag == null || typeof ag !== "object") return null;
  const g = ag as Record<string, unknown>;
  const category = g["category"];
  const id = g["id"];
  if (typeof category !== "string" || typeof id !== "string") return null;
  const c = category.trim();
  const i = id.trim();
  if (!c.length || !i.length) return null;
  return { category: c, id: i };
}

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
