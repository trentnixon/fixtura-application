import type { AccountRendersListParams } from "@/types/api/account";

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
    branding: (accountId: string) => ["account", "branding", accountId] as const,
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
} as const;
