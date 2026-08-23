"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { captureUserAction } from "@/lib/analytics";
import { ApiError } from "@/lib/api/client/api-error";
import { useDeleteAccountMediaLibraryItem } from "@/lib/api/hooks/account/useDeleteAccountMediaLibraryItem";
import { parseMediaLibraryApiError } from "@/lib/api/media-library/parse-media-library-api-error";

import type { AccountMediaLibraryItem } from "@/types/api/account";

type MediaGalleryDeleteDialogProps = {
  accountId: string;
  item: AccountMediaLibraryItem | null;
  onOpenChange: (open: boolean) => void;
};

export function MediaGalleryDeleteDialog({
  accountId,
  item,
  onOpenChange,
}: MediaGalleryDeleteDialogProps) {
  const deleteMutation = useDeleteAccountMediaLibraryItem(accountId);
  const isDeleting = deleteMutation.isPending;
  const open = item != null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && isDeleting) return;
    if (!nextOpen) onOpenChange(false);
  };

  const onConfirm = async () => {
    if (!item) return;
    try {
      await deleteMutation.mutateAsync(String(item.id));
      captureUserAction("media_deleted", { accountId, media_id: String(item.id) });
      toast.success("Background deleted");
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? parseMediaLibraryApiError(error.details).message
          : "Could not delete item. Please try again.";
      toast.error(message);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          <DialogTitle>Delete background?</DialogTitle>
          <DialogDescription>
            This removes &quot;{item.title}&quot; from your background images. The uploaded file may
            remain in storage if referenced elsewhere.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="brandPrimaryOutline"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={isDeleting}
            onClick={() => void onConfirm()}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
