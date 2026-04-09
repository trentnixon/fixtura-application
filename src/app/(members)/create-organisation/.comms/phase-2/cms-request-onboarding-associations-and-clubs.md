# CMS request — onboarding associations + clubs lookups (and W1 fields)

**From:** Fixtura members app (BFF + frontend)  
**To:** CMS / Strapi backend  
**Date:** 2026-04-07  
**Related:** [phase2-v1-data-matrix-assumptions.md](./phase2-v1-data-matrix-assumptions.md), [app-handoff-onboarding-phase2-l1-l2-w1.md](./app-handoff-onboarding-phase2-l1-l2-w1.md)

**Authoritative CMS → app contract (routes, W1, errors):** [app-handoff-onboarding-associations-clubs.md](./app-handoff-onboarding-associations-clubs.md) — use this for integration and QA once Strapi is deployed.

**Backend sign-off (code vs ops):** [cms-phase2-backend-signoff.md](./cms-phase2-backend-signoff.md)

## Purpose

Step 1 of the onboarding wizard now needs **two additional read APIs** and **optional persistence** on the existing Step 1 write (W1):

1. **Associations** — all associations that apply to the **sport** the user selected (same sport domain as L1).
2. **Clubs** — all clubs that sit under a chosen **association** (used when the account organisation type is a **club**).

The members app already exposes **BFF routes** that proxy to Strapi using the paths below. **We need Strapi to implement the upstream handlers** (or confirm equivalent routes) so integration works end-to-end.

**BFF mirror** (Next.js → Strapi): same paths as the handoff above; see [app-handoff-onboarding-associations-clubs.md](./app-handoff-onboarding-associations-clubs.md).

---

## What we need from CMS

Please confirm or deliver:

1. **Upstream routes** on Strapi matching (or aliased to) the paths and query parameters in the next section.
2. **Response JSON** aligned with the shape below (or document differences).
3. **Users & permissions** — new actions for **Authenticated** → **Account** (same pattern as L1/L2 onboarding lookups).
4. **W1 extension** — `PATCH …/onboarding/step-1` accepts and persists **`associationId`** and **`clubId`** (see §4). If field names differ on the account model, document the mapping.

---

## 1. Associations by sport

| Item        | Value                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------- |
| Method      | `GET`                                                                                             |
| Strapi path | `/api/account/onboarding/lookups/associations`                                                    |
| Query       | **`sport`** (required) — must align with the sport enum / L1 `id` string (e.g. `Cricket`, `AFL`). |

**Success (200):**

```json
{
  "data": [{ "id": 1, "label": "Example Regional Association", "sortOrder": 1 }]
}
```

**Behaviour:** Return only associations relevant to that sport (product/CMS rules for scope). Empty `data: []` is valid if none exist.

---

## 2. Clubs by association

| Item        | Value                                                                         |
| ----------- | ----------------------------------------------------------------------------- |
| Method      | `GET`                                                                         |
| Strapi path | `/api/account/onboarding/lookups/clubs`                                       |
| Query       | **`associationId`** (required) — Strapi id of the parent **association** row. |

**Success (200):** Same envelope as §1 (`data` array of `{ id, label, sortOrder }`).

**Behaviour:** Return clubs linked to that association only. Empty `data: []` is valid.

---

## 3. Auth and errors

- **Auth:** Same as other onboarding lookups — `Authorization: Bearer <JWT>` (session cookie → BFF → Strapi).
- **400** if required query param is missing or invalid (sport unknown, association not found, etc.) — prefer `{ "error": { "code": "<string>", "message": "<string>" } }` for consistency with existing W1 errors.
- **401 / 403** as per your standard.

---

## 4. W1 — persist association and club selection

The app sends on **`PATCH /api/accounts/:accountId/onboarding/step-1`** (already proxied):

| Field           | Type           | Notes                                                                              |
| --------------- | -------------- | ---------------------------------------------------------------------------------- |
| `associationId` | number         | Selected association from §1.                                                      |
| `clubId`        | number \| null | Selected club from §2 when organisation type is club; otherwise `null` or omitted. |

Please **validate** that ids belong to published rows and match sport/parent rules where applicable, and **persist** on `api::account.account` (or related) so `GET /api/account/me`, `GET …/settings`, and `GET …/organisation` can expose them when you are ready.

---

## 5. Reply format

A short confirmation is enough to unblock QA:

- Links or paths to Strapi route/controller files (if helpful).
- Confirmation that **Authenticated** permissions were added and what the action names are in Strapi Admin.
- Any **intentional** deviation from the paths or JSON shape above (we will adjust the BFF or types).

---

## References

- [`cms-handoff-onboarding-api-requirements.md`](../../../.comms/cms-handoff-onboarding-api-requirements.md) — capability IDs, BFF role.
- [`handoff-onboarding.md`](../../../.comms/handoff-onboarding.md) — Step 1 product narrative.
