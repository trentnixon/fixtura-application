export type EditLoginEmailDialogProps = {
  error: string | null;
  isOpen: boolean;
  isSubmitting: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
};
