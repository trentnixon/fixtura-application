# CMS / Strapi handoff — Phase 3 Step 2 (branding): minimum API surface

**Audience:** CMS / Strapi backend  
**From:** Fixtura members app + BFF alignment  
**Date:** 2026-04-07  
**Related:** [cms-request-onboarding-phase3-themes-and-logo.md](./cms-request-onboarding-phase3-themes-and-logo.md), [cms-response-phase3-themes-and-logo.md](./cms-response-phase3-themes-and-logo.md), [cms-handoff-onboarding-api-requirements.md](../../../.comms/cms-handoff-onboarding-api-requirements.md) §4.2 / §4.6

This document states the **minimum Strapi surface** so members app and BFF changes work end-to-end with onboarding Step 2 (branding). Paths assume the usual Strapi prefix **`/api`**.

---

## 1. Premade themes (dropdown)

**`GET /api/account/onboarding/lookups/themes`**

- Same style as sports / organisation-types lookups (authenticated JWT, lookup envelope).
- **Returns** (illustrative):

```json
{
  "data": [{ "id": 1, "label": "Classic", "sortOrder": 1, "slug": "classic" }]
}
```

- **Source:** `api::theme.theme` rows that are **published** and **`isPublic: true`**.
- Optional fields `sortOrder` / `slug` are included if present on the content-type or derived; CMS should document stable ordering.

---

## 2. Custom theme (private)

**`POST /api/accounts/:accountId/onboarding/step-2/theme`**

- Creates a theme with **`isPublic: false`** and sets **`account.theme`** to the new theme id (or equivalent **atomic** behaviour in one request).
- **Body** (illustrative): `name`, `primary`, `secondary`, `dark`, `white` (hex strings) — persisted on the theme’s **`Theme`** JSON as `{ primary, secondary, dark, white }`. The members BFF forwards JSON as-is.

---

## 3. Save Step 2 (branding write)

**`PATCH /api/accounts/:accountId/onboarding/step-2`**

- **Accepts at least:**
  - **`themeId`** (`number | null`) → persists to **`account.theme`** (colours live on the theme document, not on the account).
  - **`logoMediaId`** (`number | null`) when logo storage is decided (see §4 and [cms-response-phase3-themes-and-logo.md](./cms-response-phase3-themes-and-logo.md) §6–7).
- Semantics for empty updates and idempotency should align with **W1** (`PATCH …/onboarding/step-1`).

---

## 4. Logo upload

**`POST /api/accounts/:accountId/onboarding/step-2/upload`**

- **Multipart** field **`file`** or **`files`** (first file wins if multiple).
- **Returns** `201` with `{ "data": { "id": <upload file id> } }` — use that **`id`** as **`logoMediaId`** on **`PATCH …/onboarding/step-2`**.
- **Persistence:** uploads are stored via the Strapi **upload** plugin; the account field **`onboardingLogo`** (single image media) holds the chosen logo after **`PATCH`** with **`logoMediaId`**.

---

## 5. Permissions

- **Authenticated** user may call **§1–4** only for **accounts they own** (same ownership / JWT pattern as **W1** / Step 1).
- In **Strapi Admin** → **Settings** → **Users & Permissions** → **Roles** → **Authenticated** → **Account**, enable:
  - `getOnboardingLookupsThemes`
  - `createOnboardingStep2Theme`
  - `updateOnboardingStep2`
  - `uploadOnboardingStep2`
- Routes are registered in [`src/api/account/routes/custom-account.js`](../../../src/api/account/routes/custom-account.js).

---

## 6. How to access (Strapi REST)

**Base URL:** `{STRAPI_ORIGIN}/api` (e.g. `http://localhost:1337/api` in development).

**Auth:** `Authorization: Bearer <JWT>` from Users & Permissions login (`/api/auth/local` or your app’s auth flow). The JWT must belong to the user who **owns** the account for account-scoped routes.

### `GET /account/onboarding/lookups/themes`

Returns premade themes (published, `isPublic: true`).

```http
GET /api/account/onboarding/lookups/themes
Authorization: Bearer <token>
```

### `POST /accounts/:accountId/onboarding/step-2/theme`

Creates a private theme and sets **`account.theme`**.

```http
POST /api/accounts/42/onboarding/step-2/theme
Authorization: Bearer <token>
Content-Type: application/json

{"data":{"name":"My colours","primary":"#112233","secondary":"#445566","dark":"#111","white":"#FFF"}}
```

Body may omit **`data`** wrapper: `{ "name": "...", "primary": "#...", "secondary": "#...", "dark": "#111", "white": "#FFF" }`.

### `PATCH /accounts/:accountId/onboarding/step-2`

Partial update. At least one of **`themeId`**, **`logoMediaId`** must be present (otherwise **`EMPTY_UPDATE`** / 400, same idea as Step 1). Brand colours are **not** written on this route; they are stored on the linked theme (`POST …/step-2/theme` or premade catalogue).

```http
PATCH /api/accounts/42/onboarding/step-2
Authorization: Bearer <token>
Content-Type: application/json

{"data":{"themeId":1,"logoMediaId":99}}
```

### `POST /accounts/:accountId/onboarding/step-2/upload`

**Multipart/form-data** with an image file under field name **`file`** (or **`files`**).

```bash
curl -X POST "http://localhost:1337/api/accounts/42/onboarding/step-2/upload" ^
  -H "Authorization: Bearer <token>" ^
  -F "file=@./logo.png"
```

### Branding read (existing)

**`GET /api/accounts/:accountId/branding`** returns **`data.theme`** (including **`theme.theme`** as `{ primary, secondary, dark, white }` hex JSON when populated) and **`onboardingLogo`** (formatted media) when set.

---

## Document history

| Date       | Change                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------- |
| 2026-04-07 | Initial handoff: agreed minimum routes and payloads for Phase 3 Step 2.                                        |
| 2026-04-07 | Strapi routes implemented; §4 persistence; §5 U&P action names; §6 access examples.                            |
| 2026-04-08 | Theme JSON: `primary`/`secondary`/`dark`/`white`; W2 without account colours; branding read via `theme.theme`. |
