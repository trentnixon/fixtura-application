import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";

export type SponsorArchiveDeleteDialogProps = {
  deleteTarget: ManageSponsorsWorkspaceSponsor | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
};
