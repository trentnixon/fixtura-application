"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api/client/api-error";
import { usePostAccountBillingCancelInvoiceRequest } from "@/lib/api/hooks/account/usePostAccountBillingCancelInvoiceRequest";

import { invoiceRequestToWithdrawTarget } from "../_utils/invoice-request/invoiceRequestToWithdrawTarget";

import type {
  BillingInvoiceRequestWithdrawCopyVariant,
  BillingInvoiceRequestWithdrawTarget,
} from "../_types/invoice-request/billingInvoiceRequestWithdraw";
import type { InvoiceRequestSummary } from "@/types/api/account";

const FALLBACK_ERROR_MESSAGE = "Something went wrong. Try again.";

export function useBillingInvoiceRequestWithdraw(accountId: string) {
  const cancelInvoiceRequestMutation = usePostAccountBillingCancelInvoiceRequest(accountId);
  const [withdrawTarget, setWithdrawTarget] = useState<BillingInvoiceRequestWithdrawTarget | null>(
    null,
  );
  const [copyVariant, setCopyVariant] =
    useState<BillingInvoiceRequestWithdrawCopyVariant>("withdraw");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const confirmOpen = withdrawTarget != null;
  const isPending = cancelInvoiceRequestMutation.isPending;

  function openWithdraw(
    target: BillingInvoiceRequestWithdrawTarget,
    variant: BillingInvoiceRequestWithdrawCopyVariant = "withdraw",
  ) {
    setErrorMessage(null);
    setCopyVariant(variant);
    setWithdrawTarget(target);
  }

  function openWithdrawFromInvoiceRequest(
    request: InvoiceRequestSummary,
    variant: BillingInvoiceRequestWithdrawCopyVariant = "withdraw",
  ) {
    const target = invoiceRequestToWithdrawTarget(request);
    if (!target) return;
    openWithdraw(target, variant);
  }

  function handleDialogOpenChange(next: boolean) {
    if (isPending && !next) {
      return;
    }
    if (!next) {
      setWithdrawTarget(null);
      setErrorMessage(null);
    }
  }

  function closeDialog() {
    handleDialogOpenChange(false);
  }

  async function confirmWithdraw() {
    if (!withdrawTarget) return;

    setErrorMessage(null);

    try {
      await cancelInvoiceRequestMutation.mutateAsync(withdrawTarget.invoiceRequestId);
      setWithdrawTarget(null);
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : FALLBACK_ERROR_MESSAGE);
    }
  }

  return {
    confirmOpen,
    copyVariant,
    errorMessage,
    handleDialogOpenChange,
    isPending,
    openWithdraw,
    openWithdrawFromInvoiceRequest,
    closeDialog,
    confirmWithdraw,
    withdrawTarget,
  };
}
