import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { SPONSOR_ARCHIVE_DELETE_DIALOG_ARCHIVED_LABEL } from "./_constants/sponsor-archive-delete-dialog";
import { getSponsorArchiveDeleteDialogContent } from "./_utils/get-sponsor-archive-delete-dialog-content";
import { ArchivedSponsorLogo } from "./archived-sponsor-logo";

import type { SponsorArchiveDeleteDialogProps } from "./_types/sponsor-archive-delete-dialog";

export function SponsorArchiveDeleteDialog({
  deleteTarget,
  isDeleting,
  onOpenChange,
  onCancel,
  onConfirm,
}: SponsorArchiveDeleteDialogProps) {
  const dialogContent = getSponsorArchiveDeleteDialogContent(isDeleting);

  return (
    <Dialog open={deleteTarget != null} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={!isDeleting}
        onPointerDownOutside={(event) => {
          if (isDeleting) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isDeleting) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>{dialogContent.title}</DialogTitle>
          <DialogDescription>{dialogContent.description}</DialogDescription>
        </DialogHeader>
        {deleteTarget ? (
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <ArchivedSponsorLogo sponsor={deleteTarget} />
            <div className="min-w-0">
              <p className="truncate font-medium">{deleteTarget.name}</p>
              <p className="text-muted-foreground text-sm">
                {SPONSOR_ARCHIVE_DELETE_DIALOG_ARCHIVED_LABEL}
              </p>
            </div>
          </div>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            variant="brandPrimaryOutline"
            disabled={isDeleting}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="button" variant="destructive" disabled={isDeleting} onClick={onConfirm}>
            {dialogContent.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
