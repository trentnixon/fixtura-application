import type { AssignSponsorsMode } from "./assign-sponsors-header";
import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";

export type AssignSponsorsWorkspaceProps = {
  accountId: string;
  mode: AssignSponsorsMode;
};

export type AssignSponsorsWorkspaceContentProps = AssignSponsorsWorkspaceProps & {
  errorMessage: string;
  hasSponsors: boolean;
  isError: boolean;
  isLoading: boolean;
  onRetry: () => void;
  sponsors: ManageSponsorsWorkspaceSponsor[];
};

export type AssignSponsorsPlacementPanelsProps = AssignSponsorsWorkspaceProps & {
  sponsors: ManageSponsorsWorkspaceSponsor[];
};
