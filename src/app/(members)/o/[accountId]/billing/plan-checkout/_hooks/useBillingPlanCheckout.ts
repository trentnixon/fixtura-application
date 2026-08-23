import { useMemo, useState } from "react";

import { analyticsFailureReasonCode, captureConversion } from "@/lib/analytics";
import { ApiError } from "@/lib/api/client/api-error";
import { useAccountBillingAvailableTiers } from "@/lib/api/hooks/account/useAccountBillingAvailableTiers";
import { usePostAccountBillingCheckout } from "@/lib/api/hooks/account/usePostAccountBillingCheckout";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { useBillingInvoiceTiersGatewayRedirect } from "../../_hooks/useBillingInvoiceTiersGatewayRedirect";
import {
  isBillingPlanCheckoutStartDateValid,
  localBillingPlanCheckoutDateInputToday,
} from "../_utils/billingPlanCheckout";

export function useBillingPlanCheckout(accountId: string, enabled: boolean) {
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [missingCheckoutUrl, setMissingCheckoutUrl] = useState(false);

  const minDate = useMemo(() => localBillingPlanCheckoutDateInputToday(), []);

  const tiersQ = useAccountBillingAvailableTiers(accountId, { enabled });
  const checkoutMutation = usePostAccountBillingCheckout(accountId);

  useBillingInvoiceTiersGatewayRedirect({
    accountId,
    enabled,
    tiersIsSuccess: tiersQ.isSuccess,
    tiersData: tiersQ.data,
  });

  const dateOk = isBillingPlanCheckoutStartDateValid(startDate, minDate);
  const canSubmit = Boolean(selectedTierId && dateOk && !checkoutMutation.isPending);

  async function handleContinueToPayment() {
    setCheckoutError(null);
    setMissingCheckoutUrl(false);
    if (!selectedTierId || !dateOk) {
      return;
    }
    try {
      const res = await checkoutMutation.mutateAsync({
        subscriptionTierId: selectedTierId,
        startDate,
      });
      if (res.checkoutUrl && res.checkoutUrl.length > 0) {
        captureConversion("subscription_checkout_started", {
          accountId,
          tier_id: selectedTierId,
          payment_path: "card",
          source: "plan_checkout",
        });
        // Configure Stripe success_url / cancel_url per .comms/billing-checkout-return-urls.md so returns trigger a billing refetch.
        window.location.assign(res.checkoutUrl);
        return;
      }
      setMissingCheckoutUrl(true);
    } catch (e) {
      captureConversion("checkout_failed", {
        accountId,
        reason_code: analyticsFailureReasonCode(e),
      });
      if (e instanceof ApiError) {
        setCheckoutError(e.message);
      } else if (e instanceof Error) {
        setCheckoutError(e.message);
      } else {
        setCheckoutError(AUTH_ERROR_MESSAGES.network);
      }
    }
  }

  return {
    tiersQ,
    checkoutMutation,
    minDate,
    selectedTierId,
    setSelectedTierId,
    startDate,
    setStartDate,
    checkoutError,
    missingCheckoutUrl,
    canSubmit,
    handleContinueToPayment,
  };
}
