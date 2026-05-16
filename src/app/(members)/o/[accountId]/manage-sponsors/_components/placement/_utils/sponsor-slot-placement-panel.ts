import { ApiError } from "@/lib/api/client/api-error";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { PRIMARY_POSITION_SLOT_IDS } from "../../../_constants/sponsor-position-slots";
import { countPositionSlotAllocationsForSponsor } from "../../../_utils/sponsorship-allocation-general";

import type { SponsorPositionSlotDef } from "../../../_constants/sponsor-position-slots";
import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";
import type { SlotOccupant } from "../../../_utils/sponsorship-allocation-general";
import type {
  AssignmentRowFilter,
  PositionAssignmentMetrics,
  SlotKindFilter,
  SponsorSlotPlacementTableRow,
} from "../_types/sponsor-slot-placement-panel";

export function allocationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return AUTH_ERROR_MESSAGES.unexpected;
}

export function findHighestVisibleGeneralSlotIndex(occupants: Map<string, SlotOccupant>) {
  let maxGeneralIndex = 0;
  for (const slotId of occupants.keys()) {
    const match = /^general_sponsor_(\d+)$/.exec(slotId);
    if (match) maxGeneralIndex = Math.max(maxGeneralIndex, Number(match[1]));
  }
  return maxGeneralIndex;
}

export function clampVisibleGeneralSlotCount({
  current,
  minimum,
  maximum,
  occupiedSlotIndex,
}: {
  current: number;
  minimum: number;
  maximum: number;
  occupiedSlotIndex: number;
}) {
  return Math.min(maximum, Math.max(current, minimum, occupiedSlotIndex));
}

export function buildVisiblePositionSlots({
  primarySlots,
  generalSlots,
  visibleGeneralSlotCount,
}: {
  primarySlots: SponsorPositionSlotDef[];
  generalSlots: SponsorPositionSlotDef[];
  visibleGeneralSlotCount: number;
}) {
  return [...primarySlots, ...generalSlots.slice(0, visibleGeneralSlotCount)];
}

export function buildPositionAssignmentMetrics({
  tableSlots,
  occupants,
  eligibleSponsors,
}: {
  tableSlots: SponsorPositionSlotDef[];
  occupants: Map<string, SlotOccupant>;
  eligibleSponsors: ManageSponsorsWorkspaceSponsor[];
}): PositionAssignmentMetrics {
  const total = tableSlots.length;
  const filled = tableSlots.filter((slot) => occupants.has(slot.id)).length;
  const empty = total - filled;
  const unassigned = eligibleSponsors.filter(
    (sponsor) => countPositionSlotAllocationsForSponsor(sponsor) === 0,
  ).length;

  return {
    total,
    filled,
    empty,
    eligibleCount: eligibleSponsors.length,
    unassigned,
  };
}

export function filterPositionSlots({
  tableSlots,
  occupants,
  sponsorByNumericId,
  assignmentRowFilter,
  slotKindFilter,
  sponsorSearchQuery,
}: {
  tableSlots: SponsorPositionSlotDef[];
  occupants: Map<string, SlotOccupant>;
  sponsorByNumericId: Map<number, ManageSponsorsWorkspaceSponsor>;
  assignmentRowFilter: AssignmentRowFilter;
  slotKindFilter: SlotKindFilter;
  sponsorSearchQuery: string;
}) {
  const query = sponsorSearchQuery.trim().toLowerCase();
  let slots = tableSlots;

  if (assignmentRowFilter === "empty") {
    slots = slots.filter((slot) => !occupants.has(slot.id));
  } else if (assignmentRowFilter === "filled") {
    slots = slots.filter((slot) => occupants.has(slot.id));
  }

  if (slotKindFilter === "primary") {
    slots = slots.filter((slot) => PRIMARY_POSITION_SLOT_IDS.has(slot.id));
  } else if (slotKindFilter === "general") {
    slots = slots.filter((slot) => !PRIMARY_POSITION_SLOT_IDS.has(slot.id));
  }

  if (!query.length) return slots;

  return slots.filter((slot) => {
    const occupant = occupants.get(slot.id);
    if (!occupant) return true;
    const assigned = sponsorByNumericId.get(occupant.sponsorId);
    const label = (assigned?.name ?? `Sponsor #${occupant.sponsorId}`).toLowerCase();
    return label.includes(query);
  });
}

export function filterEligibleSponsorsForPicker({
  eligibleSponsors,
  sponsorSearchQuery,
}: {
  eligibleSponsors: ManageSponsorsWorkspaceSponsor[];
  sponsorSearchQuery: string;
}) {
  const query = sponsorSearchQuery.trim().toLowerCase();
  if (!query.length) return eligibleSponsors;
  return eligibleSponsors.filter((sponsor) => sponsor.name.toLowerCase().includes(query));
}

export function buildAddGeneralPositionLabel(remaining: number) {
  return `+ Add general position (${remaining})`;
}

export function buildClearPositionAssignmentTasks(occupants: Map<string, SlotOccupant>) {
  return Array.from(occupants.values()).map((occupant) => ({
    sponsorId: occupant.sponsorId,
    allocationId: occupant.allocationId,
  }));
}

export function buildSponsorSlotPlacementTableRows({
  displaySlots,
  occupants,
  sponsorByNumericId,
  rowSelection,
  isPending,
  busySlotId,
  isClearingAll,
}: {
  displaySlots: SponsorPositionSlotDef[];
  occupants: Map<string, SlotOccupant>;
  sponsorByNumericId: Map<number, ManageSponsorsWorkspaceSponsor>;
  rowSelection: Record<string, string>;
  isPending: boolean;
  busySlotId: string | null;
  isClearingAll: boolean;
}): SponsorSlotPlacementTableRow[] {
  return displaySlots.map((slot) => {
    const occupant = occupants.get(slot.id) ?? null;
    const assigned = occupant ? (sponsorByNumericId.get(occupant.sponsorId) ?? null) : null;

    return {
      key: slot.id,
      slot,
      occupant,
      assigned,
      rowBusy: busySlotId === slot.id || isPending || isClearingAll,
      selectValue: rowSelection[slot.id] ?? "",
      isPrimary: PRIMARY_POSITION_SLOT_IDS.has(slot.id),
    };
  });
}
