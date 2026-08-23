import { useState } from "react";

import { analyticsFailureReasonCode, captureConversion } from "@/lib/analytics";
import { ApiError } from "@/lib/api/client/api-error";
import {
  isAccountBillingAvailableTiersGatewayRedirect,
  useAccountBillingAvailableTiers,
} from "@/lib/api/hooks/account/useAccountBillingAvailableTiers";
import { usePostAccountBillingInvoiceRequest } from "@/lib/api/hooks/account/usePostAccountBillingInvoiceRequest";
import { AUTH_ERROR_MESSAGES } from "@/lib/auth/auth-errors";

import { useBillingInvoiceContactPrefill } from "./useBillingInvoiceContactPrefill";
import { useBillingInvoiceTiersGatewayRedirect } from "./useBillingInvoiceTiersGatewayRedirect";
import {
  buildBillingInvoiceRequestBody,
  isBillingInvoiceRequestRequiredFilled,
  isBillingInvoiceRequestedStartValid,
  parseBillingInvoiceStartLocal,
} from "../_utils/invoice-request/billingInvoiceRequest";

export function useBillingInvoiceRequest(accountId: string, enabled: boolean) {
  const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
  const [requestedStartLocal, setRequestedStartLocal] = useState("");
  const [billingContactName, setBillingContactName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [billingOrganisationName, setBillingOrganisationName] = useState("");
  const [notes, setNotes] = useState("");

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState<string | null>(null);

  const tiersQ = useAccountBillingAvailableTiers(accountId, { enabled });
  const invoiceMutation = usePostAccountBillingInvoiceRequest(accountId);

  useBillingInvoiceContactPrefill(
    accountId,
    enabled,
    setBillingContactName,
    setBillingEmail,
    setBillingOrganisationName,
  );

  useBillingInvoiceTiersGatewayRedirect({
    accountId,
    enabled,
    tiersIsSuccess: tiersQ.isSuccess,
    tiersData: tiersQ.data,
  });

  const startParsed = parseBillingInvoiceStartLocal(requestedStartLocal);
  const startOk = isBillingInvoiceRequestedStartValid(startParsed);

  const requiredFilled = isBillingInvoiceRequestRequiredFilled({
    billingContactName,
    billingEmail,
    billingOrganisationName,
  });

  const tiersForSubmit =
    tiersQ.isSuccess && tiersQ.data && !isAccountBillingAvailableTiersGatewayRedirect(tiersQ.data)
      ? tiersQ.data.tiers
      : [];

  const canSubmit = Boolean(
    selectedTierId &&
    startParsed &&
    startOk &&
    requiredFilled &&
    !invoiceMutation.isPending &&
    tiersForSubmit.length > 0,
  );

  async function handleSubmit() {
    setSubmitError(null);
    setSubmitSuccessMessage(null);
    if (!canSubmit || !selectedTierId || !startParsed) return;
    try {
      const res = await invoiceMutation.mutateAsync(
        buildBillingInvoiceRequestBody({
          selectedTierId,
          startParsed,
          billingContactName,
          billingEmail,
          billingOrganisationName,
          notes,
        }),
      );
      setSubmitSuccessMessage(res.message?.trim() || "Your invoice request was submitted.");
      captureConversion("invoice_requested", { accountId, source: "billing_overview" });
    } catch (e) {
      captureConversion("checkout_failed", {
        accountId,
        reason_code: analyticsFailureReasonCode(e),
      });
      if (e instanceof ApiError) {
        setSubmitError(e.message);
      } else if (e instanceof Error) {
        setSubmitError(e.message);
      } else {
        setSubmitError(AUTH_ERROR_MESSAGES.network);
      }
    }
  }

  return {
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
  };
}
