import type { AppRouteDefinition } from "@/types/routes/route-meta";

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
      description: "Get current authenticated account, accounts[] summaries, and content hub data",
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
