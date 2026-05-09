export type BillingTrialStartCardProps = {
  accountId: string;
  enabled: boolean;
  availableActions?: Partial<Record<string, boolean>>;
};

export type BillingTrialStartSchedule = {
  startLabel: string;
  endLabel: string;
};

export type BillingTrialStartConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trialSchedule: BillingTrialStartSchedule | null;
  errorMessage: string | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};
