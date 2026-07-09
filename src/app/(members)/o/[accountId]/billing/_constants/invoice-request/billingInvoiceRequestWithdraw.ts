import type { BillingInvoiceRequestWithdrawCopyVariant } from "../../_types/invoice-request/billingInvoiceRequestWithdraw";

export const BILLING_INVOICE_REQUEST_WITHDRAW_COPY = {
  cancelButtonLabel: "Cancel",
  description: "You can submit a new one later.",
  withdraw: {
    title: "Withdraw invoice request?",
    triggerButtonLabel: "Withdraw invoice request",
    confirmButtonLabel: "Withdraw request",
    pendingConfirmButtonLabel: "Withdrawing…",
  },
  cancel: {
    title: "Cancel invoice request?",
    triggerButtonLabel: "Cancel invoice request",
    confirmButtonLabel: "Cancel request",
    pendingConfirmButtonLabel: "Cancelling…",
  },
} as const;

export function getBillingInvoiceRequestWithdrawCopy(
  variant: BillingInvoiceRequestWithdrawCopyVariant = "withdraw",
) {
  const variantCopy = BILLING_INVOICE_REQUEST_WITHDRAW_COPY[variant];
  return {
    cancelButtonLabel: BILLING_INVOICE_REQUEST_WITHDRAW_COPY.cancelButtonLabel,
    description: BILLING_INVOICE_REQUEST_WITHDRAW_COPY.description,
    title: variantCopy.title,
    triggerButtonLabel: variantCopy.triggerButtonLabel,
    confirmButtonLabel: variantCopy.confirmButtonLabel,
    pendingConfirmButtonLabel: variantCopy.pendingConfirmButtonLabel,
  };
}
