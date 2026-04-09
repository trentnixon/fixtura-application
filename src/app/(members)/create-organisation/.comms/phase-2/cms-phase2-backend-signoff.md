# Phase 2 — backend contract + CMS ops checklist

**Date:** 2026-04-07  
**Purpose:** Single place for **what the Strapi/backend repo defines in code** vs **what still needs environment / Admin confirmation**. Use with [app-handoff-onboarding-phase2-l1-l2-w1.md](./app-handoff-onboarding-phase2-l1-l2-w1.md) and [app-handoff-onboarding-associations-clubs.md](./app-handoff-onboarding-associations-clubs.md).

---

## From backend code (not ambiguous)

### Routes (Strapi `/api` prefix)

| Method  | Path                                                                   |
| ------- | ---------------------------------------------------------------------- |
| `POST`  | `/api/account/first` → `createFirstAccount`                            |
| `GET`   | `/api/account/onboarding/lookups/sports`                               |
| `GET`   | `/api/account/onboarding/lookups/organisation-types`                   |
| `GET`   | `/api/account/onboarding/lookups/associations?sport=`                  |
| `GET`   | `/api/account/onboarding/lookups/clubs?associationId=`                 |
| `PATCH` | `/api/accounts/:accountId/onboarding/step-1` → `updateOnboardingStep1` |

Scopes live in `custom-account.js` (e.g. `api::account.account.getOnboardingLookupsSports`, `…updateOnboardingStep1`, `…createFirstAccount`).

**Path note:** PATCH uses plural **`accounts`** — `/api/accounts/:accountId/onboarding/step-1`.

### L1 sport values (exact strings)

Same as enum / lookup ids:

`Cricket`, `AFL`, `Hockey`, `Netball`, `Basketball`

Invalid or missing `sport` on associations lookup → **400** with `error.code`: **`INVALID_SPORT`** (required param or not in allowed set).

### Clubs lookup

Published clubs where **associations** contains that association id (M2M); sorted by **Name** ascending. **`{ data: [] }`** is normal when there are no linked clubs.

### Ordering (stable, not random)

- L1: fixed order
- L2: account-type **id** ascending
- Associations: **name** ascending
- Clubs: **name** ascending

### W1 body

Keys: `sport`, `accountTypeId`, `onboardingOrganisationName`, `isRightsHolder`, `isPermissionGiven`, `associationId`, `clubId` — optional wrapper `{ data: { … } }` supported.

### Rules

| Rule                                                        | Behaviour                                                    |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| `associationId: null`                                       | **400** `INVALID_ASSOCIATION` (“cannot be null”)             |
| Numeric `clubId` without valid `associationId` in same body | **400** `ASSOCIATION_REQUIRED_FOR_CLUB`                      |
| `clubId: null`                                              | Clears clubs (`set: []`)                                     |
| Partial PATCH omitting `associationId`                      | Does **not** clear association — only explicit updates apply |

### Validation / error codes (Step 1)

Includes at least: `INVALID_SPORT`, `UNKNOWN_ACCOUNT_TYPE`, `ASSOCIATION_SPORT_MISMATCH`, `UNKNOWN_ASSOCIATION`, `UNKNOWN_CLUB`, `CLUB_SPORT_MISMATCH` (when club has a known sport that doesn’t match account sport), `ASSOCIATION_REQUIRED_FOR_CLUB`, plus shape codes like `INVALID_BODY`, `EMPTY_UPDATE`. Implemented in `updateOnboardingStep1/index.js`.

### Persistence

`associationId` / `clubId` map to account **many-to-many** `associations` and `clubs` (single selection via `set: [id]`).

### `onboardingOrganisationName`

Stored on account; **max 255** chars after trim; empty string → `null`.

### Caching

Lookups: `Cache-Control: private, max-age=3600` in controller.

### Club vs association (product / payload)

`GET /api/account/me` and organisation payload resolve display using **`account_type.id === 1`** → treat as **club** (first club); else **association** (first association) — **not** a label regex on this path:

- Club: `accountOrganisationDetails` from `clubs[0]` details
- Else: from `associations[0]` details

**Members app:** uses **`CLUB_ACCOUNT_TYPE_ID === 1`** in [`src/lib/config/onboarding.ts`](../../../../../lib/config/onboarding.ts) for the Step 1 club picker — align with CMS `account-type` ids.

### Hydration caveat

`GET …/settings` returns `account_type` **id** and scalars but not raw `associationId` / `clubId`.  
`GET /api/account/me` and `GET …/organisation` expose **`accountOrganisationDetails`** (resolved from first club vs first association by type), not necessarily the same shape as the onboarding PATCH response. For debugging IDs, PATCH success echoes `updated.associationId` / `updated.clubId` when relations were written.

### Associations lookup

`sport` query param is **required**; omitting → **400**, not an empty list.

---

## CMS / ops checklist (environment — cannot be fully verified from code alone)

| #   | Ask                                                                                                                                       |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Confirm **target URL** (staging/production) runs the commit that includes these routes.                                                   |
| 2   | **Users & permissions** → **Authenticated** → **Account**: every listed action enabled (verify in Admin or export).                       |
| 3   | **Spot-check** app handoff docs vs this sheet — especially `{ data }` envelope and `{ error: { code, message } }`.                        |
| 4   | **Process:** who updates Fixtura handoffs when the contract changes (organisational).                                                     |
| 5   | **Smoke tests:** JWT + GET each lookup + PATCH success + one **400** (e.g. `associationId: null` or wrong sport). Minimal curls optional. |

---

## Members app (Fixtura) alignment

- BFF paths match Strapi (plural **`/api/accounts/`** for W1).
- Step 1: [`wizard-step-organisation.tsx`](../../_components/wizard-step-organisation.tsx) — club UI when `accountTypeId === CLUB_ACCOUNT_TYPE_ID` (**1**).
