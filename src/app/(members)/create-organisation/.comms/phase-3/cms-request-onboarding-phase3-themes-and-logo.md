# CMS request — Phase 3 onboarding: premade themes, custom theme creation, logo

**Audience:** CMS / Strapi backend  
**From:** Fixtura members app (onboarding Step 2)  
**Date:** 2026-04-07  
**Related:** [app-handoff-onboarding-phase3-m1-w2.md](./app-handoff-onboarding-phase3-m1-w2.md), [cms-handoff-onboarding-api-requirements.md](../../../.comms/cms-handoff-onboarding-api-requirements.md) §4.6, [cms-response-phase3-themes-and-logo.md](./cms-response-phase3-themes-and-logo.md) (backend review), [phase3-implementation-decisions.md](./phase3-implementation-decisions.md) (FE defaults)

## Context

Onboarding **Step 2 — Branding** needs:

1. **Premade themes** — a list of default themes users can pick from (same catalogue the product uses elsewhere).
2. **Custom theme** — users may **create** a theme that is **assigned to their account only** (not published as a global/public theme).
3. **Logo** — upload image to Strapi and associate with the account (M1 in the app handoff). **FE ships a placeholder uploader until schema + CMS path are agreed** ([response §6](./cms-response-phase3-themes-and-logo.md)).

The members BFF mirrors **M1** (`POST …/onboarding/step-2/upload`) and **W2** (`PATCH …/onboarding/step-2`) per the Phase 3 handoff.

**Important:** `GET …/all-template-options` does **not** list `api::theme.theme` — use a dedicated theme catalogue ([response §3](./cms-response-phase3-themes-and-logo.md)).

---

## 1. GET — Premade / default themes (catalogue)

**Purpose:** Populate the Step 2 theme dropdown with all **public / premade** themes (`isPublic: true` on `api::theme.theme`).

**Preferred (aligned with L1/L2):**

- `GET {STRAPI_URL}/api/account/onboarding/lookups/themes`

**Success 200 — example:**

```json
{
  "data": [
    { "id": 1, "slug": "classic", "label": "Classic", "sortOrder": 1 },
    { "id": 2, "slug": "bold", "label": "Bold", "sortOrder": 2 }
  ]
}
```

- **`label`:** maps from theme `Name` if slug not added yet.
- **`slug` / `sortOrder`:** optional; see [response §7](./cms-response-phase3-themes-and-logo.md).

**Alternative (B):** filtered Strapi REST `GET /api/themes?filters[isPublic][$eq]=true&publicationState=live` — document exact query for BFF proxy.

---

## 2. POST — Create custom theme (account-scoped, private)

**Purpose:** User chooses **“Create custom theme”** — new `api::theme.theme` with `isPublic: false`, linked via `account.theme`.

**Preferred:**

- `POST {STRAPI_URL}/api/accounts/:accountId/onboarding/step-2/theme`

**Auth:** Bearer JWT; user must own the account.

**Request body (example):**

```json
{
  "name": "My club colours",
  "primary": "#112233",
  "secondary": "#445566",
  "dark": "#111",
  "white": "#FFF"
}
```

**Success 200/201 — example:**

```json
{
  "data": {
    "id": 99,
    "isPublic": false,
    "accountId": 42
  }
}
```

**CMS must define** how `Name` / `Theme` JSON are populated from the body.

---

## 3. W2 — PATCH Step 2 (`…/onboarding/step-2`)

Extend the body to include at least:

| Field         | Type           | Notes                                                                                                                                           |
| ------------- | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **`themeId`** | number \| null | **Single** relation to `api::theme.theme` (replaces split premade/custom ids). Premade = row with `isPublic: true`; custom = `isPublic: false`. |
| `logoMediaId` | number \| null | From M1 when logo schema exists.                                                                                                                |

Colours are **not** on W2; they live on the theme document (`POST …/step-2/theme` or premade catalogue).

`EMPTY_UPDATE` / idempotency consistent with W1.

---

## 4. Logo upload (M1)

Contract intent: [app-handoff-onboarding-phase3-m1-w2.md](./app-handoff-onboarding-phase3-m1-w2.md). Logo UI remains a **placeholder** until CMS picks storage ([response §6](./cms-response-phase3-themes-and-logo.md)).

---

## 5. Open questions for CMS workshop

1. **`slug` / `sortOrder`** on theme for stable keys and ordering?
2. Enforce **at most one private theme per account** in API?
3. Maximum **custom** themes per account?
4. Logo: **`account.logo`** vs **tagged media-library** vs **Theme JSON**?

---

## Document history

| Date       | Change                                                                                      |
| ---------- | ------------------------------------------------------------------------------------------- |
| 2026-04-07 | Initial request: premade list, custom create, W2 fields, logo placeholder note.             |
| 2026-04-07 | Merged with copy variant; `themeId` W2; cross-links to response + implementation decisions. |
