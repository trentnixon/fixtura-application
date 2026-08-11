# Frontend handoff — Save organisation branding (palette + template mode)

**To:** Fixtura app / FE (members app + route-lab branding)  
**From:** CMS / Strapi backend  
**Date:** 2026-04-30

---

## What we shipped

A single authenticated write that persists **organisation colours** (via `theme.Theme` JSON linked from the account) and **template mode** (via the account’s `template_option.template_mode`), so “Save branding” can be one call instead of multiple partial updates.

**New endpoint**

| Item   | Value                               |
| ------ | ----------------------------------- |
| Method | `PATCH`                             |
| Path   | `/api/accounts/:accountId/branding` |

**Read path tweak**

`GET /api/accounts/:accountId/branding` now includes **`template_option.modeId`** (integer or `null`) alongside the existing **`template_option.mode`** (slug string used by render/scheduling defaults).

---

## How to access

1. **Base URL:** same Strapi REST root as elsewhere, e.g. `{STRAPI_ORIGIN}/api/...`.
2. **Headers:**  
   `Authorization: Bearer <jwt>`  
   `Content-Type: application/json`
3. **Path param:** `accountId` must be a positive integer Strapi account id **owned by the logged-in user** (same ownership model as other `/accounts/:accountId/*` routes).
4. **Permissions:** in Strapi Admin → Settings → Users & permissions → role used by your app → **Account** → enable **`saveAccountBranding`** (scope: `api::account.account.saveAccountBranding`).
5. **Template mode picker data:** unchanged — use **`GET /api/template-modes/ui`** for published modes (`id`, `name`, `slug`). The save endpoint expects the same **`id`** values as **`templateModeId`** in the PATCH body.

---

## Request payload

You may send a **flat** JSON object or **`{ data: { ... } }`** (either shape is accepted).

**Rule:** At least one of **`themeId`**, **`palette`** / nested **`theme`** colour fields, or **`templateModeId`** must be present. Sending `{}` returns `400` / `EMPTY_UPDATE`.

### Fields

| Field            | Type                                                | Description                                                                                                                                 |
| ---------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `themeId`        | `number \| null`                                    | Optional. Set the account’s theme to this Strapi `theme` id, or `null` to clear **only when** you are not sending palette keys (see below). |
| `palette`        | `BrandingPaletteInput`                              | Optional. Brand colours to merge into the active theme JSON keys `primary`, `secondary`, `dark`, `white`.                                   |
| `theme`          | `{ themeId?, primary?, secondary?, dark?, white? }` | Optional alternative to top-level `themeId` + `palette`: `themeId` plus any of the four colour keys in one object.                          |
| `templateModeId` | `number \| null`                                    | Optional. Published `template-mode` row id (same ids as `GET /api/template-modes/ui`). `null` clears the mode relation.                     |

**Colour rules**

- Each colour is a **hex string** `#RGB` or `#RRGGBB`, or **empty string** / **null** to remove that key from stored theme JSON.
- Invalid hex → `400` / `INVALID_PALETTE_COLOR`.

**Behaviour notes**

- **`themeId` only (no palette):** attaches the account to that theme if allowed (public themes, or private themes not “in use” by another account per backend rules).
- **`palette` without top-level `themeId`:** merges into the account’s **current** theme; may create a new private theme if the current one is public or shared.
- **`themeId` + `palette`:** merges colours onto that theme; if the theme cannot be edited in place (e.g. public catalogue), the backend forks a private copy and links the account to it.
- **`themeId: null` with `palette`:** rejected (`INVALID_THEME_WITH_PALETTE`).

---

### TypeScript — request types

```typescript
/** Keys stored in theme JSON (hex or clear with null / "") */
export type BrandingPaletteInput = Partial<{
  primary: string | null;
  secondary: string | null;
  dark: string | null;
  white: string | null;
}>;

export type PatchAccountBrandingBody =
  | {
      themeId?: number | null;
      palette?: BrandingPaletteInput;
      theme?: {
        themeId?: number | null;
        primary?: string | null;
        secondary?: string | null;
        dark?: string | null;
        white?: string | null;
      };
      templateModeId?: number | null;
    }
  /** Strapi-style wrapper (both supported) */
  | {
      data: {
        themeId?: number | null;
        palette?: BrandingPaletteInput;
        theme?: PatchAccountBrandingBody["theme"];
        templateModeId?: number | null;
      };
    };
```

---

### Example payloads

**Save mode only**

```json
{
  "templateModeId": 3
}
```

**Save colours only (merged onto current theme)**

```json
{
  "palette": {
    "primary": "#112233",
    "secondary": "#445566",
    "dark": "#111111",
    "white": "#FFFFFF"
  }
}
```

**Aligns with CMS handoff shape (`theme` + `templateModeId`)**

```json
{
  "theme": {
    "themeId": 12,
    "primary": "#112233",
    "secondary": "#445566",
    "dark": "#111111",
    "white": "#FFFFFF"
  },
  "templateModeId": 3
}
```

---

## Responses

Envelope matches other authenticated account endpoints: **`{ data: ... }`** on success, **`{ error: { code, message } }`** on validation / business errors.

### Success (`200`)

`data.accountId` and `data.themeId` are always returned.  
If the client sent **`templateModeId`** at the top level (key present — including `null` to clear), **`data.templateModeId`** and **`data.templateModeSlug`** are included (slug is for debugging/support).

```typescript
export type PatchAccountBrandingSuccess = {
  data: {
    accountId: number;
    themeId: number | null;
    /** Present only when the request included a `templateModeId` field */
    templateModeId?: number | null;
    templateModeSlug?: string | null;
  };
};
```

### Errors

HTTP status matches `result.status`. Body shape:

```typescript
export type PatchAccountBrandingError = {
  error: {
    code: string;
    message: string;
  };
};
```

**Typical codes (non-exhaustive)**

| HTTP | Code                             | Meaning                                                                    |
| ---- | -------------------------------- | -------------------------------------------------------------------------- |
| 400  | `INVALID_BODY`                   | Body not a JSON object.                                                    |
| 400  | `EMPTY_UPDATE`                   | Nothing to apply.                                                          |
| 400  | `INVALID_PALETTE_COLOR`          | Invalid hex colour.                                                        |
| 400  | `INVALID_TEMPLATE_MODE_ID`       | `templateModeId` not a positive integer when set.                          |
| 400  | `UNKNOWN_OR_DRAFT_TEMPLATE_MODE` | Mode id missing or not **published** (draft excluded, same as UI catalog). |
| 400  | `INVALID_THEME_ID`               | `themeId` invalid when provided.                                           |
| 400  | `UNKNOWN_THEME`                  | Theme id does not exist.                                                   |
| 400  | `THEME_NOT_AVAILABLE`            | Private theme not allowed for this account.                                |
| 400  | `INVALID_THEME_WITH_PALETTE`     | `themeId: null` combined with palette — not supported.                     |
| 404  | `ACCOUNT_NOT_FOUND`              | Account missing or not owned by the user.                                  |

---

## Read-back after save

`GET /api/accounts/:accountId/branding` returns (among other fields):

- **`data.theme`** — `{ id, name, theme }` where `theme` is the JSON blob (includes `primary` / `secondary` / `dark` / `white` when set).
- **`data.template_option`** — includes **`modeId`** (saved template-mode id) and **`mode`** (slug, e.g. `light` / `dark`).

Use **`GET /api/template-modes/ui`** to resolve id ↔ label in the UI.

---

## Related backend references

- Route registration: `src/api/account/routes/custom-account.js`
- Handler: `saveAccountBranding` in `src/api/account/controllers/account.js`
- Service: `src/api/account/controllers/services/saveAccountBranding/index.js`
- Original CMS request (context): `src/api/theme/.docs/request/cms-handoff-branding-save-palette-and-template-mode.md`
