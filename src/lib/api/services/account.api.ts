import { apiClient } from "../client/fetch-client";
import { appRoutes } from "../routes/route-definitions";

import type {
  AccountBrandingResponse,
  AccountMeResponse,
  AccountOrganisationContextResponse,
  AccountRenderDetailResponse,
  AccountRenderTokenResponse,
  AccountRendersListParams,
  AccountRendersListResponse,
  AccountSchedulerResponse,
  AccountSettingsResponse,
  OrganisationAccountDetailsResponse,
} from "@/types/api/account";

/**
 * Domain-specific service for account related API calls.
 * Consumes the route registry and the central fetch client.
 */
export const accountApi = {
  /** Bootstrap: user, accountId, light `accounts[]` (see Phase 1 handoff). */
  getAccountMe: () => apiClient.get<AccountMeResponse>(appRoutes.account.me.path),

  getOrganisationAccountDetails: (accountId: string) => {
    const path = `${appRoutes.account.organisationDetails.path}/${encodeURIComponent(accountId)}`;
    return apiClient.get<OrganisationAccountDetailsResponse>(path);
  },

  /** Phase 2: canonical settings slice for the account settings screen. */
  getAccountSettings: (accountId: string) => {
    const path = `${appRoutes.accounts.settings.path}/${encodeURIComponent(accountId)}/settings`;
    return apiClient.get<AccountSettingsResponse>(path);
  },

  /** Phase 3: template, theme, and template_option for branding / preview flows. */
  getAccountBranding: (accountId: string) => {
    const path = `${appRoutes.accounts.branding.path}/${encodeURIComponent(accountId)}/branding`;
    return apiClient.get<AccountBrandingResponse>(path);
  },

  /** Phase 4: club/association summary for scoped UI (not the legacy hub aggregate). */
  getAccountOrganisationContext: (accountId: string) => {
    const path = `${appRoutes.accounts.organisation.path}/${encodeURIComponent(accountId)}/organisation`;
    return apiClient.get<AccountOrganisationContextResponse>(path);
  },

  /** Phase 5: scheduler config and flags (no renders; `isUpdating` lives on settings). */
  getAccountScheduler: (accountId: string) => {
    const path = `${appRoutes.accounts.scheduler.path}/${encodeURIComponent(accountId)}/scheduler`;
    return apiClient.get<AccountSchedulerResponse>(path);
  },

  /** Phase 6: sanitized render-token document only (not on bootstrap /account/me). */
  getAccountRenderToken: (accountId: string) => {
    const path = `${appRoutes.accounts.renderToken.path}/${encodeURIComponent(accountId)}/render-token`;
    return apiClient.get<AccountRenderTokenResponse>(path);
  },

  /** Phase 7: paginated render history (light rows; not hub aggregates). */
  getAccountRenders: (accountId: string, params?: AccountRendersListParams) => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 25;
    const search = new URLSearchParams();
    search.set("page", String(page));
    search.set("pageSize", String(pageSize));
    if (params?.from !== undefined && params.from !== "") {
      search.set("from", params.from);
    }
    if (params?.to !== undefined && params.to !== "") {
      search.set("to", params.to);
    }
    if (params?.status !== undefined && params.status !== "") {
      search.set("status", params.status);
    }
    const qs = search.toString();
    const path = `${appRoutes.accounts.renders.path}/${encodeURIComponent(accountId)}/renders${qs ? `?${qs}` : ""}`;
    return apiClient.get<AccountRendersListResponse>(path);
  },

  /** Phase 8: single render detail (counts + downloads; not hub aggregate). */
  getAccountRenderDetail: (accountId: string, renderId: string) => {
    const path = `${appRoutes.accounts.renderDetail.path}/${encodeURIComponent(accountId)}/renders/${encodeURIComponent(renderId)}`;
    return apiClient.get<AccountRenderDetailResponse>(path);
  },
};
