import type { SponsorPlacementBrandingPreviewState } from "./sponsor-placement-branding-preview";
import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";
import type { EntityTargetAllocation } from "../../../_utils/sponsorship-allocation-entity";
import type { useAccountSponsorEntityTargets } from "@/lib/api/hooks/account/useAccountSponsorEntityTargets";
import type { AccountSponsorEntityTarget, AccountSponsorEntityType } from "@/types/api/account";
import type { Dispatch, SetStateAction } from "react";

export type EntityRowFilter = "all" | "assigned" | "unassigned";
export type EntityTypeFilter = "all" | AccountSponsorEntityType;

export type ParsedEntityTargetKey = {
  type: AccountSponsorEntityType;
  id: number;
};

export type EntityTargetGroup = {
  key: string;
  label: string;
  targets: AccountSponsorEntityTarget[];
};

export type EntityAssignmentMetrics = {
  totalTargets: number;
  assignedTargets: number;
  emptyTargets: number;
  eligibleCount: number;
  unassigned: number;
  totalAllocations: number;
};

export type ClearEntityAssignmentTask = {
  sponsorId: number;
  entityType: AccountSponsorEntityType;
  entityId: number;
  allocationId: number;
};

export type TargetMatchesSearchOptions = {
  target: AccountSponsorEntityTarget;
  query: string;
  allocationsByTarget: Map<string, EntityTargetAllocation[]>;
};

export type EntityTargetWithAllocationsOptions = {
  target: AccountSponsorEntityTarget;
  allocationsByTarget: Map<string, EntityTargetAllocation[]>;
};

export type BuildPrimaryPositionSponsorsOptions = {
  sponsors: ManageSponsorsWorkspaceSponsor[];
  sponsorByNumericId: Map<number, ManageSponsorsWorkspaceSponsor>;
};

export type FilterEntityTargetsOptions = {
  targets: AccountSponsorEntityTarget[];
  allocationsByTarget: Map<string, EntityTargetAllocation[]>;
  entityRowFilter: EntityRowFilter;
  entityTypeFilter: EntityTypeFilter;
  entitySearchQuery: string;
};

export type EntityTargetsWithAllocationsOptions = {
  targets: AccountSponsorEntityTarget[];
  allocationsByTarget: Map<string, EntityTargetAllocation[]>;
};

export type BuildEntityAssignmentMetricsOptions = EntityTargetsWithAllocationsOptions & {
  eligibleSponsors: ManageSponsorsWorkspaceSponsor[];
};

export type BuildEntityAssignmentTableRowsOptions = {
  groupedTargets: EntityTargetGroup[];
  allocationsByTarget: Map<string, EntityTargetAllocation[]>;
  sponsorByNumericId: Map<number, ManageSponsorsWorkspaceSponsor>;
  rowSelection: Record<string, string>;
  isPending: boolean;
  busyTargetKey: string | null;
  isClearingAll: boolean;
};

export type ResolveEntityPreviewTargetsOptions = {
  allTargets: AccountSponsorEntityTarget[];
  previewTargets: AccountSponsorEntityTarget[];
};

export type EntityAssignmentMutationState = {
  isPending: boolean;
  busyTargetKey: string | null;
  isClearingAll: boolean;
};

export type SponsorEntityAssignmentState = {
  groupedTargets: EntityTargetGroup[];
  allocationsByTarget: Map<string, EntityTargetAllocation[]>;
  sponsorByNumericId: Map<number, ManageSponsorsWorkspaceSponsor>;
  eligibleSponsors: ManageSponsorsWorkspaceSponsor[];
  primaryPositionSponsors: ManageSponsorsWorkspaceSponsor[];
  previewTargets: AccountSponsorEntityTarget[];
  allTargets: AccountSponsorEntityTarget[];
  metrics: EntityAssignmentMetrics;
  rowSelection: Record<string, string>;
  entitySearchQuery: string;
  entityRowFilter: EntityRowFilter;
  entityTypeFilter: EntityTypeFilter;
  mutationState: EntityAssignmentMutationState;
  clearAllDialogOpen: boolean;
} & SponsorPlacementBrandingPreviewState;

export type SponsorEntityAssignmentActions = {
  setEntitySearchQuery: (value: string) => void;
  setEntityRowFilter: (value: EntityRowFilter) => void;
  setEntityTypeFilter: (value: EntityTypeFilter) => void;
  setRowSelection: Dispatch<SetStateAction<Record<string, string>>>;
  assignToTarget: (target: AccountSponsorEntityTarget) => Promise<void>;
  clearTarget: (target: AccountSponsorEntityTarget) => Promise<void>;
  setClearAllDialogOpen: (open: boolean) => void;
  confirmClearAllEntityAssignments: () => Promise<void>;
};

export type SponsorEntityAssignmentHookOptions = {
  accountId: string;
  sponsors: ManageSponsorsWorkspaceSponsor[];
};

export type SponsorEntityAssignmentHookResult = {
  segmentOk: boolean;
  targetsQuery: ReturnType<typeof useAccountSponsorEntityTargets>;
  state: SponsorEntityAssignmentState;
  actions: SponsorEntityAssignmentActions;
};

export type SponsorEntityAssignmentTableProps = {
  groupedTargets: EntityTargetGroup[];
  allocationsByTarget: Map<string, EntityTargetAllocation[]>;
  sponsorByNumericId: Map<number, ManageSponsorsWorkspaceSponsor>;
  eligibleSponsors: ManageSponsorsWorkspaceSponsor[];
  rowSelection: Record<string, string>;
  mutationState: EntityAssignmentMutationState;
  setRowSelection: Dispatch<SetStateAction<Record<string, string>>>;
  assignToTarget: (target: AccountSponsorEntityTarget) => Promise<void>;
  clearTarget: (target: AccountSponsorEntityTarget) => Promise<void>;
  readOnly?: boolean;
};

export type EntityAssignmentTableGroupRow = {
  kind: "group";
  key: string;
  label: string;
  targetCount: number;
};

export type EntityAssignmentTableTargetRow = {
  kind: "target";
  key: string;
  target: AccountSponsorEntityTarget;
  assignments: EntityTargetAllocation[];
  firstAssignment: EntityTargetAllocation | null;
  previewSponsor: ManageSponsorsWorkspaceSponsor | null;
  hasAssignment: boolean;
  rowBusy: boolean;
  selectValue: string;
  context: string;
  label: string;
};

export type EntityAssignmentTableRow =
  EntityAssignmentTableGroupRow | EntityAssignmentTableTargetRow;

export type EntityAssignmentGroupRowProps = {
  row: EntityAssignmentTableGroupRow;
};

export type EntityAssignmentTargetRowProps = {
  row: EntityAssignmentTableTargetRow;
  eligibleSponsors: ManageSponsorsWorkspaceSponsor[];
  setRowSelection: Dispatch<SetStateAction<Record<string, string>>>;
  assignToTarget: SponsorEntityAssignmentTableProps["assignToTarget"];
  clearTarget: SponsorEntityAssignmentTableProps["clearTarget"];
  readOnly?: boolean;
};

export type SponsorEntityAssignmentSidebarProps = {
  metrics: EntityAssignmentMetrics;
  mutationState: EntityAssignmentMutationState;
  clearAllDialogOpen: boolean;
  entitySearchQuery: string;
  entityRowFilter: EntityRowFilter;
  entityTypeFilter: EntityTypeFilter;
  setEntitySearchQuery: (value: string) => void;
  setEntityRowFilter: (value: EntityRowFilter) => void;
  setEntityTypeFilter: (value: EntityTypeFilter) => void;
  onClearAll: () => void;
  readOnly?: boolean;
};

export type SponsorEntityAssignmentPanelProps = {
  accountId: string;
  sponsors: ManageSponsorsWorkspaceSponsor[];
};
