# CMS request — account sign-in & profile writes (handoff)

**Date:** 2026-05-01  
**Audience:** Fixtura CMS / backend (Strapi) team  
**From:** Members-area frontend (account / settings UX)  
**Scope:** Persisting three user-controlled items from the renewed account experience. **Account deletion is explicitly out of scope** for this document.

**Related (read-only, already shipped):**

- [account-admin-api-contract.md](./account-admin-api-contract.md) — JWT, tenancy, error semantics, route map
- [handoff-phase-02-accounts-settings.md](./handoff/done/handoff-phase-02-accounts-settings.md) — `GET /accounts/:accountId/settings` (notes write API deferred there)

---

## 1. Purpose

We are promoting a redesigned **account** experience from Route Lab to production (`/o/[accountId]/account`). It includes **change** flows for:

1. **User name** (display / profile name as presented in the product)
2. **Login email** (identifier used for authentication and account email)
3. **Password** (credential rotation)

Today, the lab implementation uses **fixtures and stubs only** — no CMS calls and no persistence. Before wiring production, we need **authoritative write contracts**, **data ownership rules**, and **security-process alignment** from CMS so login-related changes are correct end-to-end.

---

## 2. What the frontend has implemented (Route Lab)

**Lab route:** `/sandbox/route-lab/app/account`  
**Primary UI:** `src/app/sandbox/route-lab/app/account/_components/account-lab-workspace.tsx`  
**Fixture model:** `src/features/route-lab/fixtures/account.ts` (`userName`, `loginEmail`, plus read-only organisation context)

**UX (sign-in & security, edit mode):**

- Each of the three fields uses a **“change”** action that opens a **dialog**; values are shown as read-only rows (label + current value + CTA).
- **Login email:** client-side **format validation** with Zod (non-empty, valid email shape) before a stub success path.
- **Password:** dialog collects new + confirm; **stub validation only** — minimum length (8) and match; **optional visual strength meter** (informational, **not** used to gate save). **Show/hide** toggles on password inputs.
- **Delete account** exists in the lab as a separate destructive block; **it is not part of this CMS request.**

**Important:** Production wiring must **replace** stubs with real requests, follow CMS **password policy** and **email change** rules, and must **not** assume lab validation is sufficient for server acceptance.

---

## 3. Security and correctness — expectations (shared)

These are alignment points for CMS and frontend. Where something is undecided, we need CMS to document the chosen behaviour.

| Topic                 | Expectation                                                                                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transport             | All reads/writes over **HTTPS**; **no** credentials or tokens in URLs/query strings.                                                                                    |
| Authentication        | Mutations use the same **JWT** model as existing account-scoped routes (`Authorization: Bearer`), per [account-admin-api-contract.md](./account-admin-api-contract.md). |
| Authorisation         | Only the **account owner** (or explicitly allowed role) may change these fields; preserve **404 vs non-enumeration** semantics where already agreed.                    |
| Password handling     | **Plain passwords** appear only over TLS in request bodies; CMS stores **hashes** only; frontend must **never** log raw passwords.                                      |
| Email change          | Define whether change is **immediate** or **verified** (e.g. confirmation link, re-login). Frontend must implement the agreed multi-step UX if required.                |
| Sensitive changes     | If CMS requires **step-up** (current password, MFA, or re-auth), specify the contract (headers, body fields, error codes).                                              |
| Sessions              | Define whether **email or password** change **invalidates existing sessions** / refresh tokens and what the client should do (e.g. forced re-login).                    |
| Rate limiting & abuse | CMS should apply **rate limits** and consistent errors for credential-change endpoints; document codes/messages for the app.                                            |
| Audit                 | Product may require **audit logs** for email/password changes; confirm if present and what the app should display (e.g. “last updated” source).                         |

---

## 4. Data ownership — what we need CMS to confirm

The lab uses a single string **`userName`**. Production data may map to **Strapi `users-permissions`** (global user) and/or **`account`** scalars (e.g. settings payload exposes `FirstName`, `LastName` on the account — see Phase 2 handoff).

**Please confirm for each field:**

| Lab / UI concept | Questions for CMS                                                                                                                                                                                                   |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User name**    | Is this stored on **`user`** (e.g. `username`, `firstname`/`lastname`), on **`account`**, or both? What is the **canonical** value for “how the name appears” in the product?                                       |
| **Login email**  | Is sign-in email the **`users-permissions` `email`**, a separate verified field, or tied to account `DeliveryAddress`/other? Must not assume it matches **delivery** email used for bundles unless product says so. |
| **Password**     | Confirm we use **Strapi’s supported** password change path (plugin endpoint, custom controller, etc.) and any **policy** (min length, complexity, breach checks).                                                   |

---

## 5. What we need CMS to **produce** (deliverables)

Concrete artifacts so the frontend can implement production saves **without** guessing.

1. **Normative write specification** (can extend [account-admin-api-contract.md](./account-admin-api-contract.md) or add a new phase handoff):
   - One or more endpoints (or Strapi plugin routes) for **update display name**, **update login email**, **change password**.
   - Method, path, **request body schema**, **response shape**, and **error catalogue** (HTTP status, machine-readable code if any, safe user-facing message).

2. **Permission model**
   - Strapi permission names / roles for each operation (aligned with existing `getAccountSettings`-style naming).
   - Post-deploy checklist (which toggles to enable for **Authenticated**).

3. **Identity & email-change flow**
   - If verification emails or pending states exist: document states, polling vs redirect, and how **`GET /accounts/:accountId/settings`** or **`GET /account/me`** reflects the **pending vs committed** email.

4. **Password change contract**
   - Required body fields (e.g. `currentPassword`, `password`, `passwordConfirmation`); whether **current password** is mandatory; alignment with Strapi defaults.
   - Whether responses should drive **session refresh** or **logout**.

5. **Read model updates**
   - Ensure **GET** payloads used by the account page expose the same **user name** and **login email** the user sees after save (including any normalisation CMS applies).

**Out of scope for this request (explicit):** **Delete account** — no contract requested here.

---

## 6. Suggested frontend integration target (informational)

Production route target (from lab plan): **`/o/[accountId]/account`**.  
Reads will likely combine existing **bootstrap** and/or **`GET /accounts/:accountId/settings`** with any new **user/profile** fields CMS exposes. Exact composition depends on answers in §4.

---

## 7. Open questions summary (for CMS workshop)

- Single **PATCH** resource vs separate commands for email vs password?
- **Idempotency** and conflict handling (e.g. email already in use).
- **Internationalisation** of validation messages: client-only vs server-led?
- Does **`lastUpdated`** (or equivalent) on account/user reflect these changes for the overview panel?

---

## 8. References in this repo

- Account lab implementation guide: `src/app/sandbox/route-lab/app/account/.docs/account-route-lab-implementation-guide.md`
- Phase 2 settings GET: [handoff-phase-02-accounts-settings.md](./handoff/done/handoff-phase-02-accounts-settings.md)
