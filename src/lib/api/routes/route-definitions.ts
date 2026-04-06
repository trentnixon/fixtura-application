import type { AppRouteDefinition } from "@/types/routes/route-meta";

/**
 * Phase 0 (CMS) did not ship new `/accounts/:accountId/*` handlers; it locked transport and error semantics only.
 * Entries under `accounts` stay `status: "planned"` until the matching phase handoff’s backend is live; then flip to
 * `ready` and implement `*.api.ts` + hooks per `.skills/api-data-layer-patterns.md`.
 * @see `.comms/data-fetching/handoff/handoff-phase-00-contract.md`
 */
const ACCOUNTS_API_BASE = "/api/accounts" as const;

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
        "GET append /{accountId}/settings — account configuration flags (canonical settings screen)",
      domain: "account",
    },
    branding: {
      key: "accounts.branding",
      method: "GET",
      path: ACCOUNTS_API_BASE,
      authRequired: true,
      status: "ready",
      description:
        "GET append /{accountId}/branding — template, theme, template_option (branding / preview)",
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
      status: "planned",
      description: "Phase 9: append /{accountId}/analytics/overview",
      domain: "account",
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
