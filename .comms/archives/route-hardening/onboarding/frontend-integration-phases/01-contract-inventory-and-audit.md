# Phase 01: Contract Inventory and Audit

## Goal

Build an evidence-backed map of every frontend dependency on singular or implicit account selection before broad implementation changes begin.

## Prerequisites

- Read `../12-frontend-integration-guide.md`.
- Read this folder's `README.md`.
- Inspect repository guidance and the current working tree.

## Scope

Audit application code, tests, types, route handlers, middleware, server actions, API hooks, query keys, stores, and documentation for:

- `/api/account/me` and `data.accountId` consumers;
- `accounts[0]`, first-account, default-account, and lowest-id assumptions;
- `user.account` or account selection derived from authentication alone;
- uses of `isActive` or `isSetup` as selection state;
- create and resume route behavior;
- account-scoped links and redirects missing an id;
- account ids stored only in mutable global state;
- API clients or request bodies capable of overriding a route account;
- cache/query/mutation keys that omit `accountId`;
- BFF routes that reshape status codes, bodies, headers, or errors;
- deletion behavior and optimistic removal;
- account-level and nested-resource 404 handling.

Compare discovered CMS consumers with:

```text
D:\htdoc\Fixtura\Fixtura.com.au\Backend\.comms\FrontEnd\request\cms-multi-account\04-consumer-hardening.md
```

If that repository is unavailable, record the comparison as deferred rather than guessing.

## Required deliverable

Create or update an audit ledger containing, for every finding:

| Consumer | Current assumption | Risk | Required resolution | Owning phase | Status |
| -------- | ------------------ | ---- | ------------------- | ------------ | ------ |

At minimum, group findings into selection, onboarding, billing/Stripe, branding/assets, fixtures/grades/tracking, scheduler, media/sponsors/renders/analytics, routing/server actions, BFF, and caches.

**Delivered:** [`01-audit-ledger.md`](./01-audit-ledger.md) (2026-07-13).

## Tasks

- Enumerate all `/account/me`, `/account/first`, and `/accounts/:accountId` consumers.
- Trace account id creation from URL or API response through every request.
- Inventory query keys, invalidation keys, optimistic stores, and persisted client state.
- Identify existing tests that encode old singular-account behavior.
- Mark shared infrastructure files likely to overlap later phases.
- Classify findings by severity: cross-account exposure, wrong-account mutation, unsafe fallback, stale presentation, or compatibility cleanup.
- Record ambiguities without implementing speculative behavior.

## Out of scope

- Broad production-code rewrites.
- Product redesign of the organisation-selection experience.
- Staging fixture creation.
- Treating simple text matches as confirmed defects without tracing the code path.

## Validation

- Re-run the searches used for the audit and confirm every match is represented or explicitly dismissed.
- Check the ledger covers browser, server, BFF, cache, and test layers.
- Confirm every finding has an owning phase.

## Acceptance criteria

- Every consumer of `/api/account/me.data.accountId` is listed.
- Every confirmed first/default/singular-account assumption is listed.
- All high-risk account domains have cache and routing coverage.
- Known shared-file overlaps are identified before implementation.
- The next phases have a concrete file-level worklist.

## Handoff to Phase 02

Provide the API/type/BFF findings first, including response parsing, status/header handling, error shapes, and the exact files that define the shared account contract.

---

## Phase 01 completion handoff — 2026-07-13

### Outcome

**Phase complete**

Audit ledger delivered at [`01-audit-ledger.md`](./01-audit-ledger.md). No production code rewritten (Phase 01 scope).

### Acceptance criteria

| Criterion                                                        | Status                                                              |
| ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| Every consumer of `/api/account/me.data.accountId` listed        | Pass — see ledger §1–§4 and shared helper rows                      |
| Every confirmed first/default/singular-account assumption listed | Pass — `activeAccountSummaryFromMePayload`, picker synth row, tests |
| High-risk domains have cache and routing coverage                | Pass — ledger §3–§9                                                 |
| Shared-file overlaps identified                                  | Pass — ledger “Shared-file overlap map”                             |
| Next phases have concrete file-level worklist                    | Pass — ledger “Phase 02 starting worklist”                          |

### Findings summary

- Primary singular-account risk is concentrated in `activeAccountSummaryFromMePayload` (`payload.accountId` then `rows[0]`), consumed by sidebar gateway chrome, branding theme naming, and billing invoice prefill.
- `AccountMePayload.accountId` is still a required `number` (guide: compatibility / nullable).
- BFF `nextResponseFromStrapiFetch` preserves status/body but does **not** forward `Retry-After`; no FE `ACCOUNT_CREATE_BUSY` handling yet.
- Global `ui.*PickerSelectedId` query keys omit `accountId` (Phase 07).
- Delete affordance is still inferred client-side from onboarding-state fields (Phase 05).
- Dismissed: `user.account`, `isActive` as selection, middleware `me.accountId` selection, select-org auto-pick.

### CMS comparison

Backend `04-consumer-hardening.md` is complete (2026-07-13). Frontend gaps vs that contract are recorded in the ledger; scheduler download path verification remains Open for Phase 06.

### Files changed

- Created: `docs/route-hardening/onboarding/frontend-integration-phases/01-audit-ledger.md`
- Updated: this file (completion handoff only)

### Validation

Searches recorded in the ledger (PowerShell `rg` patterns over `src/**/*.{ts,tsx}`). Matches classified as Open / Dismissed / Inventory-covered. No production test suite required for Phase 01.

### Deferred risks (owner → phase)

| Risk                                                                           | Owner phase |
| ------------------------------------------------------------------------------ | ----------- |
| Unsafe active-row fallback + tests locking it                                  | 02, 03, 08  |
| Retry-After / ACCOUNT_CREATE_BUSY                                              | 02, 04      |
| Nullable compatibility `accountId` types                                       | 02          |
| Continue-setup / Unfinished organisation copy vs `onboardingWizardCompletedAt` | 03          |
| Create/resume blank obtain semantics end-to-end                                | 04          |
| Client-inferred delete eligibility                                             | 05          |
| OrgAccessBoundary / nested 404 normalization / download clients                | 06          |
| Picker UI key isolation + switch races                                         | 07          |
| Multi-account automated matrix                                                 | 08          |
| Staging personas / browser matrix                                              | 09          |

### Working-tree notes

Unrelated dirty files (dashboard branding, `button.tsx`, save-branding dialog, older onboarding docs) were preserved and not edited.

### Next phase

**Phase 02: API types, parsing, and BFF behavior** — start from the Phase 02 worklist at the bottom of [`01-audit-ledger.md`](./01-audit-ledger.md) (types → `account-me-rows` → Retry-After BFF → `/account/first` busy tests → me route comments → error parsers).
