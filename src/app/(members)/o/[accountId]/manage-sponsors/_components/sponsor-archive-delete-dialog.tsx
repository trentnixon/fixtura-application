import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ArchivedSponsorLogo } from "./archived-sponsor-logo";

import type { ManageSponsorsWorkspaceSponsor } from "../_types/manage-sponsors";

export function SponsorArchiveDeleteDialog({
  deleteTarget,
  isDeleting,
  onOpenChange,
  onCancel,
  onConfirm,
}: {
  deleteTarget: ManageSponsorsWorkspaceSponsor | null;
  isDeleting: boolean;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
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
          <DialogTitle>{isDeleting ? "Deleting sponsor" : "Delete archived sponsor?"}</DialogTitle>
          <DialogDescription>
            {isDeleting
              ? "Please wait while the sponsor is deleted."
              : "This permanently removes the sponsor record and its allocation data. Restore the sponsor instead if you may need it later."}
          </DialogDescription>
        </DialogHeader>
        {deleteTarget ? (
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <ArchivedSponsorLogo sponsor={deleteTarget} />
            <div className="min-w-0">
              <p className="truncate font-medium">{deleteTarget.name}</p>
              <p className="text-muted-foreground text-sm">Archived sponsor</p>
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
            {isDeleting ? "Deleting" : "Delete sponsor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
