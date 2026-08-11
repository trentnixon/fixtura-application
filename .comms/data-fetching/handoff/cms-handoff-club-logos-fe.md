# Club Logos — Frontend & BFF handoff (single doc)

**From:** CMS (Strapi) Backend  
**To:** Fixtura App (FE) + Next.js BFF  
**Date:** 2026-05-26  
**UI:** Members **`/o/:accountId/club-logos`** and **`/o/:accountId/club-logos/:clubId`**

**Authoritative API contract** (same payloads and status codes as CMS): [cms-handoff-club-logos-directory-endpoint.md](./cms-handoff-club-logos-directory-endpoint.md). This file is the **one-stop FE/BFF** summary: routes, bodies, errors, caching, and integration flow.

**Local Strapi wiring + curl smoke:** [club-logos-local-setup-and-smoke.md](./club-logos-local-setup-and-smoke.md)

## Product rules

- **Who:** **Association accounts only** for the Club Logos experience. Club-organisation accounts get an **empty directory** (`200` with `clubs: []`); **writes** are **not** supported for them (Strapi returns **404** with write error shape where applicable).
- **Where the logo lives:** Persisted on the **`club`** document’s **`Logo`** media relation — **not** on the association account onboarding / Step 2 branding logo.
- **Scope:** The club list and write targets are the **same** server-side set: clubs in the account’s **competitive scope** (see below). Do **not** build the list from sponsor assignable targets.
- **Do not use:** `GET /api/accounts/:accountId/sponsor-entity-targets` for the directory list.

---

## BFF (Next.js)

Mirror Strapi paths **exactly** under your app’s `/api/accounts/...` prefix (or your existing members API convention):

| Upstream (Strapi)                  | Your BFF should                                                             |
| ---------------------------------- | --------------------------------------------------------------------------- |
| `GET …/club-logos-directory`       | Proxy **GET**, forward `Authorization: Bearer <JWT>`                        |
| `POST …/clubs/:clubId/logo/upload` | Proxy **POST**, forward JWT, **stream multipart** (field `file` or `files`) |
| `PATCH …/clubs/:clubId/logo`       | Proxy **PATCH**, forward JWT + JSON body                                    |

Forward **`Cache-Control`** from upstream on responses if your stack supports it (`private, no-store` on directory GET and logo PATCH).

---

## Auth & ownership

| Rule          | Detail                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------ |
| **JWT**       | Required on all three routes.                                                              |
| **Ownership** | User must **own** `:accountId`. Wrong user → **404** (enumeration-safe; not 403).          |
| **403**       | Valid JWT but Strapi role missing the specific **Account** permission (see § Permissions). |

---

## Endpoint 1 — Directory (read)

|            |                                                   |
| ---------- | ------------------------------------------------- |
| **Method** | `GET`                                             |
| **Path**   | `/api/accounts/:accountId/club-logos-directory`   |
| **Param**  | `accountId` — positive integer; invalid → **400** |

### Success `200`

```json
{
  "data": {
    "clubs": [
      {
        "id": 32961,
        "name": "Example Cricket Club",
        "logoUrl": null
      }
    ]
  }
}
```

| Field             | Meaning                                                |
| ----------------- | ------------------------------------------------------ |
| `clubs[].id`      | Strapi **club** id (use in path for writes).           |
| `clubs[].name`    | Display name; fallback `"Club <id>"`.                  |
| `clubs[].logoUrl` | Absolute image URL or `null` — resolution order below. |

**Sorting:** By `name` (`localeCompare`, `numeric: true`), then `id` ascending. **One row per club id.**

**Empty list `200`:** Club org account, or association with **no competitions in scope**.

### Directory errors

| HTTP | When                                              |
| ---- | ------------------------------------------------- |
| 400  | Invalid `accountId`                               |
| 401  | Missing / invalid JWT                             |
| 403  | Missing `getAccountClubLogosDirectory` permission |
| 404  | Account missing or not owned                      |
| 500  | Server error                                      |

---

## `logoUrl` resolution (READ + PATCH response)

Server uses first available:

1. `club.Logo`
2. `club.PlayHQLogo`
3. `club.ParentLogo`

**Important for “clear logo” UX:** `PATCH` with `logoMediaId: null` clears **only** `club.Logo`. If PlayHQ or Parent still has a value, **`logoUrl` may still be non-null** after clear. Align toasts / empty-state copy with that (or treat “no custom Fixtura logo” differently in UI if needed later).

---

## Competitive scope (reference only — server-side)

FE should **not** recompute scope for correctness. In short: associations on the account → their competitions → union of clubs linked via **`club_to_competition`** and clubs on **teams** in those competitions. Published clubs only; `isActive === false` omitted. Multi-association accounts: **union** of clubs.

Writes use the **same** scope: unknown or out-of-scope `clubId` → **404** (`CLUB_NOT_FOUND` style in write error body).

---

## Endpoint 2 — Upload (M1)

|            |                                                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Method** | `POST`                                                                                                                   |
| **Path**   | `/api/accounts/:accountId/clubs/:clubId/logo/upload`                                                                     |
| **Params** | Positive integers; bad values → **400** (plain bad request for invalid ids; missing file message for missing multipart). |
| **Body**   | `multipart/form-data`, field **`file`** (alias **`files`**).                                                             |

### Success `201`

```json
{
  "data": {
    "id": 12345
  }
}
```

`id` is the upload plugin file id — pass to W2 as `logoMediaId`. M1 **does not** attach to the club; always call **W2** next on success.

---

## Endpoint 3 — Persist or clear (W2)

|            |                                                                                      |
| ---------- | ------------------------------------------------------------------------------------ |
| **Method** | `PATCH`                                                                              |
| **Path**   | `/api/accounts/:accountId/clubs/:clubId/logo`                                        |
| **Params** | Same as M1.                                                                          |
| **Body**   | Flat JSON **or** wrapped `{ "data": { … } }` (same pattern as sponsor / onboarding). |

**Set logo** (after M1):

```json
{
  "logoMediaId": 12345
}
```

**Clear** Fixtura-uploaded club logo relation:

```json
{
  "logoMediaId": null
}
```

**Requirement:** The key **`logoMediaId` must be present**. Omitting it → **400** / `EMPTY_UPDATE`.

### Success `200`

```json
{
  "data": {
    "id": 32961,
    "name": "Example Cricket Club",
    "logoUrl": "https://…"
  }
}
```

`logoUrl` uses the same cascade as the directory. Response includes **`Cache-Control: private, no-store`**.

---

## Write errors (structured)

When Strapi returns a structured failure for writes, shape is:

```json
{
  "error": {
    "code": "SOME_CODE",
    "message": "Human-readable message"
  }
}
```

| HTTP | Typical cases                                                                        |
| ---- | ------------------------------------------------------------------------------------ |
| 400  | Invalid body, `EMPTY_UPDATE`, invalid `logoMediaId`, unknown file id, non-image MIME |
| 401  | Missing / invalid JWT                                                                |
| 403  | Missing `uploadAccountClubLogo` or `patchAccountClubLogo`                            |
| 404  | Not owning account, club org write, club out of scope / not found                    |
| 500  | Upload / unexpected server error                                                     |

**Stable codes** (show or map in UI as needed): `EMPTY_UPDATE`, `UNKNOWN_MEDIA`, `INVALID_LOGO_MIME`, `INVALID_LOGO_MEDIA_ID`, `ACCOUNT_NOT_FOUND`, `CLUB_NOT_FOUND`.

Invalid `accountId` / `clubId` (non–positive integer) may use **400** with simple message from Strapi without the `error.code` object — match your other account proxies.

---

## Permissions (Strapi admin — per environment)

Under **Settings → Users & Permissions → Authenticated → Account**, enable:

| Label (admin)                  | Scope string                                        |
| ------------------------------ | --------------------------------------------------- |
| `getAccountClubLogosDirectory` | `api::account.account.getAccountClubLogosDirectory` |
| `uploadAccountClubLogo`        | `api::account.account.uploadAccountClubLogo`        |
| `patchAccountClubLogo`         | `api::account.account.patchAccountClubLogo`         |

If any are off, the matching route returns **403**.

---

## FE integration flow

1. **List:** `GET …/club-logos-directory` → render rows / thumbnails from `logoUrl`.
2. **Save (replace):** `POST …/logo/upload` (multipart) → on **201**, `PATCH …/logo` with `{ logoMediaId: <id> }` → on **200**, optimistic merge of `data` into React Query directory cache + invalidate/refetch (`useUpdateClubLogo`).
3. **Clear:** `PATCH …/logo` with `{ logoMediaId: null }` → refetch directory; remember cascade may still show a URL.
4. **Reuse** the same crop/upload flow as **Brand logo** (`/o/:accountId/brand-logo`) if that is already M1 + W2 against Step 2 routes — same **two-step** pattern here.

**Client validation:** Align image MIME/size with brand logo / Step 2 once documented (e.g. png/jpeg/webp; app-side **8 MB** is fine as a soft cap if CMS allows it).

---

## FE / BFF checklist

- [x] BFF: `GET` proxy for `club-logos-directory` + forward auth + cache header.
- [x] BFF: `POST` proxy for `…/clubs/:clubId/logo/upload` (multipart stream).
- [x] BFF: `PATCH` proxy for `…/clubs/:clubId/logo`.
- [x] Types: `ClubRow`, directory envelope, `UploadAccountClubLogoResponse`, `PatchAccountClubLogoBody` / response.
- [x] Club Logos list uses **directory** endpoint only (not sponsor-entity-targets).
- [x] After successful W2, invalidate/refetch directory.
- [x] Env: Authenticated role has all three Account permissions above — **documented** for local QA: [club-logos-local-setup-and-smoke.md](./club-logos-local-setup-and-smoke.md) (still enable in Strapi admin per environment).

**App alignment (2026-05-26):** FE routes `/o/:accountId/club-logos` and `/o/:accountId/club-logos/:clubId`; M1→W2 via `useUpdateClubLogo` with W2 response merged into directory query cache + invalidation; club-scoped error mapping in `resolve-club-logo-error-message.ts`; clear UX copy reflects Logo-only clear (PlayHQ/Parent cascade may remain).

---

## Status

**Agreed — CMS shipped; app FE/BFF wired.** Confirm Strapi **Authenticated → Account** permissions per environment before QA save/clear in staging.

| Area     | Path                                       |
| -------- | ------------------------------------------ |
| Routes   | `src/api/account/routes/custom-account.js` |
| Handlers | `src/api/account/controllers/account.js`   |

For full CMS-facing spec and phase-3 notes, see [cms-handoff-club-logos-directory-endpoint.md](./cms-handoff-club-logos-directory-endpoint.md).
