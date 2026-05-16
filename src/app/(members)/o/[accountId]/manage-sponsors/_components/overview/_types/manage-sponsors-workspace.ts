import type { useManageSponsorsWorkspace } from "../../../_hooks/use-manage-sponsors-workspace";
import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";
import type { SponsorEditorSaveParams } from "../../editor/_types/sponsor-editor";

export type ManageSponsorsWorkspaceProps = {
  accountId: string;
};

export type ManageSponsorsWorkspaceState = ReturnType<typeof useManageSponsorsWorkspace>;

export type ManageSponsorsWorkspaceContentProps = ManageSponsorsWorkspaceProps & {
  workspace: ManageSponsorsWorkspaceState;
  onEditSponsor: (sponsorId: number | string) => void;
};

export type ManageSponsorsEditorSheetProps = {
  open: boolean;
  sponsor: ManageSponsorsWorkspaceSponsor | null;
  onOpenChange: (open: boolean) => void;
  onSaveSponsor: (params: SponsorEditorSaveParams) => void | Promise<void>;
  onSaved: () => void;
};

export type UseManageSponsorsEditorSelectionInput = {
  sponsors: ManageSponsorsWorkspaceSponsor[];
};
