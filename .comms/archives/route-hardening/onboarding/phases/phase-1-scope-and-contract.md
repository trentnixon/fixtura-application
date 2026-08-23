# Phase 1: Scope And Contract Inventory

Status: Complete

## Goal

Confirm what the app believes the onboarding contract is before changing behavior.

## Code Areas

- `src/lib/api/routes/route-definitions.ts`
- `src/lib/api/services/account.api.ts`
- `src/types/api/account.ts`
- `src/lib/api/query/query-keys.ts`
- `src/app/api/account/**`
- `src/app/api/accounts/[accountId]/onboarding/**`
- `src/app/(members)/select-organisation/**`
- `src/app/(members)/create-organisation/**`
- `src/components/auth/org-access-boundary.tsx`

## Tasks

- [x] List every customer route involved in onboarding.
- [x] List every onboarding API route in `appRoutes`.
- [x] Match every `accountApi` onboarding method to a concrete BFF route file.
- [x] Confirm request and response types exist for each endpoint.
- [x] Confirm query keys exist for lifecycle/setup reads and are invalidated by writes.
- [x] Note naming mismatches, especially `deliveryAddress` as weekly asset email.
- [x] Record CMS/backend assumptions that are only present in comments.

## Tests And Checks

- [x] No code changes expected in this phase.
- [x] No test run required unless inventory finds a broken import or route reference.
- [x] Optional: run targeted typecheck if route/type inconsistencies are edited.

## Hardening Notes

- Treat this phase as source-of-truth cleanup only.
- Do not change user behavior here.
- Capture uncertain CMS semantics as explicit questions rather than encoding guesses.

---

## Completion Evidence

### Route matrix

| Customer route               | Entry file                                                                           | Query params                                                                                   | APIs called                                                                                                                                                                                 | Redirect / routing behavior                                                                                                                                                                | Exceptions                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `/select-organisation`       | `src/app/(members)/select-organisation/page.tsx` → `select-organisation-content.tsx` | `reason` (gateway feedback: `forbidden`, `not_found`, `invalid_org`); dev `orgSim` (simulator) | `GET /api/account/me`; per-row prefetch `GET …/onboarding/onboarding-state`                                                                                                                 | Zero accounts → show Create card only. Card click → fetch onboarding-state → `accountEntryFromOnboardingState`: wizard → `/create-organisation?accountId=`; complete → `/o/{id}/dashboard` | Dev `orgSim` skips lifecycle APIs and opens dashboard directly                                                                    |
| `/create-organisation`       | `src/app/(members)/create-organisation/page.tsx` → `create-organisation-wizard.tsx`  | `accountId` (resume)                                                                           | Bootstrap: `GET /api/account/me`, `GET …/onboarding/onboarding-state`, `GET …/setup-status` (compact card). Step 0: `POST /api/account/first`. Lookups + step PATCH/POST + confirm + delete | Completed wizard → `router.replace(/o/{id}/dashboard)`. Resume: `not_started` → step 1; `in_progress` → `onboardingCurrentStep` 1–4                                                        | Step 0 only when zero accounts or no `accountId`. Create organisation card links here **without** `accountId` (Phase 7 ambiguity) |
| `/create-organisation/setup` | `src/app/(members)/create-organisation/setup/page.tsx` → `setup-client.tsx`          | `accountId` (required)                                                                         | `GET …/onboarding/onboarding-state`, `GET …/setup-status`                                                                                                                                   | **Recovery-only:** wizard incomplete → redirect to wizard; wizard complete → redirect to dashboard immediately                                                                             | Normal post-W4 flow goes to dashboard, not this route. UI only for bookmarks/support                                              |
| `/o/[accountId]/*`           | `src/app/(members)/o/[accountId]/layout.tsx` → `OrgAccessBoundary`                   | Path segment `accountId`                                                                       | `GET …/organisation`, `GET …/onboarding/onboarding-state`                                                                                                                                   | Invalid segment → `/select-organisation?reason=invalid_org`. Org 403/404/400 → `/select-organisation?reason=…`. Wizard incomplete → `/create-organisation?accountId=`                      | **`/o/{id}/season` and subpaths exempt** from wizard redirect                                                                     |

**Lifecycle source of truth:** `src/lib/onboarding/resolve-account-entry.ts`

- `wizardDone = hasCompletedOnboardingWizard === true || onboardingWizardStatus === "completed"`
- Wizard incomplete → intent `wizard` → `/create-organisation?accountId={id}`
- Wizard complete → intent `dashboard` → `/o/{id}/dashboard`
- **`isSetup` and pipeline status do not block routing**

**Per-route hardening doc gaps (defer to Phases 2–3):** `select-organisation.md`, `create-organisation.md`, and `setup.md` are checklist shells missing lifecycle routing, Step 0, setup recovery-only behavior, and endpoint↔hook matrices.

---

### Endpoint matrix

All 18 onboarding-related `appRoutes` keys align 1:1 with `accountApi` methods and BFF `route.ts` files. No orphan keys or methods.

| appRoutes key                                | Method | BFF path                                               | `accountApi` method                     | Hook(s)                                | Request type                     | Response type                                | BFF file                                    | API test                  |
| -------------------------------------------- | ------ | ------------------------------------------------------ | --------------------------------------- | -------------------------------------- | -------------------------------- | -------------------------------------------- | ------------------------------------------- | ------------------------- |
| `account.me`                                 | GET    | `/api/account/me`                                      | `getAccountMe`                          | `useAccountMe`                         | —                                | `AccountMeResponse`                          | `src/app/api/account/me/route.ts`           | —                         |
| `account.first`                              | POST   | `/api/account/first`                                   | `createFirstAccount`                    | `useCreateFirstAccount`                | `CreateFirstAccountRequestBody`  | `CreateFirstAccountResponse`                 | `src/app/api/account/first/route.ts`        | —                         |
| `account.onboardingLookupsSports`            | GET    | `/api/account/onboarding/lookups/sports`               | `getOnboardingLookupsSports`            | `useOnboardingLookupSports`            | —                                | `OnboardingLookupsSportsResponse`            | `…/lookups/sports/route.ts`                 | —                         |
| `account.onboardingLookupsOrganisationTypes` | GET    | `/api/account/onboarding/lookups/organisation-types`   | `getOnboardingLookupsOrganisationTypes` | `useOnboardingLookupOrganisationTypes` | —                                | `OnboardingLookupsOrganisationTypesResponse` | `…/organisation-types/route.ts`             | —                         |
| `account.onboardingLookupsAssociations`      | GET    | `/api/account/onboarding/lookups/associations?sport=`  | `getOnboardingLookupsAssociations`      | `useOnboardingLookupAssociations`      | query `sport`                    | `OnboardingLookupsAssociationsResponse`      | `…/lookups/associations/route.ts`           | —                         |
| `account.onboardingLookupsClubs`             | GET    | `/api/account/onboarding/lookups/clubs?associationId=` | `getOnboardingLookupsClubs`             | `useOnboardingLookupClubs`             | query `associationId`            | `OnboardingLookupsClubsResponse`             | `…/lookups/clubs/route.ts`                  | —                         |
| `account.onboardingLookupsThemes`            | GET    | `/api/account/onboarding/lookups/themes`               | `getOnboardingLookupsThemes`            | `useOnboardingLookupThemes`            | —                                | `OnboardingLookupsThemesResponse`            | `…/lookups/themes/route.ts`                 | —                         |
| `accounts.onboardingStep1`                   | PATCH  | `/api/accounts/{id}/onboarding/step-1`                 | `updateOnboardingStep1`                 | `useUpdateOnboardingStep1`             | `UpdateOnboardingStep1Body`      | `UpdateOnboardingStep1Response`              | `…/onboarding/step-1/route.ts`              | —                         |
| `accounts.onboardingStep2Upload`             | POST   | `/api/accounts/{id}/onboarding/step-2/upload`          | `uploadOnboardingStep2Logo`             | (inside `useUpdateOnboardingStep2`)    | `FormData`                       | `UploadOnboardingStep2LogoResponse`          | `…/step-2/upload/route.ts`                  | —                         |
| `accounts.onboardingStep2`                   | PATCH  | `/api/accounts/{id}/onboarding/step-2`                 | `updateOnboardingStep2`                 | `useUpdateOnboardingStep2`             | `UpdateOnboardingStep2Body`      | `UpdateOnboardingStep2Response`              | `…/onboarding/step-2/route.ts`              | —                         |
| `accounts.onboardingStep2Theme`              | POST   | `/api/accounts/{id}/onboarding/step-2/theme`           | `createOnboardingStep2Theme`            | `useCreateOnboardingStep2Theme`        | `CreateOnboardingStep2ThemeBody` | `CreateOnboardingStep2ThemeResponse`         | `…/step-2/theme/route.ts`                   | —                         |
| `accounts.onboardingStep3`                   | PATCH  | `/api/accounts/{id}/onboarding/step-3`                 | `updateOnboardingStep3`                 | `useUpdateOnboardingStep3`             | `UpdateOnboardingStep3Body`      | `UpdateOnboardingStep3Response`              | `…/onboarding/step-3/route.ts`              | **Yes** (`route.test.ts`) |
| `accounts.onboardingConfirm`                 | POST   | `/api/accounts/{id}/onboarding/confirm`                | `confirmOnboarding`                     | `useConfirmOnboarding`                 | `Record<string, unknown>`        | `ConfirmOnboardingResponse`                  | `…/onboarding/confirm/route.ts`             | —                         |
| `accounts.onboardingSetupStatus`             | GET    | `/api/accounts/{id}/onboarding/setup-status`           | `getOnboardingSetupStatus`              | `useOnboardingSetupStatus`             | —                                | `unknown` (parsed in hook)                   | `…/onboarding/setup-status/route.ts`        | —                         |
| `accounts.onboardingOnboardingState`         | GET    | `/api/accounts/{id}/onboarding/onboarding-state`       | `getOnboardingOnboardingState`          | `useOnboardingOnboardingState`         | —                                | `OnboardingStateResponse \| unknown`         | `…/onboarding/onboarding-state/route.ts`    | —                         |
| `accounts.onboardingRetrySetup`              | POST   | `/api/accounts/{id}/onboarding/retry-setup`            | `retryOnboardingSetup`                  | `useRetryOnboardingSetup`              | `Record<string, unknown>`        | `OnboardingStateResponse \| unknown`         | `…/onboarding/retry-setup/route.ts`         | —                         |
| `accounts.deleteAccount`                     | DELETE | `/api/accounts/{id}`                                   | `deleteUnfinishedAccount`               | `useDeleteUnfinishedAccount`           | —                                | `unknown`                                    | `src/app/api/accounts/[accountId]/route.ts` | —                         |

**Related scoped read (not onboarding `appRoutes` but used by gates):**

| Concern                 | Method | Path                              | Hook                            |
| ----------------------- | ------ | --------------------------------- | ------------------------------- |
| Org access gate         | GET    | `/api/accounts/{id}/organisation` | `useAccountOrganisationContext` |
| Step hydration / review | GET    | `/api/accounts/{id}/settings`     | `useAccountSettings`            |
| Step 2 branding         | GET    | `/api/accounts/{id}/branding`     | `useAccountBranding`            |

**BFF siblings under `src/app/api/account/` not in onboarding registry:** `template-categories/list-for-selection`, `organisation/[accountId]` (legacy hub).

---

### Data field matrix

| Phase                   | UI component                                     | Write endpoint                                                                       | API body keys                                                                                                            | CMS / Strapi storage                              | Hydration reads                                                     | UI validation                                                                                |
| ----------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Step 0** Get started  | Inline in `create-organisation-wizard.tsx`       | `POST /api/account/first`                                                            | `sport`, `hasCompletedStartSequence`                                                                                     | A1 first-account endpoint                         | `useAccountMe`, `useOnboardingLookupSports`                         | Sport required; coming-soon sports disabled                                                  |
| **Step 1** Organisation | `wizard-step-organisation.tsx`                   | `PATCH …/step-1`                                                                     | `sport`, `accountTypeId`, `associationId`, `clubId`, `onboardingOrganisationName`, `isRightsHolder`, `isPermissionGiven` | Account fields per W1 handoff                     | `useAccountSettings`, lookup hooks (org types, associations, clubs) | Sport, org type, association, club (if club type), rights + permission switches              |
| **Step 2** Branding     | `wizard-step-branding.tsx`                       | `POST …/step-2/upload` (if file) + `POST …/step-2/theme` (custom) + `PATCH …/step-2` | `themeId`, `logoMediaId`                                                                                                 | Theme ref + logo media ref                        | `useAccountBranding`, `useOnboardingLookupThemes`, `useAccountMe`   | Logo + theme selection                                                                       |
| **Step 3** Contact      | `wizard-step-contact.tsx`                        | `PATCH …/step-3`                                                                     | `firstName`, `lastName`, **`deliveryAddress`**                                                                           | `FirstName`, `LastName`, **`DeliveryAddress`**    | `useAccountSettings`                                                | First name required; **`deliveryAddress` = weekly assets email** (max 320, email validation) |
| **Step 4** Review       | `wizard-step-review.tsx`                         | `POST …/confirm`                                                                     | `{}` (CMS-defined)                                                                                                       | Wizard completion flags                           | settings, org context, branding, lookups, `useCurrentUser`          | Read-only review then confirm                                                                |
| **Post-wizard** Setup   | `SetupStatusCard` (wizard compact + setup route) | — (reads)                                                                            | —                                                                                                                        | Pipeline enums on onboarding-state + setup-status | `useOnboardingSetupStatus`, `useOnboardingOnboardingState`          | Retry via `POST …/retry-setup` when failed                                                   |

**Step index mapping:**

- Client Step 0 (Get started / sport) is **client-only prelude** before server `onboardingCurrentStep` 1–4.
- Server `onboardingCurrentStep` 0 = not started; resume sets UI to step 1 when `not_started`, or to `onboardingCurrentStep` when `in_progress`.

**Naming mismatch — `deliveryAddress`:**

| Layer                                                   | Semantics                                                                        |
| ------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Product / UI (`wizard-step-contact.tsx` line 36)        | Weekly assets delivery **email**                                                 |
| API field (`UpdateOnboardingStep3Body.deliveryAddress`) | Neutral name; stores email value in practice                                     |
| CMS comms (`cms-response-phase4-w3`)                    | `text` field, max 4000, multiline allowed — **postal-address semantics in docs** |
| CMS request open Q C3                                   | Still says "UI is a textarea today" — **stale**; UI is single-line email input   |

---

### Query key and invalidation matrix

**Read keys:**

| Key factory                                       | Tuple                                               | Used by                                |
| ------------------------------------------------- | --------------------------------------------------- | -------------------------------------- |
| `queryKeys.account.me`                            | `["account", "me"]`                                 | `useAccountMe`                         |
| `queryKeys.account.setupStatus(accountId)`        | `["account", "onboarding-setup-status", accountId]` | `useOnboardingSetupStatus`             |
| `queryKeys.account.onboardingState(accountId)`    | `["account", "onboarding-state", accountId]`        | `useOnboardingOnboardingState`         |
| `queryKeys.onboarding.lookupsSports`              | `["onboarding", "lookups", "sports"]`               | `useOnboardingLookupSports`            |
| `queryKeys.onboarding.lookupsOrganisationTypes`   | `["onboarding", "lookups", "organisation-types"]`   | `useOnboardingLookupOrganisationTypes` |
| `queryKeys.onboarding.lookupsAssociations(sport)` | `["onboarding", "lookups", "associations", sport]`  | `useOnboardingLookupAssociations`      |
| `queryKeys.onboarding.lookupsClubs(id)`           | `["onboarding", "lookups", "clubs", id \| "none"]`  | `useOnboardingLookupClubs`             |
| `queryKeys.onboarding.lookupsThemes`              | `["onboarding", "lookups", "themes"]`               | `useOnboardingLookupThemes`            |

**Mutation invalidation by hook:**

| Hook                            | Invalidates                                                                                                                                                               |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `useCreateFirstAccount`         | `account.me`                                                                                                                                                              |
| `useUpdateOnboardingStep1`      | `me`, `settings`, `organisationContext`, `setupStatus`, `onboardingState`                                                                                                 |
| `useUpdateOnboardingStep2`      | `me`, `branding`, `settings`, `mediaLibrary`, `setupStatus`, `onboardingState` — **not** `organisationContext`                                                            |
| `useUpdateOnboardingStep3`      | `me`, `settings`, `auth.me`, `setupStatus`, `onboardingState`                                                                                                             |
| `useConfirmOnboarding`          | `me`, `settings`, `organisationContext`, `branding`, `auth.me`, `setupStatus`, `onboardingState`                                                                          |
| `useRetryOnboardingSetup`       | `me`, `onboardingState`, `setupStatus`, `settings`, `organisationContext`, `branding`, `auth.me`                                                                          |
| `useCreateOnboardingStep2Theme` | `me`, `branding`, `lookupsThemes`, `settings` — **not** `setupStatus` / `onboardingState`                                                                                 |
| `useDeleteUnfinishedAccount`    | Cancels in-flight onboarding queries; `me` refetch; `onboardingState`, `setupStatus`, `settings`, `organisationContext`, `branding`, `auth.me` with `refetchType: "none"` |

**Asymmetries flagged for Phase 3/4 (not fixed in Phase 1):**

- `useUpdateOnboardingStep2` omits `organisationContext` invalidation (step 1 and confirm include it).
- `useCreateOnboardingStep2Theme` omits lifecycle keys (`setupStatus`, `onboardingState`).
- `uploadOnboardingStep2Logo` has no standalone hook; invoked inside `useUpdateOnboardingStep2`.

**setup-status vs onboarding-state split** (from `app-handoff-setup-status-vs-onboarding-state.md`):

- **setup-status:** machine-readable polling, `isUpdating`, pipeline phase/status.
- **onboarding-state:** wizard completion, routing (`resolveAccountEntry`), pipeline timestamps, banner inputs.

---

### Open contract questions

**Product / app (unresolved — do not guess):**

| ID  | Question                                                                                                                                                             | Source                                                                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| P1  | Multi-account "Create organisation": create new vs resume existing — deferred to Phase 7                                                                             | Hardening plan                                                              |
| P2  | `deliveryAddress` product semantics: app treats as weekly assets email; CMS docs describe postal/multiline text (max 4000). Which is authoritative for v1?           | `wizard-step-contact.tsx`, `cms-response-phase4-w3`, `.memory/decisions.md` |
| P3  | Are first name + weekly assets email required before W4 confirm (product C1)? CMS defers to product.                                                                 | `cms-request-phase4-w3` §C1                                                 |
| P4  | Get Started (Step 0) vs server `onboardingCurrentStep`: is sport selection client-only prelude with server step 1 = organisation?                                    | `onboarding-lifecycle-v1-open-questions-for-cms.md` §6 Q14                  |
| P5  | Post-confirm UX: gateway-only until setup complete vs enter `/o/*` with soft gating? **Current app:** wizard complete unlocks scoped app regardless of setup status. | Lifecycle open questions §5 Q11–12; `resolve-account-entry.ts`              |

**CMS / backend (from comms — some may be answered but not reflected in app types):**

| ID  | Question                                                                                                  | Source                                                                                            |
| --- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| C1  | Setup-status terminal vocabulary: `failed` vs `blocked` / `abandoned` — which values stop polling?        | `onboarding-lifecycle-v1-open-questions-for-cms.md` §2                                            |
| C2  | `initialSetupStatus` vs `initialDataFetchStatus` ordering and which drives `setup-status.status`          | Same doc §4 Q8–9                                                                                  |
| C3  | Polling cadence: handoff recommends 10–15s backoff; app may use shorter fixed interval                    | Same doc §8                                                                                       |
| C4  | Post-confirm / post-retry consistency delay before new `queued`/`running` states appear                   | Same doc §10 Q20                                                                                  |
| C5  | DELETE unfinished account: eligibility contract (`isSetup === false`, incomplete wizard) and error shapes | `epic-5-ticket-5-2-delete-account-bff-placeholder.md` (route exists; Epic 6 CMS dependency noted) |
| C6  | `retry-setup` `409 RETRY_NOT_ALLOWED` error envelope stability                                            | Lifecycle open questions §9 Q18                                                                   |

**Loose types catalogued (defer tightening to Phase 4):**

| Endpoint                                                | Gap                                                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `confirmOnboarding`                                     | No `ConfirmOnboardingBody`; body is `Record<string, unknown>`                               |
| `retryOnboardingSetup`                                  | No `RetryOnboardingSetupBody`                                                               |
| `deleteUnfinishedAccount`                               | No `DeleteUnfinishedAccountResponse`; returns `unknown`                                     |
| `getOnboardingSetupStatus`                              | Service returns `unknown`; `OnboardingSetupStatusData` exists but not used at service layer |
| `getOnboardingOnboardingState` / `retryOnboardingSetup` | Union with `unknown`; runtime parse in hooks                                                |
| `ConfirmOnboardingResponse.data`                        | Optional `Record<string, unknown>`                                                          |
| `OnboardingSetupStatusData.status`                      | Plain `string` (not union); parser enforces at runtime                                      |

**Stale comms note:** `onboarding-lifecycle-v1-open-questions-for-cms.md` §"App-side context" claims onboarding-state and retry-setup are not implemented; **code now implements both**. Treat open questions as still valid; treat implementation status as outdated.

---

### Commands run

```powershell
rg -n "onboarding|create-organisation|select-organisation|onboarding-state|setup-status" src docs/route-hardening/onboarding
rg --files src/app/api/account src/app/api/accounts src/lib/api/services src/lib/api/hooks/account | rg "onboarding|me/route|first/route"
```

**Results:** 18 BFF route files confirmed under `src/app/api/account/` and `src/app/api/accounts/[accountId]/onboarding/` plus `accounts/[accountId]/route.ts` (DELETE). Only `step-3/route.test.ts` exists for API route tests. No broken imports or route references found. Typecheck not run (no code/type edits made).

---

## Phase Handoff

**Code changes:** None.

**Tests added/updated:** None.

**Remaining risks:**

- Loose types on confirm, retry-setup, delete, and setup-status service layer.
- Query invalidation asymmetry (step 2 org context; step 2 theme lifecycle keys).
- `deliveryAddress` semantic mismatch between app (email) and CMS docs (postal text).
- Multi-account create organisation ambiguity (Phase 7).
- Uneven BFF API route test coverage (only step-3).
- Stale CMS open-questions doc re implementation status.

**Next recommended phase:** Phase 2 — [phase-2-lifecycle-routing-and-access.md](phase-2-lifecycle-routing-and-access.md)
