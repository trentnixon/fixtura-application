# CMS request — Phase 4 onboarding Step 3 (W3) contact / delivery + open questions

**Audience:** CMS / Strapi backend, product (for semantics)  
**From:** Fixtura members app (onboarding Step 3)  
**Date:** 2026-04-07  
**Related:**

- Technical contract (BFF → Strapi): [app-handoff-onboarding-phase4-w3.md](./app-handoff-onboarding-phase4-w3.md)
- Product/API catalogue: [cms-handoff-onboarding-api-requirements.md](../../../.comms/cms-handoff-onboarding-api-requirements.md) — §4.2 (W3), §5 (semantics), §9.4 Q13, §9.5 Q14–Q15
- Phased plan: [PhasedIntegrationPath.md](../../.docs/PhasedIntegrationPath.md) Phase 4
- Integration notes (app): [integration-notes-phase4-step3.md](./integration-notes-phase4-step3.md)
- **CMS / Strapi reply:** [cms-response-phase4-w3-contact-and-delivery.md](./cms-response-phase4-w3-contact-and-delivery.md)

---

## Context — what the app ships today

- **BFF:** `PATCH /api/accounts/[accountId]/onboarding/step-3` proxies JSON to Strapi `PATCH …/api/accounts/:accountId/onboarding/step-3` (same pattern as W1/W2).
- **Reads:** Step 3 hydrates **`GET …/settings`** (`FirstName`, `LastName`, `DeliveryAddress`) and shows **sign-in email** from **`GET /api/auth/me`** (read-only in UI for now).
- **Writes:** Request body uses **`firstName`**, **`lastName`**, **`deliveryAddress`** (camelCase); the BFF forwards the body **unchanged**. Strapi maps to **`FirstName`** / **`LastName`** / **`DeliveryAddress`** on the account (see [CMS response](./cms-response-phase4-w3-contact-and-delivery.md)).
- **Errors:** The app maps **409** to an inline message on Step 3 when the response includes a usable `message` (or a generic conflict copy). **Stable `code`** in JSON helps FE and analytics.

---

## What we need from CMS (implementation)

**Status:** Met in Strapi per [cms-response-phase4-w3-contact-and-delivery.md](./cms-response-phase4-w3-contact-and-delivery.md) (enable **`updateOnboardingStep3`** in Admin after deploy).

1. **Upstream route:** `PATCH /api/accounts/:accountId/onboarding/step-3` as specified in [app-handoff-onboarding-phase4-w3.md](./app-handoff-onboarding-phase4-w3.md) (auth, partial body, empty-update **400**, success shape).
2. **Strapi Users & Permissions:** Enable the custom controller/action for that route for the **Authenticated** role (exact action name can match your convention; document it next to W1/W2).
3. **Persistence:** Map fields to the same account/settings model that **`GET …/settings`** exposes so reload and Step 4 review stay consistent.
4. **OpenAPI or changelog:** When the route is live, note **field names** (if you normalise `firstName` → `FirstName` server-side, document the contract the browser sends vs what Strapi stores).

---

## Open questions — please answer or assign owner

These block or sharpen **product semantics** and **error UX**; several are echoed in the global handoff §5 and §9.4.

### A. Canonical contact email (§5 item 4, §9.5 Q14)

| #      | Question                                                                                                                             | Why it matters                                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| **A1** | Is **operational contact email** the **user’s Strapi email** only, a **separate field on the account**, or **both**?                 | The UI currently shows **auth/me** email read-only; we need to know if Step 3 should ever **edit** email or only name/address. |
| **A2** | If email is stored on the **account**, how does it **sync** with **`/api/users/me`** when the user changes password/email elsewhere? | Avoids contradictory displays between settings, auth, and onboarding.                                                          |
| **A3** | Should **`GET …/settings`** eventually expose a dedicated **contactEmail** (or similar) distinct from user profile?                  | Drives whether we extend types and hydration without overloading legacy fields.                                                |

### B. Mid-flow identity change (§9.4 Q13)

| #      | Question                                                                                                                   | Why it matters                                                                                                                    |
| ------ | -------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **B1** | When should Strapi return **409** on W3 (e.g. user email changed mid-onboarding, session invalidated, account reassigned)? | The app reserves **409** for conflicts; we need **when** you emit it and a **stable `code`** (e.g. `EMAIL_CONFLICT`) for mapping. |
| **B2** | Should the client **retry** W3 after refresh, or is conflict always **terminal** until the user re-enters the flow?        | Affects copy (“Try again” vs “Contact support”).                                                                                  |
| **B3** | Is **idempotency** for W3 limited to “same body” or do you also treat “same logical contact” across retries specially?     | Aligns with §9.3 Q6 idempotency expectations.                                                                                     |

### C. Validation and data rules

| #      | Question                                                                                                                                  | Why it matters                                         |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| **C1** | **Required vs optional** for first name, last name, delivery address for **wizard completion** (distinct from “nice to have” on account)? | Product may require minimum contact before W4 confirm. |
| **C2** | **Max lengths**, **international address** rules, **PII** storage notes — any constraints we should enforce in FE before PATCH?           | Reduces 422 churn; document in OpenAPI.                |
| **C3** | Does **`deliveryAddress`** support **multiline** and **country** split later, or stay a single text field for v1?                         | UI is a textarea today; confirm no mismatch with CMS.  |

### D. Permissions and errors

| #      | Question                                                                                                                                                              | Why it matters                                            |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **D1** | Exact **Strapi permission** name for W3 (for runbooks and “403 in prod” debugging).                                                                                   | Same pattern as Phase 1–3 action names.                   |
| **D2** | Confirm **shared error shape** for **400 / 422 / 409** (§9.5 Q15): e.g. `{ error: { message, code?, details? } }` or RFC 7807 — **one** pattern for onboarding steps. | FE maps to TanStack Query and inline alerts consistently. |

### E. Alternative contract (only if you reject dedicated step-3)

| #      | Question                                                                                                                  | Why it matters                                                                                                                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **E1** | If you prefer **`PATCH …/settings`** instead of **`…/onboarding/step-3`**, is that **authoritative** for the same fields? | App chose **step-3** for parity with W1/W2; we can add a **PATCH on settings** BFF instead **only** if you want a single write surface — please state preference to avoid duplicate implementations. |

---

## Responses

**Source:** [cms-response-phase4-w3-contact-and-delivery.md](./cms-response-phase4-w3-contact-and-delivery.md) (2026-04-07). Please reply inline if anything below changes.

| ID    | Answer / decision                                                                                                                                                                                                                                         | Owner                     | Target date |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ----------- |
| A1–A3 | **W3 does not write user/email.** Email on account / contact semantics remain **product** decisions. Display via **`GET /api/auth/me`** until product locks rules.                                                                                        | Product (open)            | TBD         |
| B1–B3 | **No 409 from W3 in v1.** Repeat PATCH idempotent (**200**, same sense as W1). Stable **`error.code`** for conflicts deferred until product defines **B1–B3**.                                                                                            | CMS + product             | v1 shipped  |
| C1–C3 | **Server validation:** `firstName` / `lastName` max **255** chars; **`deliveryAddress`** max **4000**; trim; multiline allowed. **`DeliveryAddress`** Strapi type **`text`** (not email). **C1** (required-for-wizard) still product if needed before W4. | CMS (C2–C3); product (C1) | 2026-04-07  |
| D1–D2 | **Permission:** `updateOnboardingStep3` — **`api::account.account.updateOnboardingStep3`**. **Errors:** `{ "error": { "code", "message" } }` for **400** / **422** / **404** per app handoff.                                                             | CMS                       | 2026-04-07  |
| E1    | **Dedicated `PATCH …/onboarding/step-3`** is the v1 write surface; no separate **`PATCH …/settings`** for W3 from CMS.                                                                                                                                    | CMS                       | 2026-04-07  |

---

## References (quick)

- **W3 capability ID** and “PATCH settings or dedicated resource”: [cms-handoff-onboarding-api-requirements.md](../../../.comms/cms-handoff-onboarding-api-requirements.md) §4.2 table (W3 row).
- **Minimum reads for review (Phase 5)** include settings + auth/me: same doc §4.5.
