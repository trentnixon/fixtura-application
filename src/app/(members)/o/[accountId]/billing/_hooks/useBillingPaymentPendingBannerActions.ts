"use client";

import { useState } from "react";

import { captureUserAction } from "@/lib/analytics";
import { ApiError } from "@/lib/api/client/api-error";
import { usePostAccountBillingCheckoutResume } from "@/lib/api/hooks/account/usePostAccountBillingCheckoutResume";
import { usePostAccountBillingDeletePendingOrder } from "@/lib/api/hooks/account/usePostAccountBillingDeletePendingOrder";

type UseBillingPaymentPendingBannerActionsOptions = {
  accountId: string;
  orderId: string | null;
  deletableOrderId: string | null;
  withdrawPending?: boolean;
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
  withdrawPending = false,
}: UseBillingPaymentPendingBannerActionsOptions) {
  const resume = usePostAccountBillingCheckoutResume(accountId);
  const discard = usePostAccountBillingDeletePendingOrder(accountId);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [discardError, setDiscardError] = useState<string | null>(null);

  const resetErrors = () => {
    setResumeError(null);
    setDiscardError(null);
  };

  const onContinuePayment = async () => {
    if (!orderId) return;
    resetErrors();
    try {
      const data = await resume.mutateAsync({ orderId });
      if (data.checkoutUrl) {
        captureUserAction("billing_checkout_resumed", { accountId });
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
      captureUserAction("billing_pending_order_discarded", { accountId });
    } catch (error) {
      setDiscardError(billingActionErrorMessage(error));
    }
  };

  return {
    billingActionPending: resume.isPending || discard.isPending || withdrawPending,
    discard,
    discardError,
    onContinuePayment,
    onDiscardPendingOrder,
    resume,
    resumeError,
  };
}
