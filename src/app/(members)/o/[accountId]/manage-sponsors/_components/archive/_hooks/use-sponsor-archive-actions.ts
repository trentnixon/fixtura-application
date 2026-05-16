import { useMemo, useState } from "react";
import { toast } from "sonner";

import { getArchivedSponsors, getSponsorMutationErrorMessage } from "../_utils/sponsor-archive";

import type { ManageSponsorsWorkspaceSponsor } from "../../../_types/manage-sponsors";

export function useSponsorArchiveActions({
  workspaceSponsors,
  restoreArchivedSponsor,
  deleteSponsor,
}: {
  workspaceSponsors: ManageSponsorsWorkspaceSponsor[];
  restoreArchivedSponsor: (sponsorId: ManageSponsorsWorkspaceSponsor["id"]) => Promise<void>;
  deleteSponsor: (sponsorId: ManageSponsorsWorkspaceSponsor["id"]) => Promise<void>;
}) {
  const archivedSponsors = useMemo(
    () => getArchivedSponsors(workspaceSponsors),
    [workspaceSponsors],
  );

  const [restoringSponsorId, setRestoringSponsorId] = useState<
    ManageSponsorsWorkspaceSponsor["id"] | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<ManageSponsorsWorkspaceSponsor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function restoreSponsor(sponsor: ManageSponsorsWorkspaceSponsor) {
    setRestoringSponsorId(sponsor.id);
    try {
      await restoreArchivedSponsor(sponsor.id);
      toast.success("Sponsor restored", {
        description: `${sponsor.name} is back in the sponsor pool.`,
      });
    } catch (error) {
      toast.error(getSponsorMutationErrorMessage(error));
    } finally {
      setRestoringSponsorId(null);
    }
  }

  async function confirmDeleteSponsor() {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteSponsor(deleteTarget.id);
      toast.success("Sponsor deleted", {
        description: `${deleteTarget.name} was permanently removed.`,
      });
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getSponsorMutationErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  }

  function handleDeleteDialogOpenChange(open: boolean) {
    if (!open && isDeleting) return;
    if (!open) setDeleteTarget(null);
  }

  return {
    archivedSponsors,
    restoringSponsorId,
    deleteTarget,
    isDeleting,
    restoreSponsor,
    setDeleteTarget,
    confirmDeleteSponsor,
    handleDeleteDialogOpenChange,
  };
}
