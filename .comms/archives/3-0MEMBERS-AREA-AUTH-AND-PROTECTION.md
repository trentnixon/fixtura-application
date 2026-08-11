# Fixtura Members Area — Auth and Protection Strategy

## 1. Purpose

This document defines how authentication and route protection are implemented for the Fixtura Members Area.

It covers:

- Strapi JWT authentication flow
- token storage strategy
- middleware protection rules
- session handling
- authenticated API access
- logout and session expiry handling

This is the **core security and access control layer** of the application.

### Implementation status (code)

| Area                       | Implementation                                                                                                                                                                                                                                                    |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login / cookie             | [`src/app/api/auth/login/route.ts`](../src/app/api/auth/login/route.ts) sets httpOnly JWT; [`auth-cookie.ts`](../src/lib/auth/auth-cookie.ts)                                                                                                                     |
| Middleware                 | [`src/middleware.ts`](../src/middleware.ts) — cookie **presence** for `/app/*`; `/login` redirects if cookie present                                                                                                                                              |
| Session API                | [`GET /api/auth/session`](../src/app/api/auth/session/route.ts) — JWT `exp` decode via [`jwt-payload.ts`](../src/lib/auth/jwt-payload.ts); malformed / expired → not authenticated                                                                                |
| Client boundary            | [`MembersSessionBoundary`](../src/components/auth/members-session-boundary.tsx) — UX session check; signs out + redirect if invalid                                                                                                                               |
| Browser API                | [`apiFetch`](../src/lib/api/api-client.ts) / [`parseJsonOrThrow`](../src/lib/api/api-client.ts) — 401 → logout + `getSessionInvalidRedirectUrl()` (e.g. `/login?reason=session`); 403 → [`AccessDeniedState`](../src/components/feedback/access-denied-state.tsx) |
| Logout redirect            | [`getLogoutRedirectPath()`](../src/lib/config/logout-redirect.ts) / `NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT`                                                                                                                                                            |
| Session-expired UX         | [`getSessionInvalidRedirectUrl()`](../src/lib/config/auth-redirect.ts) + login banner when `reason=session` ([`login-form.tsx`](../src/components/auth/login-form.tsx))                                                                                           |
| Server → Strapi (user JWT) | [`fetchStrapiWithAuthCookie`](../src/lib/strapi/server.ts) for Route Handlers (optional use)                                                                                                                                                                      |

**Deferred (not in early build):** Strapi round-trip token introspection on every request; refresh-token rotation; Edge middleware JWT parsing.

---

## 2. Core Principles

### Centralised Protection

All route access must be enforced via middleware.

### Single Source of Truth

Authentication state must not be duplicated across components.

### Predictable Behaviour

Auth flow must behave consistently across all routes.

### Secure by Default

Protected routes must never render without validation.

---

## 3. Authentication Flow (Strapi JWT)

### Step-by-step

1. User submits login form
2. Request sent to Strapi auth endpoint
3. Strapi returns:
   - JWT token
   - user object (optional)
4. Token is stored (strategy defined below)
5. User is redirected to `/app`
6. Subsequent requests include JWT

---

## 4. Token Storage Strategy

### Recommended Approach: HTTP-Only Cookies

**Why:**

- protects against XSS
- works with middleware
- safer for production

---

### Storage Rules

- JWT stored in HTTP-only cookie
- cookie is:
  - secure (in production)
  - sameSite = strict or lax
- no direct access from client JS

---

### Alternative (Not Preferred)

- localStorage
- sessionStorage

**Risks:**

- vulnerable to XSS
- harder to protect routes at middleware level

---

## 5. Middleware Strategy

Middleware runs on every request and enforces access control.

---

### Middleware Responsibilities

- check for auth cookie
- determine route type
- redirect based on auth state

---

### Route Classification

| Route Type | Example  | Requires Auth |
| ---------- | -------- | ------------- |
| Public     | `/`      | ❌            |
| Auth       | `/login` | ❌            |
| Protected  | `/app/*` | ✅            |

---

### Middleware Logic

#### If route is protected:

- no token → redirect to `/login`
- token present → allow

---

#### If route is auth (`/login`):

- token present → redirect to `/app`
- no token → allow

---

#### If route is public:

- always allow

---

## 6. Middleware Implementation Notes

- must ignore:
  - static assets
  - API routes (unless intentionally protected)
- should be fast and lightweight
- should not call external APIs unless necessary

---

## 7. Session Validation

### Middleware (route gate)

- **Cookie presence** on protected routes = allow (fast; no JWT decode in Edge).

---

### Session route + client boundary (UX)

- [`GET /api/auth/session`](../src/app/api/auth/session/route.ts) decodes JWT payload (no signature verification) and treats missing/invalid payload or **past `exp`** as unauthenticated.
- Tokens **without** an `exp` claim are treated as still valid for session UX until an API returns 401.
- [`MembersSessionBoundary`](../src/components/auth/members-session-boundary.tsx) uses this for protected-shell UX (sign out + redirect when session is not usable).

---

### Optional enhancement (future)

- Validate JWT with Strapi (or JWKS) on the server when needed.
- Refresh-token flow (requires Strapi/plugin configuration).
- Per-request expiry in middleware (Edge-safe decode) — only if product requires zero client flash.

---

## 8. Auth-Aware API Client

All API calls must go through a central client.

---

### Responsibilities

- **Browser:** same-origin `fetch` sends the httpOnly cookie automatically; no `Authorization` header in client JS.
- **Server:** for Strapi proxies, use [`fetchStrapiWithAuthCookie`](../src/lib/strapi/server.ts) (reads JWT from cookies server-side only).
- standardise JSON parsing and errors via [`parseJsonOrThrow`](../src/lib/api/api-client.ts).

---

### Behaviour on Auth Failure

If API returns:

#### 401 Unauthorized

- assume session expired or invalid
- trigger logout flow
- redirect via [`getSessionInvalidRedirectUrl()`](../src/lib/config/auth-redirect.ts) — default `/login?reason=session` so the login page can show [`AUTH_ERROR_MESSAGES.sessionExpired`](../src/lib/auth/auth-errors.ts)

---

#### 403 Forbidden

- show access denied message
- do not logout automatically

---

## 9. Client-Side Auth Awareness

Even though middleware protects routes, the UI still needs awareness.

---

### Use Cases

- show loading state while session resolves
- handle API-triggered logout
- display user-specific UI (optional)

---

### Strategy

- lightweight auth context or hook
- do NOT duplicate auth logic
- rely on middleware as source of truth

---

## 10. Login Flow Details

### On Submit

- disable form
- show loading state
- send request to Strapi

---

### On Success

- store token in cookie (via API route or server action)
- redirect to `/app`

---

### On Failure

Show appropriate message:

- invalid credentials
- network error
- server unavailable

---

## 11. Logout Flow

### Steps

1. remove auth cookie
2. clear client state
3. redirect to `/login` or `/`

---

### Trigger Points

- manual logout
- API 401 response
- token expiry detection

---

## 12. Session Expiry Handling

When session becomes invalid:

### Behaviour

- redirect to `/login` with query `reason=session` when the configured post-auth-failure path is `/login` (see [`getSessionInvalidRedirectUrl()`](../src/lib/config/auth-redirect.ts))
- login page shows the copy from [`AUTH_ERROR_MESSAGES.sessionExpired`](../src/lib/auth/auth-errors.ts) in [`LoginForm`](../src/components/auth/login-form.tsx) when `reason=session`
- if `NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT` is `/` (or another non-login path), user is sent there **without** the query param; messaging on the marketing site is out of scope for this doc

---

### Requirements

- must not leave user in broken state
- must be consistent across app

---

## 13. Redirect Rules

### After Login

- redirect to `/app`
- optionally support return URL

---

### After Logout

- redirect target from [`getLogoutRedirectPath()`](../src/lib/config/logout-redirect.ts) (default `/login`; override with `NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT`)

---

### After session invalidation (401, expired JWT in session flow)

- redirect via [`getSessionInvalidRedirectUrl()`](../src/lib/config/auth-redirect.ts) — appends `reason=session` when landing on `/login`

---

### Unauthorized Access

- middleware: unauthenticated access to `/app/*` → `/login` (optional `from=` query)

---

## 14. Security Considerations

- never expose JWT in client JS
- never trust client-side auth state
- avoid storing sensitive data in localStorage
- always validate protected routes in middleware
- sanitise API responses if needed

---

## 15. Decision Log (Critical)

These decisions must be locked before implementation:

### 1. Token storage

→ HTTP-only cookies (recommended)

### 2. Middleware enforcement

→ ALL protected routes go through middleware

### 3. API auth handling

→ centralised fetch wrapper

### 4. 401 behaviour

→ force logout + redirect

### 5. Login handling

→ handled via API route or server action

---

## 16. Failure Scenarios Covered

- invalid login
- missing token
- expired token
- unauthorized route access
- API auth failure
- logout edge cases

---

## 17. Summary

This strategy ensures:

- strong route protection
- secure token handling
- predictable authentication flow
- clean separation of concerns
- scalable foundation for future access control

---
