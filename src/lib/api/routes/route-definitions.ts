import type { AppRouteDefinition } from "@/types/routes/route-meta";

/**
 * Phase 0 (CMS) did not ship new `/accounts/:accountId/*` handlers; it locked transport and error semantics only.
 * Entries under `accounts` stay `status: "planned"` until the matching phase handoff’s backend is live; then flip to
 * `ready` and implement `*.api.ts` + hooks per `.skills/api-data-layer-patterns.md`.
 * @see `.comms/data-fetching/handoff/handoff-phase-00-contract.md`
 */
const ACCOUNTS_API_BASE = "/api/accounts" as const;
const SEASON_HUB_API_BASE = "/api/season-hub" as const;

export const appRoutes = {
  auth: {
    login: {
      key: "auth.login",
      method: "POST",
      path: "/api/auth/login",
      authRequired: false,
      status: "ready",
      description: "Authenticate user and establish session",
      domain: "auth",
    },
    logout: {
      key: "auth.logout",
      method: "POST",
      path: "/api/auth/logout",
      authRequired: true,
      status: "ready",
      description: "Destroy current session",
      domain: "auth",
    },
    me: {
      key: "auth.me",
      method: "GET",
      path: "/api/auth/me",
      authRequired: true,
      status: "ready",
      description: "Get current authenticated user",
      domain: "auth",
    },
    session: {
      key: "auth.session",
      method: "GET",
      path: "/api/auth/session",
      authRequired: false,
      status: "ready", // This exists and returns { authenticated: boolean }
      description: "Check session status",
      domain: "auth",
    },
  },
  account: {
    me: {
      key: "account.me",
      method: "GET",
      path: "/api/account/me",
      authRequired: true,
      status: "ready",
      description:
        "Bootstrap: authenticated user, accountId, and light accounts[] (switcher/header). Heavy data uses organisation hub or future /accounts/:id/* routes.",
      domain: "account",
    },
    /** A1: create or attach first account for zero-account users (proxies to Strapi POST /api/account/first). */
    first: {
      key: "account.first",
      method: "POST",
      path: "/api/account/first",
      authRequired: true,
      status: "ready",
      description:
        "Onboarding Phase 1 — first account; invalidates GET /api/account/me after success. See create-organisation/.comms/phase-1/app-handoff-post-account-first-endpoint.md.",
      domain: "account",
    },
    /** L1: onboarding sport lookup (GET). See app-handoff-onboarding-phase2-l1-l2-w1.md */
    onboardingLookupsSports: {
      key: "account.onboarding-lookups-sports",
      method: "GET",
      path: "/api/account/onboarding/lookups/sports",
      authRequired: true,
      status: "ready",
      description: "Onboarding Phase 2 — sport options for Step 1 dropdown",
      domain: "account",
    },
    /** L2: onboarding organisation-type lookup (GET). */
    onboardingLookupsOrganisationTypes: {
      key: "account.onboarding-lookups-organisation-types",
      method: "GET",
      path: "/api/account/onboarding/lookups/organisation-types",
      authRequired: true,
      status: "ready",
      description: "Onboarding Phase 2 — organisation type options for Step 1",
      domain: "account",
    },
    /** Associations for a sport (GET ?sport=). Step 1 before clubs. */
    onboardingLookupsAssociations: {
      key: "account.onboarding-lookups-associations",
      method: "GET",
      path: "/api/account/onboarding/lookups/associations",
      authRequired: true,
      status: "ready",
      description: "Onboarding Phase 2 — associations filtered by sport query param",
      domain: "account",
    },
    /** Clubs under an association (GET ?associationId=). */
    onboardingLookupsClubs: {
      key: "account.onboarding-lookups-clubs",
      method: "GET",
      path: "/api/account/onboarding/lookups/clubs",
      authRequired: true,
      status: "ready",
      description: "Onboarding Phase 2 — clubs for association query param",
      domain: "account",
    },
    /** L3: premade themes for onboarding Step 2 (GET). */
    onboardingLookupsThemes: {
      key: "account.onboarding-lookups-themes",
      method: "GET",
      path: "/api/account/onboarding/lookups/themes",
      authRequired: true,
      status: "ready",
      description: "Onboarding Phase 3 — premade theme catalogue for Step 2",
      domain: "account",
    },
    /** Published template categories for selection UIs (includes private; see handoff). */
    templateCategoriesListForSelection: {
      key: "account.template-categories-list-for-selection",
      method: "GET",
      path: "/api/account/template-categories/list-for-selection",
      authRequired: true,
      status: "ready",
      description:
        "GET — live template categories for dropdowns (.comms/data-fetching/handoff/handoff-list-for-selection.md)",
      domain: "account",
    },
    /** Base path; append `/${accountId}` in the service (BFF: /api/account/organisation/[accountId]). */
    organisationDetails: {
      key: "account.organisation-details",
      method: "GET",
      path: "/api/account/organisation",
      authRequired: true,
      status: "ready",
      description: "Full dashboard aggregate for a selected account (Strapi account id)",
      domain: "account",
    },
  },
  /**
   * Dedicated account-scoped routes (Phases 2–9). Path is the base; services must append
   * `/${accountId}/…` (and for render detail, `/renders/${renderId}`) — see account-admin-api-contract.md §7.
   */
  accounts: {
    settings: {
      key: "accounts.settings",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET + PATCH append /{accountId}/settings — load + save preference flags / delivery (`saveAccountSettings`)",
      domain: "account",
    },
    notifications: {
      key: "accounts.notifications",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "PATCH append /{accountId}/notifications — bundle addressee + delivery email (`saveAccountNotifications`); members read via GET …/settings",
      domain: "account",
    },
    securityProfile: {
      key: "accounts.security-profile",
      method: "PATCH",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "PATCH append /{accountId}/security/profile — display name (`saveAccountSecurityProfile`); see route-lab .docs/frontend-handoff-account-security-writes.md",
      domain: "account",
    },
    securityLoginEmail: {
      key: "accounts.security-login-email",
      method: "PATCH",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "PATCH append /{accountId}/security/login-email — login email (`saveAccountSecurityLoginEmail`)",
      domain: "account",
    },
    securityPassword: {
      key: "accounts.security-password",
      method: "POST",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "POST append /{accountId}/security/password — password change (`changeAccountSecurityPassword`)",
      domain: "account",
    },
    branding: {
      key: "accounts.branding",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET/PATCH append /{accountId}/branding — read template/theme/template_option; save palette + template mode",
      domain: "account",
    },
    organisation: {
      key: "accounts.organisation",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET append /{accountId}/organisation — club/association summary (canonical; not the legacy hub)",
      domain: "account",
    },
    scheduler: {
      key: "accounts.scheduler",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET append /{accountId}/scheduler — read-only scheduler doc, Queued/isRendering, days_of_the_week (no renders)",
      domain: "account",
    },
    renderToken: {
      key: "accounts.render-token",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET append /{accountId}/render-token — sanitized render-token doc only (explicit fetch; not on /account/me bootstrap)",
      domain: "account",
    },
    renders: {
      key: "accounts.renders",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description: "Phase 7: append /{accountId}/renders (paginated; query params per handoff)",
      domain: "account",
    },
    renderDetail: {
      key: "accounts.render-detail",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description: "Phase 8: append /{accountId}/renders/{renderId}",
      domain: "account",
    },
    analyticsOverview: {
      key: "accounts.analytics-overview",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description: "Phase 9: append /{accountId}/analytics/overview",
      domain: "account",
    },
    allTemplateOptions: {
      key: "accounts.all-template-options",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET append /{accountId}/all-template-options — full published template catalog + optional currentSelection (.comms/API/handoff-all-template-options.md)",
      domain: "account",
    },
    mediaLibrary: {
      key: "accounts.media-library",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET append /{accountId}/media-library — published gallery / media-library items for the account",
      domain: "account",
    },
    mediaLibraryItem: {
      key: "accounts.media-library-item",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET append /{accountId}/media-library/{mediaId} — single published gallery row for the account",
      domain: "account",
    },
    sponsors: {
      key: "accounts.sponsors",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET|POST append /{accountId}/sponsors — list (GET); create sponsor (POST). PATCH|DELETE append /{accountId}/sponsors/{sponsorId}. POST multipart append …/upload. See app-handoff-account-sponsors-and-allocations-crud.md",
      domain: "account",
    },
    sponsorEntityTargets: {
      key: "accounts.sponsor-entity-targets",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET append /{accountId}/sponsor-entity-targets — account-scoped catalogue of sponsor-assignable club/team/grade targets",
      domain: "account",
    },
    clubLogosDirectory: {
      key: "accounts.club-logos-directory",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET append /{accountId}/club-logos-directory — association club directory for Club Logos UI (competitive scope)",
      domain: "account",
    },
    clubLogo: {
      key: "accounts.club-logo",
      method: "PATCH",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "POST multipart append /{accountId}/clubs/{clubId}/logo/upload (M1); PATCH append /{accountId}/clubs/{clubId}/logo (W2 logoMediaId) — association club logo stewardship",
      domain: "account",
    },
    /** Billing v1 only: do not add client routes for legacy Strapi `/orders` or `/subscription-tiers`; use account billing keys below. */
    billing: {
      key: "accounts.billing",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET append /{accountId}/billing — billing v1 summary (`data`: billingStatus, accessStatus, currentPlan, trial, activeOrder, latestInvoiceRequest, availableActions); see billing .comms/frontend-billing-api-contract-handoff.md",
      domain: "account",
    },
    billingAvailableTiers: {
      key: "accounts.billing-available-tiers",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET append /{accountId}/billing/available-tiers — `{ tiers: AvailableBillingTier[] }` for plan selection",
      domain: "account",
    },
    billingCheckout: {
      key: "accounts.billing-checkout",
      method: "POST",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description: "POST append /{accountId}/billing/checkout — Start Stripe checkout session",
      domain: "account",
    },
    billingCheckoutResume: {
      key: "accounts.billing-checkout-resume",
      method: "POST",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "POST append /{accountId}/billing/checkout/resume — Resume Stripe checkout (pending order)",
      domain: "account",
    },
    billingInvoiceRequests: {
      key: "accounts.billing-invoice-requests",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET + POST append /{accountId}/billing/invoice-requests — list and submit invoice payment requests",
      domain: "account",
    },
    billingInvoiceRequestCancel: {
      key: "accounts.billing-invoice-request-cancel",
      method: "POST",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "POST append /{accountId}/billing/invoice-requests/{invoiceRequestId}/cancel — member withdraw invoice request (BFF → Strapi)",
      domain: "account",
    },
    billingStartTrial: {
      key: "accounts.billing-start-trial",
      method: "POST",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "POST append /{accountId}/billing/start-trial — CMS assigns eligible free trial; refetch GET billing after success",
      domain: "account",
    },
    billingOrders: {
      key: "accounts.billing-orders",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET append /{accountId}/billing/orders — full order history (BFF → Strapi /api/orders/account/:accountId)",
      domain: "account",
    },
    billingOrdersDeletePending: {
      key: "accounts.billing-orders-delete-pending",
      method: "POST",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "POST append /{accountId}/billing/orders/{orderId}/delete — discard pending Stripe checkout order (BFF → Strapi)",
      domain: "account",
    },
    /** W1: PATCH append /{accountId}/onboarding/step-1 — Step 1 organisation + permission. */
    onboardingStep1: {
      key: "accounts.onboarding-step-1",
      method: "PATCH",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "PATCH append /{accountId}/onboarding/step-1 — onboarding Phase 2 Step 1 partial update",
      domain: "account",
    },
    /** W2: PATCH append /{accountId}/onboarding/step-2 — Step 2 branding (logo ref + colours). */
    onboardingStep2: {
      key: "accounts.onboarding-step-2",
      method: "PATCH",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "PATCH append /{accountId}/onboarding/step-2 — onboarding Phase 3 Step 2 branding fields",
      domain: "account",
    },
    /** M1: POST append /{accountId}/onboarding/step-2/upload — logo multipart upload. */
    onboardingStep2Upload: {
      key: "accounts.onboarding-step-2-upload",
      method: "POST",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "POST append /{accountId}/onboarding/step-2/upload — onboarding Phase 3 logo upload (multipart)",
      domain: "account",
    },
    /** Create private theme + link account (POST append /{accountId}/onboarding/step-2/theme). */
    onboardingStep2Theme: {
      key: "accounts.onboarding-step-2-theme",
      method: "POST",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "POST append /{accountId}/onboarding/step-2/theme — onboarding Phase 3 custom private theme",
      domain: "account",
    },
    /** W3: PATCH append /{accountId}/onboarding/step-3 — Step 3 contact / delivery. */
    onboardingStep3: {
      key: "accounts.onboarding-step-3",
      method: "PATCH",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "PATCH append /{accountId}/onboarding/step-3 — onboarding Phase 4 Step 3 contact and delivery",
      domain: "account",
    },
    /** W4: POST append /{accountId}/onboarding/confirm — Step 4 wizard complete. */
    onboardingConfirm: {
      key: "accounts.onboarding-confirm",
      method: "POST",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "POST append /{accountId}/onboarding/confirm — onboarding Phase 5 review and wizard completion",
      domain: "account",
    },
    /** S1: GET append /{accountId}/onboarding/setup-status — poll-friendly setup preparation state. */
    onboardingSetupStatus: {
      key: "accounts.onboarding-setup-status",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET append /{accountId}/onboarding/setup-status — onboarding Phase 6 setup status (S1); see app-handoff-onboarding-phase6-s1-s2.md",
      domain: "account",
    },
    /** Lifecycle v1: GET append /{accountId}/onboarding/onboarding-state — wizard + setup bootstrap. */
    onboardingOnboardingState: {
      key: "accounts.onboarding-onboarding-state",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET append /{accountId}/onboarding/onboarding-state — onboarding lifecycle v1; see app-handoff-onboarding-lifecycle-v1-integration.md",
      domain: "account",
    },
    /** Lifecycle v1: POST append /{accountId}/onboarding/retry-setup — re-queue after failed setup/fetch. */
    onboardingRetrySetup: {
      key: "accounts.onboarding-retry-setup",
      method: "POST",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "POST append /{accountId}/onboarding/retry-setup — onboarding lifecycle v1 retry after failure",
      domain: "account",
    },
    /** Epic 6: DELETE append /{accountId} — unfinished account deletion per CMS recovery contract. */
    deleteAccount: {
      key: "accounts.delete-account",
      method: "DELETE",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "DELETE append /{accountId} — delete unfinished onboarding account when CMS allows (Epic 6 recovery)",
      domain: "account",
    },
  },
  /** CMS asset catalog (Next BFF; path mirrors Strapi). */
  assets: {
    listForSelection: {
      key: "assets.list-for-selection",
      method: "GET",
      path: "/api/assets/list-for-selection",
      authRequired: false,
      status: "ready",
      description:
        "GET — BFF → Strapi public assets list (session optional; forwards Bearer when signed in). .comms/API/ASSETS-handoff-list-for-selection.md",
      domain: "assets",
    },
  },
  /** Published template gradients for UI selection (BFF → Strapi). */
  templateGradients: {
    ui: {
      key: "template-gradients.ui",
      method: "GET",
      path: "/api/template-gradients/ui",
      authRequired: true,
      status: "ready",
      description: "GET — published template gradients for UI selection",
      domain: "template-gradients",
    },
  },
  /** Published template images for UI selection (BFF → Strapi). */
  templateImages: {
    ui: {
      key: "template-images.ui",
      method: "GET",
      path: "/api/template-images/ui",
      authRequired: true,
      status: "ready",
      description: "GET — published template images for UI selection",
      domain: "template-images",
    },
  },
  /** Published template modes for UI selection (BFF → Strapi). */
  templateModes: {
    ui: {
      key: "template-modes.ui",
      method: "GET",
      path: "/api/template-modes/ui",
      authRequired: true,
      status: "ready",
      description: "GET — published template modes for UI selection",
      domain: "template-modes",
    },
  },
  /** Published template noises for UI selection (BFF → Strapi). */
  templateNoises: {
    ui: {
      key: "template-noises.ui",
      method: "GET",
      path: "/api/template-noises/ui",
      authRequired: true,
      status: "ready",
      description: "GET — published template noises for UI selection",
      domain: "template-noises",
    },
  },
  /** Published template palettes for UI selection (BFF → Strapi). */
  templatePalettes: {
    ui: {
      key: "template-palettes.ui",
      method: "GET",
      path: "/api/template-palettes/ui",
      authRequired: true,
      status: "ready",
      description: "GET — published template palettes for UI selection",
      domain: "template-palettes",
    },
  },
  /** Published template particles for UI selection (BFF → Strapi). */
  templateParticles: {
    ui: {
      key: "template-particles.ui",
      method: "GET",
      path: "/api/template-particles/ui",
      authRequired: true,
      status: "ready",
      description: "GET - published template particles for UI selection",
      domain: "template-particles",
    },
  },
  /** Published template patterns for UI selection (BFF → Strapi). */
  templatePatterns: {
    ui: {
      key: "template-patterns.ui",
      method: "GET",
      path: "/api/template-patterns/ui",
      authRequired: true,
      status: "ready",
      description: "GET - published template patterns for UI selection",
      domain: "template-patterns",
    },
  },
  /** Published template textures for UI selection (BFF → Strapi). */
  templateTextures: {
    ui: {
      key: "template-textures.ui",
      method: "GET",
      path: "/api/template-textures/ui",
      authRequired: true,
      status: "ready",
      description: "GET - published template textures for UI selection",
      domain: "template-textures",
    },
  },
  /** Published template video configs for UI selection (BFF → Strapi). */
  templateVideos: {
    ui: {
      key: "template-videos.ui",
      method: "GET",
      path: "/api/template-videos/ui",
      authRequired: true,
      status: "ready",
      description: "GET - published template video configs for UI selection",
      domain: "template-videos",
    },
  },
  /**
   * Season explorer read model (BFF → Strapi). Base path only; services append
   * `/${accountId}/recon|stats|competitions|...` per frontend-handoff.md under season/.docs/request/.
   */
  seasonHub: {
    base: {
      key: "season-hub.base",
      method: "GET",
      path: SEASON_HUB_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET append /{accountId}/… — recon, stats, competitions, grades, fixtures (see season/.docs/request/frontend-handoff.md)",
      domain: "season-hub",
    },
  },
  associationOverviewQueues: {
    triggerAssociationSingleScrape: {
      key: "association-overview-queues.trigger-association-single-scrape",
      method: "POST",
      path: "/api/association-overview-queues/trigger-association-single-scrape",
      authRequired: true,
      status: "ready",
      description:
        "POST — queue single association scrape by association id (BFF proxy to CMS trigger endpoint)",
      domain: "association-overview-queues",
    },
  },
  club: {
    triggerClubSingleScrape: {
      key: "club.trigger-club-single-scrape",
      method: "POST",
      path: "/api/club/trigger-club-single-scrape",
      authRequired: true,
      status: "ready",
      description: "POST — queue single club scrape by club id (BFF proxy to CMS trigger endpoint)",
      domain: "club",
    },
  },
  grade: {
    triggerFixtureDiscovery: {
      key: "grade.trigger-fixture-discovery",
      method: "POST",
      path: "/api/grade/trigger-fixture-discovery",
      authRequired: true,
      status: "ready",
      description:
        "POST — queue fixture discovery for one grade by Strapi grade document id (BFF proxy; CMS queue fixture_discovery)",
      domain: "grade",
    },
  },
  competition: {
    triggerGradesCompsSingleScrape: {
      key: "competition.trigger-grades-comps-single-scrape",
      method: "POST",
      path: "/api/competition/trigger-grades-comps-single-scrape",
      authRequired: true,
      status: "ready",
      description:
        "POST — queue single competition grades scrape (CMS scrape:grades-comps-single; BFF proxy)",
      domain: "competition",
    },
    triggerGradesLookupTeamsSingleScrape: {
      key: "competition.trigger-grades-lookup-teams-single-scrape",
      method: "POST",
      path: "/api/competition/trigger-grades-lookup-teams-single-scrape",
      authRequired: true,
      status: "ready",
      description:
        "POST — queue competition-wide teams lookup for all grades (CMS scrape:grades-lookup-teams-single; BFF proxy)",
      domain: "competition",
    },
  },
  gameMetaData: {
    triggerResultSingleScrape: {
      key: "game-meta-data.trigger-result-single-scrape",
      method: "POST",
      path: "/api/game-meta-data/trigger-result-single-scrape",
      authRequired: true,
      status: "ready",
      description:
        "POST — queue single fixture result scrape (CMS scrape:result-single; BFF proxy)",
      domain: "game-meta-data",
    },
  },
  admin: {
    fetchHealth: {
      key: "admin.fetch-health",
      method: "GET",
      path: "/api/admin/fetch-health",
      authRequired: true,
      adminOnly: true,
      status: "planned",
      description: "Check availability of internal API routes",
      domain: "admin",
    },
  },
} as const satisfies Record<string, Record<string, AppRouteDefinition>>;
