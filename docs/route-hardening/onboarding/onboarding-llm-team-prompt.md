# Onboarding Hardening LLM Team Prompt

Use this prompt to brief an LLM teammate on the onboarding hardening work.

## Context

We hardened Fixtura account onboarding in phases. The work covers:

- `/select-organisation`
- `/create-organisation`
- `/create-organisation/setup`
- Scoped account entry from `/o/[accountId]/*`
- Onboarding BFF routes under `/api/account/*` and `/api/accounts/[accountId]/onboarding/*`

The main plan is:

- `docs/route-hardening/onboarding/hardening-and-testing-plan.md`
- `docs/route-hardening/onboarding/outstanding-dev-review.md`

Dedicated phase files are:

- `docs/route-hardening/onboarding/phases/phase-1-scope-and-contract.md`
- `docs/route-hardening/onboarding/phases/phase-2-lifecycle-routing-and-access.md`
- `docs/route-hardening/onboarding/phases/phase-3-wizard-data-collection.md`
- `docs/route-hardening/onboarding/phases/phase-4-bff-endpoint-hardening.md`
- `docs/route-hardening/onboarding/phases/phase-5-recovery-retry-and-deletion.md`
- `docs/route-hardening/onboarding/phases/phase-6-manual-browser-checks.md`
- `docs/route-hardening/onboarding/phases/phase-7-multi-account-create-organisation.md`

## Current Understanding

What is working well:

- `resolveAccountEntry` is the single source of truth for lifecycle routing.
- Completed wizard accounts can enter the scoped app even when setup/data-fetch is still running or failed.
- Onboarding API request and response types are documented in `src/types/api/account.ts`.
- Step mutation hooks invalidate relevant account, setup, and onboarding-state query keys.
- Unfinished-account delete has helper logic, customer copy, mutation tests, and UI coverage.
- Custom onboarding colours now persist through the same branding save path used by the account branding screen.
- Multi-account create/resume behavior is explicit: create means new account; selecting an unfinished account resumes it.

Known gaps:

- Setup-`failed` retry reachability needs CMS/admin fixtures for browser sign-off.
- Associations/clubs with no fixtures may legitimately leave setup/data-fetch in a pending or no-work state; this needs a dedicated follow-up scenario.
- `/api/account/first` is still the account creation endpoint name, but Phase 7 now depends on it supporting additional account creation, not only first-account creation.
- `GET /api/account/me` and legacy `GET /api/account/organisation/[accountId]` still use inline BFF guards (out of onboarding matrix).
- Step 3 uses `deliveryAddress` for weekly asset email, which is contract-compatible but easy to misunderstand.

## Important Product Rule

`/create-organisation` with no `accountId` must always create a new account instance. It must not infer or reuse `/api/account/me.accountId`.

Explicit resume is only `/create-organisation?accountId=...`, and the id must belong to the signed-in user. Customers resume incomplete organisations by selecting the unfinished organisation card on `/select-organisation`.

## Next Phase

Phases 1-7 are complete. Review current follow-up notes before new onboarding work:

- `docs/route-hardening/onboarding/outstanding-dev-review.md`
- `docs/route-hardening/onboarding/phases/phase-6-manual-browser-checks.md`
- `docs/route-hardening/onboarding/phases/phase-7-multi-account-create-organisation.md`

## Suggested Working Instructions

1. Read the main plan and the relevant phase file first.
2. Inspect code before editing.
3. Treat the repo as dirty; do not revert unrelated user or teammate changes.
4. Prefer `rg` for file and text search.
5. Keep changes scoped to onboarding unless a shared component bug is proven.
6. If code changes are needed, add or update targeted tests.
7. Record evidence in the relevant phase file before moving to a new phase or handing off.

## Key Files To Inspect First

- `src/lib/api/routes/route-definitions.ts`
- `src/lib/api/services/account.api.ts`
- `src/types/api/account.ts`
- `src/lib/api/query/query-keys.ts`
- `src/lib/onboarding/resolve-account-entry.ts`
- `src/app/(members)/select-organisation/select-organisation-content.tsx`
- `src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`
- `src/components/auth/org-access-boundary.tsx`
- `src/app/api/account/**`
- `src/app/api/accounts/[accountId]/onboarding/**`

## Commands To Prefer

Use targeted commands first:

```powershell
rg -n "onboarding|create-organisation|select-organisation|onboarding-state|setup-status" src docs
rg --files src/app/api/account src/app/api/accounts src/lib src/types | rg "onboarding|account"
```

Run tests after identifying concrete code or test targets.

## Phase Handoff Format

When completing a phase, update the phase file with:

- Code changes:
- Tests added/updated:
- Commands run:
- Remaining risks:
- Next recommended phase:

## Current Next Action

No new onboarding phase is queued. Pick up only documented follow-ups or newly requested production bugs.
