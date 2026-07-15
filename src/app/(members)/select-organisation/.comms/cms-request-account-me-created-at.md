# CMS request — `createdAt` + branding `theme` on `GET /account/me` `accounts[]`

**From:** Fixtura App (frontend)  
**To:** CMS (Strapi) Backend Team  
**Date:** 2026-07-14  
**Context:** `/select-organisation` UX — "New" badge, card accent colours, and richer org picker without per-account branding fetches

---

## Endpoint

**`GET /api/account/me`** → **`data.accounts[]`** (each owned account row)

App BFF: **`GET /api/account/me`** (proxies to Strapi unchanged).

---

## Request 1 — `createdAt`

Add an ISO-8601 **`createdAt`** field to each item in **`data.accounts[]`**.

### Semantics

- **Must be:** account entity creation timestamp (Strapi `account.createdAt`).
- **Must not be:** last activity, last login, onboarding step time, or render/update time.

### Consumer use

1. **New** badge on picker cards when `createdAt` is within 14 days.
2. **Newest first** sort option on `/select-organisation`.

---

## Request 2 — branding `theme` (light slice)

Add a nullable **`theme`** object on each **`data.accounts[]`** row, using the **same shape as the `theme` field on `GET /api/accounts/:accountId/branding`** (Phase 3):

```typescript
{
  id: number;
  name: string;
  theme: Record<string, unknown>; // Strapi Theme JSON — primary/secondary hex, etc.
  isPublic?: boolean | null;
}
```

### Semantics

- **`null`** when the account has no linked theme.
- **`theme.theme`** must include brand colours the app already reads elsewhere (`primary`, `secondary`, optional `dark`, `white` as hex). See [`theme-colours-from-account.ts`](../../../../lib/branding/theme-colours-from-account.ts).
- **Do not** embed full `template`, `template_option`, scheduler, or media on `/account/me` — theme slice only.

### Why on `/me`, not N× `GET …/branding`

`/select-organisation` lists every owned account. Calling **`GET /api/accounts/:accountId/branding`** per card would mean **1 + N** requests on every visit. A light **`theme`** on each bootstrap row keeps the picker to **one bootstrap call** (plus existing per-account onboarding-state for lifecycle CTAs).

### Consumer use

1. Org picker card accent / ring colour from `theme.theme.primary` (fallback when no org logo).
2. Visual differentiation between organisations at a glance.

---

## Example row

```json
{
  "data": {
    "user": { "id": 110, "...": "..." },
    "accounts": [
      {
        "id": 319,
        "createdAt": "2026-07-01T04:12:33.000Z",
        "isActive": true,
        "onboardingOrganisationName": "North Districts",
        "accountOrganisationDetails": {
          "id": 31296,
          "Name": "North Districts",
          "ParentLogo": "https://…",
          "Sport": "Cricket"
        },
        "theme": {
          "id": 42,
          "name": "North Districts Blue",
          "isPublic": false,
          "theme": {
            "primary": "#003366",
            "secondary": "#FF6600",
            "dark": "#111111",
            "white": "#FFFFFF"
          }
        }
      }
    ]
  }
}
```

---

## TypeScript alignment (app follow-up after CMS ships)

Add to [`AccountSummary`](../../../../types/api/account.ts):

```typescript
createdAt?: string | null;
theme?: AccountBrandingTheme | null;
```

Reuse existing **`AccountBrandingTheme`** — no new theme type.

---

## Open questions

1. Confirm field names: `createdAt`, `theme` (camelCase).
2. Confirm **`createdAt`** is always present for owned accounts (null only if genuinely unknown).
3. Confirm **`theme`** population matches **`getAccountBrandingPayload`** theme resolution (same linked theme record as the branding screen).
4. Any payload size concerns for users with many accounts? If so, minimum acceptable slice is `{ id, name, theme: { primary, secondary } }` nested under `theme.theme`.

---

## Blocked until shipped

- **New** badge + newest-first sort (`createdAt`)
- Theme-tinted org picker cards (`theme`)

## Reference endpoints today

| Purpose                               | Endpoint                                                       |
| ------------------------------------- | -------------------------------------------------------------- |
| Org list (bootstrap)                  | **`GET /api/account/me`**                                      |
| Full branding (single account)        | **`GET /api/accounts/:accountId/branding`**                    |
| Lifecycle CTA (Continue setup / Open) | **`GET /api/accounts/:accountId/onboarding/onboarding-state`** |
