# CMS / backend handoff — Onboarding API requirements

**Audience:** CMS and backend teams responsible for Strapi schema and APIs consumed by the Fixtura members app.

**Related product + FE specification:** [handoff-onboarding.md](./handoff-onboarding.md) (full onboarding PDR: product, UX, frontend architecture, implementation phases).

**Document purpose:** Summarise what the application is building, what the Fixtura **BFF already exposes as read-only** today, and **what must be created or extended on the CMS/API side** so onboarding can be implemented contract-first. This is a **requirements and gap** document, not a signed OpenAPI spec.

**As of:** 2026-04-07 (Australia/Sydney). Field names and flags on existing DTOs remain **provisional** until this handoff is agreed and reflected in a formal contract.

---

## 1. Context — what onboarding is

Onboarding is the **guided setup experience** for a signed-in user in the Fixtura members area. It is **account-scoped**: configuration applies to an **active organisation account**, not a single global user profile (the product expects eventual **multiple accounts per user**; the UX should not assume one account forever).

### 1.1 User-facing story (org-first)

1. **Identify the organisation** and confirm authority to act for it.
2. **Grant permission** for Fixtura to fetch and prepare organisation data (this unlocks background work).
3. **Queue backend preparation** as soon as permission is confirmed (user continues the visible wizard while work runs).
4. Complete **branding** and **contact** steps, then **review and confirm**.
5. After the visible wizard ends, **backend preparation may still run**; the UI must show a **real setup status** (not an opaque spinner) until a **terminal** ready or blocked state.

### 1.2 Two different “complete” concepts (must be modelled in API semantics)

| Concept             | Meaning                                                                                                    |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Wizard complete** | User finished all **visible** steps; required inputs saved and confirmed on the server.                    |
| **Setup complete**  | **Backend** preparation has reached a **ready** (or clearly **blocked**) state for normal operational use. |

The API contract must allow the frontend to **show wizard completion** while **setup is still in progress**, and to **poll** until setup reaches a terminal state.

### 1.3 Non-goals (this release)

Per the PDR: multi-account switching UX, invites, teams, deep template/theme customisation, and full post-onboarding admin are **out of scope** for this onboarding initiative description.

---

## 2. What the Fixtura application will do (after contracts exist)

Once CMS endpoints are defined and stable:

- Add a **dedicated authenticated onboarding route** with **one layout** and **one stepper** (internal step state; avoids route explosion).
- Use **TanStack Query** for server state: **step-scoped mutations**, **invalidation** after each step, **hydration** from server on reload/resume.
- Treat **setup / background preparation status** as **server state**: fetch and **poll** while non-terminal; **do not** infer readiness only on the client.
- Expose CMS capabilities through the app’s **BFF** (`/api/...`) and **route registry** (`src/lib/api/routes/route-definitions.ts`), **API client** (`src/lib/api/services/account.api.ts` or a dedicated onboarding service), and hooks — consistent with existing account patterns.

**Order of delivery (contract-first):** data matrix → CMS schema + endpoints → BFF + client + hooks → UI last.

### 2.1 BFF vs Strapi / CMS (source of truth)

**Persisted organisation, account, and onboarding state** should live in **CMS (Strapi) or the authoritative backend** the CMS fronts. The Fixtura **BFF** (`/api/...` in this app) is the **transport and shaping layer** for the browser: auth, cookies, DTO mapping, and error normalisation. The handoff assumes **no durable “app-only” onboarding writes** in production; any temporary mocks belong in development only. Once contracts exist, **CMS defines behaviour**; the BFF **mirrors** agreed routes and payloads.

---

## 3. What already exists in the app today (read-only)

The members app BFF currently implements **GET-only** handlers under `/api/accounts/[accountId]/…`. There are **no** `POST`, `PATCH`, or `PUT` handlers on those account-scoped paths in this repository snapshot. The `accountApi` service exposes **only `get*` methods** for account resources.

### 3.1 Endpoints the UI can use today for hydration (discovery)

These are **reads** that may help **populate** onboarding screens until write contracts exist. **Mapping of fields to PDR steps is provisional** — see section 5 and the PDR “Provisional mapping” table.

| Method | App BFF path (pattern)                              | Role for onboarding (read / hydrate)                                                                        |
| ------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| GET    | `/api/account/me`                                   | Bootstrap: user, light `accounts[]`, account summary fields (e.g. `isSetup`-style signals — semantics TBD). |
| GET    | `/api/auth/me`                                      | Authenticated user (e.g. email for contact step — canonical rule TBD).                                      |
| GET    | `/api/account/organisation/[accountId]`             | Legacy organisation hub aggregate (dashboard-oriented).                                                     |
| GET    | `/api/accounts/[accountId]/settings`                | Settings flags and contact-related fields (`AccountSettingsData`).                                          |
| GET    | `/api/accounts/[accountId]/organisation`            | Organisation context (`AccountOrganisationContextData`).                                                    |
| GET    | `/api/accounts/[accountId]/branding`                | Branding / template / theme (`AccountBrandingData`).                                                        |
| GET    | `/api/accounts/[accountId]/scheduler`               | Scheduler doc (onboarding may not need; listed for completeness).                                           |
| GET    | `/api/accounts/[accountId]/render-token`            | Render token doc (typically post-setup).                                                                    |
| GET    | `/api/accounts/[accountId]/renders`                 | Paginated renders list.                                                                                     |
| GET    | `/api/accounts/[accountId]/renders/[renderId]`      | Render detail.                                                                                              |
| GET    | `/api/accounts/[accountId]/analytics/overview`      | Analytics overview.                                                                                         |
| GET    | `/api/accounts/[accountId]/all-template-options`    | Template catalog (product may defer theme work from onboarding).                                            |
| GET    | `/api/accounts/[accountId]/media-library`           | Media library list.                                                                                         |
| GET    | `/api/accounts/[accountId]/media-library/[mediaId]` | Single media item.                                                                                          |
| GET    | `/api/accounts/[accountId]/sponsors`                | Sponsors.                                                                                                   |
| GET    | `/api/accounts/[accountId]/billing`                 | Billing.                                                                                                    |

**Auth (POST in app, not account onboarding writes):** `POST /api/auth/login`, `POST /api/auth/logout`, password flows (`forgot-password`, `reset-password`, `change-password`).

### 3.2 Gateway behaviour (product + routing)

After sign-in, users hit **select-organisation** using `GET /api/account/me`. A **create-organisation** page exists but is a **placeholder**: there is **no self-serve create-account API** wired end-to-end in-app until CMS provides a contract for **zero-account** / **first account** creation (see section 4.3).

---

## 4. Required new or extended CMS / API capabilities

This section lists **capabilities** the CMS/backend must provide. Exact **URL shapes** can follow your existing REST conventions (Strapi custom routes, controllers, etc.); the Fixtura app will mirror them in the BFF once agreed.

Traceability columns reference the **PDR** ([handoff-onboarding.md](./handoff-onboarding.md)) Part 1 steps and Part 4 phases.

### 4.1 Reference / lookup data (Phase 1 data matrix → Phase 2 lookups)

**PDR trace:** Part 1 Step 1 (sport, organisation type, …); Part 4 Phase 1–2.

| ID  | Capability                                                        | Purpose                          | Notes                                                                        |
| --- | ----------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------------------- |
| L1  | **Sport** (or equivalent) options                                 | Step 1 dropdowns                 | Exact enum vs free text is a **product** decision; expose a stable contract. |
| L2  | **Organisation type** (and any hierarchy: association / club / …) | Step 1                           | Confirm whether associations/clubs need **lookup** or **search** endpoints.  |
| L3  | Any other **picklists** product adds to Step 1–3                  | Dependent on Phase 1 data matrix | **TBD** until the shared data matrix exists.                                 |

**Caching:** FE can cache static lookups with TanStack Query; TTL and invalidation rules should be documented.

---

### 4.2 Persist onboarding steps (writes)

**PDR trace:** Part 1 Steps 1–3; Part 2 (step-scoped mutations); Part 4 Phases 2–3.

The PDR **recommends step-scoped persistence** (save per step with clear semantics), not **only** a single submit-at-the-end, unless product standardises otherwise.

| ID  | PDR step                           | Required capability                                                                                                                                                  | Suggested shape (illustrative)                                | CMS must define                                                                                                                  |
| --- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| W1  | Step 1 — Organisation + permission | Persist sport, organisation type, organisation name, **explicit permission / authority** flags, and any fields needed to **establish or attach** org/account context | e.g. `POST` or `PATCH` scoped to account or pre-account flow  | Payload fields, validation, idempotency, error codes; whether this step **creates** the account row or updates an existing draft |
| W2  | Step 2 — Branding                  | Persist minimum branding (e.g. logo reference, colours) **as product commits**                                                                                       | e.g. `PATCH` branding resource or step-specific write         | What onboarding **writes** vs defers to post-onboarding settings                                                                 |
| W3  | Step 3 — Contact / delivery        | Persist operational contact and delivery details                                                                                                                     | e.g. `PATCH` settings or dedicated contact resource           | Canonical **email** rules (see section 5)                                                                                        |
| W4  | Step 4 — Review and confirm        | **Confirm wizard** — server records **wizard complete** distinct from **setup complete**                                                                             | e.g. dedicated `POST …/onboarding/confirm` or flag transition | Atomic transition; conflict if backend not ready to accept confirm                                                               |

**W4 vs setup readiness (PDR-aligned default):** The product requirement is that **wizard complete** can occur while **setup** is still running. So **`POST …/confirm` should generally _not_ reject** solely because background preparation is unfinished, unless validation fails (missing required fields, illegal state). **Reject** when the **wizard cannot be completed** (e.g. required steps not saved); **accept** wizard completion and leave **setup** to **S1** polling. If CMS prefers a stricter rule, document it explicitly.

**Draft vs live account (W1):** Whether step 1 **creates** a row, **upgrades a stub**, or **only PATCHes** an existing account is a **CMS design choice** tied to **A1**. The FE needs: a **stable `accountId`** as soon as the user is in account-scoped flows, **clear HTTP errors** if the client retries in the wrong order, and **idempotent** step saves where possible (see section 9).

**Permission fields (W1 vs §5):** Separate **persisted** fields (must be stored for compliance, gating, or backend jobs) from **UI-only** copy. Anything that **unlocks fetch/preparation** or **audit** should be **persisted booleans or timestamps** on the account/settings payload CMS defines—not inferred only from client state.

**Note:** If CMS prefers **resource-oriented** APIs (`PATCH /accounts/:id/settings` only), the same **semantic** boundaries (step 1 vs 2 vs 3 vs confirm) must still be clear in documentation so the FE can map mutations and invalidation.

---

### 4.3 Zero-account / first account / gateway alignment

**PDR trace:** Part 3 “create-organisation placeholder”; API contract gaps (Write).

| ID  | Capability                                                                   | Purpose                                                                                                                          |
| --- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| A1  | **Create or attach first account** for a user with **no** `accounts[]` entry | Unblocks onboarding without manual support; aligns **select-organisation** vs **onboarding entry** (open question in section 5). |

This is a **backend capability**; user copy remains org-first, not “create shell first” as the hero narrative.

---

### 4.4 Setup / onboarding status (read, poll-friendly)

**PDR trace:** Part 1 “Setup status component”; Part 2 TanStack Query polling; Part 3 API gaps (Read).

| ID  | Capability                        | Purpose                                                                                                                                                  |
| --- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | **Machine-readable setup status** | Drive `SetupStatusCard` UI: phase label, progress if applicable, **user action required**, **blocked** vs **in progress**, **terminal** ready or blocked |
| S2  | **Polling contract**              | Document **poll interval guidance**, **HTTP caching** if any, and **when clients must stop** polling (terminal states)                                   |

Illustrative fields (names are **not** prescriptive): `phase`, `status` (`in_progress` | `ready` | `blocked` | …), `messageKey` or display-safe message, `requiresUserAction`, `errorCode` (if blocked).

**Terminal states and retry:** Confirm whether **failed-but-retryable** (transient upstream error, user can retry or wait) is **distinct** from **blocked** (needs support or irreversible issue). If distinct, expose it in **S1** (e.g. sub-status under `in_progress`, or `status: retryable`) so the UI can **keep polling** or show **retry** vs **contact support**. Polling should **stop** only on **terminal** `ready`, **blocked**, or an explicit **abandoned** state if product defines one.

**Strapi implementation:** Members app + BFF contract and polling defaults: [app-handoff-onboarding-phase6-s1-s2.md](./phase-6/app-handoff-onboarding-phase6-s1-s2.md). Strapi permission deploy: [deploy-get-onboarding-setup-status-permission.md](./phase-6/deploy-get-onboarding-setup-status-permission.md). Payload mapping lives in the Strapi codebase (`getOnboardingSetupStatusPayload` service — see deploy doc).

---

### 4.5 Optional: single read model for review (N+1 avoidance)

**PDR trace:** Part 3 API gaps — optional aggregate for Step 4.

| ID  | Capability                                      | Purpose                                                                                                                      |
| --- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| R1  | **Onboarding summary** or **review** read model | One GET returning organisation, permission snapshot, branding, contact — **optional** if composed GETs are acceptable for v1 |

**If R1 is deferred for v1**, the **minimum read set** for Step 4 (review) is acceptable as **parallel GETs**: `GET /api/accounts/[accountId]/settings`, `GET /api/accounts/[accountId]/organisation`, `GET /api/accounts/[accountId]/branding`, plus `GET /api/auth/me` (and `GET /api/account/me` if switcher/bootstrap context is needed). Document **ordering** (await all, show partial failure) in the OpenAPI/BFF notes.

---

### 4.6 Media — logo / branding assets

**PDR trace:** Part 3 API gaps (Media); Part 4 Phase 3.

| ID  | Capability                                                  | Purpose                                                                                                                                                   |
| --- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | **Logo upload** (or reuse existing media/branding pipeline) | Step 2 may require upload; confirm whether existing Strapi/media flows apply or a **dedicated onboarding upload** contract is needed (size, MIME, authz). |

**M1 + W2 sequencing:** CMS should document **one** of: (a) upload returns a **media/asset id** that **W2** (or `PATCH` branding) references; or (b) a **single** “branding step” endpoint that accepts multipart + fields atomically. The FE can support either; mixed behaviour without a written sequence causes bugs.

---

## 5. Semantics CMS must sign off (before FE uses flags for routing)

**PDR trace:** Part 3 “Critical implementation risk”; Part 3 Open questions.

Existing DTOs may expose fields such as `hasCompletedStartSequence`, `isSetup`, `isPermissionGiven`, `isUpdating`, `AccountSummary.isSetup`. **Their exact meanings and state transitions are not locked in the PDR.**

The CMS/backend team should publish:

1. **Definitions** of each flag and how they relate to **wizard complete** vs **setup complete**.
2. **Which fields (if any)** may drive **hard navigation** (redirect / gate routes) vs **banner-only** UX.
3. Whether **`isPermissionGiven`** is sufficient for Step 1 legal/permission copy, or whether **additional persisted booleans** are required.
4. **Canonical contact email:** user profile only, account field, or both — and how updates sync.

Until signed off, the Fixtura app will **not** hard-code onboarding routing against these fields.

---

## 6. Open questions (product + CMS)

These are copied from the PDR for visibility in this handoff; resolution belongs in product + CMS workshops.

1. **Routing:** Where do **zero-account** users land — straight into onboarding vs `create-organisation` — once **A1** exists?
2. **Blocking vs soft gate:** Hard-redirect until onboarding complete vs partial app access with persistent **setup** banner for v1?
3. **Review aggregate:** Ship **R1** in v1 or compose from existing GETs?
4. **Reference data scope:** Final list of lookups (L1–L3) after Phase 1 data matrix.

---

## 7. Suggested collaboration sequence

1. **Shared data matrix** (Part 4 Phase 1): fields, ownership, required/optional — product, CMS, FE.
2. **OpenAPI or equivalent** for lookups, writes, status, first-account, media — CMS leads.
3. **Semantics document** for completion/setup flags (section 5).
4. Fixtura implements **BFF routes** + **route-definitions** + **client/hooks**, then **UI** (Part 4 Phases 4–5 of the PDR).

---

## 8. Definition of success (API side)

From the PDR definition of success, the **API contract** enables:

- Quick persistence of **organisation identity** and **permission**.
- **Background preparation** start without blocking the visible wizard.
- Clear **separation** of wizard completion from backend readiness, with a **pollable setup status**.
- **Reload and resume** driven by **server state**.

---

## 9. Review responses — gaps and workshop Q&A (2026-04-07)

Internal review of this handoff surfaced useful ambiguities. Below: **best answers today** (PDR-aligned or engineering practice), **owner** when still open, and **what to lock in the next revision** of the contract or semantics doc.

### 9.1 Gaps from review — one-place answers

| Gap                                  | Resolution                                                                                                                                                            |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BFF vs Strapi URLs**               | See **§2.1**: CMS is source of truth for persisted data; BFF mirrors for the browser.                                                                                 |
| **Draft vs live account**            | Document with **W1 + A1** together: stub vs active, when `accountId` first appears, idempotency. FE needs stable id + clear errors—not a specific schema choice here. |
| **Permission: persisted vs UI-only** | Persist anything that **gates jobs**, **audit**, or **legal** proof; pure copy can stay UI-only only if product accepts no server record.                             |
| **M1 + W2**                          | See **§4.6**: upload-then-reference **or** one atomic step—CMS picks one and documents it.                                                                            |
| **S1 terminal states**               | Distinguish **retryable** vs **blocked** if product needs different UX; see **§4.4** paragraph on terminal states.                                                    |
| **R1 deferred**                      | **§4.5** lists minimum GET set for Step 4 without R1.                                                                                                                 |

---

### 9.2 Product

| #     | Question                                                                        | Best answer today                                                                                                                                                                                                                                                                                                                                                                              | Owner / next step                       |
| ----- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **1** | Zero-account routing: onboarding vs `create-organisation` vs context-dependent? | **Not fixed in the PDR.** Reasonable default once **A1** exists: **context-dependent** entry (marketing vs deep link) with a **single** recommended **default** for “signed in, zero accounts” (e.g. land in **onboarding** if product wants org-first; otherwise a dedicated **create** screen that calls the same API). Product should pick one default and document it in the gateway spec. | **Product**                             |
| **2** | Hard gate vs banner vs mixed for v1?                                            | **Not fixed in the PDR** (listed as open question). The PDR **does** require **setup-in-progress** UI after wizard complete when backend is not ready—so **soft** treatment for “setup” is required. **Wizard** gating (block `/o/...` until done) is a **product** choice: hard gate, soft, or mixed by route.                                                                                | **Product**                             |
| **3** | Frozen data matrix for steps 1–3?                                               | **Must be produced in Phase 1** (PDR Part 4). This handoff cannot freeze fields until that workshop output exists.                                                                                                                                                                                                                                                                             | **Product + CMS + FE** (shared matrix)  |
| **4** | Sport / org type: enum, free text, or hybrid?                                   | **API implication:** enums and small lists suit **GET list** endpoints; free text needs validation rules only; **hybrid** (enum + “Other”) is common and should be explicit in the matrix so L1/L2 are not redesigned mid-flight.                                                                                                                                                              | **Product** chooses; **CMS** implements |

---

### 9.3 CMS / backend

| #      | Question                                             | Best answer today                                                                                                                                                                                                                                                                       | Owner / next step                       |
| ------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| **5**  | Step 1: create account, upgrade stub, or PATCH only? | **Coupled to A1.** Document one lifecycle: e.g. zero-account user triggers **A1** which returns `accountId`, then **W1** PATCHes; or **W1** is the single transaction that creates+persists. Either is valid; **must be one documented story** so FE and gateway agree.                 | **CMS** (with **Product** on UX entry)  |
| **6**  | Idempotency for repeat POST/PATCH?                   | **Best practice:** `PATCH` step saves should be **idempotent** for the same logical body. For **POST** that creates resources, use **idempotency-Key** header **or** a natural key (e.g. single draft per user) — **CMS** chooses and documents.                                        | **CMS**                                 |
| **7**  | W4 confirm when setup is not ready?                  | **PDR-aligned:** accept **wizard complete** while **setup** continues; **S1** reflects setup. **Reject** only on invalid wizard state (see **§4.2** W4 note).                                                                                                                           | **CMS** confirms or documents deviation |
| **8**  | S1 payload: which machine-readable fields?           | Minimum useful set: **`phase`**, **`status`** (including retryable vs blocked if needed), **`requiresUserAction`**, **`errorCode`** (when blocked), optional **`progress`** (percent **or** opaque string **or** step index—**pick one** and version it).                               | **CMS** publishes in OpenAPI            |
| **9**  | Polling defaults: interval, headers, max duration?   | **S2** should specify: suggested **client poll interval** range (e.g. 2–10s with backoff), whether **`Retry-After`** or **`Cache-Control: max-age`** is used, and **terminal** stop conditions. **“Contact support”** after N minutes is **product** copy + **S1** `blocked` semantics. | **CMS** + **Product**                   |
| **10** | M1: max size, MIME, virus scan, URL access?          | **CMS** should publish **security baselines** (size cap, MIME allowlist, public vs signed vs account-scoped URLs). Virus scan is **infrastructure**—state expectation if applicable.                                                                                                    | **CMS** / **platform**                  |

---

### 9.4 Semantics and flags (§5)

| #      | Question                                                       | Best answer today                                                                                                                                                                                                                                                                                                   | Owner / next step     |
| ------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| **11** | Single source of truth for wizard vs setup vs permission?      | **Avoid** scattering truth across unrelated booleans without a doc. **Preferred:** one **`onboardingStatus`** / **`setupStatus`** style model **plus** explicit **wizardComplete** if needed—or a **small** signed-off matrix mapping **fields → meanings**. **Derived** flags are OK if **documented** and stable. | **CMS** semantics doc |
| **12** | Navigation: redirects vs banners — allowlist?                  | **Yes, recommended:** explicit **allowlist** “these fields may trigger **redirect**; these are **banner-only**.” Until published, FE **will not** hard-gate on legacy flags (PDR Part 3 risk).                                                                                                                      | **CMS** + **Product** |
| **13** | Contact email: user vs account vs both; writes mid-onboarding? | **Open in PDR.** Rules needed: **canonical read** for display, **which write API** updates it, and **conflict** if user email changes during onboarding.                                                                                                                                                            | **Product** + **CMS** |

---

### 9.5 App / BFF (contract consumers)

| #      | Question                                                              | Best answer today                                                                                                                                                                                                                                                                                                                                                                                                                         | Owner / next step      |
| ------ | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **14** | `GET /api/account/me` vs `GET /api/auth/me` for onboarding hydration? | **Use both, with roles:** **`/api/account/me`** is the **primary bootstrap** for account list, `accountId`, and account-level signals. **`/api/auth/me`** is the **user identity** slice (e.g. email) when the contact step needs it. **Avoid divergence** by documenting in OpenAPI which screen reads which; FE should treat **`account/me` as navigation truth** and **`auth/me` as user profile truth** unless CMS merges them later. | **BFF** contract notes |
| **15** | Shared error shape for validation, conflict, 403/404?                 | **Standardise** in OpenAPI: e.g. `{ code, message, details? }` or **Problem Details** (RFC 7807)-style, **stable `code`** for TanStack Query mapping (step-level vs global). Map **409** for confirm-before-allowed, **422** for validation, **403/404** for scope.                                                                                                                                                                       | **CMS** + **BFF**      |

---

### 9.6 Cross-team process

| #      | Question                                             | Best answer today                                                                                                                                                                                                             | Owner / next step       |
| ------ | ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| **16** | OpenAPI ownership and who approves breaking changes? | **CMS leads** drafting OpenAPI (per **§7**). **Breaking changes** should be **reviewed by FE** (consumer) before merge; optionally **product** for behaviour changes. Record **version** or **date** on the spec.             | **Process** agreement   |
| **17** | Cutover: when are BFF + CMS field names frozen?      | Set a **milestone**: e.g. “first vertical slice integrated” or “v0.1 OpenAPI tagged” — after which renames go through **versioning** or **deprecation**. Until then, names remain **provisional** (this handoff **§header**). | **Tech lead** + **CMS** |

---

## Document history

| Date       | Change                                                                                                                              |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-07 | Initial CMS handoff drafted from onboarding PDR and app route inventory.                                                            |
| 2026-04-07 | §2.1 BFF vs CMS; §4.2 W4/draft/permission; §4.4 S1 retryable; §4.5 R1 minimum GETs; §4.6 M1+W2; **§9** review gap table + Q&A 1–17. |
