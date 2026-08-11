# App request — Phase 2: lookups (L1–L3) and Step 1 write (W1)

**From:** Fixtura members app (BFF + frontend)  
**To:** CMS / Strapi backend  
**Date:** 2026-04-07  
**Phase:** Phase 2 — Lookups + Step 1 — see [`PhasedIntegrationPath.md`](../../.docs/PhasedIntegrationPath.md).

## Purpose

The onboarding wizard **Step 1** (organisation + permission) needs **read-only reference data** for dropdowns and **one persisted write** that saves Step 1 fields and unlocks backend preparation per product. This document lists **what we need from CMS** so we can mirror routes in the Next.js BFF (`/api/…`), register them in the app route registry, and ship typed clients + TanStack Query hooks.

**Authoritative requirements context:** [`cms-handoff-onboarding-api-requirements.md`](../../../.comms/cms-handoff-onboarding-api-requirements.md) §4.1–4.2.  
**Product / UX:** [`handoff-onboarding.md`](../../../.comms/handoff-onboarding.md) — Step 1 fields are conceptually: sport, organisation type, organisation name, and **explicit permission / authority** confirmations.

**Dependency:** [A1 / first account](../phase-1/app-handoff-post-account-first-endpoint.md) is integrated in-app; the browser typically has a **stable `accountId`** before Step 1. W1 must be defined together with that lifecycle (see §4).

---

## What we need back from CMS (deliverable)

Please provide **one consolidated reply** (or OpenAPI fragment) that includes:

1. **Exact Strapi URL paths and HTTP methods** for each capability below (L1–L3, W1).
2. **Request and response JSON shapes** (field names, types, required vs optional).
3. **Auth model:** confirm all endpoints use the same **JWT (Bearer)** as `GET /api/account/me` for the authenticated user.
4. **Error contract:** status codes and JSON body for validation errors, forbidden, conflict, and server errors (align with [`cms-handoff-onboarding-api-requirements.md`](../../../.comms/cms-handoff-onboarding-api-requirements.md) §9.5 Q15 where possible).
5. **Caching hint for L1–L3:** whether responses may be treated as **static for the session** (we will use long-lived TanStack Query cache); note if **ETag** / short TTL applies.
6. **W1 idempotency and ordering** relative to A1 (see §4).

Until this is agreed, the app will keep Step 1 as **placeholder UI** and will not ship live L1–L3/W1 BFF routes.

---

## 1. L1 — Sport (or equivalent) options

**Need:** A stable list (or tree) for the Step 1 **sport** control.

**Please specify:**

- Path (e.g. `GET /api/…/sports` or collection query Strapi already uses).
- Response shape: at minimum **id + display label** per option; include **sort order** if not alphabetical.
- Whether the source is **enum-like** (small fixed set) or **CMS-managed collection** (may grow).
- Whether **“Other”** / free text is required; if yes, validation rules and how it maps to stored values.

---

## 2. L2 — Organisation type

**Need:** Options for **organisation type** (e.g. association vs club vs internal workspace — exact labels are product).

**Please specify:**

- Path and method (**simple list GET** vs **search** with query string — product may need search for large hierarchies).
- If **hierarchical** (parent/child): document whether the FE should load **one level at a time** or receive a **nested** structure in one response.
- Same **id + label** (and ordering) conventions as L1.

---

## 3. L3 — Additional Step 1 picklists

**Need:** Any **further** reference fields the **signed data matrix** adds to Step 1 (or Step 1 only for Phase 2 scope).

**Please specify:**

- One endpoint per picklist, or a **batched** reference endpoint — either is fine if documented.
- **TBD** until product delivers the data matrix: list **which** L3 endpoints exist for v1 (may be zero).

---

## 4. W1 — Persist Step 1 (organisation + permission)

**Need:** A single clear **write** that persists Step 1 and, per product, **queues backend fetch/preparation** when permission is granted.

**Conceptual fields (product — final list is the data matrix):**

- Organisation identity: sport, organisation type, organisation name (and any matrix fields).
- **Permission / authority:** persisted flags or timestamps as CMS defines — not UI-only state. The app today reads `isPermissionGiven` and `isRightsHolder` on `GET /api/accounts/[accountId]/settings`; confirm whether W1 **writes those** or **new** fields.

**Please specify:**

- **URL:** e.g. `PATCH /api/accounts/:accountId/…` or a dedicated onboarding route.
- **Method** and **Content-Type** (`application/json`).
- **Request body** schema and **validation rules** (lengths, allowed characters for name).
- **Success response** (200/201): minimal body; confirm whether the client must **re-fetch** `GET /api/account/me`, `GET .../settings`, and `GET .../organisation` or whether W1 returns updated slices.
- **Idempotency:** same payload retried → same outcome; document **409** vs **200** behaviour if the user is in the wrong state.
- **Relationship to A1:** After [`POST /api/account/first`](../phase-1/app-handoff-post-account-first-endpoint.md), the user has an **account id**. Confirm W1 is **always** “update existing account/org context for that id” vs any alternate flow — one documented story (see cms-handoff §4.2 “Draft vs live account”).

**Side effects (for our UI copy):**

- Confirm that a successful W1 **may enqueue** async jobs (setup). The FE will show **setup status** in a later phase (**S1**); Step 1 should not assume synchronous completion.

---

## What the app will do once contracts are fixed

- Add **BFF** `route.ts` handlers under `src/app/api/…` that proxy to the Strapi paths above with session cookie → Bearer forwarding (same pattern as existing account GETs).
- Register routes in `src/lib/api/routes/route-definitions.ts`, implement `account.api.ts` (or `onboarding.api.ts`) + `query-keys` + hooks.
- **L1–L3:** `useQuery` with long cache TTL.
- **W1:** `useMutation` with invalidation of `account.me`, `…/settings`, `…/organisation` for the active `accountId` after success.
- Wire **Step 1** form in `CreateOrganisationWizard`.

---

## References

- [`PhasedIntegrationPath.md`](../../.docs/PhasedIntegrationPath.md) — Phase 2 scope and exit criteria.
- [`cms-handoff-onboarding-api-requirements.md`](../../../.comms/cms-handoff-onboarding-api-requirements.md) — capability IDs L1–L3, W1, caching note, draft vs live.
- [`handoff-onboarding.md`](../../../.comms/handoff-onboarding.md) — Step 1 narrative and blocking fields.
- Existing read hydration (provisional mapping): `GET /api/accounts/[accountId]/settings`, `GET /api/accounts/[accountId]/organisation`.

## Open questions (for CMS + product jointly)

- **L2:** List-only vs search — which applies for v1?
- **W1:** Exact mapping to `AccountSettingsData` / org context fields vs new Strapi fields.
- **Data matrix:** Final required/optional list and labels for permission checkboxes.
