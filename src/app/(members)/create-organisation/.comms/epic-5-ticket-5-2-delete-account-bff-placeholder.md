# Ticket 5.2 — BFF support for delete-account (placeholder)

**Date:** 2026-04-09  
**Status:** Waiting on Strapi contract — see **Epic 6** in `.comms/CODEX/ONBOARDING_IMPLEMENTATION_BACKLOG.md`.

## CMS dependency

- **Ticket 6.1** — Finalize delete-account contract for unfinished accounts (method/path, eligibility e.g. `isSetup === false`, success and error responses).
- **Ticket 6.2** — Strapi implements the endpoint.

No BFF route should ship until 6.1 is agreed.

## Intended app integration (when contract is final)

1. **BFF route** under `src/app/api/accounts/[accountId]/...` mirroring the Strapi path, same proxy pattern as `onboarding/retry-setup/route.ts` (cookie JWT, `encodeURIComponent(accountId)`, `nextResponseFromStrapiFetch`).
2. **`route-definitions.ts`** — register the app API path.
3. **`accountApi`** — thin client method calling the BFF.
4. **Hook** — `useMutation` with invalidations (below) and navigation on success.

## Query invalidation (baseline)

Mirror `useRetryOnboardingSetup` (`src/lib/api/hooks/account/useRetryOnboardingSetup.ts`):

- `queryKeys.account.me`
- `queryKeys.account.onboardingState(accountId)`
- `queryKeys.account.setupStatus(accountId)`
- `queryKeys.account.settings(accountId)`
- `queryKeys.account.organisationContext(accountId)`
- `queryKeys.account.branding(accountId)`
- `queryKeys.auth.me`

**Add when implementing:** invalidate any cache that lists accounts or the deleted account (e.g. broad `queryKeys.account.me` may suffice for the organisation picker). Confirm against the Epic 6 response contract.

## Frontend mutation shape (draft)

- **On success:** `router.replace` to select-organisation (or login if the session loses all orgs — TBD from API).
- **On error:** surface `ApiError` / `message` from JSON; respect 401 (existing `apiRequest` logout behavior).

## Links

- Epic 5 verification: `create-organisation/.comms/epic-5-bff-contract-verification.md`
- Backlog Epic 6: `.comms/CODEX/ONBOARDING_IMPLEMENTATION_BACKLOG.md` — CMS Recovery Completion
