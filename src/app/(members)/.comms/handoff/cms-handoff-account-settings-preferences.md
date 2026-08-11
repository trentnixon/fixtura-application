# CMS handoff — Account settings preferences (bundles + org-type gating)

**From:** Fixtura App (frontend)  
**To:** CMS / Strapi backend  
**Date:** 2026-04-30  
**Purpose:** Define the backend contract so the production Settings UI can read and persist organisation preferences (bundle delivery day, junior surnames, competition grouping, seniors/masters split).

---

## Context (what the app is building)

We are implementing a **Settings** screen with:

1. **Bundle delivery day** — weekday selection (options may be CMS-driven).
2. **Include junior players’ surnames in bundles** — boolean.
3. **Competitions grouped by** — `competition` | `grade` — **association accounts only**.
4. **Split seniors and masters** — boolean — **club accounts only**.

The UI **hides** controls that do not apply to the account’s organisation type. **Server-side validation must match** (reject or ignore inapplicable fields).

---

## What the app already has

### Bootstrap

- `GET /api/account/me` (Next BFF → Strapi) — `accountId`, user, light `accounts[]`.

### Canonical settings read (frontend already calls this)

- `GET /api/accounts/:accountId/settings` — typed as `AccountSettingsData`; includes at least:
  - `include_junior_surnames: boolean`
  - `group_assets_by: boolean` (exists; relationship to “competitions grouped by” TBC)

### Organisation context

- `GET /api/accounts/:accountId/organisation` — `account_type`, `accountOrganisationDetails` (Phase 4 org summary).

### Scheduler (may relate to delivery day)

- `GET /api/accounts/:accountId/scheduler` — scheduler doc + `days_of_the_week` relation in types.

**Repo references:**

- Types: `src/types/api/account.ts` (`AccountSettingsData`, organisation + scheduler types)
- Service: `src/lib/api/services/account.api.ts` (`getAccountSettings`, `getAccountOrganisationContext`, `getAccountScheduler`)
- Proxy example: `src/app/api/account/me/route.ts`

---

## What we need from CMS

### 1) Authoritative read model for this screen

Confirm whether the UI should:

- **Option A (preferred):** Extend `GET /api/accounts/:accountId/settings` so it returns **all** fields this Settings screen needs in one payload; or
- **Option B:** Compose from `settings` + `scheduler` + `organisation` (more round-trips).

**Question:** Which option is the canonical contract?

---

### 2) Persisted fields — names, types, and storage location

We need stable persistence for:

| UI control                | Suggested app shape      | CMS question                                                                              |
| ------------------------- | ------------------------ | ----------------------------------------------------------------------------------------- |
| Bundle delivery day       | weekday enum or CMS id   | Field name? Relation to `days_of_the_week`? Owned by **account** vs **scheduler**?        |
| Include junior surnames   | boolean                  | Already `include_junior_surnames` on settings — confirm this remains the source of truth. |
| Competitions grouped by   | `competition` \| `grade` | New field name + type? Or map to existing `group_assets_by`?                              |
| Split seniors and masters | boolean                  | New field name on account/settings?                                                       |

**Questions:**

- Exact **Strapi attribute names** and **types** for any new fields.
- If **delivery day** lives on the scheduler document, what is the **read + write** path (same `GET` as today plus `PATCH` where)?

---

### 3) Write endpoint(s)

We need a mutation aligned with existing account-scoped routes, for example:

- `PATCH /api/accounts/:accountId/settings`

(or split: `PATCH` settings for booleans/enums and `PATCH` scheduler for delivery day, if that is the domain boundary).

**Questions:**

- Final **method + path** on Strapi (and whether Next BFF mirrors `/api/accounts/:id/...` only).
- Request body: **flat JSON** vs Strapi-style `{ data: { ... } }`.
- **Partial PATCH** — only send changed keys?
- Response: full updated `settings` document vs `{ accountId, updated: Partial<...> }`.

---

### 4) Server-side validation (required)

Please define behaviour when the client sends fields that do not apply:

- **Club:** `competitionsGroupedBy` must be **ignored or rejected** (specify HTTP status + error shape).
- **Association:** `splitSeniorsAndMasters` must be **ignored or rejected**.

**Questions:**

- Authoritative rule to classify **club vs association** server-side (same as `GET /organisation`)?
- Error envelope: e.g. `{ error: { code, message } }` consistent with other save handlers (e.g. branding)?

---

### 5) CMS-driven options for bundle delivery day

If weekdays are not hard-coded in the app:

**Questions:**

- Which **GET** returns allowed delivery days (global vs per-account)?
- Stable **value** to store (slug, id, enum string)?
- Any **timezone / cutoff** rules the UI should display (or should CMS return `nextDeliveryAt`)?

---

### 6) Permissions

**Questions:**

- Strapi permission action(s) for:
  - read `GET .../settings`
  - write `PATCH .../settings` (and scheduler if separate)
- Any fields restricted to admin roles?

---

### 7) Side effects

**Questions:**

- Does changing **delivery day** reschedule jobs immediately or on next cycle?
- Any cache or downstream invalidation the app should expect after PATCH?

---

## Proposed PATCH body (for discussion — align to your conventions)

```json
{
  "includeJuniorSurnames": true,
  "bundleDeliveryDay": "sunday",
  "competitionsGroupedBy": "competition",
  "splitSeniorsAndMasters": false
}
```

Server must **ignore or reject** keys that do not apply to the account’s org type (behaviour to be specified by CMS).

---

## Acceptance criteria

- `GET` exposes every field required to render Settings without ad-hoc inference.
- `PATCH` persists changes and returns authoritative updated values (or clear partial `updated` map).
- Org-type gating is **enforced on the server**, not only in the UI.
- Errors are structured and stable for user-facing messages.
- Strapi roles/permissions documented and enabled.

---

## Open items (frontend)

- Production route will consume `GET /settings` + org context; Route Lab remains stub until `PATCH` exists.
- Copy and layout are being finalised in Route Lab; field binding will follow CMS names once confirmed.
