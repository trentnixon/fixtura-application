"use client";

import {
  TypographyCardTitle,
  TypographyDialogDescription,
  TypographyDialogTitle,
} from "@/components/typography";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { SponsorEditorLogoPreview } from "./save-dialog/sponsor-editor-logo-preview";
import { SPONSOR_EDITOR_SAVE_DIALOG_COPY } from "../_constants/sponsor-editor-save-dialog";

import type { SponsorEditorSaveDialogProps } from "../_types/sponsor-editor";

export function SponsorEditorSaveDialog({
  open,
  onOpenChange,
  isConfirmSaving,
  isCreateMode,
  clearLogo,
  logoPreviewUrl,
  savedLogoUrl,
  name,
  onConfirm,
}: SponsorEditorSaveDialogProps) {
  const title = isConfirmSaving
    ? SPONSOR_EDITOR_SAVE_DIALOG_COPY.busyTitle
    : SPONSOR_EDITOR_SAVE_DIALOG_COPY.idleTitle;
  const description = isConfirmSaving
    ? SPONSOR_EDITOR_SAVE_DIALOG_COPY.busyDescription
    : isCreateMode
      ? SPONSOR_EDITOR_SAVE_DIALOG_COPY.createDescription
      : SPONSOR_EDITOR_SAVE_DIALOG_COPY.updateDescription;
  const confirmLabel = isConfirmSaving
    ? SPONSOR_EDITOR_SAVE_DIALOG_COPY.busyConfirmAction
    : SPONSOR_EDITOR_SAVE_DIALOG_COPY.idleConfirmAction;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && isConfirmSaving) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent
        className="max-h-[min(90vh,800px)] overflow-y-auto"
        showCloseButton={!isConfirmSaving}
        onPointerDownOutside={(event) => {
          if (isConfirmSaving) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isConfirmSaving) event.preventDefault();
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
        <div className="flex flex-col items-center gap-2">
          <div className="mx-auto flex w-fit max-w-[min(100%,22rem)] shrink-0 justify-center sm:max-w-md">
            <SponsorEditorLogoPreview
              clearLogo={clearLogo}
              logoPreviewUrl={logoPreviewUrl}
              savedLogoUrl={savedLogoUrl}
              name={name}
            />
          </div>
          <div className="w-full min-w-0 text-center">
            <TypographyCardTitle as="p" className="wrap-break-word">
              {name.trim() || SPONSOR_EDITOR_SAVE_DIALOG_COPY.emptySponsorName}
            </TypographyCardTitle>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="brandPrimaryOutline"
            disabled={isConfirmSaving}
            onClick={() => onOpenChange(false)}
          >
            {SPONSOR_EDITOR_SAVE_DIALOG_COPY.cancelAction}
          </Button>
          <Button type="button" variant="success" disabled={isConfirmSaving} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
