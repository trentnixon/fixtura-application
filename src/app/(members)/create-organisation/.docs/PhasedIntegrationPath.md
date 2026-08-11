# Phased integration path — create-organisation wizard

**Route:** `src/app/(members)/create-organisation/`
**Purpose:** Step-by-step build plan for the **onboarding wizard** (org-first, account-scoped). Use this document to review **one phase at a time** with product and CMS.

**Authoritative product + API references:**

- [handoff-onboarding.md](../../.comms/handoff-onboarding.md) — full PDR (steps, UX, TanStack Query).
- [cms-handoff-onboarding-api-requirements.md](../../.comms/cms-handoff-onboarding-api-requirements.md) — capability IDs (L/W/A/S/R/M), BFF vs CMS, Q&A.

**Legend — capability IDs (CMS handoff):**

| ID          | Meaning                                                     |
| ----------- | ----------------------------------------------------------- |
| **A1**      | Create or attach **first account** (zero-account user).     |
| **L1–L3**   | Reference / lookup APIs (sport, org type, other picklists). |
| **W1–W4**   | Onboarding **writes** — steps 1–3 + confirm wizard.         |
| **S1 / S2** | Setup **status** read + **polling** contract.               |
| **R1**      | Optional **single GET** for review (aggregate).             |
| **M1**      | Logo / media upload contract.                               |

**What exists today (app):**

- [page.tsx](../page.tsx) — route entry with metadata; renders **`CreateOrganisationWizard`**.
- [\_components/create-organisation-wizard.tsx](../_components/create-organisation-wizard.tsx) — **Get Started** triggers **A1** when bootstrap has no account rows; **Step 1** uses [wizard-step-organisation.tsx](../_components/wizard-step-organisation.tsx) (L1/L2 + W1); **Step 2** uses [wizard-step-branding.tsx](../_components/wizard-step-branding.tsx) (M1 + W2 + `GET …/branding` hydrate); **Step 3** uses [wizard-step-contact.tsx](../_components/wizard-step-contact.tsx) (W3 + settings + `auth/me`); **Step 4** uses [wizard-step-review.tsx](../_components/wizard-step-review.tsx) (parallel GETs §4.5 + **W4** confirm); **after W4 success** navigates to **`/o/[accountId]/dashboard`**; internal step index, step strip, Back/Next, **Finish** on last step; links to select-organisation and help.
- **BFF** — `POST /api/account/first` (A1); `GET /api/account/onboarding/lookups/sports` · `…/organisation-types` (L1/L2); `GET /api/account/onboarding/lookups/themes` (L3); `PATCH /api/accounts/[accountId]/onboarding/step-1` (W1); `POST …/onboarding/step-2/upload` (M1), `POST …/onboarding/step-2/theme`, `PATCH …/onboarding/step-2` (W2); `PATCH …/onboarding/step-3` (W3); `POST …/onboarding/confirm` (W4); `GET …/onboarding/setup-status` (S1); other `GET` under `/api/accounts/[accountId]/…`; **`account.api.ts`** includes onboarding + `createFirstAccount`.
- **Bootstrap** — `GET /api/account/me`, `GET /api/auth/me` (reads only).

---

## Wizard structure (what we build in the UI)

These are the **visible** steps from the PDR; implementation uses **one layout + one stepper** (internal step index).

| Order | Screen                        | PDR / handoff                   | Notes                                                                             |
| ----- | ----------------------------- | ------------------------------- | --------------------------------------------------------------------------------- |
| 0     | **Get Started**               | Part 1 “Get Started”            | Pre-stepper: expectations, background prep, CTA into step 1.                      |
| 1     | **Organisation + permission** | Step 1, **W1**, **L1–L3**       | Sport, org type, name, permission/authority; unlocks backend prep.                |
| 2     | **Branding**                  | Step 2, **W2**, **M1**          | Logo/colours minimum; theme deep-dive deferred per PDR.                           |
| 3     | **Contact / delivery**        | Step 3, **W3**                  | Operational contact; email rules per semantics doc.                               |
| 4     | **Review + confirm**          | Step 4, **W4**, **R1** optional | Summary; **wizard complete** (distinct from **setup complete**).                  |
| —     | **Setup status** (persistent) | **S1**, **S2**                  | Card/banner after step 1 through terminal ready/blocked; **poll** until terminal. |

---

## Phase 0 — Documentation, shell, no live writes

**Status:** **Done** (TKT-2026-ONB-001).

**Goal:** Safe place to iterate UI structure without depending on CMS.

| Area           | Delivered                                                                                                                                                                                                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route          | [page.tsx](../page.tsx) exports metadata and mounts `CreateOrganisationWizard`. No segment `layout.tsx` (not required for providers).                                                                                                                                                                    |
| UI shell       | [create-organisation-wizard.tsx](../_components/create-organisation-wizard.tsx): **Get Started** (step 0), then four wizard steps with placeholder copy; horizontal **step strip** (current / done / upcoming); **Back** / **Next**; **Finish** disabled on step 4 with note until server wiring exists. |
| State          | `useState` step index only; **no** URL sync, **no** persistence.                                                                                                                                                                                                                                         |
| Escape hatches | **Back to selection** → `ROUTES.selectOrganisation`; **Get help** → `ROUTES.help`.                                                                                                                                                                                                                       |
| API            | None (no CMS/BFF calls).                                                                                                                                                                                                                                                                                 |

**Endpoints:** none.

**Exit criteria (met):** `/create-organisation` shows Get Started + stepper frames for all four steps; gateway links to select-organisation and help work; no live writes.

---

## Phase 1 — First account + bootstrap (A1)

**Status:** **Done** (TKT-2026-ONB-002) — app + BFF; **Strapi** must implement upstream `POST /api/account/first` per [`.comms/phase-1/app-handoff-post-account-first-endpoint.md`](../.comms/phase-1/app-handoff-post-account-first-endpoint.md).

**Goal:** User with **zero accounts** gets a **stable `accountId`** so account-scoped reads and writes can attach.

| Area      | Exists                                                                                                                     | Notes                                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| A1        | BFF `POST /api/account/first` → Strapi `POST /api/account/first`; `accountApi.createFirstAccount`; `useCreateFirstAccount` | Get Started calls A1 when [`accountPickerRowsFromMePayload`](../../../../lib/account/account-me-rows.ts) is empty. |
| Bootstrap | `GET /api/account/me`                                                                                                      | After A1 success, **`account.me`** query invalidated.                                                              |
| Gateway   | Select-organisation, create-organisation                                                                                   | Product decision on default entry for zero-account unchanged (CMS handoff §9.2 Q1).                                |

**Endpoints**

- **BFF:** `POST /api/account/first` (body optional JSON, often `{}`).
- **Upstream:** Strapi contract documented in app-handoff above; semantics for draft vs live vs **W1** remain in CMS handoff §4.2.

---

## Phase 2 — Lookups + Step 1 (L1–L3, W1)

**Status:** **Done** (app + BFF; v1 assumptions in [phase2-v1-data-matrix-assumptions.md](../.comms/phase-2/phase2-v1-data-matrix-assumptions.md); Strapi contract in [app-handoff-onboarding-phase2-l1-l2-w1.md](../.comms/phase-2/app-handoff-onboarding-phase2-l1-l2-w1.md)).

**Goal:** Populate dropdowns; save **organisation + permission**; queue backend work per PDR.

| Area      | Exists                                                                                                                                                                           |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| L1–L2     | BFF `GET /api/account/onboarding/lookups/sports` · `GET …/organisation-types`; `useOnboardingLookupSports` / `useOnboardingLookupOrganisationTypes` (cached). **L3** none in v1. |
| Step 1 UI | [wizard-step-organisation.tsx](../_components/wizard-step-organisation.tsx) — sport, org type, name, permission checkboxes; hydrates from settings when available.               |
| W1        | BFF `PATCH /api/accounts/[accountId]/onboarding/step-1`; `useUpdateOnboardingStep1` invalidates `account.me`, `settings`, `organisationContext`.                                 |
| Setup UI  | Muted placeholder copy after Step 1 fields; **S1** polling in Phase 6.                                                                                                           |

**Endpoints**

- **BFF:** `GET /api/account/onboarding/lookups/sports`, `GET /api/account/onboarding/lookups/organisation-types`, `PATCH /api/accounts/[accountId]/onboarding/step-1`.
- **Upstream:** Strapi paths per app-handoff Phase 2 doc.

**Reads available today (hydration, provisional):** `GET /api/accounts/[accountId]/settings`, `GET /api/accounts/[accountId]/organisation` (after `accountId` known).

---

## Phase 3 — Step 2 branding (M1, W2)

**Status:** **Done** (app + BFF; TKT-2026-ONB-004 — **closed**; remaining Strapi/CMS E2E and edge cases in **testing/QA**). **CMS contract (routes + branding fields):** [cms-handoff-onboarding-phase3-step2.md](../.comms/phase-3/cms-handoff-onboarding-phase3-step2.md). App handoff: [app-handoff-onboarding-phase3-m1-w2.md](../.comms/phase-3/app-handoff-onboarding-phase3-m1-w2.md).

**Goal:** Minimum branding persisted; logo path documented.

| Area   | Exists                                                        | Notes                                                                                                                                                                                                                                                |
| ------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read   | BFF `GET /api/accounts/[accountId]/branding`                  | Hydrates Step 2 via `useAccountBranding` (`data.theme.theme` palette + `onboardingLogo` when CMS returns them).                                                                                                                                      |
| M1     | BFF `POST /api/accounts/[accountId]/onboarding/step-2/upload` | Multipart field `file` → media id; upstream must implement.                                                                                                                                                                                          |
| W2     | BFF `PATCH /api/accounts/[accountId]/onboarding/step-2`       | JSON body per handoff; upstream must implement.                                                                                                                                                                                                      |
| Themes | Live lookup + custom theme POST                               | [cms-handoff-onboarding-phase3-step2.md](../.comms/phase-3/cms-handoff-onboarding-phase3-step2.md). Premade request context: [cms-request-onboarding-phase3-themes-and-logo.md](../.comms/phase-3/cms-request-onboarding-phase3-themes-and-logo.md). |

**CMS still defines:** MIME/size limits, error codes, Strapi permission names, and theme APIs (see handoffs above).

---

## Phase 4 — Step 3 contact (W3)

**Status:** **Done** (app + BFF; TKT-2026-ONB-005). **Strapi** implements upstream `PATCH /api/accounts/:accountId/onboarding/step-3` per [`.comms/phase-4/app-handoff-onboarding-phase4-w3.md`](../.comms/phase-4/app-handoff-onboarding-phase4-w3.md). **CMS reply:** [`.comms/phase-4/cms-response-phase4-w3-contact-and-delivery.md`](../.comms/phase-4/cms-response-phase4-w3-contact-and-delivery.md).

**Goal:** Operational contact + delivery on the account.

| Area | Exists                                                  | Notes                                                                                                                    |
| ---- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Read | `GET .../settings`, `GET /api/auth/me`                  | Step 3 hydrates settings; email display via `useCurrentUser` (**canonical email** rule still in CMS semantics §5 / Q13). |
| W3   | BFF `PATCH /api/accounts/[accountId]/onboarding/step-3` | Proxies Strapi; `useUpdateOnboardingStep3`.                                                                              |

**CMS → BFF (implemented in app):**

- **W3** — contact/delivery writes. Strapi v1 does **not** emit **409** on W3 (see CMS response); **409** in FE is defensive for future Q13.

---

## Phase 5 — Review + confirm (W4, R1 optional)

**Status:** **Done** (TKT-2026-ONB-006) — app + BFF; **Strapi** implements upstream `POST /api/accounts/:accountId/onboarding/confirm` per [`.comms/phase-5/app-handoff-onboarding-phase5-w4.md`](../.comms/phase-5/app-handoff-onboarding-phase5-w4.md). **R1** deferred; review uses parallel GETs (§4.5).

**Goal:** **Wizard complete** on server; user can proceed to app while setup may still run.

| Area | Exists               | Notes                                                                                                                               |
| ---- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| R1   | Optional / deferred  | **v1:** parallel `settings`, `organisation`, `branding`, `auth/me`, `account/me` in `wizard-step-review`. Optional aggregate later. |
| W4   | BFF                  | `POST /api/accounts/[accountId]/onboarding/confirm` → Strapi. PDR: confirm **must not** fail only because setup is unfinished.      |
| UI   | `wizard-step-review` | Read-only summary + **Finish** → `useConfirmOnboarding`; partial failure + retry; **409** / validation surfaced.                    |

**Endpoints (CMS → BFF):**

- **W4**: `POST …/onboarding/confirm` — **implemented** in app BFF.
- **R1** (optional): `GET …/onboarding/summary` — not required for v1.

**Minimum reads (no R1):** parallel `settings`, `organisation`, `branding`, `auth/me`, `account/me`.

---

## Phase 6 — Setup status (S1, S2)

**Status:** **Done** (TKT-2026-ONB-007) — app + BFF; **Strapi** must implement upstream `GET /api/accounts/:accountId/onboarding/setup-status` per [`.comms/phase-6/app-handoff-onboarding-phase6-s1-s2.md`](../.comms/phase-6/app-handoff-onboarding-phase6-s1-s2.md).

**Goal:** Replace spinners with **machine-readable** preparation state; **poll** until terminal.

| Area | Exists                                                      | Notes                                                                                              |
| ---- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| S1   | BFF `GET /api/accounts/[accountId]/onboarding/setup-status` | `accountApi.getOnboardingSetupStatus`, `useOnboardingSetupStatus`, `queryKeys.account.setupStatus` |
| S2   | `.comms/phase-6/app-handoff-onboarding-phase6-s1-s2.md`     | Poll interval, terminal states; `Retry-After` deferred until Strapi sends headers                  |
| UI   | `SetupStatusCard`                                           | Step 1 (`wizard-step-organisation`) + review (`wizard-step-review`); invalidates after W1 + W4     |

**New endpoints (CMS → BFF):**

- **S1** — status payload (`phase`, `status`, `requiresUserAction`, `errorCode`, optional progress).
- **S2** — behaviour doc (not necessarily a separate URL).

**Can start integration** as soon as **W1** queues work; UI surfaces a muted message when S1 returns **404** (upstream not ready).

---

## Phase 7 — Completion, redirect, gateway

**Status:** **Done** (TKT-2026-ONB-008).

**Goal:** After **W4**, send user to **`/o/[accountId]/…`**; apply **product** gating (hard vs soft) once semantics exist.

| Area                              | Exists             | Delivered                                                                                                             |
| --------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Redirect                          | —                  | **`router.replace`** to **`accountScopedRoutes.dashboard(accountId)`** from `CreateOrganisationWizard` on W4 success. |
| Gating                            | Middleware partial | Align with **§5** flags only after CMS allowlist; **no** hard redirects on legacy fields in middleware (unchanged).   |
| create-organisation vs onboarding | Placeholder copy   | Gateway **Q1** (zero-account default) still product; wizard exit goes to dashboard.                                   |

**New endpoints:** none beyond prior phases; **`GET /api/account/me`** is invalidated after W4 via existing `useConfirmOnboarding` behaviour.

---

## Cross-cutting (all phases)

| Concern                | Action                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------- |
| **Errors**             | Shared shape for validation / 409 / 403 — BFF + CMS (handoff §9.5 Q15).                 |
| **Idempotency**        | Step **PATCH** idempotent where possible (§9.3 Q6).                                     |
| **Query invalidation** | After each mutation: `account.me`, affected account GETs per `api-data-layer-patterns`. |
| **Semantics**          | **§5** doc from CMS before hard navigation on flags.                                    |

---

## Document history

| Date       | Change                                                                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-07 | Initial phased path and wizard breakdown for `create-organisation`.                                                                                                   |
| 2026-04-07 | Phase 0 marked complete: wizard shell implementation notes and “what exists today” updated.                                                                           |
| 2026-04-07 | Phase 1 (A1): BFF `POST /api/account/first`, client hook, Get Started wiring; Strapi handoff in `.comms/phase-1/app-handoff-post-account-first-endpoint.md`.          |
| 2026-04-07 | Phase 2 (L1, L2, W1): BFF lookup GETs + Step 1 PATCH, registry + hooks + `WizardStepOrganisation`; `apiClient.patch`.                                                 |
| 2026-04-07 | Phase 3 (M1, W2): BFF upload + Step 2 PATCH, `apiClient.postFormData`, `WizardStepBranding`; handoff `.comms/phase-3/app-handoff-onboarding-phase3-m1-w2.md`.         |
| 2026-04-07 | Phase 3 UI: premade theme placeholder, disabled custom theme, logo upload placeholder; CMS request `.comms/phase-3/cms-request-onboarding-phase3-themes-and-logo.md`. |
| 2026-04-07 | Phase 3 sync with CMS handoff Step 2: branding DTO fields, logo upload + hydration; `.comms/phase-3/integration-notes-phase3-step2.md`.                               |
| 2026-04-07 | Phase 3 marked **closed** for app delivery; downstream CMS E2E verification deferred to testing (TKT-2026-ONB-004).                                                   |
| 2026-04-07 | Phase 4 (W3): BFF `PATCH …/onboarding/step-3`, `WizardStepContact`, `.comms/phase-4` handoff (TKT-2026-ONB-005).                                                      |
| 2026-04-07 | Phase 5 (W4): BFF `POST …/onboarding/confirm`, `WizardStepReview`, `useConfirmOnboarding`; `.comms/phase-5` handoff (TKT-2026-ONB-006).                               |
| 2026-04-07 | Phase 6 (S1, S2): BFF `GET …/onboarding/setup-status`, `useOnboardingSetupStatus`, `SetupStatusCard`; `.comms/phase-6` handoff (TKT-2026-ONB-007).                    |
| 2026-04-08 | Phase 7: post-W4 `router.replace` to `/o/[accountId]/dashboard`; TKT-2026-ONB-008.                                                                                    |
