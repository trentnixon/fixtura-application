# App request: Association club logo write (upload / clear)

**From:** Fixtura App (frontend) Team  
**To:** CMS (Strapi) Backend Team  
**Date:** 2026-05-26  
**Feature:** `/o/:accountId/club-logos/:clubId` (members UI, association accounts only)

**Prerequisite (read path — shipped):** [app-handoff-account-club-logos-directory-endpoint.md](../handoff/app-handoff-account-club-logos-directory-endpoint.md)

---

## Purpose

Associations need to **upload, replace, recrop, and clear** logos for **member clubs** in their competitive scope. The Club Logos UI lists clubs via `GET …/club-logos-directory`; selecting a club opens a logo editor that reuses the same crop/upload flow as **Brand logo** (`/o/:accountId/brand-logo`).

**Critical product rule:** the logo is persisted on the **`club`** document (`clubId` in path), **not** on the association **`account`** onboarding logo.

---

## What the app does today

The frontend and BFF are **already wired** to the contract below. Upload currently fails with **405 Method Not Allowed** because Strapi does not expose these routes yet.

| Layer          | M1 — upload                                                            | W2 — persist / clear                                            |
| -------------- | ---------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Members UI** | `ClubLogoWorkspace` → `useUpdateClubLogo`                              | same hook (M1 then W2)                                          |
| **App client** | `POST /api/accounts/:accountId/clubs/:clubId/logo/upload`              | `PATCH /api/accounts/:accountId/clubs/:clubId/logo`             |
| **Next BFF**   | `src/app/api/accounts/[accountId]/clubs/[clubId]/logo/upload/route.ts` | `src/app/api/accounts/[accountId]/clubs/[clubId]/logo/route.ts` |
| **Strapi**     | **Not implemented** ← blocking                                         | **Not implemented**                                             |

After a successful write, the app invalidates `GET …/club-logos-directory` so list thumbnails refresh.

---

## Requirements (must-have)

### 1. Auth, ownership, and scope

- Same pattern as other account custom routes: **JWT required**; authenticated user must **own** `:accountId`.
- **Association accounts only** for writes (`account_type !== 1` in app jargon). Club-organisation accounts must not use this API (app redirects them away from Club Logos nav).
- **`:clubId` must appear in the same competitive scope** as `GET …/club-logos-directory` for that account. If the club is out of scope → **404** (preferred for enumeration safety, consistent with sponsor CRUD).
- Invalid ids (`accountId`, `clubId` non–positive-integer) → **400**.

### 2. Target field on the club entity

Per the directory handoff, v1 logos live on **`club`** only:

- **Write target:** attach uploaded media to the club’s **`Logo`** relation (same semantic field that wins first in directory `logoUrl` resolution).
- **Do not** write the association account’s onboarding logo or Step 2 branding.
- **Do not** modify `PlayHQLogo` or `ParentLogo` via this API in v1.

### 3. M1 — Multipart upload

| Property         | Value                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------- |
| **Method**       | `POST`                                                                                  |
| **Path**         | `/api/accounts/:accountId/clubs/:clubId/logo/upload`                                    |
| **Content-Type** | `multipart/form-data`                                                                   |
| **Field name**   | `file` (support `files` as alias if consistent with onboarding Step 2 / sponsor upload) |

**Success (`201` or `200` — pick one and document):**

```json
{
  "data": {
    "id": 12345
  }
}
```

`id` = Strapi upload/media plugin id for use in W2.

**Validation (align with brand logo / Step 2 where possible):**

- Allowed MIME: `image/png`, `image/jpeg`, `image/webp` (confirm exact list).
- Max size: document hard limit (app validates **8MB** client-side).
- Reject non-image uploads with stable error codes (see §6).

M1 **does not** need to attach the logo to the club yet if your pipeline prefers upload-then-link; the app always calls W2 immediately after M1 succeeds.

### 4. W2 — Persist or clear logo link

| Property   | Value                                                              |
| ---------- | ------------------------------------------------------------------ |
| **Method** | `PATCH`                                                            |
| **Path**   | `/api/accounts/:accountId/clubs/:clubId/logo`                      |
| **Body**   | Flat or `{ "data": { … } }` unwrap (same as Step 2 / sponsor CRUD) |

**Set logo (after M1):**

```json
{
  "logoMediaId": 12345
}
```

- `logoMediaId` must reference an existing upload id from M1 (or prior upload).
- Must be `image/*` MIME or return **400** with a stable code (e.g. `INVALID_LOGO_MIME`, `UNKNOWN_MEDIA`).

**Clear logo:**

```json
{
  "logoMediaId": null
}
```

- Clears club **`Logo`** relation.
- Subsequent `GET …/club-logos-directory` should return `logoUrl: null` for that club (per existing read cascade).

**Logo-only PATCH** is valid (no other fields required).

**Success (`200`):**

```json
{
  "data": {
    "id": 30753,
    "name": "Example Cricket Club",
    "logoUrl": "https://cdn.example/strapi/asset.png"
  }
}
```

| Field     | Notes                                                             |
| --------- | ----------------------------------------------------------------- |
| `id`      | Strapi **`club`** document id (matches path `:clubId`)            |
| `name`    | Display name (optional but helpful for app toasts)                |
| `logoUrl` | Absolute URL after write, same resolution rules as directory read |

### 5. BFF alignment

App BFF mirrors Strapi paths **exactly** (JWT forwarded; multipart body streamed for M1):

- `POST /api/accounts/:accountId/clubs/:clubId/logo/upload`
- `PATCH /api/accounts/:accountId/clubs/:clubId/logo`

### 6. Errors

Match existing account custom controllers:

```json
{
  "error": {
    "code": "SOME_CODE",
    "message": "Human-readable message"
  }
}
```

| HTTP    | When                                                                |
| ------- | ------------------------------------------------------------------- |
| **400** | Invalid body, bad media id, wrong MIME, empty update                |
| **401** | Missing / invalid JWT                                               |
| **403** | Authenticated but not permitted (if used)                           |
| **404** | Account not found, club not found, or club not in association scope |
| **405** | Wrong method (should not occur once routes registered)              |
| **500** | Unexpected                                                          |

Suggested stable codes (reuse Step 2 where applicable): `EMPTY_UPDATE`, `UNKNOWN_MEDIA`, `INVALID_LOGO_MIME`, `INVALID_BODY`.

### 7. Permissions (proposed)

Enable under **Authenticated → Account** (confirm exact slugs):

| Action (proposed)       | Handler             |
| ----------------------- | ------------------- |
| `uploadAccountClubLogo` | M1 multipart upload |
| `patchAccountClubLogo`  | W2 persist / clear  |

---

## Reference implementations in this repo

| Pattern                          | Doc / route                                                                                                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **M1 + W2 (two-step)**           | Brand logo: [brand-logo-cms-fed-briefing.md](../../responses/brand-logo-cms-fed-briefing.md); `POST …/onboarding/step-2/upload` + `PATCH …/onboarding/step-2`      |
| **Single-step multipart attach** | Sponsor logo: [app-handoff-account-sponsors-and-allocations-crud.md](./app-handoff-account-sponsors-and-allocations-crud.md) — `POST …/sponsors/:sponsorId/upload` |
| **Club list / scope**            | [app-handoff-account-club-logos-directory-endpoint.md](../handoff/app-handoff-account-club-logos-directory-endpoint.md)                                            |

The app chose **M1 + W2** (brand-logo style) so **clear** uses `logoMediaId: null` on PATCH, consistent with organisation logo maintenance.

---

## Alternative (negotiable)

If CMS prefers **one step** like sponsor upload:

- `POST …/clubs/:clubId/logo/upload` multipart → attach to club `Logo` and return `{ data: { id, name, logoUrl } }` in one response.
- App would simplify `useUpdateClubLogo` to a single POST for saves; **clear** would still need `PATCH` with `logoMediaId: null` or a dedicated DELETE.

Please confirm which pattern you will ship so FE can adjust if needed.

---

## Out of scope (v1)

- Association-level logo **overrides** (junction table / per-association club logo distinct from club-native `Logo`).
- Bulk upload across multiple clubs.
- Automatic deletion of replaced media files from storage (sponsor v1 also skips cleanup).
- Writing `PlayHQLogo` / `ParentLogo`.

---

## Open questions for CMS

1. Confirm **M1 + W2** vs **single-step POST** for upload+attach.
2. Confirm **`Logo`** is the only field written on `club`.
3. Confirm scope check reuses the same algorithm as `GET …/club-logos-directory`.
4. Confirm M1 success status (**200** vs **201**) and exact error codes.
5. Confirm whether a club with its **own Fixtura club account** may still receive association logo writes (directory includes these clubs today).
6. Confirm **Cache-Control** on PATCH response (app will refetch directory; `private, no-store` preferred).

---

## Frontend files (already implemented)

- UI list: `src/app/(members)/o/[accountId]/club-logos/`
- UI editor: `src/app/(members)/o/[accountId]/club-logos/[clubId]/`
- Hook: `src/lib/api/hooks/account/useUpdateClubLogo.ts`
- API service: `src/lib/api/services/account.api.ts` (`uploadAccountClubLogo`, `patchAccountClubLogo`)
- Types: `src/types/api/account.ts` (`UploadAccountClubLogoResponse`, `PatchAccountClubLogoBody`, `PatchAccountClubLogoResponse`)

---

## Status

**Agreed — CMS shipped.** Authoritative FE/BFF summary: [cms-handoff-club-logos-fe.md](../handoff/cms-handoff-club-logos-fe.md). App implements M1 + W2 per that contract.
