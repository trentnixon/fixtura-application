import type {
  AccountAnalyticsOverviewParams,
  AccountRendersListParams,
  AllTemplateOptionsParams,
} from "@/types/api/account";
import type { SeasonHubCompetitionsListParams } from "@/types/api/season-hub";

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
    /** GET /api/accounts/:accountId/notifications */
    notifications: (accountId: string) => ["account", "notifications", accountId] as const,
    mediaLibrary: (accountId: string) => ["account", "media-library", accountId] as const,
    mediaLibraryItem: (accountId: string, mediaId: string) =>
      ["account", "media-library", accountId, mediaId] as const,
    sponsors: (accountId: string) => ["account", "sponsors", accountId] as const,
    sponsorEntityTargets: (accountId: string) =>
      ["account", "sponsor-entity-targets", accountId] as const,
    clubLogosDirectory: (accountId: string) =>
      ["account", "club-logos-directory", accountId] as const,
    sponsorAllocationsGeneral: (accountId: string, sponsorId: number) =>
      ["account", "sponsor-allocations-general", accountId, sponsorId] as const,
    sponsorAllocationsEntity: (
      accountId: string,
      sponsorId: number,
      entityType: string,
      entityId: number,
    ) =>
      [
        "account",
        "sponsor-allocations-entity",
        accountId,
        sponsorId,
        entityType,
        entityId,
      ] as const,
    billing: (accountId: string) => ["account", "billing", accountId] as const,
    billingAvailableTiers: (accountId: string) =>
      ["account", "billing-available-tiers", accountId] as const,
    billingInvoiceRequests: (accountId: string) =>
      ["account", "billing-invoice-requests", accountId] as const,
    /** GET /api/accounts/:accountId/billing/orders → Strapi orders-by-account list */
    billingOrders: (accountId: string) => ["account", "billing-orders", accountId] as const,
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
  /** GET /api/template-gradients/ui — published gradients (BFF → Strapi) */
  templateGradients: {
    ui: ["template-gradients", "ui"] as const,
  },
  /** GET /api/template-images/ui — published template images (BFF → Strapi) */
  templateImages: {
    ui: ["template-images", "ui"] as const,
  },
  /** GET /api/template-modes/ui — published template modes (BFF → Strapi) */
  templateModes: {
    ui: ["template-modes", "ui"] as const,
  },
  /** GET /api/template-noises/ui — published template noises (BFF → Strapi) */
  templateNoises: {
    ui: ["template-noises", "ui"] as const,
  },
  /** GET /api/template-palettes/ui — published template palettes (BFF → Strapi) */
  templatePalettes: {
    ui: ["template-palettes", "ui"] as const,
  },
  /** GET /api/template-particles/ui — published template particles (BFF → Strapi) */
  templateParticles: {
    ui: ["template-particles", "ui"] as const,
  },
  /** GET /api/template-patterns/ui — published template patterns (BFF → Strapi) */
  templatePatterns: {
    ui: ["template-patterns", "ui"] as const,
  },
  /** GET /api/template-textures/ui — published template textures (BFF → Strapi) */
  templateTextures: {
    ui: ["template-textures", "ui"] as const,
  },
  /** GET /api/template-videos/ui — published template video configs (BFF → Strapi) */
  templateVideos: {
    ui: ["template-videos", "ui"] as const,
  },
  /** GET /api/season-hub/:accountId/… — season explorer (BFF → Strapi) */
  seasonHub: {
    all: ["season-hub"] as const,
    recon: (accountId: string) => ["season-hub", "recon", accountId] as const,
    stats: (accountId: string) => ["season-hub", "stats", accountId] as const,
    competitions: (accountId: string, params?: SeasonHubCompetitionsListParams) =>
      ["season-hub", "competitions", accountId, params?.page ?? 1, params?.pageSize ?? 25] as const,
    competition: (accountId: string, competitionId: string) =>
      ["season-hub", "competition", accountId, competitionId] as const,
    competitionGrades: (accountId: string, competitionId: string) =>
      ["season-hub", "competition-grades", accountId, competitionId] as const,
    /** Canonical grade key includes competitionId when present; otherwise alias branch. */
    grade: (accountId: string, gradeId: string, competitionId: string | null) =>
      ["season-hub", "grade", accountId, gradeId, competitionId ?? "alias"] as const,
    gradeFixtures: (accountId: string, gradeId: string, competitionId: string | null) =>
      ["season-hub", "grade-fixtures", accountId, gradeId, competitionId ?? "alias"] as const,
    fixture: (accountId: string, competitionId: string, gradeId: string, fixtureId: string) =>
      ["season-hub", "fixture", accountId, competitionId, gradeId, fixtureId] as const,
    fixtureAlias: (accountId: string, gradeId: string, fixtureId: string) =>
      ["season-hub", "fixture-alias", accountId, gradeId, fixtureId] as const,
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
    templateGradientPickerSelectedId: ["ui", "pickers", "template-gradient", "selectedId"] as const,
    templateImagePickerSelectedId: ["ui", "pickers", "template-image", "selectedId"] as const,
    templateModePickerSelectedId: ["ui", "pickers", "template-mode", "selectedId"] as const,
    templateNoisePickerSelectedId: ["ui", "pickers", "template-noise", "selectedId"] as const,
    templateParticlePickerSelectedId: ["ui", "pickers", "template-particle", "selectedId"] as const,
    templatePalettePickerSelectedId: ["ui", "pickers", "template-palette", "selectedId"] as const,
    templatePatternPickerSelectedId: ["ui", "pickers", "template-pattern", "selectedId"] as const,
    templateTexturePickerSelectedId: ["ui", "pickers", "template-texture", "selectedId"] as const,
    templateVideoPickerSelectedId: ["ui", "pickers", "template-video", "selectedId"] as const,
  },
} as const;
