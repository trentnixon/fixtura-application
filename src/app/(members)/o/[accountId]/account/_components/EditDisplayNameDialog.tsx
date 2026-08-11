import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  EDIT_DISPLAY_NAME_DIALOG_CANCEL_LABEL,
  EDIT_DISPLAY_NAME_DIALOG_DESCRIPTION,
  EDIT_DISPLAY_NAME_DIALOG_INPUT_ID,
  EDIT_DISPLAY_NAME_DIALOG_LABEL,
  EDIT_DISPLAY_NAME_DIALOG_SUBMIT_LABEL,
  EDIT_DISPLAY_NAME_DIALOG_SUBMITTING_LABEL,
  EDIT_DISPLAY_NAME_DIALOG_TITLE,
} from "../_constants/edit-display-name-dialog";

import type { EditDisplayNameDialogProps } from "../_types/edit-display-name-dialog";

export function EditDisplayNameDialog({
  error,
  isOpen,
  isSubmitting,
  value,
  onChange,
  onClose,
  onOpenChange,
  onSubmit,
}: EditDisplayNameDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{EDIT_DISPLAY_NAME_DIALOG_TITLE}</DialogTitle>
          <DialogDescription>{EDIT_DISPLAY_NAME_DIALOG_DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor={EDIT_DISPLAY_NAME_DIALOG_INPUT_ID}>
            {EDIT_DISPLAY_NAME_DIALOG_LABEL}
          </Label>
          <Input
            id={EDIT_DISPLAY_NAME_DIALOG_INPUT_ID}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoComplete="name"
            disabled={isSubmitting}
          />
          {error ? (
            <p className="text-destructive text-sm" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {EDIT_DISPLAY_NAME_DIALOG_CANCEL_LABEL}
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={onSubmit}>
            {isSubmitting
              ? EDIT_DISPLAY_NAME_DIALOG_SUBMITTING_LABEL
              : EDIT_DISPLAY_NAME_DIALOG_SUBMIT_LABEL}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
