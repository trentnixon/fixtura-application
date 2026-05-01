# Frontend handoff — Account security writes (profile, login email, password)

**To:** Fixtura app / BFF  
**From:** CMS / Strapi backend  
**Date:** 2026-05-01

---

## Product decisions (this ship)

| Topic                  | Choice                                                                                                                                                                                                                                                                                       |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Display / profile name | Stored on **`api::account.account`** as **`FirstName`** / **`LastName`**. Lab-style single field maps to **`userName`** in the body (sets `FirstName`, clears `LastName`). Alternatively send **`firstName`** / **`lastName`** only (no `userName`).                                         |
| Login email            | **Immediate** update to **`plugin::users-permissions.user.email`**. Value is **normalized** (trim + lower case). No verification email in this version.                                                                                                                                      |
| Password               | **`currentPassword`** required. New password **`password`** + **`passwordConfirmation`**; minimum **8** characters; must differ from current. Hashed with **bcrypt** before persistence. Accounts **without** a stored password (e.g. non-local auth) get **`PASSWORD_CHANGE_UNAVAILABLE`**. |

---

## Read model (no new GET)

Identity for the account screen can be composed from existing routes:

- **`GET /api/account/me`** — `user.email`, `user.username` for the JWT user.
- **`GET /api/accounts/:accountId/settings`** — `FirstName`, `LastName`, and other account settings (unchanged).

`DeliveryAddress` on the account is **not** the login email; do not confuse with sign-in email.

---

## Routes

Base URL: Strapi REST prefix **`/api`** (same as other account routes).

| Operation                     | Method  | Path                                            |
| ----------------------------- | ------- | ----------------------------------------------- |
| Update profile / display name | `PATCH` | `/api/accounts/:accountId/security/profile`     |
| Update login email            | `PATCH` | `/api/accounts/:accountId/security/login-email` |
| Change password               | `POST`  | `/api/accounts/:accountId/security/password`    |

**Ownership:** `accountId` must be a positive integer and belong to **`ctx.state.user`** (same as **`PATCH .../settings`**). Otherwise **`404`** / **`ACCOUNT_NOT_FOUND`** (non-enumeration preserved).

**Auth:** `Authorization: Bearer <jwt>`.

**Permissions:** Strapi Admin → Settings → Users & permissions → **Authenticated** → **Account** → enable:

- `saveAccountSecurityProfile` — `api::account.account.saveAccountSecurityProfile`
- `saveAccountSecurityLoginEmail` — `api::account.account.saveAccountSecurityLoginEmail`
- `changeAccountSecurityPassword` — `api::account.account.changeAccountSecurityPassword`

(If an action row is missing after deploy, restart Strapi or re-save the Account content-type so custom actions are registered, then toggle as above.)

---

## `PATCH .../security/profile`

**Body:** flat JSON or `{ data: { ... } }`.

Provide **either**:

- **`userName`** (string, non-empty after trim, max 255) — sets `FirstName` to this value and `LastName` to `""`, **or**
- **`firstName`** and/or **`lastName`** (strings, max 255 each; may be empty to clear a field).

Do **not** send `userName` together with `firstName` / `lastName` (**`400`** / **`INVALID_BODY`**).

**Success `200`:** `{ "data": { ... } }` — same shape as **`GET /api/accounts/:accountId/settings`** for the account.

---

## `PATCH .../security/login-email`

**Body:** `{ "loginEmail": "..." }` **or** `{ "email": "..." }` (not both).

**Success `200`:** `{ "data": { "loginEmail": "<normalized>" } }`.

---

## `POST .../security/password`

**Body:**

```json
{
  "currentPassword": "...",
  "password": "...",
  "passwordConfirmation": "..."
}
```

**Success `200`:** `{ "data": { "changed": true } }`.

**Sessions:** Existing JWTs are **not** automatically revoked by this endpoint; the app may continue using the current token until expiry or choose to force re-login after password change.

---

## Error envelope

```json
{ "error": { "code": "SOME_CODE", "message": "Human-readable message" } }
```

| HTTP | `code`                                     | When                                                |
| ---- | ------------------------------------------ | --------------------------------------------------- |
| 400  | `INVALID_BODY`                             | Body missing, not an object, or conflicting fields. |
| 400  | `EMPTY_UPDATE`                             | Profile: nothing to update.                         |
| 400  | `INVALID_USER_NAME`                        | `userName` invalid type, empty, or too long.        |
| 400  | `INVALID_FIRST_NAME` / `INVALID_LAST_NAME` | Name field invalid type or too long.                |
| 400  | `INVALID_EMAIL`                            | Missing or malformed email.                         |
| 400  | `CURRENT_PASSWORD_REQUIRED`                | Password change: missing current password.          |
| 400  | `INVALID_PASSWORD`                         | Missing new password, or same as current.           |
| 400  | `PASSWORD_MISMATCH`                        | `password` ≠ `passwordConfirmation`.                |
| 400  | `WEAK_PASSWORD`                            | New password shorter than 8 characters.             |
| 400  | `CURRENT_PASSWORD_INCORRECT`               | Current password does not match.                    |
| 400  | `PASSWORD_CHANGE_UNAVAILABLE`              | No password on file for this user.                  |
| 404  | `ACCOUNT_NOT_FOUND`                        | Account missing or not owned by user.               |
| 409  | `EMAIL_IN_USE`                             | Another user already uses this email.               |

---

## Related

- Frontend request / scope: [`.comms/FrontEnd/request/comms-request-account-sign-in-and-profile-writes.md`](../../../../.comms/FrontEnd/request/comms-request-account-sign-in-and-profile-writes.md)
- Preferences (delivery, etc.): [frontend-handoff-patch-account-settings-save.md](./frontend-handoff-patch-account-settings-save.md)
