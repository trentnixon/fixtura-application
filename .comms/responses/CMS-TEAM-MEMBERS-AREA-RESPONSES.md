# CMS / Backend responses — Members area handoff (§4.3)

**Audience:** Application team, members product, and anyone integrating with Strapi for the members area  
**Purpose:** Authoritative answers from the Strapi backend to the questions in [CMS-TEAM-MEMBERS-AREA-HANDOFF.md](../CMS-TEAM-MEMBERS-AREA-HANDOFF.md) §4.3, plus the process we follow for new integration requests.  
**Date:** 2026-04-01

---

## Answers to §4.3 “Questions for CMS”

### 1. Canonical Strapi base URL(s) per environment (dev / staging / production)

| Environment    | Canonical base URL (no trailing slash) | How it is determined                                                                                                                                       |
| -------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Local dev**  | `http://localhost:1337`                | Default port from `config/server.js` (`PORT` defaults to 1337).                                                                                            |
| **Staging**    | _Fill in when a staging app exists_    | Not encoded in this repo. Use the staging deployment’s public HTTPS URL (e.g. separate Heroku app or subdomain).                                           |
| **Production** | _Fill from deployment config_          | `config/env/production/server.js` sets `url` from **`MY_HEROKU_URL`**. Copy the exact value from the Heroku (or equivalent) config for the production app. |

**Instructions for operators**

- Maintain the **filled** table above (or your internal runbook) and share the same values with the Next.js team for `STRAPI_URL` per environment.
- Never commit live production URLs if your policy forbids it; placeholders here are intentional until ops pastes approved values.

---

### 2. Whether `identifier` is always email or also username

- The extended User model requires **both** `username` and `email` (`src/extensions/users-permissions/content-types/user/schema.json`).
- Strapi **Users & Permissions** `POST /api/auth/local` accepts **`identifier`** as **either** the user’s **email** or **username** (standard plugin behaviour), matching whatever was stored for that account.

**Product / contract**

- The Next app may label the field “email” in the UI; users must still enter a value that matches **one** of those identifiers in Strapi.
- If the product should allow **only** email login, that is a **product + optional policy** decision (e.g. custom validation); it is not enforced by the schema alone.

---

### 3. User registration / password reset — Strapi vs another system

- **Email delivery** for plugin flows uses **SendGrid** (`config/plugins.js`: `SENDGRID_API_KEY`, `defaultFrom`, `defaultReplyTo`).
- There is **no separate IdP** implemented in this repo for members; account data lives in Strapi Users & Permissions (with extensions such as the `account` relation).

**Registration, forgot-password, and reset-password**

- These are **Strapi Users & Permissions** capabilities. Whether each is **enabled** and which **roles** may call them is configured in **Strapi Admin** → Settings → Users & Permissions (not visible as fixed “on/off” in git).

**Avoid duplication**

- Align with the app team so the Next app calls the **same** Strapi endpoints (or a documented BFF) rather than duplicating user storage or email flows.

---

### 4. Rate limits or IP rules affecting Next.js server-to-server login

- `config/middlewares.js` uses the **standard Strapi middleware stack** only; there is **no** project-registered middleware here that applies `koa2-ratelimit` (or similar) to `/api/auth/local`.
- **Infrastructure** (Heroku, CDN, WAF, firewall, bot protection) may still throttle or block traffic by IP or volume; that is outside this repository.

**What to tell the app team**

- **Application config in repo:** No dedicated rate limit for auth is defined in our middleware list.
- **Operations:** Confirm with hosting/security whether limits could affect the Next deployment’s outbound requests to Strapi.

---

## Process for new requests (members / CMS / app integration)

Use this loop for each new feature that touches Strapi and the members app.

1. **Intake** — Record the request under `.comms/` (who, what API, auth model, example payloads, environments). Link [CMS-TEAM-MEMBERS-AREA-HANDOFF.md](../CMS-TEAM-MEMBERS-AREA-HANDOFF.md) and any OpenAPI or route list.
2. **Scope** — Decide **Strapi-only**, **Next-only**, or **both**. JWT-authenticated routes need correct **Users & Permissions** (or custom policies) and documented headers (`Authorization: Bearer <jwt>`).
3. **Implement (Backend)** — Add or change APIs under `src/api/*` or extensions; match existing patterns and policies.
4. **Build** — `npm run build` (`strapi build`) before release; use `npm run dev` / `strapi develop` locally while iterating.
5. **Deploy** — Deploy via your usual path (e.g. Heroku). Ensure **`MY_HEROKU_URL`** (production) and other secrets match the target environment.
6. **Hand back** — Give the app team **base URL**, **routes**, **methods**, **bodies**, and **permission rules** (e.g. Authenticated role).
7. **Verify** — End-to-end on staging: Next `STRAPI_URL` → Strapi → login/session behaviour as required.

---

## Checklist: SendGrid and Users & Permissions (per environment)

Complete this for **each** environment where members auth is tested or live. Values are **not** asserted from git—confirm in Admin and deployment config.

### SendGrid (`config/plugins.js`)

- [ ] `SENDGRID_API_KEY` is set on the deployment.
- [ ] Test email (registration confirmation / password reset) is received when flows are enabled.
- [ ] `defaultFrom` / `defaultReplyTo` are acceptable for production sender reputation.

### Users & Permissions (Strapi Admin)

- [ ] **Register** — Enabled only if product should allow self-sign-up; **Public** role permissions reviewed.
- [ ] **Forgot password / Reset password** — Enabled as needed; email templates and redirect URLs (if used) configured.
- [ ] **Email confirmation** — `confirmed` behaviour matches product (require confirmation vs not).
- [ ] **Authenticated** role can access any new member APIs you add.

**Owner / date verified:** **\*\*\*\***\_**\*\*\*\***

---

## Related

- [CMS-TEAM-MEMBERS-AREA-HANDOFF.md](../CMS-TEAM-MEMBERS-AREA-HANDOFF.md) — App team handoff and §4.3 question list
- `config/server.js`, `config/env/production/server.js` — URL and port behaviour
- `config/plugins.js` — SendGrid email plugin
