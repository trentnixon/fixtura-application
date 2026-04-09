# CMS / backend response — Phase 4 onboarding Step 3 (W3) contact / delivery

**Audience:** Fixtura members app (BFF + frontend)  
**From:** CMS / Strapi backend  
**Date:** 2026-04-07  
**Re:** [cms-request-phase4-w3-contact-and-open-questions.md](./cms-request-phase4-w3-contact-and-open-questions.md) (request to Strapi)

**Full API contract (upstream):** [app-handoff-onboarding-phase4-w3.md](./app-handoff-onboarding-phase4-w3.md)  
**BFF integration checklist:** [integration-notes-phase4-step3.md](./integration-notes-phase4-step3.md)

---

## How this maps to your document

Your request asked Strapi to expose **`PATCH /api/accounts/:accountId/onboarding/step-3`**, align writes with **`GET …/settings`**, enable **Users & Permissions** for the new action, and document the **browser vs stored** field names. Below is what is **live in this backend repo** and how it answers each item.

| Your ask (from § “What we need from CMS”)                                       | Status                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **1. Upstream route** — auth, partial body, empty-update **400**, success shape | **Done.** Route **`PATCH /api/accounts/:accountId/onboarding/step-3`**. Optional body wrapper `{ "data": { … } }` (same as W1). At least one of `firstName` / `lastName` / `deliveryAddress` required or **400** `EMPTY_UPDATE`. Success **`{ "data": { "accountId", "updated" } }`** with camelCase in `updated`. |
| **2. Users & Permissions** — **Authenticated** role                             | **Action:** `updateOnboardingStep3` — scope **`api::account.account.updateOnboardingStep3`**. **Must be enabled in Strapi Admin** (same pattern as W1/W2); otherwise **403**.                                                                                                                                      |
| **3. Persistence** — same model as **`GET …/settings`**                         | **Done.** Writes map to **`FirstName`**, **`LastName`**, **`DeliveryAddress`** on `api::account.account`. **`GET /api/accounts/:accountId/settings`** continues to return those fields (PascalCase) so reload and Step 4 review stay consistent.                                                                   |
| **4. Field names / contract**                                                   | **Request:** camelCase **`firstName`**, **`lastName`**, **`deliveryAddress`**. **Storage:** Strapi attributes **`FirstName`**, **`LastName`**, **`DeliveryAddress`**. **Response `updated`:** camelCase keys only for fields touched in that request.                                                              |

Your **§ Context** (BFF proxies unchanged JSON; reads from **settings** + **auth/me** for email) remains the intended **BFF/UI** behaviour — Strapi implements the **upstream** side only.

---

## Your open questions — where we landed

Answers are also reflected in the **Responses** table in [cms-request-phase4-w3-contact-and-open-questions.md](./cms-request-phase4-w3-contact-and-open-questions.md).

| Block                                 | Summary                                                                                                                                                                                                                                              |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A (canonical contact email)**       | **Not implemented on W3.** Strapi does **not** write user/email on this route; **A1–A3** stay **product** decisions. Display email via **`GET /api/auth/me`** (or your BFF) until product locks rules.                                               |
| **B (409 / mid-flow identity)**       | **No 409 from W3 in v1.** Repeat PATCH is idempotent in the same sense as W1 (**200**). If product later needs conflict handling, we add a stable **`error.code`** once **B1–B3** are agreed.                                                        |
| **C (validation / multiline)**        | **Implemented:** `firstName` / `lastName` max **255** chars; **`deliveryAddress`** max **4000**; trim; multiline allowed in **`deliveryAddress`**. **`DeliveryAddress`** schema type is **`text`** (was `email` — corrected for physical addresses). |
| **D (permission name + error shape)** | **Permission:** `updateOnboardingStep3`. **Errors:** `{ "error": { "code", "message" } }` with **400** / **422** / **404** as in [app-handoff-onboarding-phase4-w3.md](./app-handoff-onboarding-phase4-w3.md).                                       |
| **E (PATCH settings vs step-3)**      | **Dedicated `step-3` route** is the write surface for these fields in v1 (parity with W1/W2). No separate **`PATCH …/settings`** requirement for W3 from CMS side.                                                                                   |

---

## What the app / BFF should do next

1. **Proxy** `PATCH /api/accounts/[accountId]/onboarding/step-3` → Strapi **`PATCH {STRAPI_URL}/api/accounts/:accountId/onboarding/step-3`** with the same JWT as W1/W2.
2. **Forward** the JSON body **unchanged** (camelCase).
3. **Enable** the Strapi permission **after deploy** (or you will see **403** for a valid user).
4. **409** handling in the UI can remain defensive; Strapi does not emit **409** for W3 until product defines conflicts.

---

## Implementation pointers (Strapi / CMS repository)

These paths are **relative to the Strapi backend repo**, not the Fixtura members app. The members app only contains the BFF proxy under `src/app/api/accounts/[accountId]/onboarding/step-3/`.

| Piece          | Location (Strapi repo)                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Route          | `src/api/account/routes/custom-account.js`                                                                                           |
| Controller     | `src/api/account/controllers/account.js` — `updateOnboardingStep3`                                                                   |
| Business logic | `src/api/account/controllers/services/updateOnboardingStep3/index.js`                                                                |
| Account schema | `src/api/account/content-types/account/schema.json` — `DeliveryAddress` is **`text`** (migrated from `email` for physical addresses) |

---

## Deploy note

First deploy after this change should allow Strapi to **alter** the `accounts` column for **`DeliveryAddress`** (email → text). **Smoke test:** PATCH step-3 → GET settings → values match.
