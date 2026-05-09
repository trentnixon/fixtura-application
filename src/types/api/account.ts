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
  /** When set on bootstrap, avoids extra onboarding-state fetch for card tone; optional CMS field. */
  hasCompletedOnboardingWizard?: boolean;
  isRightsHolder?: boolean;
  /** Account-level sport (may match `accountOrganisationDetails.Sport`). */
  Sport?: string;
  account_type?: number;
  /** Saved template-option row id for `GET .../all-template-options?templateOptionId=` (CMS; optional). @see .comms/API/handoff-all-template-options.md */
  templateOptionId?: number | null;
  /** Phase 2 onboarding working name; optional until CMS exposes on bootstrap. */
  onboardingOrganisationName?: string | null;
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

/** Request body for POST /api/account/first (A1); forwarded to Strapi as-is. */
export interface CreateFirstAccountRequestBody {
  /** L1 sport id when user completes Get Started with a sport pick. */
  sport?: string;
  /** Signals CMS that the initial start sequence (e.g. sport selection) is complete. */
  hasCompletedStartSequence?: boolean;
  [key: string]: unknown;
}

/** POST /api/account/first (A1) — create or attach first account; see app-handoff-post-account-first-endpoint.md */
export interface CreateFirstAccountPayload {
  accountId: number;
  [key: string]: unknown;
}

export interface CreateFirstAccountResponse {
  data: CreateFirstAccountPayload;
}

/** L1 — GET /api/account/onboarding/lookups/sports */
export interface OnboardingSportOption {
  id: string;
  label: string;
  sortOrder: number;
}

export interface OnboardingLookupsSportsResponse {
  data: OnboardingSportOption[];
}

/** L2 — GET /api/account/onboarding/lookups/organisation-types */
export interface OnboardingOrganisationTypeOption {
  id: number;
  label: string;
  sortOrder: number;
}

export interface OnboardingLookupsOrganisationTypesResponse {
  data: OnboardingOrganisationTypeOption[];
}

/** GET /api/account/onboarding/lookups/associations?sport= */
export interface OnboardingAssociationOption {
  id: number;
  label: string;
  sortOrder: number;
}

export interface OnboardingLookupsAssociationsResponse {
  data: OnboardingAssociationOption[];
}

/** GET /api/account/onboarding/lookups/clubs?associationId= */
export interface OnboardingClubOption {
  id: number;
  label: string;
  sortOrder: number;
}

export interface OnboardingLookupsClubsResponse {
  data: OnboardingClubOption[];
}

/**
 * Account sport enum (CMS); same values as account sport.
 * @see GET /api/account/onboarding/lookups/themes — each theme may set `sport` or null.
 */
export type AccountSportEnum = "Cricket" | "AFL" | "Hockey" | "Netball" | "Basketball";

/** L3 — GET /api/account/onboarding/lookups/themes (premade catalogue). */
export interface OnboardingThemeOption {
  id: number;
  label: string;
  slug?: string | null;
  sortOrder?: number | null;
  /** Theme’s sport from CMS; null when unset. */
  sport: AccountSportEnum | null;
  /** Full Theme JSON from CMS — expect `{ primary, secondary, dark, white }` hex tokens; null when absent. */
  theme: Record<string, unknown> | null;
}

export interface OnboardingLookupsThemesResponse {
  data: OnboardingThemeOption[];
}

/** W1 — PATCH /api/accounts/:accountId/onboarding/step-1 */
export interface UpdateOnboardingStep1Body {
  sport?: string;
  accountTypeId?: number;
  onboardingOrganisationName?: string | null;
  isRightsHolder?: boolean;
  isPermissionGiven?: boolean;
  /** Selected association (sport-scoped); CMS may persist link. */
  associationId?: number | null;
  /** Selected club when organisation type is club; under parent association. */
  clubId?: number | null;
}

export interface UpdateOnboardingStep1Response {
  data: {
    accountId: number;
    updated: Partial<{
      sport: string;
      accountTypeId: number;
      onboardingOrganisationName: string | null;
      isRightsHolder: boolean;
      isPermissionGiven: boolean;
      associationId: number | null;
      clubId: number | null;
    }>;
  };
}

/** W2 — PATCH /api/accounts/:accountId/onboarding/step-2 */
export interface UpdateOnboardingStep2Body {
  /** Maps to `account.theme` → `api::theme.theme` id (premade or private). Colours live on the theme, not on the account. */
  themeId?: number | null;
  logoMediaId?: number | null;
}

export interface UpdateOnboardingStep2Response {
  data: {
    accountId: number;
    updated: Partial<{
      themeId: number | null;
      logoMediaId: number | null;
    }>;
  };
}

/** W3 — PATCH /api/accounts/:accountId/onboarding/step-3 */
export interface UpdateOnboardingStep3Body {
  firstName?: string | null;
  lastName?: string | null;
  deliveryAddress?: string | null;
}

export interface UpdateOnboardingStep3Response {
  data: {
    accountId: number;
    updated: Partial<{
      firstName: string | null;
      lastName: string | null;
      deliveryAddress: string | null;
    }>;
  };
}

/** W4 — POST /api/accounts/:accountId/onboarding/confirm (wizard complete; CMS-defined body). */
export interface ConfirmOnboardingResponse {
  data?: Record<string, unknown>;
}

/** Lifecycle v1 — GET .../onboarding/onboarding-state `data` object. */
export type OnboardingWizardStatus = "not_started" | "in_progress" | "completed";

export type InitialPipelineStatus = "not_started" | "queued" | "running" | "completed" | "failed";

export interface OnboardingStateData {
  accountId: number;
  onboardingWizardStatus: OnboardingWizardStatus;
  /** 0–4 — see onboarding lifecycle handoff §5 */
  onboardingCurrentStep: number;
  onboardingLastCompletedStep: number;
  onboardingStartedAt: string | null;
  onboardingLastActivityAt: string | null;
  hasCompletedOnboardingWizard: boolean;
  onboardingWizardCompletedAt: string | null;

  initialSetupStatus: InitialPipelineStatus;
  initialSetupStartedAt: string | null;
  initialSetupCompletedAt: string | null;
  initialSetupFailedAt: string | null;
  initialSetupFailureReason: string | null;

  initialDataFetchStatus: InitialPipelineStatus;
  initialDataFetchStartedAt: string | null;
  initialDataFetchCompletedAt: string | null;
  initialDataFetchFailedAt: string | null;
  initialDataFetchFailureReason: string | null;

  isSetup: boolean;
  isUpdating: boolean;
  isActive: boolean;
}

export interface OnboardingStateResponse {
  data: OnboardingStateData;
}

/** S1 — GET /api/accounts/:accountId/onboarding/setup-status (machine-readable preparation state). */
export interface OnboardingSetupStatusData {
  /** Machine-readable lifecycle value; drives polling stop when terminal. */
  status: string;
  phase?: string | null;
  requiresUserAction?: boolean;
  errorCode?: string | null;
  /** CMS versions shape — number, percent string, or opaque object. */
  progress?: number | string | Record<string, unknown> | null;
  messageKey?: string | null;
  /** Lifecycle v1 — pipeline enums + flags (optional until CMS ships). */
  initialSetupStatus?: InitialPipelineStatus;
  initialDataFetchStatus?: InitialPipelineStatus;
  isSetup?: boolean;
  isUpdating?: boolean;
}

/** Optional envelope — client uses `parseOnboardingSetupStatusPayload` for wire JSON. */
export interface OnboardingSetupStatusResponse {
  data: OnboardingSetupStatusData;
}

/** POST /api/accounts/:accountId/onboarding/step-2/theme — create private theme + link account. */
export interface CreateOnboardingStep2ThemeBody {
  name: string;
  primary: string;
  secondary: string;
  dark: string;
  white: string;
}

export interface CreateOnboardingStep2ThemeResponse {
  data: {
    id: number;
    isPublic?: boolean;
    accountId?: number;
  };
}

/** M1 — POST /api/accounts/:accountId/onboarding/step-2/upload */
export interface UploadOnboardingStep2LogoResponse {
  data: {
    id: number;
  };
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
  /** Same shape as GET /api/accounts/:id/scheduler `data.scheduler` when CMS embeds it on the organisation hub. */
  scheduler?: AccountSchedulerDocument | null;
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

/** GET /api/accounts/:accountId/settings — account configuration (Phase 2 + preferences save handoff). */
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
  /** Working org name during onboarding (Phase 2); optional until CMS exposes. */
  onboardingOrganisationName?: string | null;
  /** Club-only preference; PATCH `splitSeniorsAndMasters`. @see .comms/response/frontend-handoff-patch-account-settings-save.md */
  split_seniors_and_masters?: boolean;
  /**
   * Embedded scheduler when CMS returns it on the settings payload (delivery day lives on `days_of_the_week`).
   */
  scheduler?: AccountSchedulerDocument | null;
  /** Bundle addressee line when CMS exposes it on the settings document (same source as notifications PATCH). */
  bundleAddressedTo?: string | null;
  /** Operational delivery mailbox when CMS exposes it on the settings document. */
  deliveryEmail?: string | null;
}

export interface AccountSettingsResponse {
  data: AccountSettingsData;
}

/** PATCH /api/accounts/:accountId/settings — partial body (flat). */
export type PatchAccountSettingsBody = {
  includeJuniorSurnames?: boolean;
  competitionsGroupedBy?: "grade" | "competition";
  splitSeniorsAndMasters?: boolean;
  daysOfTheWeekId?: number;
  bundleDeliveryDay?: string;
};

/** PATCH allows `{ data: { ... } }` wrapper per CMS contract. */
export type PatchAccountSettingsRequest =
  | PatchAccountSettingsBody
  | { data: PatchAccountSettingsBody };

/** Success envelope matches GET settings `data`. */
export type PatchAccountSettingsResponse = AccountSettingsResponse;

/** Notifications form shape: read from **`GET /api/account/me`** + scheduler; writes use **onboarding step-3** (contact) + **PATCH settings** (weekday). @see frontend-handoff-account-notifications.md */
export interface AccountNotificationsData {
  bundleAddressedTo: string | null;
  deliveryEmail: string | null;
  /** Read-only derived from scheduler; writes via PATCH .../settings. */
  assetDeliveryDay: string | null;
}

export interface AccountNotificationsResponse {
  data: AccountNotificationsData;
}

/** PATCH /api/accounts/:accountId/notifications — only these keys; never delivery day fields. */
export type PatchAccountNotificationsBody = {
  bundleAddressedTo?: string | null;
  deliveryEmail?: string | null;
};

export type PatchAccountNotificationsRequest =
  | PatchAccountNotificationsBody
  | { data: PatchAccountNotificationsBody };

export type PatchAccountNotificationsResponse = AccountNotificationsResponse;

/** PATCH /api/accounts/:accountId/security/profile — XOR: `userName` OR `firstName`/`lastName` (server enforces). */
export type PatchAccountSecurityProfileBody =
  | { userName: string }
  | { firstName?: string; lastName?: string };

export type PatchAccountSecurityProfileRequest =
  | PatchAccountSecurityProfileBody
  | { data: PatchAccountSecurityProfileBody };

export type PatchAccountSecurityProfileResponse = AccountSettingsResponse;

/** PATCH /api/accounts/:accountId/security/login-email — one of `loginEmail` or `email` (server enforces). */
export type PatchAccountSecurityLoginEmailBody = { loginEmail: string } | { email: string };

export type PatchAccountSecurityLoginEmailRequest =
  | PatchAccountSecurityLoginEmailBody
  | { data: PatchAccountSecurityLoginEmailBody };

export interface PatchAccountSecurityLoginEmailResponse {
  data: { loginEmail: string };
}

/** POST /api/accounts/:accountId/security/password */
export interface PostAccountSecurityPasswordBody {
  currentPassword: string;
  password: string;
  passwordConfirmation: string;
}

export interface PostAccountSecurityPasswordResponse {
  data: { changed: true };
}

/** Image on GET /api/accounts/:accountId/media-library item (handoff). */
export interface AccountMediaLibraryImage {
  id: number;
  url: string;
  width: number | null;
  height: number | null;
  mime: string | null;
  alternativeText: string | null;
}

/** One published gallery row (ordering: updatedAt desc on server). */
export interface AccountMediaLibraryItem {
  id: number;
  title: string | null;
  isActive: boolean | null;
  tags: unknown | null;
  ageGroup: "Seniors" | "Juniors" | "Both" | string | null;
  assetType: string | null;
  markerPosition: unknown | null;
  image: AccountMediaLibraryImage | null;
}

export interface AccountMediaLibraryData {
  items: AccountMediaLibraryItem[];
}

export interface AccountMediaLibraryResponse {
  data: AccountMediaLibraryData;
}

/** GET /api/accounts/:accountId/media-library/:mediaId — one published row (handoff). */
export interface AccountMediaLibraryItemResponse {
  data: AccountMediaLibraryItem;
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

/** One sponsorship allocation row on GET /api/accounts/:accountId/sponsors (`allocation` is Strapi JSON). */
export interface AccountSponsorshipAllocation {
  id: number;
  allocation: unknown | null;
}

/** Published sponsor row (handoff get-account-sponsors). */
export interface AccountSponsorDto {
  id: number;
  name: string;
  url: string | null;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  isPrimary: boolean;
  tagline: string | null;
  order: number | null;
  description: string | null;
  isVideo: boolean;
  isArticle: boolean;
  logo: BrandingMedia | null;
  sponsorshipAllocations: AccountSponsorshipAllocation[];
}

export interface AccountSponsorsData {
  items: AccountSponsorDto[];
}

/** GET /api/accounts/:accountId/sponsors */
export interface AccountSponsorsResponse {
  data: AccountSponsorsData;
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
  /** When present, premade catalogue themes are public; private/custom themes are false. */
  isPublic?: boolean | null;
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
  /** Saved template-option row id for catalog hydration (CMS; optional). */
  templateOptionId?: number | null;
  /** Onboarding logo media (`onboardingLogo` on account); optional until CMS populates. */
  onboardingLogo?: BrandingMedia | null;
}

export interface AccountBrandingResponse {
  data: AccountBrandingData;
}

/** Keys stored in theme JSON (hex or clear with null / ""). */
export type BrandingPaletteInput = Partial<{
  primary: string | null;
  secondary: string | null;
  dark: string | null;
  white: string | null;
}>;

export type PatchAccountBrandingThemePayload = {
  themeId?: number | null;
  primary?: string | null;
  secondary?: string | null;
  dark?: string | null;
  white?: string | null;
};

/** PATCH /api/accounts/:accountId/branding — flat or Strapi-style `{ data }` body. */
export type PatchAccountBrandingBody =
  | {
      themeId?: number | null;
      palette?: BrandingPaletteInput;
      theme?: PatchAccountBrandingThemePayload;
      templateModeId?: number | null;
    }
  | {
      data: {
        themeId?: number | null;
        palette?: BrandingPaletteInput;
        theme?: PatchAccountBrandingThemePayload;
        templateModeId?: number | null;
      };
    };

/** Success envelope from Strapi save handler. */
export interface PatchAccountBrandingSuccessData {
  accountId: number;
  themeId: number | null;
  /** Present when the request included a `templateModeId` field. */
  templateModeId?: number | null;
  templateModeSlug?: string | null;
}

export interface PatchAccountBrandingSuccess {
  data: PatchAccountBrandingSuccessData;
}

/** Validation / business error from Strapi `saveAccountBranding`. */
export interface PatchAccountBrandingErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export type {
  AllTemplateOptionsData,
  AllTemplateOptionsPayload,
  AllTemplateOptionsResponse,
  TemplateCategoriesForSelectionResponse,
  AudioOptionItem,
  BundleAudioSummary,
  CurrentTemplateSelection,
  MediaSummary,
  TemplateCategoryCatalogItem,
  TemplateCategoryRef,
  TemplateGradientItem,
  TemplateImageItem,
  TemplateModeItem,
  TemplateNoiseItem,
  TemplatePaletteItem,
  TemplateParticleItem,
  TemplatePatternItem,
  TemplateTextureCatalogItem,
  TemplateVideoItem,
} from "./all-template-options";

export type {
  AssetCategorySummary,
  AssetListForSelectionItem,
  AssetListForSelectionResponse,
} from "./assets";

/** Optional query for all-template-options BFF. */
export type AllTemplateOptionsParams = {
  templateOptionId?: number;
};

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
  /** Present when CMS populates full collection-type relation fields. */
  updatedAt?: string;
  publishedAt?: string;
}

export interface AccountSchedulerDocument {
  id: number;
  Name: string;
  Time: string | null;
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

/** Query params for GET /api/accounts/:accountId/analytics/overview (Phase 9). Omit both for CMS default window. */
export interface AccountAnalyticsOverviewParams {
  from?: string;
  to?: string;
}

/** Top-level `meta` on analytics overview — resolved range and freshness. */
export interface AccountAnalyticsOverviewMeta {
  from: string;
  to: string;
  timezone: string;
  computedAt: string;
  staleness: string;
  totalRendersInRange: number;
}

/** KPI rollup for renders with createdAt in [from, to] (Phase 9). */
export interface AccountAnalyticsRollup {
  totalRenders: number;
  totalProcessingRenders: number;
  totalCompleteRenders: number;
  totalEmailsSent: number;
  totalTeamRosterRequests: number;
  totalTeamRosters: number;
  totalTeamRosterEmails: number;
  totalForceRerenders: number;
  totalForceRerenderEmails: number;
  totalGameResults: number;
  totalUpcomingGames: number;
  totalGrades: number;
  totalDownloads: number;
  totalAiArticles: number;
}

/** Per-day arrays align with `series` (UTC calendar days, chronological). */
export interface AccountAnalyticsMetricsOverTime {
  totalRenders: number;
  totalCompleteRenders: number;
  totalDownloads: number;
  totalEmailsSent: number;
  totalGameResults: number;
  totalUpcomingGames: number;
  totalGrades: number;
  totalAiArticles: number;
  GameResultsArr: number[];
  UpcomingGamesArr: number[];
  GradesArr: number[];
  AiArticlesArr: number[];
  DownloadsArr: number[];
}

export interface AccountAnalyticsMetricsAsPercentageOfCost {
  valuePerRender: number;
  totalCostByAccount: number;
  totalDigitalAssets: number;
  percentageCompleteRenders: number;
  percentageProcessingRenders: number;
  percentageGameResults: number;
  percentageDownloads: number;
  percentageAiArticles: number;
  averageCostPerDigitalAsset: number;
  averageCostOverTime: number[];
}

export interface AccountAnalyticsOverviewSeriesPoint {
  date: string;
  renders: number;
  completeRenders: number;
  gameResults: number;
  upcomingGames: number;
  grades: number;
  downloads: number;
  aiArticles: number;
}

/** GET /api/accounts/:accountId/analytics/overview — `data` slice (Phase 9). */
export interface AccountAnalyticsOverviewData {
  id: number;
  rollup: AccountAnalyticsRollup;
  metricsOverTime: AccountAnalyticsMetricsOverTime;
  metricsAsPercentageOfCost: AccountAnalyticsMetricsAsPercentageOfCost;
  series: AccountAnalyticsOverviewSeriesPoint[];
}

/** Envelope includes top-level `meta` (required for Phase 9). */
export interface AccountAnalyticsOverviewResponse {
  data: AccountAnalyticsOverviewData;
  meta: AccountAnalyticsOverviewMeta;
}

/** --- Account billing v1 (Strapi handoff: frontend-billing-api-contract-handoff.md) --- */

/** Club vs Association tier category (GET …/billing/available-tiers camelCase v1). */
export type SubscriptionTierCategory = "Club" | "Association";

/**
 * Tier row from GET /accounts/:id/billing/available-tiers — camelCase v1 wire shape.
 * @see src/app/(members)/o/[accountId]/billing/.comms/response/frontend-handoff-billing-available-tiers.md
 */
export interface AvailableBillingTier {
  id: string;
  name: string;
  description: string;
  category: SubscriptionTierCategory;
  price: number;
  currency: string;
  daysInPass: number;
  priceByWeekInPass?: number;
  isActive: boolean;
  includeSponsors: boolean;
  includedAssetTypes: string[];
  packageName?: string;
  stripePriceId?: string;
}

/** Payment rail for a pending `currentPlan` row on GET billing summary (in-flight order). */
export type BillingPaymentChannel = "stripe" | "invoice";

/**
 * `currentPlan` on GET /api/accounts/:accountId/billing — catalog tier plus pending-order context.
 * `orderId` / `paymentChannel` are non-null only when there is no paid-in-window `activeOrder`
 * but an in-flight checkout or invoice order exists (per CMS contract).
 */
export interface BillingSummaryCurrentPlan extends AvailableBillingTier {
  /** Pending order driving this `currentPlan`; null when there is none. */
  orderId: string | null;
  /** Channel for that pending order; null when there is none. */
  paymentChannel: BillingPaymentChannel | null;
}

export interface BillingTrialSummaryV1 {
  id?: number;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
  eligible?: boolean;
  subscriptionTier?: AvailableBillingTier | null;
}

export interface InvoiceRequestSummary {
  invoiceRequestId?: string;
  id?: string | number;
  status?: string;
  submittedAt?: string | null;
  message?: string | null;
  subscriptionTierId?: string | null;
  requestedStartDate?: string | null;
  /** When false or omitted and canWithdrawInvoiceRequest is used, FE treats as not withdrawable. */
  canWithdraw?: boolean;
}

export interface BillingInvoiceAddressRequest {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface AccountBillingAvailableTiersResponse {
  tiers: AvailableBillingTier[];
}

export interface PostAccountBillingCheckoutRequest {
  subscriptionTierId: string;
  startDate: string;
}

export interface CreateCheckoutResponse {
  checkoutSessionId: string;
  checkoutUrl?: string;
  orderId: string;
}

/** POST /billing/checkout/resume — body (orderId required per CMS v1). */
export interface PostAccountBillingCheckoutResumeRequest {
  orderId: string;
}

/** POST /billing/checkout/resume — response. */
export interface ResumeCheckoutResponse {
  orderId: string;
  checkoutSessionId: string;
  checkoutUrl?: string;
  reusedExisting: boolean;
}

/** POST /billing/orders/:orderId/delete — discard pending Stripe checkout (CMS v1). */
export interface DeletePendingOrderResponse {
  orderId: string;
  noOp: boolean;
  checkoutStatus?: string;
  stripeSessionExpired?: boolean;
}

export interface AccountBillingInvoiceRequestsResponse {
  invoiceRequests: InvoiceRequestSummary[];
}

export interface PostAccountBillingInvoiceRequestBody {
  subscriptionTierId: string;
  requestedStartDate: string;
  billingContactName: string;
  billingEmail: string;
  billingOrganisationName: string;
  /** Omit for online-only invoice requests (no postal billing address). CMS must accept absence. */
  billingAddress?: BillingInvoiceAddressRequest;
  notes?: string;
}

export interface CreateInvoiceRequestResponse {
  invoiceRequestId: string;
  status: "submitted";
  submittedAt: string;
  message: string;
}

/** POST …/billing/invoice-requests/:invoiceRequestId/cancel — withdraw / cancel invoice request (CMS v1). */
export interface CancelInvoiceRequestResponse {
  invoiceRequestId: string;
  noOp: boolean;
  status?: string;
  message?: string;
}

/** POST …/billing/start-trial — CMS assigns trial; extend when Strapi stabilises envelope. */
export interface StartAccountBillingTrialResponse {
  trialId?: string | number;
  /** CMS may return a fixed token (e.g. `started`) or other string; UI should refetch GET /billing. */
  status?: string;
  message?: string;
}

/** Tier row on GET /api/accounts/:accountId/billing — legacy consolidated payload / Strapi tier embed (`image_url` omitted). */
export interface AccountBillingSubscriptionTierDto {
  id: number;
  Name: string;
  Title: string | null;
  SubTitle: string | null;
  description: string | null;
  price: number | null;
  currency: string | null;
  stripe_product_id: string | null;
  stripe_price_id: string | null;
  isActive: boolean;
  isClub: boolean;
  includeSponsors: boolean;
  Category: string | null;
  DaysInPass: number | null;
  PriceByWeekInPass: number | null;
  subscription_items: unknown[];
}

export interface AccountBillingTrialDto {
  id: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  subscriptionTier: AccountBillingSubscriptionTierDto | null;
}

export interface AccountBillingCustomerDto {
  id: number;
  stripe_customer_id: string | null;
  stripe_created: string | null;
  stripe_invoice_prefix: string | null;
}

export interface AccountBillingOrderDto {
  id: number;
  Name: string | null;
  total: number | null;
  currency: string | null;
  OrderPaid: boolean | null;
  payment_status: string | null;
  checkout_status: string | null;
  payment_channel: string | null;
  startOrderAt: string | null;
  endOrderAt: string | null;
  isActive: boolean;
  isPaused: boolean;
  cancel_at_period_end: boolean | null;
  stripe_subscription_id: string | null;
  stripe_status: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  invoice_number: string | null;
  invoice_due_date: string | null;
  createdAt: string;
  updatedAt: string;
  subscriptionTier: AccountBillingSubscriptionTierDto | null;
}

/** GET /api/accounts/:accountId/billing — `data` slice (billing v1). */
export interface AccountBillingSummaryV1 {
  billingStatus: string;
  accessStatus: string;
  currentPlan: BillingSummaryCurrentPlan | null;
  trial: BillingTrialSummaryV1 | null;
  activeOrder: AccountBillingOrderDto | null;
  latestInvoiceRequest: InvoiceRequestSummary | null;
  /** e.g. canWithdrawInvoiceRequest, canDeletePendingOrder, canStartCheckout — CMS billing v1. */
  availableActions?: Partial<Record<string, boolean>>;
}

/** Derived current subscription (handoff SummaryDto). */
export interface AccountBillingSummaryDto {
  status: string;
  tier: string | null;
  price: number | null;
  currency: string | null;
  startDate: string | null;
  endDate: string | null;
  daysRemaining: number;
  cancelAtPeriodEnd?: boolean;
  isActive?: boolean;
  autoRenew?: boolean;
}

export interface AccountBillingFinancialSummaryDto {
  totalSpent: number;
  averageOrderValue: number;
  totalOrders: number;
  paidOrders: number;
  lifetimeValue: number;
}

export interface AccountBillingMetaDto {
  ordersTotal: number;
  ordersReturned: number;
  orderListMax: number;
}

/** Legacy consolidated billing payload (pre–billing v1 summary). */
export interface AccountBillingLegacyPayload {
  subscriptionTier: AccountBillingSubscriptionTierDto | null;
  trial: AccountBillingTrialDto | null;
  customers: AccountBillingCustomerDto[];
  orders: AccountBillingOrderDto[];
  summary: AccountBillingSummaryDto;
  financialSummary: AccountBillingFinancialSummaryDto;
  meta: AccountBillingMetaDto;
}

/** Tier slice on GET /api/orders/account/:accountId order rows (camelCase handoff). */
export interface AccountBillingOrderHistorySubscriptionTierDto {
  id: number;
  name: string;
  price: number;
  currency: string;
}

/**
 * Single order row from GET /api/orders/account/:accountId (Strapi custom route; plain JSON, no `{ data }` wrapper).
 * `status` is boolean in CMS schema — treat as opaque unless product defines semantics.
 */
export interface AccountBillingOrderHistoryDto {
  id: number;
  name: string | null;
  status: boolean | null;
  currency: string | null;
  /** Stored as string in CMS; parse on client when numeric ops are needed. */
  total: string | null;
  isPaid: boolean;
  paymentStatus: string | null;
  checkoutStatus: string | null;
  paymentChannel: string | null;
  isActive: boolean;
  isPaused: boolean;
  cancelAtPeriodEnd: boolean;
  stripeStatus: string | null;
  stripeSubscriptionId: string | null;
  startAt: string | null;
  endAt: string | null;
  createdAt: string;
  updatedAt: string;
  subscriptionTier: AccountBillingOrderHistorySubscriptionTierDto | null;
}

/** Meta on GET /api/orders/account/:accountId */
export interface AccountBillingOrdersMetaDto {
  count: number;
}

/**
 * GET /api/accounts/:accountId/billing/orders (BFF) → Strapi GET /api/orders/account/:accountId.
 * Plain JSON object (not wrapped in `{ data: … }`).
 */
export interface AccountBillingOrdersResponse {
  accountId: number;
  orders: AccountBillingOrderHistoryDto[];
  meta: AccountBillingOrdersMetaDto;
}

/** GET /api/accounts/:accountId/billing */
export interface AccountBillingResponse {
  data: AccountBillingSummaryV1;
}

/** POST /api/association-overview-queues/trigger-association-single-scrape */
export interface TriggerAssociationSingleScrapeRequest {
  associationId: number;
}

export interface TriggerAssociationSingleScrapeSuccessResponse {
  success: boolean;
  jobId: number;
  runId: string;
  message: string;
  queueName: string;
}

/** POST /api/club/trigger-club-single-scrape */
export interface TriggerClubSingleScrapeRequest {
  clubId: number;
}

export interface TriggerClubSingleScrapeSuccessResponse {
  success: boolean;
  jobId: number;
  runId: string;
  message: string;
  queueName: string;
}

/** POST /api/competition/trigger-grades-comps-single-scrape */
export interface TriggerGradesCompsSingleScrapeRequest {
  competitionId: number;
}

export interface TriggerGradesCompsSingleScrapeSuccessResponse {
  success: true;
  jobId: number | string;
  runId: string;
  message: string;
  queueName: "scrape:grades-comps-single" | string;
}

/** POST /api/competition/trigger-grades-lookup-teams-single-scrape */
export interface TriggerGradesLookupTeamsSingleScrapeRequest {
  competitionId: number;
}

export interface TriggerGradesLookupTeamsSingleScrapeSuccessResponse {
  success: true;
  jobId: number | string;
  runId: string;
  message: string;
  queueName: "scrape:grades-lookup-teams-single" | string;
}

/** POST /api/grade/trigger-fixture-discovery */
export interface TriggerFixtureDiscoveryGradeRequest {
  id: number;
}

export interface TriggerFixtureDiscoveryGradeSuccessResponse {
  success: true;
  jobId: number | string;
  runId: string;
  message: string;
  queueName: "fixture_discovery" | string;
  gradeId: number;
}

export interface StrapiErrorResponse {
  error?: {
    status: number;
    name: string;
    message: string;
  };
}
