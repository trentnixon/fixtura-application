import { ChangePasswordForm } from "@/components/auth/change-password-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  CHANGE_PASSWORD_DIALOG_DESCRIPTION,
  CHANGE_PASSWORD_DIALOG_TITLE,
} from "../_constants/change-password-dialog";

import type { ChangePasswordDialogProps } from "../_types/change-password-dialog";

export function ChangePasswordDialog({
  accountId,
  formKey,
  isOpen,
  onOpenChange,
}: ChangePasswordDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{CHANGE_PASSWORD_DIALOG_TITLE}</DialogTitle>
          <DialogDescription>{CHANGE_PASSWORD_DIALOG_DESCRIPTION}</DialogDescription>
        </DialogHeader>
        <ChangePasswordForm
          key={formKey}
          accountId={accountId}
          onDismiss={() => onOpenChange(false)}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
