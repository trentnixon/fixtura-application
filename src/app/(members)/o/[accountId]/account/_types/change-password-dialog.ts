export type ChangePasswordDialogProps = {
  accountId: string;
  formKey: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};
