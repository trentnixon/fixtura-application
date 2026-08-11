import { ONBOARDING_SETUP_STATUS_TIMEOUT_MS } from "@/lib/config/onboarding";

import { apiClient } from "../client/fetch-client";
import { MEDIA_LIBRARY_UPLOAD_TIMEOUT_MS } from "../media-library/media-library-upload-config";
import { parseAccountMeResponse } from "../parse-account-me-response";
import { parseCreateFirstAccountResponse } from "../parse-create-first-account-response";
import { parseDeleteAccountResponse } from "../parse-delete-account-response";
import { appRoutes } from "../routes/route-definitions";
import {
  normalizeCreateCheckoutResponse,
  normalizeDeletePendingOrderResponse,
  normalizeResumeCheckoutResponse,
} from "../utils/normalize-billing-checkout-post-response";
import { normalizeCancelInvoiceRequestResponse } from "../utils/normalize-cancel-invoice-request-response";

import type {
  AccountAnalyticsOverviewParams,
  AccountAnalyticsOverviewResponse,
  AccountClubLogosDirectoryResponse,
  PatchAccountClubLogoBody,
  PatchAccountClubLogoResponse,
  UploadAccountClubLogoResponse,
  AccountSponsorAllocationMutationResponse,
  AccountSponsorAllocationsListResponse,
  AccountSponsorEntityType,
  AccountSponsorEntityTargetsResponse,
  AccountSponsorMutationResponse,
  AccountSponsorsResponse,
  AllTemplateOptionsParams,
  AllTemplateOptionsResponse,
  AssetListForSelectionResponse,
  TemplateCategoriesForSelectionResponse,
  AccountBillingAvailableTiersResponse,
  AccountBillingInvoiceRequestsResponse,
  AccountBillingOrdersResponse,
  AccountBillingResponse,
  AccountBrandingResponse,
  AccountMediaLibraryItemResponse,
  AccountMediaLibraryResponse,
  PatchAccountMediaLibraryBody,
  AccountOrganisationContextResponse,
  AccountRenderDetailResponse,
  AccountRenderTokenResponse,
  AccountRendersListParams,
  AccountRendersListResponse,
  AccountSchedulerResponse,
  AccountSettingsResponse,
  PatchAccountSponsorBody,
  PostAccountSponsorBody,
  CreateFirstAccountRequestBody,
  DeletePendingOrderResponse,
  OnboardingLookupsAssociationsResponse,
  OnboardingLookupsClubsResponse,
  OnboardingLookupsOrganisationTypesResponse,
  OnboardingLookupsSportsResponse,
  OnboardingLookupsThemesResponse,
  CreateOnboardingStep2ThemeBody,
  CreateOnboardingStep2ThemeResponse,
  OrganisationAccountDetailsResponse,
  UpdateOnboardingStep1Body,
  UpdateOnboardingStep1Response,
  UpdateOnboardingStep2Body,
  UpdateOnboardingStep2Response,
  UpdateOnboardingStep3Body,
  UpdateOnboardingStep3Response,
  UploadOnboardingStep2LogoResponse,
  ConfirmOnboardingResponse,
  CancelInvoiceRequestResponse,
  CreateInvoiceRequestResponse,
  TriggerAssociationSingleScrapeRequest,
  TriggerAssociationSingleScrapeSuccessResponse,
  TriggerClubSingleScrapeRequest,
  TriggerClubSingleScrapeSuccessResponse,
  TriggerGradesCompsSingleScrapeRequest,
  TriggerGradesCompsSingleScrapeSuccessResponse,
  TriggerGradesLookupTeamsSingleScrapeRequest,
  TriggerGradesLookupTeamsSingleScrapeSuccessResponse,
  TriggerFixtureDiscoveryGradeRequest,
  TriggerFixtureDiscoveryGradeSuccessResponse,
  TriggerResultSingleScrapeRequest,
  TriggerResultSingleScrapeSuccessResponse,
  OnboardingStateResponse,
  PatchAccountBrandingBody,
  PatchAccountBrandingSuccess,
  PatchAccountSecurityLoginEmailRequest,
  PatchAccountSecurityLoginEmailResponse,
  PatchAccountSecurityProfileRequest,
  PatchAccountSecurityProfileResponse,
  AccountNotificationsResponse,
  PatchAccountNotificationsRequest,
  PatchAccountNotificationsResponse,
  PatchAccountSettingsRequest,
  PatchAccountSettingsResponse,
  PostAccountSecurityPasswordBody,
  PostAccountSecurityPasswordResponse,
  PostAccountBillingCheckoutRequest,
  PostAccountBillingCheckoutResumeRequest,
  PostAccountBillingInvoiceRequestBody,
  StartAccountBillingTrialResponse,
  SupportDirectoryParams,
  SupportDirectoryResponse,
} from "@/types/api/account";
import type {
  GradeOrderingGetParams,
  GradeOrderingResponse,
  ReplaceGradeOrderingRequest,
} from "@/types/api/grade-ordering";
import type {
  PutTemplateOptionsBody,
  PutTemplateOptionsSuccess,
} from "@/types/api/template-options";

function accountSponsorsPath(accountId: string, ...segments: (string | number)[]) {
  const base = `${appRoutes.accounts.sponsors.path}/${encodeURIComponent(accountId)}/sponsors`;
  if (segments.length === 0) return base;
  return `${base}/${segments.map((s) => encodeURIComponent(String(s))).join("/")}`;
}

function accountSponsorEntityTargetsPath(accountId: string) {
  return `${appRoutes.accounts.sponsorEntityTargets.path}/${encodeURIComponent(accountId)}/sponsor-entity-targets`;
}

function accountClubLogosDirectoryPath(accountId: string) {
  return `${appRoutes.accounts.clubLogosDirectory.path}/${encodeURIComponent(accountId)}/club-logos-directory`;
}

function accountClubLogoPath(accountId: string, clubId: number, ...segments: string[]) {
  const base = `${appRoutes.accounts.clubLogo.path}/${encodeURIComponent(accountId)}/clubs/${encodeURIComponent(String(clubId))}/logo`;
  if (segments.length === 0) return base;
  return `${base}/${segments.join("/")}`;
}

/**
 * Domain-specific service for account related API calls.
 * Consumes the route registry and the central fetch client.
 */
export const accountApi = {
  /** Bootstrap: user + owned `accounts[]` (compatibility `accountId` is not selection state). */
  getAccountMe: async () => {
    const payload = await apiClient.get<unknown>(appRoutes.account.me.path);
    return parseAccountMeResponse(payload);
  },

  /** Obtain reusable blank account (200 reuse / 201 create); invalidate `account.me` after success. */
  createFirstAccount: async (body: CreateFirstAccountRequestBody = {}) => {
    const payload = await apiClient.post<unknown>(appRoutes.account.first.path, body);
    return parseCreateFirstAccountResponse(payload);
  },

  /** Support super-user paginated account directory (Phase 5). */
  getSupportDirectory: (params?: SupportDirectoryParams) => {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 25;
    const search = new URLSearchParams();
    search.set("page", String(page));
    search.set("pageSize", String(pageSize));
    if (params?.search !== undefined && params.search !== "") {
      search.set("search", params.search);
    }
    if (params?.sport !== undefined) {
      search.set("sport", params.sport);
    }
    if (params?.isActive !== undefined) {
      search.set("isActive", params.isActive ? "true" : "false");
    }
    if (params?.isSetup !== undefined) {
      search.set("isSetup", params.isSetup ? "true" : "false");
    }
    if (params?.healthStatus !== undefined) {
      search.set("healthStatus", params.healthStatus);
    }
    if (params?.sort !== undefined) {
      search.set("sort", params.sort);
    }
    const qs = search.toString();
    return apiClient.get<SupportDirectoryResponse>(
      `${appRoutes.account.supportDirectory.path}${qs ? `?${qs}` : ""}`,
    );
  },

  /** L1: sport options for onboarding Step 1. */
  getOnboardingLookupsSports: () =>
    apiClient.get<OnboardingLookupsSportsResponse>(appRoutes.account.onboardingLookupsSports.path),

  /** L2: organisation types for onboarding Step 1. */
  getOnboardingLookupsOrganisationTypes: () =>
    apiClient.get<OnboardingLookupsOrganisationTypesResponse>(
      appRoutes.account.onboardingLookupsOrganisationTypes.path,
    ),

  /** Associations for a sport (GET ?sport=). */
  getOnboardingLookupsAssociations: (sport: string) => {
    const path = `${appRoutes.account.onboardingLookupsAssociations.path}?sport=${encodeURIComponent(sport)}`;
    return apiClient.get<OnboardingLookupsAssociationsResponse>(path);
  },

  /** Clubs under an association (GET ?associationId=). */
  getOnboardingLookupsClubs: (associationId: number) => {
    const path = `${appRoutes.account.onboardingLookupsClubs.path}?associationId=${encodeURIComponent(String(associationId))}`;
    return apiClient.get<OnboardingLookupsClubsResponse>(path);
  },

  /** L3: premade themes for onboarding Step 2. */
  getOnboardingLookupsThemes: () =>
    apiClient.get<OnboardingLookupsThemesResponse>(appRoutes.account.onboardingLookupsThemes.path),

  /** W1: partial Step 1 save (organisation + permission). */
  updateOnboardingStep1: (accountId: string, body: UpdateOnboardingStep1Body) => {
    const path = `${appRoutes.accounts.onboardingStep1.path}/${encodeURIComponent(accountId)}/onboarding/step-1`;
    return apiClient.patch<UpdateOnboardingStep1Response>(path, body);
  },

  /** M1: logo file upload for Step 2 — returns media id for W2. */
  uploadOnboardingStep2Logo: (accountId: string, file: File) => {
    const path = `${appRoutes.accounts.onboardingStep2Upload.path}/${encodeURIComponent(accountId)}/onboarding/step-2/upload`;
    const formData = new FormData();
    formData.set("file", file);
    return apiClient.postFormData<UploadOnboardingStep2LogoResponse>(path, formData);
  },

  /** W2: partial Step 2 save (branding fields). */
  updateOnboardingStep2: (accountId: string, body: UpdateOnboardingStep2Body) => {
    const path = `${appRoutes.accounts.onboardingStep2.path}/${encodeURIComponent(accountId)}/onboarding/step-2`;
    return apiClient.patch<UpdateOnboardingStep2Response>(path, body);
  },

  /** W3: partial Step 3 save (contact / delivery). */
  updateOnboardingStep3: (accountId: string, body: UpdateOnboardingStep3Body) => {
    const path = `${appRoutes.accounts.onboardingStep3.path}/${encodeURIComponent(accountId)}/onboarding/step-3`;
    return apiClient.patch<UpdateOnboardingStep3Response>(path, body);
  },

  /** W4: confirm wizard completion (distinct from setup complete). */
  confirmOnboarding: (accountId: string, body: Record<string, unknown> = {}) => {
    const path = `${appRoutes.accounts.onboardingConfirm.path}/${encodeURIComponent(accountId)}/onboarding/confirm`;
    return apiClient.post<ConfirmOnboardingResponse>(path, body);
  },

  /** S1: machine-readable setup / preparation status (poll until terminal). Parse with `parseOnboardingSetupStatusPayload`. */
  getOnboardingSetupStatus: (accountId: string) => {
    const path = `${appRoutes.accounts.onboardingSetupStatus.path}/${encodeURIComponent(accountId)}/onboarding/setup-status`;
    return apiClient.get<unknown>(path, { timeoutMs: ONBOARDING_SETUP_STATUS_TIMEOUT_MS });
  },

  /** Lifecycle v1: wizard + setup bootstrap. Parse with `parseOnboardingStatePayload`. */
  getOnboardingOnboardingState: (accountId: string) => {
    const path = `${appRoutes.accounts.onboardingOnboardingState.path}/${encodeURIComponent(accountId)}/onboarding/onboarding-state`;
    return apiClient.get<OnboardingStateResponse | unknown>(path);
  },

  /** Lifecycle v1: retry setup after pipeline failure. Success body aligns with onboarding-state `data`. */
  retryOnboardingSetup: (accountId: string, body: Record<string, unknown> = {}) => {
    const path = `${appRoutes.accounts.onboardingRetrySetup.path}/${encodeURIComponent(accountId)}/onboarding/retry-setup`;
    return apiClient.post<OnboardingStateResponse | unknown>(path, body);
  },

  /** DELETE unfinished account; CMS is eligibility authority. Success body must include deleted:true. */
  deleteUnfinishedAccount: async (accountId: string) => {
    const path = `${appRoutes.accounts.deleteAccount.path}/${encodeURIComponent(accountId)}`;
    const payload = await apiClient.delete<unknown>(path);
    return parseDeleteAccountResponse(payload, accountId);
  },

  /** Create private theme and link to account (onboarding Step 2). */
  createOnboardingStep2Theme: (accountId: string, body: CreateOnboardingStep2ThemeBody) => {
    const path = `${appRoutes.accounts.onboardingStep2Theme.path}/${encodeURIComponent(accountId)}/onboarding/step-2/theme`;
    return apiClient.post<CreateOnboardingStep2ThemeResponse>(path, body);
  },

  getOrganisationAccountDetails: (accountId: string) => {
    const path = `${appRoutes.account.organisationDetails.path}/${encodeURIComponent(accountId)}`;
    return apiClient.get<OrganisationAccountDetailsResponse>(path);
  },

  /** Phase 2: canonical settings slice for the account settings screen. */
  getAccountSettings: (accountId: string) => {
    const path = `${appRoutes.accounts.settings.path}/${encodeURIComponent(accountId)}/settings`;
    return apiClient.get<AccountSettingsResponse>(path);
  },

  /**
   * Save account preference flags + delivery via Strapi `saveAccountSettings`.
   * @see src/app/(members)/.comms/response/frontend-handoff-patch-account-settings-save.md
   */
  patchAccountSettings: (accountId: string, body: PatchAccountSettingsRequest) => {
    const path = `${appRoutes.accounts.settings.path}/${encodeURIComponent(accountId)}/settings`;
    return apiClient.patch<PatchAccountSettingsResponse>(path, body);
  },

  /** Bundle addressee, delivery email, and derived asset delivery day. */
  getAccountNotifications: (accountId: string) => {
    const path = `${appRoutes.accounts.notifications.path}/${encodeURIComponent(accountId)}/notifications`;
    return apiClient.get<AccountNotificationsResponse>(path);
  },

  patchAccountNotifications: (accountId: string, body: PatchAccountNotificationsRequest) => {
    const path = `${appRoutes.accounts.notifications.path}/${encodeURIComponent(accountId)}/notifications`;
    return apiClient.patch<PatchAccountNotificationsResponse>(path, body);
  },

  /** Display / profile name on account (`saveAccountSecurityProfile`). */
  patchAccountSecurityProfile: (accountId: string, body: PatchAccountSecurityProfileRequest) => {
    const base = `${appRoutes.accounts.securityProfile.path}/${encodeURIComponent(accountId)}`;
    return apiClient.patch<PatchAccountSecurityProfileResponse>(`${base}/security/profile`, body);
  },

  /** Login email (`users-permissions.user.email`; `saveAccountSecurityLoginEmail`). */
  patchAccountSecurityLoginEmail: (
    accountId: string,
    body: PatchAccountSecurityLoginEmailRequest,
  ) => {
    const base = `${appRoutes.accounts.securityLoginEmail.path}/${encodeURIComponent(accountId)}`;
    return apiClient.patch<PatchAccountSecurityLoginEmailResponse>(
      `${base}/security/login-email`,
      body,
    );
  },

  /** Password change (`changeAccountSecurityPassword`). */
  postAccountSecurityPassword: (accountId: string, body: PostAccountSecurityPasswordBody) => {
    const base = `${appRoutes.accounts.securityPassword.path}/${encodeURIComponent(accountId)}`;
    return apiClient.post<PostAccountSecurityPasswordResponse>(`${base}/security/password`, body);
  },

  /** Published gallery / media-library items for the account (handoff). */
  getAccountMediaLibrary: (accountId: string) => {
    const path = `${appRoutes.accounts.mediaLibrary.path}/${encodeURIComponent(accountId)}/media-library`;
    return apiClient.get<AccountMediaLibraryResponse>(path);
  },

  /** Single published gallery row by Strapi id (handoff). */
  getAccountMediaLibraryItem: (accountId: string, mediaId: string) => {
    const base = `${appRoutes.accounts.mediaLibraryItem.path}/${encodeURIComponent(accountId)}/media-library`;
    const path = `${base}/${encodeURIComponent(mediaId)}`;
    return apiClient.get<AccountMediaLibraryItemResponse>(path);
  },

  /** Create/upload one media-library item (multipart; CMS v1). */
  createAccountMediaLibraryItem: (accountId: string, formData: FormData) => {
    const path = `${appRoutes.accounts.mediaLibrary.path}/${encodeURIComponent(accountId)}/media-library`;
    return apiClient.postFormData<AccountMediaLibraryItemResponse>(path, formData, {
      timeoutMs: MEDIA_LIBRARY_UPLOAD_TIMEOUT_MS,
    });
  },

  /** Partial update metadata / activation (flat JSON; CMS v1). */
  patchAccountMediaLibraryItem: (
    accountId: string,
    mediaId: string,
    body: PatchAccountMediaLibraryBody,
  ) => {
    const base = `${appRoutes.accounts.mediaLibraryItem.path}/${encodeURIComponent(accountId)}/media-library`;
    const path = `${base}/${encodeURIComponent(mediaId)}`;
    return apiClient.patch<AccountMediaLibraryItemResponse>(path, body);
  },

  /** Delete one media-library item (204 no body; CMS v1). */
  deleteAccountMediaLibraryItem: (accountId: string, mediaId: string) => {
    const base = `${appRoutes.accounts.mediaLibraryItem.path}/${encodeURIComponent(accountId)}/media-library`;
    const path = `${base}/${encodeURIComponent(mediaId)}`;
    return apiClient.delete<void>(path);
  },

  /** Published sponsors for the account (handoff get-account-sponsors). */
  getAccountSponsors: (accountId: string) => {
    return apiClient.get<AccountSponsorsResponse>(accountSponsorsPath(accountId));
  },

  /** Account-scoped catalogue of sponsor-assignable entity targets. */
  getAccountSponsorEntityTargets: (accountId: string) =>
    apiClient.get<AccountSponsorEntityTargetsResponse>(accountSponsorEntityTargetsPath(accountId)),

  /** Association club directory for Club Logos route (competitive scope, CMS handoff). */
  getAccountClubLogosDirectory: (accountId: string) =>
    apiClient.get<AccountClubLogosDirectoryResponse>(accountClubLogosDirectoryPath(accountId)),

  /** M1: logo file upload for association-managed club logo — returns media id for W2. */
  uploadAccountClubLogo: (accountId: string, clubId: number, file: File) => {
    const formData = new FormData();
    formData.set("file", file);
    return apiClient.postFormData<UploadAccountClubLogoResponse>(
      accountClubLogoPath(accountId, clubId, "upload"),
      formData,
    );
  },

  /** W2: persist or clear club logo link (association scope; club id in path). */
  patchAccountClubLogo: (accountId: string, clubId: number, body: PatchAccountClubLogoBody) =>
    apiClient.patch<PatchAccountClubLogoResponse>(accountClubLogoPath(accountId, clubId), body),

  /** Create sponsor — custom Strapi route (BFF). */
  postAccountSponsor: (accountId: string, body: PostAccountSponsorBody) =>
    apiClient.post<AccountSponsorMutationResponse>(accountSponsorsPath(accountId), body),

  /** Partial update sponsor; explicit null clears nullable fields (handoff). */
  patchAccountSponsor: (accountId: string, sponsorId: number, body: PatchAccountSponsorBody) =>
    apiClient.patch<AccountSponsorMutationResponse>(
      accountSponsorsPath(accountId, sponsorId),
      body,
    ),

  /** Delete sponsor (cascades allocations on Strapi). */
  deleteAccountSponsor: (accountId: string, sponsorId: number) =>
    apiClient.delete<unknown>(accountSponsorsPath(accountId, sponsorId)),

  /** Multipart logo attach (field `file` or `files`). */
  postAccountSponsorLogoUpload: (accountId: string, sponsorId: number, formData: FormData) =>
    apiClient.postFormData<AccountSponsorMutationResponse>(
      accountSponsorsPath(accountId, sponsorId, "upload"),
      formData,
    ),

  getAccountSponsorAllocationsGeneral: (accountId: string, sponsorId: number) =>
    apiClient.get<AccountSponsorAllocationsListResponse>(
      accountSponsorsPath(accountId, sponsorId, "allocations", "general"),
    ),

  postAccountSponsorAllocationGeneral: (accountId: string, sponsorId: number, body: unknown) =>
    apiClient.post<AccountSponsorAllocationMutationResponse>(
      accountSponsorsPath(accountId, sponsorId, "allocations", "general"),
      body,
    ),

  patchAccountSponsorAllocationGeneral: (
    accountId: string,
    sponsorId: number,
    allocationId: number,
    body: unknown,
  ) =>
    apiClient.patch<AccountSponsorAllocationMutationResponse>(
      accountSponsorsPath(accountId, sponsorId, "allocations", "general", allocationId),
      body,
    ),

  deleteAccountSponsorAllocationGeneral: (
    accountId: string,
    sponsorId: number,
    allocationId: number,
  ) =>
    apiClient.delete<unknown>(
      accountSponsorsPath(accountId, sponsorId, "allocations", "general", allocationId),
    ),

  getAccountSponsorAllocationsEntity: (
    accountId: string,
    sponsorId: number,
    entityType: AccountSponsorEntityType,
    entityId: number,
  ) =>
    apiClient.get<AccountSponsorAllocationsListResponse>(
      accountSponsorsPath(accountId, sponsorId, "allocations", "entity", entityType, entityId),
    ),

  postAccountSponsorAllocationEntity: (
    accountId: string,
    sponsorId: number,
    entityType: AccountSponsorEntityType,
    entityId: number,
    body: unknown,
  ) =>
    apiClient.post<AccountSponsorAllocationMutationResponse>(
      accountSponsorsPath(accountId, sponsorId, "allocations", "entity", entityType, entityId),
      body,
    ),

  patchAccountSponsorAllocationEntity: (
    accountId: string,
    sponsorId: number,
    entityType: AccountSponsorEntityType,
    entityId: number,
    allocationId: number,
    body: unknown,
  ) =>
    apiClient.patch<AccountSponsorAllocationMutationResponse>(
      accountSponsorsPath(
        accountId,
        sponsorId,
        "allocations",
        "entity",
        entityType,
        entityId,
        allocationId,
      ),
      body,
    ),

  deleteAccountSponsorAllocationEntity: (
    accountId: string,
    sponsorId: number,
    entityType: AccountSponsorEntityType,
    entityId: number,
    allocationId: number,
  ) =>
    apiClient.delete<unknown>(
      accountSponsorsPath(
        accountId,
        sponsorId,
        "allocations",
        "entity",
        entityType,
        entityId,
        allocationId,
      ),
    ),

  /** Billing v1 summary for the account (handoff frontend-billing-api-contract-handoff.md). */
  getAccountBilling: (accountId: string) => {
    const path = `${appRoutes.accounts.billing.path}/${encodeURIComponent(accountId)}/billing`;
    return apiClient.get<AccountBillingResponse>(path);
  },

  /** Plan rows for billing checkout (filtered per account where possible). */
  getAccountBillingAvailableTiers: (accountId: string) => {
    const path = `${appRoutes.accounts.billingAvailableTiers.path}/${encodeURIComponent(accountId)}/billing/available-tiers`;
    return apiClient.get<AccountBillingAvailableTiersResponse>(path);
  },

  /** Start Stripe Checkout session for the account. */
  postAccountBillingCheckout: async (
    accountId: string,
    body: PostAccountBillingCheckoutRequest,
  ) => {
    const path = `${appRoutes.accounts.billingCheckout.path}/${encodeURIComponent(accountId)}/billing/checkout`;
    const raw = await apiClient.post<unknown>(path, body);
    return normalizeCreateCheckoutResponse(raw);
  },

  /** Resume Stripe Checkout for a pending order (same session URL if open, else rebuild). */
  postAccountBillingCheckoutResume: async (
    accountId: string,
    body: PostAccountBillingCheckoutResumeRequest,
  ) => {
    const path = `${appRoutes.accounts.billingCheckoutResume.path}/${encodeURIComponent(accountId)}/billing/checkout/resume`;
    const raw = await apiClient.post<unknown>(path, body);
    return normalizeResumeCheckoutResponse(raw);
  },

  /** Invoice payment request history for the account. */
  getAccountBillingInvoiceRequests: (accountId: string) => {
    const path = `${appRoutes.accounts.billingInvoiceRequests.path}/${encodeURIComponent(accountId)}/billing/invoice-requests`;
    return apiClient.get<AccountBillingInvoiceRequestsResponse>(path);
  },

  /** Submit an invoice payment request for the account. */
  postAccountBillingInvoiceRequest: (
    accountId: string,
    body: PostAccountBillingInvoiceRequestBody,
  ) => {
    const path = `${appRoutes.accounts.billingInvoiceRequests.path}/${encodeURIComponent(accountId)}/billing/invoice-requests`;
    return apiClient.post<CreateInvoiceRequestResponse>(path, body);
  },

  /** Withdraw / cancel an invoice request while CMS allows (submitted / under_review). */
  postAccountBillingCancelInvoiceRequest: async (
    accountId: string,
    invoiceRequestId: string,
  ): Promise<CancelInvoiceRequestResponse> => {
    const path = `${appRoutes.accounts.billingInvoiceRequestCancel.path}/${encodeURIComponent(accountId)}/billing/invoice-requests/${encodeURIComponent(invoiceRequestId)}/cancel`;
    const raw = await apiClient.post<unknown>(path, {});
    return normalizeCancelInvoiceRequestResponse(raw);
  },

  /** Assign free trial when CMS marks account eligible (`billingStatus=trial_available` + action flag). */
  postAccountBillingStartTrial: (accountId: string) => {
    const path = `${appRoutes.accounts.billingStartTrial.path}/${encodeURIComponent(accountId)}/billing/start-trial`;
    return apiClient.post<StartAccountBillingTrialResponse>(path, {});
  },

  /** Full order history for the account (BFF → Strapi GET /api/orders/account/:accountId). */
  getAccountBillingOrders: (accountId: string) => {
    const path = `${appRoutes.accounts.billingOrders.path}/${encodeURIComponent(accountId)}/billing/orders`;
    return apiClient.get<AccountBillingOrdersResponse>(path);
  },

  /** Soft-expire pending Stripe checkout order (discard attempt). */
  postAccountBillingDeletePendingOrder: async (
    accountId: string,
    orderId: string,
  ): Promise<DeletePendingOrderResponse> => {
    const path = `${appRoutes.accounts.billingOrdersDeletePending.path}/${encodeURIComponent(accountId)}/billing/orders/${encodeURIComponent(orderId)}/delete`;
    const raw = await apiClient.post<unknown>(path, {});
    return normalizeDeletePendingOrderResponse(raw);
  },

  /** Phase 3: template, theme, and template_option for branding / preview flows. */
  getAccountBranding: (accountId: string) => {
    const path = `${appRoutes.accounts.branding.path}/${encodeURIComponent(accountId)}/branding`;
    return apiClient.get<AccountBrandingResponse>(path);
  },

  /**
   * Persist organisation palette + template mode in one call (Strapi `saveAccountBranding`).
   * @see src/app/sandbox/route-lab/season/.docs/response/frontend-handoff-patch-account-branding-save.md
   */
  patchAccountBranding: (accountId: string, body: PatchAccountBrandingBody) => {
    const path = `${appRoutes.accounts.branding.path}/${encodeURIComponent(accountId)}/branding`;
    return apiClient.patch<PatchAccountBrandingSuccess>(path, body);
  },

  /**
   * Persist template-option selections (flat Phase 4 body).
   * @see src/app/(members)/o/[accountId]/template-builder/.comms/response/handoff-put-template-options.md
   */
  putTemplateOptions: (accountId: string, body: PutTemplateOptionsBody) => {
    const path = `${appRoutes.accounts.templateOptions.path}/${encodeURIComponent(accountId)}/template-options`;
    return apiClient.put<PutTemplateOptionsSuccess>(path, body);
  },

  /** Full template catalog + optional currentSelection. @see .comms/API/handoff-all-template-options.md */
  getAllTemplateOptions: (accountId: string, params?: AllTemplateOptionsParams) => {
    const search = new URLSearchParams();
    if (params?.templateOptionId !== undefined) {
      search.set("templateOptionId", String(params.templateOptionId));
    }
    const qs = search.toString();
    const path = `${appRoutes.accounts.allTemplateOptions.path}/${encodeURIComponent(accountId)}/all-template-options${qs ? `?${qs}` : ""}`;
    return apiClient.get<AllTemplateOptionsResponse>(path);
  },

  /** Live template categories for dropdowns (includes private). @see .comms/data-fetching/handoff/handoff-list-for-selection.md */
  getTemplateCategoriesListForSelection: () =>
    apiClient.get<TemplateCategoriesForSelectionResponse>(
      appRoutes.account.templateCategoriesListForSelection.path,
    ),

  /** Published assets for pickers (compact list). @see .comms/API/ASSETS-handoff-list-for-selection.md */
  getAssetsListForSelection: () =>
    apiClient.get<AssetListForSelectionResponse>(appRoutes.assets.listForSelection.path),

  /** Phase 4: club/association summary for scoped UI (not the legacy hub aggregate). */
  getAccountOrganisationContext: (accountId: string) => {
    const path = `${appRoutes.accounts.organisation.path}/${encodeURIComponent(accountId)}/organisation`;
    return apiClient.get<AccountOrganisationContextResponse>(path);
  },

  /** Account-scoped grade ordering (GET requires organisation query). */
  getAccountGradeOrdering: (accountId: string, params: GradeOrderingGetParams) => {
    const qs = new URLSearchParams({
      organisationType: params.organisationType,
      organisationId: String(params.organisationId),
    });
    const path = `${appRoutes.accounts.gradeOrdering.path}/${encodeURIComponent(accountId)}/grade-ordering?${qs}`;
    return apiClient.get<GradeOrderingResponse>(path);
  },

  putAccountGradeOrdering: (accountId: string, body: ReplaceGradeOrderingRequest) => {
    const path = `${appRoutes.accounts.gradeOrdering.path}/${encodeURIComponent(accountId)}/grade-ordering`;
    return apiClient.put<GradeOrderingResponse, ReplaceGradeOrderingRequest>(path, body);
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

  /** Phase 9: range-scoped analytics KPIs and per-day series (not legacy hub all-time). */
  getAccountAnalyticsOverview: (accountId: string, params?: AccountAnalyticsOverviewParams) => {
    const search = new URLSearchParams();
    if (params?.from !== undefined && params.from !== "") {
      search.set("from", params.from);
    }
    if (params?.to !== undefined && params.to !== "") {
      search.set("to", params.to);
    }
    const qs = search.toString();
    const path = `${appRoutes.accounts.analyticsOverview.path}/${encodeURIComponent(accountId)}/analytics/overview${qs ? `?${qs}` : ""}`;
    return apiClient.get<AccountAnalyticsOverviewResponse>(path);
  },

  /** Queue a single association scrape run by association id. */
  triggerAssociationSingleScrape: (body: TriggerAssociationSingleScrapeRequest) =>
    apiClient.post<TriggerAssociationSingleScrapeSuccessResponse>(
      appRoutes.associationOverviewQueues.triggerAssociationSingleScrape.path,
      body,
    ),

  /** Queue a single club scrape run by club id. */
  triggerClubSingleScrape: (body: TriggerClubSingleScrapeRequest) =>
    apiClient.post<TriggerClubSingleScrapeSuccessResponse>(
      appRoutes.club.triggerClubSingleScrape.path,
      body,
    ),

  /** Queue a single competition grades scrape by Strapi competition document id. */
  triggerGradesCompsSingleScrape: (body: TriggerGradesCompsSingleScrapeRequest) =>
    apiClient.post<TriggerGradesCompsSingleScrapeSuccessResponse>(
      appRoutes.competition.triggerGradesCompsSingleScrape.path,
      body,
    ),

  /** Queue teams lookup for all grades under one competition (Strapi competition document id). */
  triggerGradesLookupTeamsSingleScrape: (body: TriggerGradesLookupTeamsSingleScrapeRequest) =>
    apiClient.post<TriggerGradesLookupTeamsSingleScrapeSuccessResponse>(
      appRoutes.competition.triggerGradesLookupTeamsSingleScrape.path,
      body,
    ),

  /** Queue fixture discovery for one grade (Strapi grade document id). */
  triggerFixtureDiscoveryGrade: (body: TriggerFixtureDiscoveryGradeRequest) =>
    apiClient.post<TriggerFixtureDiscoveryGradeSuccessResponse>(
      appRoutes.grade.triggerFixtureDiscovery.path,
      body,
    ),

  /** Queue single fixture result scrape (Strapi game-meta-data document id). */
  triggerResultSingleScrape: (body: TriggerResultSingleScrapeRequest) =>
    apiClient.post<TriggerResultSingleScrapeSuccessResponse>(
      appRoutes.gameMetaData.triggerResultSingleScrape.path,
      body,
    ),
};
