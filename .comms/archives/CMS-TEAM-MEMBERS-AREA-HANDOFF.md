# CMS team handoff — Fixtura Members Area (Next.js ↔ Strapi)

**Audience:** Strapi / CMS engineers and operators  
**Purpose:** Summarise what the application team shipped, what you need to know to operate and extend the integration, what (if anything) must exist on Strapi, and where to go next.  
**Date:** 2026-04-01

---

## 1. What we built (application side)

The Next.js app includes an initial **members area shell**: public pages, a **login** flow, and **protected routes** under `/app/*`. Authentication is **Strapi JWT** via the standard **Users & Permissions** plugin endpoint.

**High-level flow**

1. The browser posts credentials to the **Next.js** API route `POST /api/auth/login` (not directly to Strapi from the browser for the token).
2. The Next.js server calls Strapi `POST {STRAPI_URL}/api/auth/local` with `{ identifier, password }`.
3. On success, Strapi returns a **JWT**; Next.js stores it in an **HTTP-only cookie** (`fixtura_members_jwt` by default). The client JavaScript never reads the raw token.
4. **Route protection** uses Next.js **middleware** (cookie presence for `/app/*`). Deeper checks (expired JWT, etc.) happen in **session/API** layers as documented in the repo.
5. **Logout** clears the cookie via `POST /api/auth/logout` on the Next app.
6. **Session awareness** for the UI uses `GET /api/auth/session` on the Next app (reads the cookie server-side and checks JWT validity/expiry for UX — not a substitute for middleware).

**Server-side Strapi access from Next**  
For future features, server code can call Strapi with the user’s JWT using `fetchStrapiWithAuthCookie` (see `src/lib/strapi/server.ts`): `Authorization: Bearer <jwt>` to paths under your Strapi base URL.

---

## 2. What you need to know

### 2.1 Environment and connectivity

| Item             | Detail                                                                                                                                                 |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`STRAPI_URL`** | Set on the **Next.js server** only (no `NEXT_PUBLIC_` prefix). Base URL, no trailing slash, e.g. `https://cms.example.com` or `http://localhost:1337`. |
| **Reachability** | The Next.js **deployment** must be able to reach Strapi over HTTPS (or HTTP in dev) for `POST /api/auth/local` and any server-side `fetch` to Strapi.  |
| **Secrets**      | JWT secret and Strapi admin credentials live in **Strapi**; the Next app does not embed Strapi’s private keys.                                         |

### 2.2 Strapi API contract in use today

| Endpoint (on Strapi)   | Used for                                                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `POST /api/auth/local` | Login. Body: `{ "identifier": "<string>", "password": "<string>" }`. Response must include a string `jwt` on success. |

**Identifiers**  
The app sends whatever the user enters as `identifier`. Per the CMS backend, `POST /api/auth/local` accepts **either email or username** (standard Users & Permissions behaviour). The Next UI may label the field “email”; the value must match one of the identifiers stored for that user in Strapi. See [responses/CMS-TEAM-MEMBERS-AREA-RESPONSES.md](./responses/CMS-TEAM-MEMBERS-AREA-RESPONSES.md) §2.

### 2.3 Token shape and lifetime

- The app stores the **Strapi-issued JWT** in a cookie with a **7-day** `maxAge` (see `src/lib/auth/auth-cookie.ts` / `auth-constants.ts`). JWT **expiry** is still enforced when the client/session layer decodes the token.
- If you change JWT expiry or signing in Strapi, coordinate with the app team so session UX and Strapi expectations stay aligned.

### 2.4 What the app does _not_ do yet

- **No refresh-token flow** in this phase (see technical decisions in-repo).
- **No RBAC / admin-vs-member** split in the app shell yet.
- **No requirement** for custom Strapi content types beyond standard Users for the login flow itself.

---

## 3. What we need building (if anything)

**For the current login + protected shell:**  
**Nothing beyond a working Strapi instance with Users & Permissions and `POST /api/auth/local` returning a JWT** — assuming users exist and can authenticate.

**Optional / product-dependent (not required for the shell to work):**

| Topic                     | When it matters                                                                                                                                                          |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **User fields / profile** | If the product later shows member profile data from Strapi, define content types and permissions and wire Next routes or server components to those APIs.                |
| **CORS**                  | Browser-to-Strapi calls are **not** used for login (Next proxies). If you add **client-side** Strapi calls later, CORS must be configured on Strapi for the Next origin. |
| **Webhooks / preview**    | Only if the product adds CMS-driven previews or sync; not part of this handoff.                                                                                          |

If CMS is planning **new APIs** that the Next app will call with the member JWT, share **OpenAPI or route list + permission model** + staging base URL so the app team can wire `fetchStrapiWithAuthCookie` (or equivalent) consistently.

---

## 4. Further information

### 4.1 Documentation in this repo (`.comms/`)

| Document                                                                                       | Purpose                                                                                                                    |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| [responses/CMS-TEAM-MEMBERS-AREA-RESPONSES.md](./responses/CMS-TEAM-MEMBERS-AREA-RESPONSES.md) | **CMS / backend answers** to §4.3 (URLs per env, identifier rules, registration/reset, rate limits) + integration process. |
| [7-MEMBERS-AREA-TECHNICAL-DECISIONS.md](./7-MEMBERS-AREA-TECHNICAL-DECISIONS.md)               | Locked decisions on auth, cookies, middleware, redirects, error handling.                                                  |
| [3-0MEMBERS-AREA-AUTH-AND-PROTECTION.md](./3-0MEMBERS-AREA-AUTH-AND-PROTECTION.md)             | Auth and protection behaviour (aligned with implementation).                                                               |
| [8-MEMBERS-AREA-BUILD-CHECKLIST.md](./8-MEMBERS-AREA-BUILD-CHECKLIST.md)                       | Build/validation checklist; Phase 7 section records shell completion notes.                                                |
| [.env.example](../.env.example)                                                                | Minimal template; see [ENVIRONMENT-AND-CONFIG-REFERENCE.md](./ENVIRONMENT-AND-CONFIG-REFERENCE.md) for full list.          |
| [ENVIRONMENT-AND-CONFIG-REFERENCE.md](./ENVIRONMENT-AND-CONFIG-REFERENCE.md)                   | All `.env` variables, Sentry/PostHog, and non-env config.                                                                  |

### 4.2 Key code touchpoints (for engineers)

- `src/app/api/auth/login/route.ts` — Strapi `POST /api/auth/local` and cookie set.
- `src/app/api/auth/logout/route.ts` — cookie clear.
- `src/app/api/auth/session/route.ts` — session JSON for UI.
- `src/lib/strapi/server.ts` — authenticated server-side Strapi `fetch`.
- `src/lib/config/env.ts` — `STRAPI_URL` helper.

### 4.3 Questions for CMS — answered

The Strapi / CMS team has responded to these points in **[responses/CMS-TEAM-MEMBERS-AREA-RESPONSES.md](./responses/CMS-TEAM-MEMBERS-AREA-RESPONSES.md)** (summary below). For staging/production **base URLs**, ops should still fill the URL table there (or your runbook) and align `STRAPI_URL` on Next.

| Topic                         | Answer (see responses doc for detail)                                                              |
| ----------------------------- | -------------------------------------------------------------------------------------------------- |
| Base URLs per environment     | Local dev `http://localhost:1337`; staging/production from deployment (`MY_HEROKU_URL` etc.).      |
| `identifier`                  | Email **or** username (Users & Permissions); both exist on extended User model.                    |
| Registration / password reset | Strapi Users & Permissions plugin; SendGrid for email; align with app so flows are not duplicated. |
| Rate limits                   | No in-repo auth rate limit on `/api/auth/local`; infra may still apply limits.                     |

**Open actions for operators:** complete SendGrid + Users & Permissions checklist in the responses doc per environment.

---

## 5. Contact / ownership

Use your normal Fixtura / product channel for **integration questions** or **changes to auth** (e.g. OAuth, custom JWT claims). This document is a **reference handoff**; the canonical technical decisions remain in [7-MEMBERS-AREA-TECHNICAL-DECISIONS.md](./7-MEMBERS-AREA-TECHNICAL-DECISIONS.md) unless superseded by a newer decision record.
