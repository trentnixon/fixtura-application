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
  EDIT_LOGIN_EMAIL_DIALOG_CANCEL_LABEL,
  EDIT_LOGIN_EMAIL_DIALOG_DESCRIPTION,
  EDIT_LOGIN_EMAIL_DIALOG_INPUT_ID,
  EDIT_LOGIN_EMAIL_DIALOG_LABEL,
  EDIT_LOGIN_EMAIL_DIALOG_SUBMIT_LABEL,
  EDIT_LOGIN_EMAIL_DIALOG_SUBMITTING_LABEL,
  EDIT_LOGIN_EMAIL_DIALOG_TITLE,
} from "../_constants/edit-login-email-dialog";

import type { EditLoginEmailDialogProps } from "../_types/edit-login-email-dialog";

export function EditLoginEmailDialog({
  error,
  isOpen,
  isSubmitting,
  value,
  onChange,
  onClose,
  onOpenChange,
  onSubmit,
}: EditLoginEmailDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{EDIT_LOGIN_EMAIL_DIALOG_TITLE}</DialogTitle>
          <DialogDescription>{EDIT_LOGIN_EMAIL_DIALOG_DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 py-2">
          <Label htmlFor={EDIT_LOGIN_EMAIL_DIALOG_INPUT_ID}>{EDIT_LOGIN_EMAIL_DIALOG_LABEL}</Label>
          <Input
            id={EDIT_LOGIN_EMAIL_DIALOG_INPUT_ID}
            type="email"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            autoComplete="email"
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
            {EDIT_LOGIN_EMAIL_DIALOG_CANCEL_LABEL}
          </Button>
          <Button type="button" disabled={isSubmitting} onClick={onSubmit}>
            {isSubmitting
              ? EDIT_LOGIN_EMAIL_DIALOG_SUBMITTING_LABEL
              : EDIT_LOGIN_EMAIL_DIALOG_SUBMIT_LABEL}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
