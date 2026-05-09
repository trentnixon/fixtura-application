"use client";

import { BrandedLoader } from "@/components/ui/branded-loader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isAccountBillingAvailableTiersGatewayRedirect } from "@/lib/api/hooks/account/useAccountBillingAvailableTiers";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { BillingInvoiceRequestForm } from "./BillingInvoiceRequestForm";
import { useBillingInvoiceRequest } from "../../_hooks/useBillingInvoiceRequest";
import { shouldShowInvoiceRequest } from "../../_utils/billingInvoiceRequest";
import { BillingAvailableTiersErrorCard } from "../available-tiers/BillingAvailableTiersErrorCard";
import { BillingAvailableTiersRedirectStatus } from "../available-tiers/BillingAvailableTiersRedirectStatus";

import type { BillingInvoiceRequestProps } from "../../_types/billingInvoiceRequest";

export function BillingInvoiceRequest({
  accountId,
  enabled,
  availableActions,
}: BillingInvoiceRequestProps) {
  const {
    tiersQ,
    invoiceMutation,
    selectedTierId,
    setSelectedTierId,
    requestedStartLocal,
    setRequestedStartLocal,
    billingContactName,
    setBillingContactName,
    billingEmail,
    setBillingEmail,
    billingOrganisationName,
    setBillingOrganisationName,
    notes,
    setNotes,
    submitError,
    submitSuccessMessage,
    canSubmit,
    handleSubmit,
  } = useBillingInvoiceRequest(accountId, enabled);

  if (!shouldShowInvoiceRequest(availableActions)) {
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
        title="Request an online invoice"
        description="Pay by invoice instead of card."
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
    <Card>
      <CardHeader>
        <CardTitle className="font-brand text-lg">Request an online invoice</CardTitle>
        <CardDescription>
          Submit your plan and contact details. We will raise the invoice manually and send it to
          you; it will also appear with your outstanding billing items.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <BillingInvoiceRequestForm
          tiers={tiers}
          submitSuccessMessage={submitSuccessMessage}
          selectedTierId={selectedTierId}
          onSelectTierId={setSelectedTierId}
          requestedStartLocal={requestedStartLocal}
          onRequestedStartLocalChange={setRequestedStartLocal}
          billingContactName={billingContactName}
          onBillingContactNameChange={setBillingContactName}
          billingEmail={billingEmail}
          onBillingEmailChange={setBillingEmail}
          billingOrganisationName={billingOrganisationName}
          onBillingOrganisationNameChange={setBillingOrganisationName}
          notes={notes}
          onNotesChange={setNotes}
          submitError={submitError}
          canSubmit={canSubmit}
          isSubmitting={invoiceMutation.isPending}
          onSubmit={handleSubmit}
        />
      </CardContent>
    </Card>
  );
}
