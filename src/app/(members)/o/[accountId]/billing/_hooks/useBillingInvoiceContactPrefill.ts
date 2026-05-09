import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";

import { useAccountMe } from "@/lib/api/hooks/account/useAccountMe";
import {
  isAccountOrganisationContextGatewayRedirect,
  useAccountOrganisationContext,
} from "@/lib/api/hooks/account/useAccountOrganisationContext";

import { getBillingInvoicePrefillValues } from "../_utils/invoice-request/billingInvoiceRequestPrefill";

type StringSetter = Dispatch<SetStateAction<string>>;

/**
 * One-shot prefill of invoice contact fields from /account/me and organisation context.
 * Does not overwrite non-empty fields (user edits win).
 */
export function useBillingInvoiceContactPrefill(
  accountId: string,
  enabled: boolean,
  setBillingContactName: StringSetter,
  setBillingEmail: StringSetter,
  setBillingOrganisationName: StringSetter,
) {
  const appliedRef = useRef(false);
  const meQ = useAccountMe({ enabled: enabled && Boolean(accountId) });
  const orgQ = useAccountOrganisationContext(accountId, { enabled: enabled && Boolean(accountId) });

  useEffect(() => {
    appliedRef.current = false;
  }, [accountId]);

  useEffect(() => {
    if (!enabled || !accountId || appliedRef.current) return;
    if (!meQ.isSuccess || !meQ.data?.data) return;
    if (orgQ.isPending && !orgQ.isError) return;

    const orgData =
      orgQ.isSuccess && orgQ.data && !isAccountOrganisationContextGatewayRedirect(orgQ.data)
        ? orgQ.data.data
        : undefined;

    const p = getBillingInvoicePrefillValues(accountId, meQ.data.data, orgData);

    setBillingContactName((prev) => prev.trim() || p.billingContactName);
    setBillingEmail((prev) => prev.trim() || p.billingEmail);
    setBillingOrganisationName((prev) => prev.trim() || p.billingOrganisationName);

    appliedRef.current = true;
  }, [
    accountId,
    enabled,
    meQ.isSuccess,
    meQ.data,
    orgQ.isPending,
    orgQ.isError,
    orgQ.isSuccess,
    orgQ.data,
    setBillingContactName,
    setBillingEmail,
    setBillingOrganisationName,
  ]);
}
