import {
  activeAccountSummaryFromMePayload,
  organisationDetailsFromAccountRow,
} from "@/lib/account/account-me-rows";

import type { AccountMePayload, AccountOrganisationContextData } from "@/types/api/account";

/**
 * Invoice contact defaults from session bootstrap (GET /account/me) and optional org context
 * (GET /api/accounts/:id/organisation). Used to prefill invoice request forms.
 */
export function getBillingInvoicePrefillValues(
  accountId: string,
  me: AccountMePayload,
  orgContextData: AccountOrganisationContextData | undefined,
): {
  billingContactName: string;
  billingEmail: string;
  billingOrganisationName: string;
} {
  const user = me.user;
  const row = activeAccountSummaryFromMePayload(me, accountId);
  const orgFromRow = row ? organisationDetailsFromAccountRow(row) : undefined;

  const first = row?.FirstName?.trim() ?? "";
  const last = row?.LastName?.trim() ?? "";
  const contactFromName = [first, last].filter(Boolean).join(" ").trim();

  const orgFromContext = orgContextData?.accountOrganisationDetails?.Name?.trim() ?? "";
  const orgFromRowName = orgFromRow?.Name?.trim() ?? "";

  return {
    billingContactName: contactFromName || user?.username?.trim() || "",
    billingEmail: user?.email?.trim() ?? "",
    billingOrganisationName: orgFromContext || orgFromRowName,
  };
}
