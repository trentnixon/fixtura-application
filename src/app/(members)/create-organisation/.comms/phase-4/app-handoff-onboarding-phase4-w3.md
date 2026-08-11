# App handoff — Phase 4 onboarding Step 3 (W3 contact / delivery)

**From:** Fixtura members app (BFF contract)  
**To:** CMS (Strapi) backend  
**Date:** 2026-04-07  
**Related:** [cms-handoff-onboarding-api-requirements.md](../../../.comms/cms-handoff-onboarding-api-requirements.md) §4.2 (W3), §5 (canonical email — open), §9.4 **Q13** (mid-flow email change), [PhasedIntegrationPath.md](../../.docs/PhasedIntegrationPath.md) Phase 4 · **CMS questions:** [cms-request-phase4-w3-contact-and-open-questions.md](./cms-request-phase4-w3-contact-and-open-questions.md) · **CMS / Strapi reply:** [cms-response-phase4-w3-contact-and-delivery.md](./cms-response-phase4-w3-contact-and-delivery.md)

## Summary

Upstream should implement **W3** as **`PATCH …/onboarding/step-3`** persisting **operational contact and delivery** fields aligned with **`GET …/accounts/:accountId/settings`** (`FirstName`, `LastName`, `DeliveryAddress` on the read model).

**Hydration (already in app):**

- `GET /api/accounts/:accountId/settings` — account slice.
- `GET /api/auth/me` — user profile email for display (see §9.5 Q14: **account/me** = bootstrap; **auth/me** = user identity for contact step).

**Base URL:** `{STRAPI_URL}/api` (same as existing account routes).

---

## Auth

All endpoints require the same **JWT (Bearer)** as `GET /api/account/me`.

**Strapi permissions:** Authenticated role must allow **`api::account.account.updateOnboardingStep3`** (`updateOnboardingStep3`). If disabled, the client receives **403** with a valid JWT.

**CMS response (v1):** Strapi does **not** emit **409** on W3 until product defines conflict rules; FE may keep **409** handling defensively. See [cms-response-phase4-w3-contact-and-delivery.md](./cms-response-phase4-w3-contact-and-delivery.md).

---

## W3 — PATCH Step 3 contact / delivery

- **Upstream:** `PATCH {STRAPI_URL}/api/accounts/:accountId/onboarding/step-3`
- **Content-Type:** `application/json`
- **Auth:** Bearer JWT; user must own the account.

### Request body

JSON object with optional fields (partial update). **Field names** (camelCase; BFF forwards as-is). Optional wrapper **`{ "data": { … } }`** accepted (same as W1).

| Field             | Type           | Maps to settings read | Validation (Strapi v1)                                   |
| ----------------- | -------------- | --------------------- | -------------------------------------------------------- |
| `firstName`       | string \| null | `FirstName`           | max **255** after trim                                   |
| `lastName`        | string \| null | `LastName`            | max **255** after trim                                   |
| `deliveryAddress` | string \| null | `DeliveryAddress`     | max **4000** after trim; multiline; stored as **`text`** |

At least **one** of `firstName` / `lastName` / `deliveryAddress` must be present in the logical update; otherwise **400** with **`EMPTY_UPDATE`** (or equivalent).

**Idempotency:** Repeating the same PATCH should yield **200** with the same logical outcome.

### Success: **200**

```json
{
  "data": {
    "accountId": 42,
    "updated": {
      "firstName": "Alex",
      "lastName": "Patel",
      "deliveryAddress": "123 Example St"
    }
  }
}
```

Shape may match W1/W2 style; `updated` should list fields actually persisted.

### Errors

- **400** — validation, empty body.
- **403** — not allowed for this account/user.
- **404** — account not found / not in scope.
- **409** — **not used by Strapi for W3 in v1** (see CMS response). Reserve for future Q13 conflict handling.
- **422** — structured validation if used.

**Shape (v1):** `{ "error": { "code", "message" } }` where applicable.

**Q13 note:** Until product defines conflicts, **409** is not returned upstream; FE may still show **409** if the contract evolves.

---

## Client re-fetch after success

After a successful W3 PATCH, the app invalidates:

- `GET /api/account/me`
- `GET /api/accounts/:accountId/settings`
- `GET /api/auth/me` (if W3 can update user-linked profile; otherwise optional)

---

## BFF (members app) — mirror path

| Method | App path                                      | Upstream                                        |
| ------ | --------------------------------------------- | ----------------------------------------------- |
| PATCH  | `/api/accounts/[accountId]/onboarding/step-3` | `PATCH …/accounts/:accountId/onboarding/step-3` |

Implementation: [`src/app/api/accounts/[accountId]/onboarding/step-3/route.ts`](../../../../api/accounts/[accountId]/onboarding/step-3/route.ts)

---

## Display email (interim)

Canonical **contact email** for routing vs display is **not** finalised (§5). The wizard shows **email** from **`GET /api/auth/me`** read-only until CMS extends write semantics.
