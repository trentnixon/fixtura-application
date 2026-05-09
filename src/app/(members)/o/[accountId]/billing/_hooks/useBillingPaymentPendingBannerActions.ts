"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api/client/api-error";
import { usePostAccountBillingCancelInvoiceRequest } from "@/lib/api/hooks/account/usePostAccountBillingCancelInvoiceRequest";
import { usePostAccountBillingCheckoutResume } from "@/lib/api/hooks/account/usePostAccountBillingCheckoutResume";
import { usePostAccountBillingDeletePendingOrder } from "@/lib/api/hooks/account/usePostAccountBillingDeletePendingOrder";

type UseBillingPaymentPendingBannerActionsOptions = {
  accountId: string;
  orderId: string | null;
  deletableOrderId: string | null;
  withdrawableInvoiceRequestId: string | null;
};

const FALLBACK_ERROR_MESSAGE = "Something went wrong. Try again.";
const MISSING_CHECKOUT_LINK_MESSAGE =
  "Checkout did not return a payment link. Try again or use Create subscription.";

function billingActionErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : FALLBACK_ERROR_MESSAGE;
}

export function useBillingPaymentPendingBannerActions({
  accountId,
  orderId,
  deletableOrderId,
  withdrawableInvoiceRequestId,
}: UseBillingPaymentPendingBannerActionsOptions) {
  const resume = usePostAccountBillingCheckoutResume(accountId);
  const discard = usePostAccountBillingDeletePendingOrder(accountId);
  const cancelInvoiceRequest = usePostAccountBillingCancelInvoiceRequest(accountId);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [discardError, setDiscardError] = useState<string | null>(null);
  const [withdrawInvoiceError, setWithdrawInvoiceError] = useState<string | null>(null);

  const resetErrors = () => {
    setResumeError(null);
    setDiscardError(null);
    setWithdrawInvoiceError(null);
  };

  const onContinuePayment = async () => {
    if (!orderId) return;
    resetErrors();
    try {
      const data = await resume.mutateAsync({ orderId });
      if (data.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
      } else {
        setResumeError(MISSING_CHECKOUT_LINK_MESSAGE);
      }
    } catch (error) {
      setResumeError(billingActionErrorMessage(error));
    }
  };

  const onDiscardPendingOrder = async () => {
    if (!deletableOrderId) return;
    resetErrors();
    try {
      await discard.mutateAsync(deletableOrderId);
    } catch (error) {
      setDiscardError(billingActionErrorMessage(error));
    }
  };

  const onWithdrawInvoiceRequest = async () => {
    if (!withdrawableInvoiceRequestId) return;
    resetErrors();
    try {
      await cancelInvoiceRequest.mutateAsync(withdrawableInvoiceRequestId);
    } catch (error) {
      setWithdrawInvoiceError(billingActionErrorMessage(error));
    }
  };

  return {
    billingActionPending: resume.isPending || discard.isPending || cancelInvoiceRequest.isPending,
    cancelInvoiceRequest,
    discard,
    discardError,
    onContinuePayment,
    onDiscardPendingOrder,
    onWithdrawInvoiceRequest,
    resume,
    resumeError,
    withdrawInvoiceError,
  };
}
