import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";

export type SponsorTargetingPlacementKind = "general" | "entity" | "unknown";

export type SponsorTargetingPanelProps = {
  accountId: string;
  sponsor: ManageSponsorsWorkspaceSponsor | null;
};

export type SponsorPlacementOptionsCardProps = {
  title: string;
  description: string;
  positionBadge: string;
  entityBadge: string;
};

export type SponsorPlacementSummaryCardProps = {
  title: string;
  count: number;
  emptyLabel: string;
};

export type SelectedSponsorPlacementSummaryProps = {
  sponsor: ManageSponsorsWorkspaceSponsor;
  refreshedPositionCount: number | null;
  isRefreshing: boolean;
  refreshError: unknown;
};
