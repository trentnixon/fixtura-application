# Brand Logo — CMS, backend facts, and FED briefing

**Purpose:** Single document for **Strapi/CMS**, **backend maintainers**, and **frontend (members app + BFF)** so **Brand Logo** (`/o/:accountId/brand-logo`) can ship using **M1 + W2** (or an agreed alternative).

**Date:** 2026-04-30

---

## Audience

| Audience         | Use this doc for                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------- |
| **CMS / Strapi** | Product policy answers, upload limits, URL/CORS guarantees, future `PATCH /branding` for logo |
| **Backend**      | Confirms behaviour implemented in this repo (see **Backend implementation facts**)            |
| **FED / BFF**    | API contract, error codes, and **open questions back to FED** (see **What we need from FED**) |

---

## Context

**Goal:** Organisation owners can **upload, replace, crop, and clear** the account logo from the **members app** after onboarding, not only during Step 2.

**App wiring (intended):**

| Step                  | Method / path                                            | Role                                                   |
| --------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| **M1 — Upload**       | `POST /api/accounts/:accountId/onboarding/step-2/upload` | Multipart; returns `{ data: { id } }` (media id)       |
| **W2 — Persist link** | `PATCH /api/accounts/:accountId/onboarding/step-2`       | Body includes `logoMediaId` (and optionally `themeId`) |
| **Read**              | `GET /api/accounts/:accountId/branding`                  | Returns `onboardingLogo` (and theme, template, etc.)   |

The **Next.js BFF** is expected to forward these calls with the user JWT. **Route-level restriction** “wizard must be in progress” would live only in Strapi if added; see backend facts below.

**Separate path:** `PATCH /api/accounts/:accountId/branding` is for **palette + template mode** and does **not** include `logoMediaId` in the current contract. Logo maintenance should use **M1 + W2** unless branding PATCH (or a dedicated route) is extended.

---

## Questions for CMS / backend product owner

Sections **1–4** are the minimum to implement confidently; the rest avoids double sources of truth.

### 1. Lifecycle and permissions (blocking)

**1.1 — Post-onboarding use of M1/W2**
For an account where onboarding is **complete** (wizard finished, account active):

- Should **`POST …/onboarding/step-2/upload`** and **`PATCH …/onboarding/step-2`** (logo-only or logo + theme) remain **intentionally allowed** for the **account owner** under the same permissions as during Step 2?

Please answer explicitly: **allowed / not allowed / allowed only if \<condition\>**.

If **not allowed**, we need a **policy change** on these routes or a **maintenance** contract (e.g. `logoMediaId` on `PATCH …/branding`, or `POST/PATCH …/branding/logo`).

**1.2 — Ownership and roles**
Confirm the same **ownership + JWT** rules as Step 2 for live accounts (no extra role beyond “owns this account”).

**1.3 — Rate limits / abuse**
Document any **upload quotas, size limits, or throttling** for product copy (if different from Step 2).

### 2. W2 PATCH semantics (logo-only and clear)

**2.1 — Logo-only PATCH**
Is `PATCH …/onboarding/step-2` with body **only** `{ "logoMediaId": \<number\> }` (after M1) valid when the account **already has** a `themeId`?

**2.2 — Clearing the logo**
Is **`logoMediaId: null`** supported to remove the logo and clear **`onboardingLogo`** on subsequent `GET …/branding`? If not, what is the supported **clear** flow?

**2.3 — Request body shape**
Confirm canonical accepted shapes: flat `{ "logoMediaId": 123 }` vs wrapped `{ "data": { "logoMediaId": 123 } }` — and what the app **should** standardise on.

**2.4 — Idempotency**
PATCH with the **same** `logoMediaId` as stored: expected status and any side effects?

**2.5 — M1 → W2 sequencing**
Confirm required sequence: **upload returns id → PATCH with that id**; no other mandatory PATCH fields for logo-only.

### 3. M1 upload contract

**3.1 — Multipart field name**
Confirm **`file`** (and whether **`files`** remains supported).

**3.2 — Allowed MIME types**
List allowed image MIME types (e.g. `image/png`, `image/jpeg`, `image/webp`).

**3.3 — Max file size**
Hard limit (MB or bytes) for client validation and error copy.

**3.4 — Success response**
Confirm `{ "data": { "id": \<number\> } }` and HTTP **200 vs 201**.

**3.5 — Error contract**
Status codes and stable error shape for type/size/dimension failures so the app can show useful messages.

### 4. Read path: `onboardingLogo` and recrop

**4.1 — URL stability and access**
Is **`onboardingLogo.url`** always a URL the **browser can GET** without extra headers? If auth is required, describe how.

**4.2 — Resolution / formats**
Does `url` point to **original**, a **single derivative**, or **configurable** formats? If only a small derivative is returned, do we need a **second URL** (e.g. original / large) on the branding payload?

**4.3 — Dimensions**
Confirm **`width` / `height`** match the same asset as **`url`** for client min-dimension rules.

**4.4 — CORS**
If media is on another origin, confirm CORS allows the members origin to **GET** the image for canvas/cropper use.

### 5. Consistency after W2

**5.1 — Cache / eventual consistency**
Should `GET …/branding` immediately reflect a new logo after W2? Any delay to design for (retry/polling)?

**5.2 — Media deletion**
On replace, is the **previous** file orphaned, replaced, or versioned?

### 6. Alignment with branding PATCH

**6.1 — Single write path**
Confirm the only supported **production** write path for **`onboardingLogo`** is **M1 + W2** unless `PATCH …/branding` gains `logoMediaId`.

**6.2 — Future API**
If `PATCH …/branding` will accept `logoMediaId`, share timeline or spec for migration without breaking clients.

### 7. App-side intent (for CMS awareness)

- Logo UI: upload + crop; client validation aligned with **size/MIME** once documented.
- Save: **M1 then W2**, then invalidate **`GET …/branding`**.
- Clear: only if **`logoMediaId: null`** (or documented equivalent) is supported.

### Summary table (quick CMS answers)

| #   | Topic            | What we need                                                           |
| --- | ---------------- | ---------------------------------------------------------------------- |
| 1   | Lifecycle        | M1/W2 allowed after onboarding? Conditions?                            |
| 2   | W2               | Logo-only PATCH; clear logo; body shape; idempotency                   |
| 3   | M1               | Field name, MIME, max size, errors                                     |
| 4   | Read URL         | Original vs derivative; browser access; extra URL for recrop if needed |
| 5   | Read after write | Immediate consistency; old file handling                               |
| 6   | Strategy         | Canonical logo write path; future branding PATCH                       |

---

## Backend implementation facts (this repo)

These reflect **`src/api/account`** and related services as of the briefing date. **CMS** should confirm they match **intended product policy** (especially post-onboarding use).

### Routes and permissions

- **`GET/PATCH /accounts/:accountId/branding`** — `getAccountBranding` / `saveAccountBranding`; PATCH does **not** handle `logoMediaId` in `saveAccountBranding`.
- **`PATCH /accounts/:accountId/onboarding/step-2`** — `updateOnboardingStep2` → `applyOnboardingStep2Update`.
- **`POST /accounts/:accountId/onboarding/step-2/upload`** — `uploadOnboardingStep2`.

All use JWT + Account permissions (`updateOnboardingStep2`, `uploadOnboardingStep2`, etc.); routes list **empty `policies`** — behaviour is in handlers + ownership checks.

### Lifecycle (post-onboarding)

- **`persistOnboardingProgressAfterStep`** does **not** block Step 2 when **`onboardingWizardCompletedAt`** is set; it returns a lifecycle snippet and skips wizard field updates.
- So **M1/W2 are not gated** on “wizard still in progress” in current code.

### Ownership

- Step 2 PATCH: account must match **`{ id: accountId, user: userId }`**.
- Upload: **`validateAccountOwnership`** before upload.

### W2 behaviour

- Known keys: **`themeId`**, **`logoMediaId`**; at least one required (else `400` **`EMPTY_UPDATE`**).
- Body: **flat** or **`{ data: { … } }`** (unwrap in `applyOnboardingStep2Update`).
- **Logo-only** PATCH is valid: e.g. `{ "logoMediaId": 123 }`.
- **`logoMediaId: null`**: clears club/association **`Logo`**; **`409`** **`ORGANISATION_REQUIRED`** if club/association missing.
- Non-null `logoMediaId`: must exist in upload plugin and **`mime` starts with `image/`** (else `400` **`UNKNOWN_MEDIA`** / **`INVALID_LOGO_MIME`**).
- Success: **`200`** with **`{ data: { accountId, themeId, logoMediaId, …lifecycle } }`** (no `201` on PATCH).
- Errors: **`{ error: { code, message } }`** with appropriate HTTP status.

### M1 behaviour

- Multipart: field **`file`** or **`files`** (first file used).
- Success: **`201`** **`{ data: { id } }`**.
- No app-level MIME/size checks in the handler; uses Strapi **`upload`** + S3 config in `config/plugins.js` (no `sizeLimit` / `allowedTypes` in that file).
- Unexpected failures: generic **500** message from controller catch.

### Read path (`GET /branding`)

- **`onboardingLogo`**: from club or association **`Logo`**, formatted as **`id`, `url`, `width`, `height`, `mime`, `alternativeText`** (`getAccountBrandingPayload`).
- No second URL for originals/large variants in this DTO.
- Replacing logo updates relation only; **old upload record not deleted** in this code path.

### Canonical write path for logo today

- **M1 + W2** only; not **`PATCH /branding`**.

---

## What we need from FED (members app / BFF)

Use this as a checklist so backend/CMS and FE stay aligned.

### BFF and routing

- [ ] Confirm **exact proxied paths** for M1, W2, and `GET …/branding` (no accidental prefix or host drift).
- [ ] Confirm **JWT** is forwarded on all three (multipart included for M1).
- [ ] Document whether the BFF rewrites responses or errors (must preserve **`error.code`** / **`error.message`** for mapping).

### Request shape and client behaviour

- [ ] Standardise **one** W2 JSON shape (**flat** vs **`{ data }`**) in the client; server accepts both.
- [ ] Multipart field name: prefer **`file`** everywhere (aligns with backend message if `files` is legacy).
- [ ] After successful W2, confirm **cache invalidation** / refetch strategy for **`GET …/branding`** (SWR/React Query keys, etc.).

### Errors and UX

- [ ] Map backend **`code`** values to UI: e.g. **`ORGANISATION_REQUIRED`**, **`INVALID_LOGO_MIME`**, **`UNKNOWN_MEDIA`**, **`EMPTY_UPDATE`**, **`INVALID_BODY`** — including **clear-logo** when user has no org row.
- [ ] **Upload failures**: backend may return generic **500** from M1; define fallback copy and whether to surface **Sentry**/support ID.
- [ ] **409** on clear: product decision — block clear, or hide clear when org missing?

### Recrop and media URL

- [ ] Confirm **`onboardingLogo.url`** loads in the **browser** for the cropper (no credentialed fetch required, or document if it is).
- [ ] If **CORS** or **private bucket** blocks canvas reads, flag early; CMS may need **CORS rules** or a **proxy URL** through the BFF.
- [ ] **`width` / `height`**: confirm FE uses them for min-size messaging consistent with crop output.

### Validation alignment

- [ ] Once CMS answers **M1 MIME + max size**, align **client-side** validation and strings.
- [ ] Document any **extra** FE rules (min crop dimensions, output resolution) in product copy so they are not mistaken for server rules.

### Permissions and roles

- [ ] Confirm which **Strapi role** the members app uses and that **`uploadOnboardingStep2`** and **`updateOnboardingStep2`** are enabled (same as onboarding Step 2).
- [ ] If logo maintenance is **owner-only** in product, confirm FE **gates route** or handles **403** from API.

### Analytics / product

- [ ] Events for: upload started, crop confirmed, save success/fail, clear logo (if applicable).
- [ ] Copy for “change logo after setup” vs wizard Step 2 (if different).

### Future migration

- [ ] If CMS later adds **`logoMediaId`** to **`PATCH /branding`**, FED should plan a **single** save path to avoid splitting logo across two PATCH styles.

---

## Related docs

- `src/api/account/.comms/frontend-handoff-patch-account-branding-save.md` — palette + template mode (`PATCH /branding`); **not** logo.

---

## Revision

| Date       | Change                                               |
| ---------- | ---------------------------------------------------- |
| 2026-04-30 | Initial combined CMS + backend facts + FED checklist |
