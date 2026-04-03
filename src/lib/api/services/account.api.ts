import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type { AccountMeResponse, OrganisationAccountDetailsResponse } from "@/types/api/account";

/**
 * Domain-specific service for account related API calls.
 * Consumes the route registry and the central fetch client.
 */
export const accountApi = {
  /** Get current authenticated account details and content hub data */
  getAccountMe: (depth?: "extended") => {
    const path = depth ? `${appRoutes.account.me.path}?depth=${depth}` : appRoutes.account.me.path;

    return apiClient.get<AccountMeResponse>(path);
  },

  getOrganisationAccountDetails: (accountId: string) => {
    const path = `${appRoutes.account.organisationDetails.path}/${encodeURIComponent(accountId)}`;
    return apiClient.get<OrganisationAccountDetailsResponse>(path);
  },
};
