import type {
  AccountAnalyticsOverviewParams,
  AccountRendersListParams,
  AllTemplateOptionsParams,
} from "@/types/api/account";

/**
 * Standard registry for TanStack Query keys.
 * This ensures consistency across the application and avoids hard-coded string key mistakes.
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    session: ["auth", "session"] as const,
    me: ["auth", "me"] as const,
  },
  account: {
    all: ["account"] as const,
    me: ["account", "me"] as const,
    /** Legacy hub: GET /api/account/organisation/:accountId */
    organisation: (accountId: string) => ["account", "organisation", accountId] as const,
    /** Phase 4: GET /api/accounts/:accountId/organisation */
    organisationContext: (accountId: string) =>
      ["account", "organisation-context", accountId] as const,
    settings: (accountId: string) => ["account", "settings", accountId] as const,
    mediaLibrary: (accountId: string) => ["account", "media-library", accountId] as const,
    mediaLibraryItem: (accountId: string, mediaId: string) =>
      ["account", "media-library", accountId, mediaId] as const,
    sponsors: (accountId: string) => ["account", "sponsors", accountId] as const,
    billing: (accountId: string) => ["account", "billing", accountId] as const,
    branding: (accountId: string) => ["account", "branding", accountId] as const,
    /** S1 — GET /api/accounts/:accountId/onboarding/setup-status */
    setupStatus: (accountId: string) => ["account", "onboarding-setup-status", accountId] as const,
    /** Lifecycle v1 — GET /api/accounts/:accountId/onboarding/onboarding-state */
    onboardingState: (accountId: string) => ["account", "onboarding-state", accountId] as const,
    /** Phase 5: GET /api/accounts/:accountId/scheduler */
    scheduler: (accountId: string) => ["account", "scheduler", accountId] as const,
    /** Phase 6: GET /api/accounts/:accountId/render-token */
    renderToken: (accountId: string) => ["account", "render-token", accountId] as const,
    /** Phase 7: GET /api/accounts/:accountId/renders — key includes pagination/filters */
    renders: (accountId: string, params?: AccountRendersListParams) =>
      [
        "account",
        "renders",
        accountId,
        params?.page ?? 1,
        params?.pageSize ?? 25,
        params?.from ?? null,
        params?.to ?? null,
        params?.status ?? null,
      ] as const,
    /** Phase 8: GET /api/accounts/:accountId/renders/:renderId */
    renderDetail: (accountId: string, renderId: string) =>
      ["account", "render-detail", accountId, renderId] as const,
    /** Phase 9: GET /api/accounts/:accountId/analytics/overview — key includes date window */
    analyticsOverview: (accountId: string, params?: AccountAnalyticsOverviewParams) =>
      [
        "account",
        "analytics-overview",
        accountId,
        params?.from ?? null,
        params?.to ?? null,
      ] as const,
    allTemplateOptions: (accountId: string, params?: AllTemplateOptionsParams) =>
      ["account", "all-template-options", accountId, params?.templateOptionId ?? null] as const,
    /** GET /api/account/template-categories/list-for-selection — live categories incl. private */
    templateCategoriesListForSelection: [
      "account",
      "template-categories",
      "list-for-selection",
    ] as const,
  },
  /** GET /api/assets/list-for-selection — published assets (BFF → Strapi) */
  assets: {
    listForSelection: ["assets", "list-for-selection"] as const,
  },
  onboarding: {
    lookupsSports: ["onboarding", "lookups", "sports"] as const,
    lookupsOrganisationTypes: ["onboarding", "lookups", "organisation-types"] as const,
    lookupsAssociations: (sport: string) =>
      ["onboarding", "lookups", "associations", sport] as const,
    lookupsClubs: (associationId: number | null) =>
      ["onboarding", "lookups", "clubs", associationId ?? "none"] as const,
    lookupsThemes: ["onboarding", "lookups", "themes"] as const,
  },
  bundles: {
    all: ["bundles"] as const,
    detail: (id: string) => ["bundles", id] as const,
  },
  templates: {
    all: ["templates"] as const,
    detail: (id: string) => ["templates", id] as const,
  },
  admin: {
    fetchHealth: ["admin", "fetch-health"] as const,
    routes: ["admin", "routes"] as const,
  },
  /** Client/UI state only — not server-backed; avoid invalidating in broad "clear cache" flows. */
  ui: {
    templateCategoryPickerSelectedId: ["ui", "pickers", "template-category", "selectedId"] as const,
    /** Image Options asset picker — selected asset id (list-for-selection). */
    assetPickerSelectedId: ["ui", "pickers", "assets-list-for-selection", "selectedId"] as const,
  },
} as const;
