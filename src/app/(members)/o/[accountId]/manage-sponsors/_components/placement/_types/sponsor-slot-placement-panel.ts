import type { SponsorPlacementBrandingPreviewState } from "./sponsor-placement-branding-preview";
import type { SponsorPositionSlotDef } from "../../../_constants/sponsor-position-slots";
import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";
import type { SlotOccupant } from "../../../_utils/sponsorship-allocation-general";
import type { Dispatch, SetStateAction } from "react";

export type AssignmentRowFilter = "all" | "empty" | "filled";
export type SlotKindFilter = "all" | "primary" | "general";

export type PositionAssignmentMetrics = {
  total: number;
  filled: number;
  empty: number;
  eligibleCount: number;
  unassigned: number;
};

export type PositionAssignmentMutationState = {
  isPending: boolean;
  busySlotId: string | null;
  isClearingAll: boolean;
};

export type SponsorSlotPlacementState = {
  occupants: Map<string, SlotOccupant>;
  sponsorByNumericId: Map<number, ManageSponsorsWorkspaceSponsor>;
  eligibleSponsors: ManageSponsorsWorkspaceSponsor[];
  eligibleForPicker: ManageSponsorsWorkspaceSponsor[];
  tableSlots: SponsorPositionSlotDef[];
  displaySlots: SponsorPositionSlotDef[];
  metrics: PositionAssignmentMetrics;
  rowSelection: Record<string, string>;
  assignmentRowFilter: AssignmentRowFilter;
  slotKindFilter: SlotKindFilter;
  sponsorSearchQuery: string;
  canAddGeneralRow: boolean;
  generalPositionSlotsRemaining: number;
  mutationState: PositionAssignmentMutationState;
  clearAllDialogOpen: boolean;
} & SponsorPlacementBrandingPreviewState;

export type SponsorSlotPlacementActions = {
  setRowSelection: Dispatch<SetStateAction<Record<string, string>>>;
  setAssignmentRowFilter: (value: AssignmentRowFilter) => void;
  setSlotKindFilter: (value: SlotKindFilter) => void;
  setSponsorSearchQuery: (value: string) => void;
  addGeneralSlotRow: () => void;
  assignToSlot: (slot: SponsorPositionSlotDef) => Promise<void>;
  clearSlot: (slotId: string) => Promise<void>;
  setClearAllDialogOpen: (open: boolean) => void;
  confirmClearAllPositionAssignments: () => Promise<void>;
};

export type SponsorSlotPlacementHookOptions = {
  accountId: string;
  sponsors: ManageSponsorsWorkspaceSponsor[];
};

export type SponsorSlotPlacementHookResult = {
  segmentOk: boolean;
  state: SponsorSlotPlacementState;
  actions: SponsorSlotPlacementActions;
};

export type SponsorSlotPlacementTableProps = {
  displaySlots: SponsorPositionSlotDef[];
  occupants: Map<string, SlotOccupant>;
  sponsorByNumericId: Map<number, ManageSponsorsWorkspaceSponsor>;
  eligibleForPicker: ManageSponsorsWorkspaceSponsor[];
  rowSelection: Record<string, string>;
  mutationState: PositionAssignmentMutationState;
  setRowSelection: Dispatch<SetStateAction<Record<string, string>>>;
  assignToSlot: (slot: SponsorPositionSlotDef) => Promise<void>;
  clearSlot: (slotId: string) => Promise<void>;
};

export type SponsorSlotPlacementTableRow = {
  key: string;
  slot: SponsorPositionSlotDef;
  occupant: SlotOccupant | null;
  assigned: ManageSponsorsWorkspaceSponsor | null;
  rowBusy: boolean;
  selectValue: string;
  isPrimary: boolean;
};

export type SponsorSlotPlacementSidebarProps = {
  metrics: PositionAssignmentMetrics;
  mutationState: PositionAssignmentMutationState;
  clearAllDialogOpen: boolean;
  sponsorSearchQuery: string;
  assignmentRowFilter: AssignmentRowFilter;
  slotKindFilter: SlotKindFilter;
  canAddGeneralRow: boolean;
  generalPositionSlotsRemaining: number;
  setSponsorSearchQuery: (value: string) => void;
  setAssignmentRowFilter: (value: AssignmentRowFilter) => void;
  setSlotKindFilter: (value: SlotKindFilter) => void;
  onAddGeneralRow: () => void;
  onClearAll: () => void;
};

export type SponsorSlotPlacementPanelProps = {
  accountId: string;
  sponsors: ManageSponsorsWorkspaceSponsor[];
};
