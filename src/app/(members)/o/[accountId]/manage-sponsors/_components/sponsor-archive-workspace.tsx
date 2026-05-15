"use client";

import { ManageSponsorsErrorState } from "./manage-sponsors-error-state";
import { ManageSponsorsLoadingState } from "./manage-sponsors-loading-state";
import { ManageSponsorsShell } from "./manage-sponsors-shell";
import { SponsorArchiveDeleteDialog } from "./sponsor-archive-delete-dialog";
import { SponsorArchiveEmptyState } from "./sponsor-archive-empty-state";
import { SponsorArchiveHeader } from "./sponsor-archive-header";
import { SponsorArchiveSummary } from "./sponsor-archive-summary";
import { SponsorArchiveTable } from "./sponsor-archive-table";
import { useManageSponsorsWorkspace } from "../_hooks/use-manage-sponsors-workspace";
import { useSponsorArchiveActions } from "../_hooks/use-sponsor-archive-actions";

export function SponsorArchiveWorkspace({ accountId }: { accountId: string }) {
  const {
    isRedirecting,
    isLoading,
    isError,
    errorMessage,
    workspaceSponsors,
    restoreArchivedSponsor,
    deleteSponsor,
    refetch,
  } = useManageSponsorsWorkspace(accountId);

  const {
    archivedSponsors,
    restoringSponsorId,
    deleteTarget,
    isDeleting,
    restoreSponsor,
    setDeleteTarget,
    confirmDeleteSponsor,
    handleDeleteDialogOpenChange,
  } = useSponsorArchiveActions({
    workspaceSponsors,
    restoreArchivedSponsor,
    deleteSponsor,
  });

  if (isRedirecting) {
    return <ManageSponsorsLoadingState />;
  }

  return (
    <ManageSponsorsShell>
      <SponsorArchiveHeader accountId={accountId} />

      {isLoading ? <ManageSponsorsLoadingState /> : null}
      {isError ? (
        <ManageSponsorsErrorState description={errorMessage} onRetry={() => void refetch()} />
      ) : null}

      {!isLoading && !isError ? (
        <div className="grid gap-4">
          <SponsorArchiveSummary archivedSponsorCount={archivedSponsors.length} />

          {archivedSponsors.length === 0 ? (
            <SponsorArchiveEmptyState accountId={accountId} />
          ) : (
            <SponsorArchiveTable
              sponsors={archivedSponsors}
              restoringSponsorId={restoringSponsorId}
              isDeleting={isDeleting}
              onRestoreSponsor={(sponsor) => void restoreSponsor(sponsor)}
              onSelectDeleteTarget={setDeleteTarget}
            />
          )}
        </div>
      ) : null}

      <SponsorArchiveDeleteDialog
        deleteTarget={deleteTarget}
        isDeleting={isDeleting}
        onOpenChange={handleDeleteDialogOpenChange}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void confirmDeleteSponsor()}
      />
    </ManageSponsorsShell>
  );
}
