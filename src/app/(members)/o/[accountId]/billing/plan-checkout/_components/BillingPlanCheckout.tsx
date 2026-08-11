"use client";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { isAccountBillingAvailableTiersGatewayRedirect } from "@/lib/api/hooks/account/useAccountBillingAvailableTiers";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { BillingPlanCheckoutForm } from "./BillingPlanCheckoutForm";
import { BillingAvailableTiersErrorCard } from "../../_components/available-tiers/BillingAvailableTiersErrorCard";
import { BillingAvailableTiersRedirectStatus } from "../../_components/available-tiers/BillingAvailableTiersRedirectStatus";
import { useBillingPlanCheckout } from "../_hooks/useBillingPlanCheckout";
import { shouldShowPlanCheckout } from "../_utils/billingPlanCheckout";

import type { BillingPlanCheckoutProps } from "../_types/billingPlanCheckout";

export function BillingPlanCheckout({
  accountId,
  enabled,
  availableActions,
}: BillingPlanCheckoutProps) {
  const {
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
  } = useBillingPlanCheckout(accountId, enabled);

  if (!shouldShowPlanCheckout(availableActions)) {
    return null;
  }

  if (!enabled) {
    return null;
  }

  if (tiersQ.isPending) {
    return <BrandedLoader label="Loading plans" />;
  }

  if (
    tiersQ.isSuccess &&
    tiersQ.data &&
    isAccountBillingAvailableTiersGatewayRedirect(tiersQ.data)
  ) {
    return <BillingAvailableTiersRedirectStatus />;
  }

  if (tiersQ.isError) {
    const err = tiersQ.error;
    return (
      <BillingAvailableTiersErrorCard
        title="Choose a plan"
        description="Pay by card via Stripe Checkout."
        errorMessage={err instanceof Error ? err.message : AUTH_ERROR_MESSAGES.network}
        onRetry={() => void tiersQ.refetch()}
      />
    );
  }

  if (
    !tiersQ.isSuccess ||
    !tiersQ.data ||
    isAccountBillingAvailableTiersGatewayRedirect(tiersQ.data)
  ) {
    return null;
  }

  const { tiers } = tiersQ.data;

  return (
    <BillingPlanCheckoutForm
      tiers={tiers}
      minDate={minDate}
      selectedTierId={selectedTierId}
      onSelectTierId={setSelectedTierId}
      startDate={startDate}
      onStartDateChange={setStartDate}
      checkoutError={checkoutError}
      missingCheckoutUrl={missingCheckoutUrl}
      canSubmit={canSubmit}
      isCheckoutPending={checkoutMutation.isPending}
      onContinueToPayment={handleContinueToPayment}
    />
  );
}
