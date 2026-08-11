/**
 * Normative HTTP semantics for account-scoped CMS routes (`/api/accounts/:accountId/...`)
 * per [handoff-phase-00-contract.md](../../../.comms/data-fetching/handoff/handoff-phase-00-contract.md).
 *
 * Use when implementing services, TanStack Query hooks, and UI for these routes (Phases 2–9).
 * Non-owner / unknown account: **404** only — do not assume a distinct status for “wrong id” vs “no access”.
 */
export const accountScopedHttpSemantics = {
  unauthorized: 401,
  forbidden: 403,
  invalidAccountId: 400,
  notFound: 404,
  serverError: 500,
} as const;
