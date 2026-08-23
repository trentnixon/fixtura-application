"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { captureUserAction } from "@/lib/analytics";
import { useAccountSponsorAllocationsGeneralMutations } from "@/lib/api/hooks/account/useAccountSponsorAllocationsGeneralMutations";
import { isValidAccountIdSegment } from "@/lib/config/account-routes";

import { useSponsorPlacementBrandingPreview } from "./use-sponsor-placement-branding-preview";
import {
  ALL_GENERAL_POSITION_SLOTS,
  ALL_POSITION_SLOT_IDS,
  INITIAL_GENERAL_SPONSOR_SLOTS_VISIBLE,
  MAX_GENERAL_SPONSOR_SLOTS,
  PRIMARY_POSITION_SLOTS,
} from "../../../_constants/sponsor-position-slots";
import {
  buildGeneralPositionAllocationBody,
  collectPositionSlotOccupants,
} from "../../../_utils/sponsorship-allocation-general";
import {
  buildEligibleSponsors,
  buildSponsorByNumericId,
} from "../_utils/sponsor-placement-sponsors";
import {
  allocationErrorMessage,
  buildVisiblePositionSlots,
  buildClearPositionAssignmentTasks,
  buildPositionAssignmentMetrics,
  clampVisibleGeneralSlotCount,
  filterEligibleSponsorsForPicker,
  filterPositionSlots,
  findHighestVisibleGeneralSlotIndex,
} from "../_utils/sponsor-slot-placement-panel";

import type { SponsorPositionSlotDef } from "../../../_constants/sponsor-position-slots";
import type {
  AssignmentRowFilter,
  SlotKindFilter,
  SponsorSlotPlacementHookOptions,
  SponsorSlotPlacementHookResult,
} from "../_types/sponsor-slot-placement-panel";

export function useSponsorSlotPlacementPanel({
  accountId,
  sponsors,
}: SponsorSlotPlacementHookOptions): SponsorSlotPlacementHookResult {
  const segmentOk = isValidAccountIdSegment(accountId);
  const brandingPreviewState = useSponsorPlacementBrandingPreview({
    accountId,
    enabled: segmentOk,
  });
  const { postAllocation, deleteAllocation, isPending } =
    useAccountSponsorAllocationsGeneralMutations(accountId);

  const [busySlotId, setBusySlotId] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, string>>({});
  const [generalSlotVisibleCount, setGeneralSlotVisibleCount] = useState(
    INITIAL_GENERAL_SPONSOR_SLOTS_VISIBLE,
  );
  const [assignmentRowFilter, setAssignmentRowFilter] = useState<AssignmentRowFilter>("all");
  const [slotKindFilter, setSlotKindFilter] = useState<SlotKindFilter>("all");
  const [sponsorSearchQuery, setSponsorSearchQuery] = useState("");

  const occupants = useMemo(
    () => collectPositionSlotOccupants(sponsors, ALL_POSITION_SLOT_IDS),
    [sponsors],
  );

  const eligibleSponsors = useMemo(() => buildEligibleSponsors(sponsors), [sponsors]);
  const sponsorByNumericId = useMemo(() => buildSponsorByNumericId(sponsors), [sponsors]);

  useEffect(() => {
    const maxGeneralIndex = findHighestVisibleGeneralSlotIndex(occupants);
    setGeneralSlotVisibleCount((current) =>
      clampVisibleGeneralSlotCount({
        current,
        minimum: INITIAL_GENERAL_SPONSOR_SLOTS_VISIBLE,
        maximum: MAX_GENERAL_SPONSOR_SLOTS,
        occupiedSlotIndex: maxGeneralIndex,
      }),
    );
  }, [occupants]);

  const tableSlots = useMemo(
    () =>
      buildVisiblePositionSlots({
        primarySlots: PRIMARY_POSITION_SLOTS,
        generalSlots: ALL_GENERAL_POSITION_SLOTS,
        visibleGeneralSlotCount: generalSlotVisibleCount,
      }),
    [generalSlotVisibleCount],
  );

  const metrics = useMemo(
    () => buildPositionAssignmentMetrics({ tableSlots, occupants, eligibleSponsors }),
    [eligibleSponsors, occupants, tableSlots],
  );

  const displaySlots = useMemo(
    () =>
      filterPositionSlots({
        tableSlots,
        occupants,
        sponsorByNumericId,
        assignmentRowFilter,
        slotKindFilter,
        sponsorSearchQuery,
      }),
    [
      assignmentRowFilter,
      occupants,
      slotKindFilter,
      sponsorByNumericId,
      sponsorSearchQuery,
      tableSlots,
    ],
  );

  const eligibleForPicker = useMemo(
    () => filterEligibleSponsorsForPicker({ eligibleSponsors, sponsorSearchQuery }),
    [eligibleSponsors, sponsorSearchQuery],
  );

  const canAddGeneralRow = generalSlotVisibleCount < MAX_GENERAL_SPONSOR_SLOTS;
  const generalPositionSlotsRemaining = MAX_GENERAL_SPONSOR_SLOTS - generalSlotVisibleCount;

  function addGeneralSlotRow() {
    setGeneralSlotVisibleCount((count) => Math.min(MAX_GENERAL_SPONSOR_SLOTS, count + 1));
  }

  async function assignToSlot(slot: SponsorPositionSlotDef) {
    const raw = rowSelection[slot.id] ?? "";
    const targetId = Number(raw);
    if (!raw || !Number.isFinite(targetId) || targetId <= 0) {
      toast.error("Choose a sponsor for this slot.");
      return;
    }

    const target = sponsorByNumericId.get(targetId);
    if (!target?.isActive || !target.hasLogo) {
      toast.error("Choose an active sponsor with a logo.");
      return;
    }

    const occupant = occupants.get(slot.id);
    if (occupant && occupant.sponsorId === targetId) {
      toast.message("This sponsor is already assigned to the slot.");
      return;
    }

    setBusySlotId(slot.id);
    try {
      if (occupant) {
        await deleteAllocation.mutateAsync({
          sponsorId: occupant.sponsorId,
          allocationId: occupant.allocationId,
        });
      }
      await postAllocation.mutateAsync({
        sponsorId: targetId,
        body: buildGeneralPositionAllocationBody(slot),
      });
      captureUserAction("sponsor_position_assigned", { accountId });
      toast.success(`Assigned ${target.name} to ${slot.title}.`);
      setRowSelection((prev) => ({ ...prev, [slot.id]: "" }));
    } catch (error) {
      toast.error(allocationErrorMessage(error));
    } finally {
      setBusySlotId(null);
    }
  }

  async function clearSlot(slotId: string) {
    const occupant = occupants.get(slotId);
    if (!occupant) return;

    setBusySlotId(slotId);
    try {
      await deleteAllocation.mutateAsync({
        sponsorId: occupant.sponsorId,
        allocationId: occupant.allocationId,
      });
      captureUserAction("sponsor_position_cleared", { accountId });
      toast.success("Removed assignment.");
      setRowSelection((prev) => ({ ...prev, [slotId]: "" }));
    } catch (error) {
      toast.error(allocationErrorMessage(error));
    } finally {
      setBusySlotId(null);
    }
  }

  async function confirmClearAllPositionAssignments() {
    const tasks = buildClearPositionAssignmentTasks(occupants);
    if (!tasks.length) return;

    setIsClearingAll(true);
    try {
      for (const task of tasks) {
        await deleteAllocation.mutateAsync(task);
      }
      setRowSelection({});
      setClearAllDialogOpen(false);
      captureUserAction("sponsor_positions_cleared_all", { accountId });
      toast.success(`Cleared ${tasks.length} position assignment${tasks.length === 1 ? "" : "s"}.`);
    } catch (error) {
      toast.error(allocationErrorMessage(error));
    } finally {
      setIsClearingAll(false);
    }
  }

  return {
    segmentOk,
    state: {
      occupants,
      sponsorByNumericId,
      eligibleSponsors,
      eligibleForPicker,
      tableSlots,
      displaySlots,
      metrics,
      rowSelection,
      assignmentRowFilter,
      slotKindFilter,
      sponsorSearchQuery,
      canAddGeneralRow,
      generalPositionSlotsRemaining,
      mutationState: {
        isPending,
        busySlotId,
        isClearingAll,
      },
      clearAllDialogOpen,
      ...brandingPreviewState,
    },
    actions: {
      setRowSelection,
      setAssignmentRowFilter,
      setSlotKindFilter,
      setSponsorSearchQuery,
      addGeneralSlotRow,
      assignToSlot,
      clearSlot,
      setClearAllDialogOpen,
      confirmClearAllPositionAssignments,
    },
  };
}
