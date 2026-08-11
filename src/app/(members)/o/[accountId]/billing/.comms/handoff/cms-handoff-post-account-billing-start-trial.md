# CMS handoff: `POST /api/accounts/:accountId/billing/start-trial`

**From:** Fixtura App (frontend + Next BFF)  
**To:** CMS / Strapi (account billing) team  
**Date:** 2026-05-05  
**Purpose:** Contract for the account-scoped mutation that **starts a free trial** for an eligible organisation. The members billing page calls the app BFF; the BFF forwards to Strapi using the same path shape as other billing routes.

**App reference (BFF):** `src/app/api/accounts/[accountId]/billing/start-trial/route.ts` — forwards `POST` with JSON body `{}` to Strapi.

---

## Summary (what this endpoint should do)

When the authenticated user **owns** the account and the account is in an eligible **“trial available”** state (see preconditions below), this endpoint should:

1. **Persist a free trial** on the account (or equivalent domain model): set trial window (`startDate` / `endDate`), mark trial **active**, tie to the correct trial tier if your model uses one.
2. **Update billing summary fields** so that a subsequent **`GET /api/accounts/:accountId/billing`** (billing v1 consolidated summary) reflects an **active trial** (not “trial available”).
3. **Adjust `availableActions`** so the client no longer shows **Start trial** (`canStartTrial` / `can_start_trial` → `false`), and can surface checkout / invoice actions per your product rules.

The **frontend does not** derive final entitlement from this response alone: after a successful `POST`, it **invalidates and refetches `GET /billing`**. The refreshed `GET` payload is the source of truth for UI.

---

## Strapi endpoint to implement

| Property       | Value                                                                                   |
| -------------- | --------------------------------------------------------------------------------------- |
| **Method**     | `POST`                                                                                  |
| **Path**       | `/api/accounts/:accountId/billing/start-trial`                                          |
| **Path param** | `accountId` — positive integer; same as other account billing routes                    |
| **Auth**       | **Required.** `Authorization: Bearer <jwt>` (same session user as other account routes) |

**Important:** The Next.js BFF builds the Strapi URL as:

`{STRAPI_URL}/api/accounts/{accountId}/billing/start-trial`

If Strapi must use a **different** segment (e.g. `/billing/trial` instead of `/billing/start-trial`), tell the frontend team so the BFF subpath in `_billing-strapi-proxy.ts` can be updated.

---

## Request

| Item             | Value                  |
| ---------------- | ---------------------- |
| **Content-Type** | `application/json`     |
| **Body**         | **Empty object:** `{}` |

The app currently always sends `{}`. If CMS later needs optional fields (e.g. `source`, `subscriptionTierId`), agree the shape and the app will extend the BFF + client.

---

## Authorisation and validation (CMS)

- Enforce **same ownership / permission model** as `GET /billing` and `POST …/billing/checkout` (user may only start a trial for accounts they can act on).
- If the account is **not eligible** (wrong `billingStatus`, trial already active, business rules): return a **4xx** with a JSON error body the app can surface (see “Errors”).
- Consider **idempotency**: if trial is already active, either **200** with a stable “already active” shape or **409** — pick one and document; the app treats non-OK as user-visible error unless you standardise a “no-op success”.

---

## Suggested preconditions (aligned with app UI)

These are **recommended** so the members billing page (`/o/{accountId}/billing`) and `deriveBillingUiMode` stay consistent:

- **`GET /billing`** returns `billingStatus` consistent with **trial not yet started** (e.g. `trial_available`; exact string is CMS-defined but must match what the app maps in `billing-state.ts`).
- **`availableActions`** includes **`canStartTrial: true`** or **`can_start_trial: true`** (the UI **does not** allow start without an explicit true flag).
- **`trial.isActive`** should be **false** before start; after start, **`true`** with populated dates on the next `GET`.

**Access / billing status:** The app has been tested with `accessStatus` such as `pending` pre-start and `active` (or `trial`) post-start; confirm your real enums and update app label maps if needed.

---

## Success response (HTTP 2xx)

Minimal shape the app **types** today (fields optional where Strapi differs):

```json
{
  "trialId": 123,
  "status": "started",
  "message": "Your free trial has started."
}
```

- **`message`:** Optional; shown briefly in the UI while `GET /billing` refetches.
- If Strapi prefers a **`{ "data": { … } }`** envelope, document it; the BFF passes Strapi JSON through to the client **as returned** for success responses.

---

## Errors

Return Strapi’s existing error JSON pattern (e.g. `{ "error": … }`) where possible — the BFF forwards error payloads similarly to **`POST …/billing/checkout`**.

Suggested semantics (CMS team to confirm):

| HTTP    | Meaning (example)                                                                     |
| ------- | ------------------------------------------------------------------------------------- |
| **400** | Malformed path / validation                                                           |
| **401** | Missing or invalid JWT                                                                |
| **403** | Authenticated but not allowed to act on this account                                  |
| **404** | Unknown account                                                                       |
| **409** | Conflict (e.g. trial already consumed or already active), if not using idempotent 200 |

---

## After success: expected `GET /billing` snapshot (for QA)

The planning payload used for frontend QA is illustrative only — **CMS source of truth wins**. Example transition:

**Before (`trial_available`):**

- `billingStatus`: `trial_available`
- `accessStatus`: e.g. `pending`
- `trial`: present but inactive / no meaningful window
- `availableActions.canStartTrial`: `true`

**After (`trialing` / active trial):**

- `billingStatus`: e.g. `trialing`
- `accessStatus`: e.g. `active` or `trial`
- `trial.isActive`: `true`, with `startDate` / `endDate`
- `availableActions.canStartTrial`: `false`
- Checkout / invoice flags per product (optional `canCheckout`, `canRequestInvoice`, etc.)

---

## Users-permissions (Strapi)

Enable the appropriate **authenticated** permission for:

- **`POST`** `…/accounts/:accountId/billing/start-trial`\*\* (or whatever policy name maps to this route in your codebase).

Mirror the pattern used for `getAccountBilling` / checkout.

---

## Open questions for CMS (please confirm)

1. Final **exact** path segment: **`start-trial`** vs **`trial`** (or other).
2. **Idempotent** behaviour when trial already active.
3. **POST body**: remains `{}` long-term vs required fields later.
4. Exact **`billingStatus` / `accessStatus`** strings **before** and **after** start.
5. Whether **`currentPlan`** / **`activeOrder`** must stay empty during trial-only state.
6. **Trial length** source (fixed in CMS vs tier-driven).

---

## Related docs

- [frontend-billing-api-contract-handoff.md](./frontend-billing-api-contract-handoff.md) — billing v1 surfaces
- Planning: [.comms/planning/free-trial-status-identification-ui-modes.md](../planning/free-trial-status-identification-ui-modes.md) — UX + flow
- Staging QA: [.comms/resources/staging-qa-checklist.md](../resources/staging-qa-checklist.md) — includes “Free trial — start” row
