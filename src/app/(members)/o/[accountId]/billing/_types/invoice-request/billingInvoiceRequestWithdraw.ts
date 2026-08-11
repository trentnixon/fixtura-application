export type BillingInvoiceRequestWithdrawTarget = {
  invoiceRequestId: string;
  submittedAt?: string | null;
  requestedStartDate?: string | null;
  status?: string | null;
};

export type BillingInvoiceRequestWithdrawCopyVariant = "withdraw" | "cancel";

export type BillingInvoiceRequestWithdrawDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: BillingInvoiceRequestWithdrawTarget | null;
  copyVariant: BillingInvoiceRequestWithdrawCopyVariant;
  errorMessage: string | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};
