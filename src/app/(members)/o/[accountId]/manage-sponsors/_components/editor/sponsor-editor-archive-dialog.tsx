"use client";

import { TypographyDialogDescription, TypographyDialogTitle } from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { SPONSOR_EDITOR_ARCHIVE_DIALOG_COPY } from "../../_constants/sponsor-editor-archive-dialog";

import type { SponsorEditorArchiveDialogProps } from "../../_types/sponsor-editor";

export function SponsorEditorArchiveDialog({
  open,
  onOpenChange,
  isArchiving,
  onConfirm,
}: SponsorEditorArchiveDialogProps) {
  const title = isArchiving
    ? SPONSOR_EDITOR_ARCHIVE_DIALOG_COPY.busyTitle
    : SPONSOR_EDITOR_ARCHIVE_DIALOG_COPY.idleTitle;
  const description = isArchiving
    ? SPONSOR_EDITOR_ARCHIVE_DIALOG_COPY.busyDescription
    : SPONSOR_EDITOR_ARCHIVE_DIALOG_COPY.idleDescription;
  const confirmLabel = isArchiving
    ? SPONSOR_EDITOR_ARCHIVE_DIALOG_COPY.busyConfirmAction
    : SPONSOR_EDITOR_ARCHIVE_DIALOG_COPY.idleConfirmAction;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isArchiving) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        showCloseButton={!isArchiving}
        onPointerDownOutside={(event) => {
          if (isArchiving) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isArchiving) event.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle asChild>
            <TypographyDialogTitle className="text-lg leading-none">{title}</TypographyDialogTitle>
          </DialogTitle>
          <DialogDescription asChild>
            <TypographyDialogDescription>{description}</TypographyDialogDescription>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="brandPrimaryOutline"
            disabled={isArchiving}
            onClick={() => onOpenChange(false)}
          >
            {SPONSOR_EDITOR_ARCHIVE_DIALOG_COPY.cancelAction}
          </Button>
          <Button type="button" disabled={isArchiving} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
