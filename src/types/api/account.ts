/** Organisation display slice from per-account rows on GET /api/account/me, legacy hub, or Phase 4 org context. */
export type AccountOrganisationDetails = {
  id: number;
  Name: string;
  href: string;
  ParentLogo: string;
  Sport: string;
  /** Present on association (non-club) branch per Phase 4 handoff. */
  PlayHQID?: string | null;
};

/**
 * Opaque / evolving — prefer typing the fields your screens actually use.
 * Aligns with legacy fixturaContentHub + filterAccountData outputs.
 */
export type AccountContentHubPayload = {
  FirstName?: string;
  DeliveryAddress?: string;
  accountOrganisationDetails?: AccountOrganisationDetails;
  [key: string]: unknown;
};

/** Populated account document slice; shape follows Strapi entity API. */
export type AccountMeExtended = Record<string, unknown>;

export interface AccountMeUser {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  role: {
    id: number;
    name: string;
    type: string;
  } | null;
}

/** Summary row for gateway account picker (`accounts[]` on GET /api/account/me). */
export interface AccountSummary {
  id: number;
  contentHub?: AccountContentHubPayload;
  /** Present on each `accounts[]` item; preferred over legacy contentHub slice when set. */
  accountOrganisationDetails?: AccountOrganisationDetails;
  /** Account row fields (membership / CMS); use with org slice for select-organisation UI. */
  FirstName?: string | null;
  LastName?: string | null;
  DeliveryAddress?: string | null;
  isActive?: boolean;
  isSetup?: boolean;
  isRightsHolder?: boolean;
  /** Account-level sport (may match `accountOrganisationDetails.Sport`). */
  Sport?: string;
  account_type?: number;
  [key: string]: unknown;
}

/**
 * Bootstrap body for GET /api/account/me (Phase 1): light `user`, `accountId`, and `accounts[]` only.
 * Heavy dashboard fields (scheduler, renders, render_token, hub aggregates) belong on organisation hub or future `/accounts/:id/*` routes — not on `/me`.
 * Legacy top-level `contentHub` / `extended` may still appear from older CMS builds; do not rely on them for new UI.
 */
export interface AccountMePayload {
  accountId: number;
  user: AccountMeUser | null;
  /** @deprecated Prefer per-row fields on `accounts[]`; optional for legacy responses only. */
  contentHub?: AccountContentHubPayload;
  /** Accounts the JWT user may open (gateway selection). */
  accounts?: AccountSummary[];
  /** @deprecated Not part of Phase 1 bootstrap; optional if CMS still honours legacy `?depth=extended`. */
  extended?: AccountMeExtended;
}

/** Success body for GET /api/account/me */
export interface AccountMeResponse {
  data: AccountMePayload;
}

/**
 * Full dashboard aggregate for one account (GET /api/account/organisation/:accountId).
 * Field-level detail is evolving — type only what screens consume.
 */
export type OrganisationAccountDetailsData = AccountContentHubPayload & {
  id?: number;
  isActive?: boolean;
  isSetup?: boolean;
  Sport?: string;
  account_type?: number;
  scheduler?: Record<string, unknown>;
  render_token?: Record<string, unknown>;
  theme?: Record<string, unknown>;
  renders?: unknown[];
  rollup?: Record<string, unknown>;
  metricsOverTime?: Record<string, unknown>;
  metricsAsPercentageOfCost?: Record<string, unknown>;
  [key: string]: unknown;
};

export interface OrganisationAccountDetailsResponse {
  data: OrganisationAccountDetailsData;
}

/** GET /api/accounts/:accountId/settings — read-only account configuration (Phase 2 handoff). */
export interface AccountSettingsData {
  id: number;
  FirstName: string | null;
  LastName: string | null;
  DeliveryAddress: string | null;
  isActive: boolean;
  isSetup: boolean;
  isUpdating: boolean;
  isRightsHolder: boolean | null;
  isPermissionGiven: boolean | null;
  group_assets_by: boolean;
  include_junior_surnames: boolean;
  Sport: string;
  hasCompletedStartSequence: boolean;
  hasCustomTemplate: boolean;
  account_type: number | null;
}

export interface AccountSettingsResponse {
  data: AccountSettingsData;
}

/** Single media summary on template branding (poster / video / gallery items). */
export interface BrandingMedia {
  id: number;
  url: string;
  width: number | null;
  height: number | null;
  mime: string | null;
  alternativeText: string | null;
}

/** Template slice on GET /api/accounts/:accountId/branding (Phase 3). */
export interface AccountBrandingTemplate {
  id: number;
  name: string;
  frontEndName: string | null;
  requiresMedia: boolean;
  variation: string | null;
  category: string | null;
  templateVariation: string | null;
  divideFixturesBy: string | null;
  bundleAudio: Record<string, unknown> | null;
  poster: BrandingMedia | null;
  video: BrandingMedia | null;
  gallery: BrandingMedia[];
}

/** Theme slice — `theme` is Strapi JSON config. */
export interface AccountBrandingTheme {
  id: number;
  name: string;
  theme: Record<string, unknown>;
}

/**
 * Scheduler-aligned template option destruct; shape evolves with CMS.
 * @see .comms/data-fetching/handoff/handoff-phase-03-accounts-branding.md
 */
export type AccountBrandingTemplateOption = Record<string, unknown>;

/** GET /api/accounts/:accountId/branding — read-only branding / preview (Phase 3). */
export interface AccountBrandingData {
  id: number;
  template: AccountBrandingTemplate | null;
  theme: AccountBrandingTheme | null;
  template_option: AccountBrandingTemplateOption | null;
}

export interface AccountBrandingResponse {
  data: AccountBrandingData;
}

/** GET /api/accounts/:accountId/organisation — read-only org summary (Phase 4). */
export interface AccountOrganisationContextData {
  id: number;
  account_type: number | null;
  accountOrganisationDetails: AccountOrganisationDetails | null;
}

export interface AccountOrganisationContextResponse {
  data: AccountOrganisationContextData;
}

/** GET /api/accounts/:accountId/scheduler — read-only scheduler slice (Phase 5). */
export interface AccountSchedulerDayOfWeek {
  id: number;
  Name: string;
}

export interface AccountSchedulerDocument {
  id: number;
  Name: string;
  Time: string;
  Queued: boolean;
  isRendering: boolean;
  days_of_the_week?: AccountSchedulerDayOfWeek | null;
  createdAt: string;
  updatedAt: string;
}

export interface AccountSchedulerData {
  id: number;
  scheduler: AccountSchedulerDocument | null;
}

export interface AccountSchedulerResponse {
  data: AccountSchedulerData;
}

/**
 * Content API–sanitized `render-token` document (same shape as legacy hub `render_token`).
 * **`token` is a secret** — do not log responses, store in analytics, or surface in error UIs.
 */
export interface AccountRenderTokenDocument {
  id: number;
  token: string;
  expiration?: string | null;
  [key: string]: unknown;
}

/** GET /api/accounts/:accountId/render-token — explicit render-token payload (Phase 6). */
export interface AccountRenderTokenData {
  id: number;
  render_token: AccountRenderTokenDocument | null;
}

export interface AccountRenderTokenResponse {
  data: AccountRenderTokenData;
}

/** Derived status on GET /api/accounts/:accountId/renders (Phase 7). */
export type AccountRenderListStatus = "complete" | "processing" | "pending";

/** Light render row (no hub-style *_count fields). */
export interface AccountRenderListRow {
  id: number;
  Name: string;
  createdAt: string;
  Processing: boolean;
  Complete: boolean;
  status: AccountRenderListStatus;
}

export interface AccountRendersPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

/** GET /api/accounts/:accountId/renders — paginated list payload (Phase 7). */
export interface AccountRendersListData {
  id: number;
  renders: AccountRenderListRow[];
  meta: {
    pagination: AccountRendersPagination;
  };
}

export interface AccountRendersListResponse {
  data: AccountRendersListData;
}

/** Query params for GET /api/accounts/:accountId/renders; defaults applied in `accountApi.getAccountRenders`. */
export interface AccountRendersListParams {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  /** Comma-separated: `processing`, `complete`, `pending` (OR semantics on CMS). */
  status?: string;
}

/** Asset row on GET /api/accounts/:accountId/renders/:renderId (Phase 8). */
export interface AccountRenderDetailDownload {
  id: number;
  Name: string;
  URL: string;
  grouping_category: string | null;
}

/** Single render detail — list-aligned fields, scalars, hub-style counts, downloads (Phase 8). */
export interface AccountRenderDetail {
  id: number;
  Name: string;
  createdAt: string;
  updatedAt: string;
  Processing: boolean;
  Complete: boolean;
  status: AccountRenderListStatus;
  sendEmail: boolean;
  hasTeamRosterRequest: boolean;
  hasTeamRosters: boolean;
  hasTeamRosterEmail: boolean;
  isCreatingRoster: boolean;
  rerenderRequested: boolean;
  EmailSent: boolean;
  forceRerender: boolean;
  forceRerenderEmail: boolean;
  game_results_in_renders_count: number;
  upcoming_games_in_renders_count: number;
  grades_in_renders_count: number;
  downloads_count: number;
  ai_articles_count: number;
  downloads: AccountRenderDetailDownload[];
}

/** GET /api/accounts/:accountId/renders/:renderId — envelope `data` (Phase 8). */
export interface AccountRenderDetailData {
  id: number;
  render: AccountRenderDetail;
}

export interface AccountRenderDetailResponse {
  data: AccountRenderDetailData;
}
