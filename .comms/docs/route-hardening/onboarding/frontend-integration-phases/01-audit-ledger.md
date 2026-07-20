# Phase 01 Audit Ledger — Frontend Multi-Account Integration

**Prepared:** 2026-07-13  
**Authority:** [`12-frontend-integration-guide.md`](../12-frontend-integration-guide.md), [`01-contract-inventory-and-audit.md`](./01-contract-inventory-and-audit.md)  
**CMS comparison:** `D:\htdoc\Fixtura\Fixtura.com.au\Backend\.comms\FrontEnd\request\cms-multi-account\04-consumer-hardening.md` (readable; backend Phase 04 complete)

This ledger is the Phase 01 deliverable. It inventories singular/implicit account assumptions. It does **not** implement fixes.

Risk vocabulary: `cross-account exposure` | `wrong-account mutation` | `unsafe fallback` | `stale presentation` | `compatibility cleanup`

Status values for this audit: `Open` | `Dismissed` | `Inventory-covered` (domain mapped; fix elsewhere)

---

## Search commands used (re-verification)

Run from frontend repo root (`application`):

```powershell
rg -n "useAccountMe|getAccountMe|account/me|/api/account/me" src --glob "*.{ts,tsx}"
rg -n "accounts\[0\]|rows\[0\]|activeAccountSummaryFromMePayload|accountPickerRowsFromMePayload|payload\.accountId" src --glob "*.{ts,tsx}"
rg -n "createFirstAccount|useCreateFirstAccount|account/first|/api/account/first" src --glob "*.{ts,tsx}"
rg -n "user\.account|defaultAccount|firstAccount|selectedAccount" src --glob "*.{ts,tsx}"
rg -n "ACCOUNT_NOT_FOUND|deleteUnfinishedAccount|canDeleteUnfinished|useDeleteUnfinishedAccount" src --glob "*.{ts,tsx}"
rg -n "Retry-After|retry-after|ACCOUNT_CREATE_BUSY|onboardingWizardCompletedAt" src --glob "*.{ts,tsx}"
rg -n "PickerSelectedId" src/lib/api/query/query-keys.ts
```

Every match was classified as a finding, dismissed with reason, or deferred to a domain section below.

---

## 1. Selection / shell chrome

| Consumer                                                                   | Current assumption                                                                                       | Risk                  | Required resolution                                                                                                                 | Owning phase | Status                   |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------ |
| `src/lib/account/account-me-rows.ts` — `activeAccountSummaryFromMePayload` | When `selectedAccountId` omitted, uses `String(payload.accountId)`; unmatched id falls back to `rows[0]` | unsafe fallback       | Require explicit selected id for scoped chrome; never fall back to compatibility id or first row for “active” org                   | 02, 03       | Done                     |
| `src/lib/account/account-me-rows.ts` — `accountPickerRowsFromMePayload`    | If `accounts[]` empty, synthesizes singleton from `payload.accountId` (+ optional legacy `contentHub`)   | compatibility cleanup | Prefer empty list when `accounts` absent/empty once CMS always returns array; keep synth only behind explicit legacy flag if needed | 02, 03       | Done                     |
| `src/components/navigation/app-sidebar/_hooks/use-app-sidebar-user.ts`     | Calls `activeAccountSummaryFromMePayload(me, accountId)`; gateway mode often has no route `accountId`    | stale presentation    | Gateway: no org-name chip from compatibility/first row; scoped: match route id only, no `rows[0]` fallback                          | 03           | Done                     |
| `src/app/(members)/select-organisation/select-organisation-content.tsx`    | Renders all `accountPickerRowsFromMePayload` rows; click uses explicit row id; no auto-select            | —                     | Keep explicit selection; align unfinished naming / Continue-setup signal with guide (`onboardingWizardCompletedAt === null`)        | 03           | Done                     |
| Same file — title fallback                                                 | Missing org name → `Account ${id}` (not **Unfinished organisation**)                                     | stale presentation    | Use guide copy for nameless/blank rows                                                                                              | 03           | Done                     |
| Same file — `isActive` / `isSetup` props                                   | Passed to card for display/tone only; not used to choose which org opens                                 | —                     | Do not promote to selection state                                                                                                   | 03           | Dismissed (display-only) |
| `src/lib/onboarding/select-org-card-tone.ts`                               | Tone from `hasCompletedOnboardingWizard` / `isSetup` / updating flags                                    | compatibility cleanup | Align Continue-setup / unfinished presentation with `onboardingWizardCompletedAt === null` per guide                                | 03           | Done                     |
| `src/components/navigation/nav-user/_utils/resolve-nav-user-menu-hrefs.ts` | Missing `accountId` → `/select-organisation`                                                             | —                     | Safe; keep                                                                                                                          | —            | Dismissed                |
| `src/middleware.ts`                                                        | Auth only; legacy flat member paths → `/select-organisation`; no `me.accountId` selection                | —                     | Safe; ownership remains in CMS + `OrgAccessBoundary`                                                                                | 06           | Dismissed                |

---

## 2. Onboarding create + resume

| Consumer                                                                           | Current assumption                                                                             | Risk                                          | Required resolution                                                                                             | Owning phase | Status                               |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------ |
| `src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx` | Create-new (no query id) calls `POST /account/first`; resume requires query id in `accounts[]` | wrong-account mutation (if CMS/first misused) | Treat 200 reuse and 201 create as success; never select via `me.accountId`; keep explicit resume param          | 04           | Done                                 |
| `src/lib/api/hooks/account/useCreateFirstAccount.ts`                               | Invalidates `queryKeys.account.me` on success                                                  | —                                             | Preserve; add 503 busy / Retry-After client handling when BFF forwards it                                       | 02, 04       | Done                                 |
| `src/app/(members)/create-organisation/_components/wizard-step-branding.tsx`       | Theme name via `activeAccountSummaryFromMePayload(payload, accountId)`                         | unsafe fallback                               | Pass explicit wizard `accountId` only; remove helper fallback path                                              | 04           | Done                                 |
| Same file — `themeRows` / `rows[0]`                                                | First **theme catalog** row when no theme entity — not account selection                       | —                                             | Not an account-id assumption                                                                                    | —            | Dismissed                            |
| `src/lib/onboarding/resolve-account-entry.ts`                                      | Incomplete wizard → `/create-organisation?accountId=…`; complete → `/o/{id}/dashboard`         | —                                             | Keep explicit id; verify against `onboardingWizardCompletedAt`                                                  | 04, 06       | Inventory-covered                    |
| `src/lib/onboarding/can-delete-unfinished-onboarding-account.ts`                   | Frontend inferred delete affordance from `hasCompletedOnboardingWizard` + `isSetup`            | wrong-account mutation / unsafe UX            | Removed helper; wizard shows delete when validated `accountId` present; CMS DELETE + 403 handling authoritative | 05           | Done                                 |
| Stale doc `phases/phase-7-multi-account-create-organisation.md`                    | Older text may imply create always mints new account                                           | compatibility cleanup                         | Prefer guide: blank reuse 200 / create 201                                                                      | docs / 04    | Done (prefer guide; stale doc noted) |

---

## 3. Billing / Stripe

| Consumer                                                                                         | Current assumption                                                                       | Risk                         | Required resolution                                                                          | Owning phase  | Status            |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------- | ------------- | ----------------- |
| `src/app/(members)/o/[accountId]/billing/_utils/invoice-request/billingInvoiceRequestPrefill.ts` | Prefill via `activeAccountSummaryFromMePayload(me, accountId)`; two-id prefill test      | —                            | Resolve row by route `accountId` only; no first-row fallback                                 | 02, 07        | Done              |
| `src/app/(members)/o/[accountId]/billing/_hooks/useBillingInvoiceContactPrefill.ts`              | Wires me + org context with route id; create page remounts wizard with `key={accountId}` | —                            | Prefill by route id; remount prevents prior-account form retention                           | 07            | Done              |
| `src/app/(members)/o/[accountId]/billing/create/create-subscription-wizard.tsx`                  | `useAccountMe` for `user.role` staff gate only                                           | —                            | Not account selection                                                                        | —             | Dismissed         |
| Billing query keys (`billing`, `billingOrders`, tiers, invoice-requests)                         | All take `accountId`                                                                     | —                            | Two-id isolation tests cover key shape; cancel-on-switch for in-flight                       | 07            | Done              |
| Order/trial `isActive` elsewhere                                                                 | Order/trial lifecycle, not org selection                                                 | —                            | —                                                                                            | —             | Dismissed         |
| CMS legacy Stripe portal/invoice (`user` field = account id)                                     | Backend Review item                                                                      | wrong-account mutation (CMS) | FE continues to call account-scoped billing routes only; no FE change beyond verifying paths | external / 09 | Inventory-covered |

---

## 4. Branding / assets / template builder

| Consumer                                                                                        | Current assumption                                                            | Risk | Required resolution                       | Owning phase | Status            |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---- | ----------------------------------------- | ------------ | ----------------- |
| `src/app/(members)/o/[accountId]/template-builder/template-builder-content.tsx`                 | Finds matching `accounts[]` row by route id for `templateOptionId`            | —    | Keep scoped find                          | 07           | Inventory-covered |
| Branding / template-option mutations                                                            | Invalidate `account.me` after save                                            | —    | OK if me is user-level list only          | 07           | Inventory-covered |
| `src/lib/api/query/query-keys.ts` — `ui.*PickerSelectedId`                                      | Factories `(accountId) => [...]`; sandbox uses `PICKER_SANDBOX_ACCOUNT_SCOPE` | —    | Namespace picker selection by `accountId` | 07           | Done              |
| Picker hooks under `src/components/pickers/**/_hooks/use-*-picker-selection.ts`                 | Require `accountId`; selection keys account-scoped                            | —    | Same as keys                              | 07           | Done              |
| Catalog keys (`templateCategoriesListForSelection`, assets list-for-selection, template `*.ui`) | Global catalogs (no account)                                                  | —    | Acceptable for shared catalogs            | 07           | Dismissed         |

---

## 5. Fixtures / grades / tracking

| Consumer                                                 | Current assumption                                                                                         | Risk | Required resolution                                          | Owning phase | Status            |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------ | ------------ | ----------------- |
| `src/lib/api/hooks/account/useTriggerOrgSingleScrape.ts` | Resolves club/association from `me.data.accounts` **by route `accountId`**; scrape APIs take org entity id | —    | Keep find-by-id; do not use `accounts[0]`                    | 06, 07       | Inventory-covered |
| Season-hub query keys                                    | All include `accountId`                                                                                    | —    | Phase 07 isolation still required                            | 07           | Inventory-covered |
| CMS tracking / fixture services                          | Backend hardened to explicit account                                                                       | —    | FE must keep passing owned account context via scoped routes | CMS done     | Dismissed (FE)    |

---

## 6. Scheduler / media / sponsors / renders / analytics

| Consumer                                                                          | Current assumption                                                                 | Risk                                                 | Required resolution                                          | Owning phase | Status                                                                             |
| --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------ | ------------ | ---------------------------------------------------------------------------------- |
| Account-scoped BFF under `src/app/api/accounts/[accountId]/**`                    | Path segment supplies id; `guardAccountStrapiRequest` checks auth + id format only | —                                                    | Ownership is CMS; FE must not invent fallback account on 404 | 06           | Inventory-covered                                                                  |
| Scheduler / renders / render-token / analytics / media / sponsors keys            | Include `accountId`                                                                | —                                                    | Phase 07 switch isolation                                    | 07           | Inventory-covered                                                                  |
| `src/app/(members)/o/[accountId]/manage-sponsors/_utils/local-sponsor-storage.ts` | Session storage namespaced by `accountId`                                          | —                                                    | Good pattern; reuse elsewhere                                | 07           | Dismissed (good)                                                                   |
| CMS `GET /scheduler/getDownloads/:accountId`                                      | Was user-id semantics; now account id                                              | wrong-account mutation if FE still used old contract | Confirm FE download clients use account-scoped path          | 06           | Done (verify) — no FE `getDownloads` / `INTERNAL_CMS_TOKEN` consumers under `src/` |

---

## 7. Routing / middleware / server actions / OrgAccessBoundary

| Consumer                                                                                      | Current assumption                                                                                                                                                 | Risk | Required resolution                                                            | Owning phase | Status            |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---- | ------------------------------------------------------------------------------ | ------------ | ----------------- |
| `src/app/(members)/o/[accountId]/layout.tsx` + `org-access-boundary.tsx`                      | Access via organisation-context + onboarding-state for route id; ownership 403/404 → identical `not_found` gateway; onboarding-state account-unavailable redirects | —    | Treat nonexistent/cross-user identically; no fallback to another owned account | 06           | Done              |
| `src/lib/config/account-routes.ts`                                                            | Explicit scoped URL builders                                                                                                                                       | —    | Keep                                                                           | 06           | Inventory-covered |
| `src/app/(members)/o/[accountId]/dashboard/dashboard-content.tsx` + `dashboard-view-model.ts` | `useAccountMe` then `accounts.find` by route id                                                                                                                    | —    | Good; must not use `me.accountId` as active                                    | 06           | Inventory-covered |
| Server actions (e.g. Stripe invoice create)                                                   | Only `"use server"` account action: `createStrapiStripeInvoice(routeAccountId, body)`; rejects body `AccountID` mismatch                                           | —    | Audit each action never derives account from user alone                        | 06           | Done              |

---

## 8. BFF / types / parsers

| Consumer                                                                      | Current assumption                                                                                                            | Risk                                               | Required resolution                                                                           | Owning phase | Status                                                             |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------ |
| `src/types/api/account.ts` — `AccountMePayload.accountId: number`             | Required non-null compatibility id                                                                                            | compatibility cleanup                              | Make nullable/optional per guide; never use for selection                                     | 02           | Done                                                               |
| `src/types/api/account.ts` — `accounts?` optional                             | Optional array                                                                                                                | compatibility cleanup                              | Treat as required owned list once CMS guarantees it                                           | 02           | Done (documented source of truth; still optional at type boundary) |
| `src/app/api/account/me/route.ts`                                             | Comment: “resolves the account via JWT”; pass-through proxy                                                                   | compatibility cleanup                              | Update wording; keep pass-through of multi-account payload                                    | 02           | Done                                                               |
| `src/app/api/account/first/route.ts`                                          | Proxies via `nextResponseFromStrapiFetch`; preserves status/body                                                              | —                                                  | Confirm 200/201/503 + structured errors (tests cover 200/201/errors; not ACCOUNT_CREATE_BUSY) | 02           | Done                                                               |
| `src/lib/api/bff/next-response-from-strapi-fetch.ts`                          | Forwards status + JSON body; **does not forward `Retry-After`**                                                               | wrong-account mutation / unsafe UX for busy create | Forward `Retry-After` (and any required busy headers)                                         | 02           | Done                                                               |
| No FE references to `ACCOUNT_CREATE_BUSY` / `Retry-After`                     | Client cannot honor CMS busy contract                                                                                         | unsafe fallback                                    | Parse + surface retryable create state                                                        | 02, 04       | Done                                                               |
| `src/lib/api/bff/guard-account-strapi-request.ts` / `guard-strapi-request.ts` | Auth (+ segment validation); no ownership                                                                                     | —                                                  | Correct layering                                                                              | 02, 06       | Dismissed                                                          |
| `src/lib/api/routes/route-definitions.ts`                                     | Registry for `account.me` / `account.first` / scoped routes                                                                   | —                                                  | Update comments for blank obtain semantics                                                    | 02           | Done                                                               |
| Account-level `ACCOUNT_NOT_FOUND` pass-through                                | Present on delete / onboarding-state / security tests; `isAccountUnavailableError` wired into org-context + OrgAccessBoundary | —                                                  | Normalize carefully; do not map nested-resource 404s to ownership failure                     | 02, 06       | Done                                                               |

---

## 9. Caches / query keys / persisted client state

| Consumer                                                            | Current assumption                                                                                                                                          | Risk                                        | Required resolution                                                        | Owning phase | Status            |
| ------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------- | ------------ | ----------------- |
| `queryKeys.account.me` = `["account","me"]`                         | User-scoped bootstrap list (intentional)                                                                                                                    | stale presentation if treated as active org | Never derive selected org from this cache alone                            | 03, 07       | Inventory-covered |
| Most `queryKeys.account.*` / `seasonHub.*`                          | Include `accountId`                                                                                                                                         | —                                           | Prove isolation under rapid switch                                         | 07           | Inventory-covered |
| `ui.*PickerSelectedId` keys                                         | Namespaced by `accountId`                                                                                                                                   | —                                           | Scope or reset on account change                                           | 07           | Done              |
| Delete success / uncertain reconcile (`useDeleteUnfinishedAccount`) | Parses `{ deleted: true }`; uncertain outcomes refetch `account.me`; `removeQueries` for deleted id only; invalidates me + auth.me; redirects to select-org | —                                           | Phase 07 still audits other account-scoped key families under rapid switch | 05           | Done              |
| Switch cancel (`cancelOtherAccountQueries` via OrgAccessBoundary)   | Cancels in-flight `account` / `season-hub` queries for other ids; leaves `account.me` and warm cache                                                        | —                                           | Prove under rapid switch                                                   | 07           | Done              |

---

## 10. Tests encoding singular assumptions

| Consumer                                                                           | Current assumption                                                                                                                                 | Risk                  | Required resolution                                                       | Owning phase | Status            |
| ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------- | ------------ | ----------------- |
| `src/lib/account/account-me-rows.test.ts`                                          | Encodes omitted-selected → `payload.accountId`; unmatched → first row                                                                              | unsafe fallback       | Rewrite expectations to forbid silent first-row / compatibility selection | 02, 08       | Done              |
| `src/app/(members)/create-organisation/_components/_test/wizard-test-fixtures.tsx` | Previously defaulted fixture id via `accounts[0]`; now requires explicit `accountId` for multi-account fixtures (single-row may use that row’s id) | compatibility cleanup | Prefer explicit ids in fixtures (two distinct ids in multi-account tests) | 08           | Done              |
| `src/app/api/account/first/route.test.ts`                                          | Preserves 200 and 201                                                                                                                              | —                     | Add 503 + Retry-After when BFF forwards                                   | 02, 08       | Done              |
| Select-org / wizard / org-access tests                                             | Use explicit ids; do not auto-redirect via `me.accountId`                                                                                          | —                     | Expand multi-account matrix in Phase 08                                   | 08           | Inventory-covered |

---

## Dismissed non-findings (selection)

| Pattern                                                | Evidence                                                                      |
| ------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `user.account`                                         | No production usages under `src/`                                             |
| `isActive` as org selection                            | Display/badge/sponsor/order state only; select-org does not auto-pick from it |
| Middleware selecting via `me.accountId`                | Middleware is cookie auth + gateway redirects only                            |
| Select-org auto-picking single account                 | Cards require click; empty list shows create card only                        |
| `rows[0]` in account-security / season scorecard tests | Unrelated table-row assertions                                                |

---

## CMS consumer comparison (`04-consumer-hardening.md`)

| Backend theme                                                | Frontend status                                                                                              |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Explicit `accountId` everywhere; JWT does not select account | Mostly true for `/o/[accountId]` + scoped BFF; **violated** by `activeAccountSummaryFromMePayload` fallbacks |
| Never first-account / lowest-id for processing               | FE still has `rows[0]` fallback in shared helper + tests                                                     |
| Orders/Stripe account-scoped                                 | FE billing routes under `/api/accounts/:accountId/billing/*`; good                                           |
| Scheduler downloads by account id                            | Backend changed; **FE must verify** download clients use `:accountId`                                        |
| Background/queues                                            | N/A for FE                                                                                                   |
| Compatibility `data.accountId` retained temporarily          | FE types still require `accountId: number` and helpers consume it                                            |

---

## Shared-file overlap map (later phases)

| File                                                                               | Likely phases |
| ---------------------------------------------------------------------------------- | ------------- |
| `src/lib/account/account-me-rows.ts` (+ `.test.ts`)                                | 02, 03, 08    |
| `src/types/api/account.ts`                                                         | 02            |
| `src/lib/api/query/query-keys.ts`                                                  | 07            |
| `src/lib/api/query/cancel-other-account-queries.ts`                                | 07            |
| `src/components/auth/org-access-boundary.tsx`                                      | 06, 07        |
| `src/lib/api/services/account.api.ts`                                              | 02, 04, 05    |
| `src/lib/api/hooks/account/useAccountMe.ts`                                        | 02, 03        |
| `src/lib/api/hooks/account/useCreateFirstAccount.ts`                               | 02, 04        |
| `src/lib/api/hooks/account/useDeleteUnfinishedAccount.ts`                          | 05, 07        |
| `src/app/api/account/me/route.ts`                                                  | 02            |
| `src/app/api/account/first/route.ts` (+ `.test.ts`)                                | 02, 04, 08    |
| `src/lib/api/bff/next-response-from-strapi-fetch.ts`                               | 02            |
| `src/lib/api/bff/guard-*.ts`, `route-definitions.ts`                               | 02, 06        |
| `src/app/(members)/select-organisation/select-organisation-content.tsx`            | 03, 08        |
| `src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx` | 04, 05, 08    |
| `src/components/navigation/app-sidebar/_hooks/use-app-sidebar-user.ts`             | 03            |
| `src/lib/api/parse-delete-account-response.ts`                                     | 05            |
| `src/lib/api/account-delete-outcome.ts`                                            | 05            |
| `src/components/auth/org-access-boundary.tsx`                                      | 06            |
| `src/lib/config/gateway-reasons.ts`                                                | 06            |
| `src/lib/api/account-unavailable.ts`                                               | 02, 06        |
| `src/app/(members)/o/[accountId]/billing/create/actions/create-stripe-invoice.ts`  | 06            |

**Working-tree note:** Unrelated dirty files (dashboard branding components, `button.tsx`, save-branding dialog, older onboarding docs) were not modified for this phase.

---

## High-risk shortlist (implementation priority)

1. ~~Remove `payload.accountId` → `rows[0]` “active” fallback (`account-me-rows.ts` + call sites + tests).~~ **Done (Phase 02)**
2. ~~Forward `Retry-After` / handle `ACCOUNT_CREATE_BUSY` on `/account/first` path.~~ **Done (Phase 02 contract + Phase 04 UI)**
3. ~~Make `AccountMePayload.accountId` compatibility-only (nullable) and stop selection usage.~~ **Done (Phase 02)**
4. ~~Namespace or reset global `ui.*PickerSelectedId` keys by account.~~ **Done (Phase 07)**
5. ~~Stop client-side delete eligibility inference; trust CMS delete responses.~~ **Done (Phase 05)**
6. ~~Wire ownership-identical OrgAccessBoundary + bind Stripe invoice to route id.~~ **Done (Phase 06)**

---

## Phase 02 starting worklist (API / types / BFF first)

**Completed 2026-07-13** — see Phase 02 handoff in `02-api-types-parsing-and-bff.md`.
