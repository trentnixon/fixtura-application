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
    organisation: (accountId: string) => ["account", "organisation", accountId] as const,
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
