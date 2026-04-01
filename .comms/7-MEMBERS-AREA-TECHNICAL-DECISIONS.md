# Fixtura Members Area — Technical Decisions

## 1. Purpose

This document records the key technical decisions for the initial Fixtura Members Area shell build.

Its purpose is to:

- lock implementation direction
- prevent architectural drift
- create a single source of truth for major auth and shell decisions
- reduce ambiguity during development

This document applies only to the **initial protected shell build**.

---

## 2. Decision-Making Principles

Technical decisions for this phase should follow these rules:

- prefer production-safe defaults
- keep protection centralised
- avoid unnecessary complexity in the initial build
- choose patterns that support future growth
- separate structural concerns from future feature concerns

---

## 3. Locked Decisions

---

## Decision 01 — Authentication Method

### Decision

Use **Strapi JWT authentication** as the authentication mechanism for the members area.

### Why

- already aligned with the current backend direction
- simple and established auth model
- supports protected API access cleanly
- suitable for the initial shell build

### Notes

This phase only covers login/session protection, not advanced identity or permissions systems.

---

## Decision 02 — Token Storage Strategy

### Decision

Store the JWT in an **HTTP-only cookie**.

### Why

- safer than localStorage or sessionStorage
- supports middleware-based route protection
- reduces exposure to client-side script access
- more production-appropriate for a protected application area

### Implementation Direction

- cookie should be `httpOnly`
- cookie should be `secure` in production
- cookie should use an appropriate `sameSite` policy
- cookie management should be centralised

### Rejected Alternative

Store token in localStorage.

### Why Rejected

- weaker security posture
- harder to protect routes at middleware level
- increases risk of auth logic spreading into client code

---

## Decision 03 — Route Protection Layer

### Decision

Use **Next.js middleware** as the central route protection layer.

### Why

- allows protection before protected routes render
- keeps access control out of page components
- creates predictable and enforceable route behaviour
- aligns with production app expectations

### Notes

Middleware is responsible for access enforcement, not business logic.

---

## Decision 04 — Protected URL Namespace

### Decision

All protected members-area routes will live under:

```txt
/app/*
```

### Why

- creates a clear and predictable protected namespace
- simplifies middleware rules
- makes route intent immediately obvious
- supports future protected expansion cleanly

### Notes

Public and auth routes must remain outside this namespace.

---

## Decision 05 — Public and Private Shell Separation

### Decision

Use separate route groups and layout files for:

- public shell
- auth shell
- private app shell

### Why

- ensures clean UI separation
- avoids state coupling between public and private surfaces
- supports different layout, navigation, and behaviour models
- prevents auth logic leaking into public pages

---

## Decision 06 — Login Handling Pattern

### Decision

The login form will submit to an internal Next.js API route, which will communicate with Strapi and set the auth cookie.

### Why

- keeps cookie-setting logic on the server boundary
- avoids exposing token handling directly in client code
- creates a clean seam between UI and backend auth handling
- easier to standardise response handling

### Notes

The client should never be responsible for manually storing the JWT.

---

## Decision 07 — Logout Handling Pattern

### Decision

Logout will be handled through an internal API route that clears the auth cookie and returns a clean logout response.

### Why

- centralises logout behaviour
- avoids duplicated cookie-clearing logic
- ensures session cleanup is consistent
- supports logout from multiple UI entry points

---

## Decision 08 — Session Validation for Initial Build

### Decision

For the initial shell build, route protection will rely on **presence of the auth cookie** rather than deep token validation on every request.

### Why

- keeps middleware lightweight
- avoids unnecessary per-request backend calls in the initial build
- suitable for the shell scaffolding phase

### Tradeoff

A token may exist but already be invalid or expired.

### Handling

That case will be handled at the API/session layer:

- failed authenticated API call
- session route check
- forced logout when invalid session is detected

---

## Decision 09 — Auth Session Awareness in UI

### Decision

Use a **lightweight auth/session awareness layer** in the UI, but do not make it the source of truth for protection.

### Why

- UI still needs session-aware behaviour
- supports loading states, logout, and expired-session handling
- avoids placing protection responsibility on client state

### Rule

Middleware is the protection layer.
Client session state is a UX layer.

---

## Decision 10 — API Access Pattern

### Decision

All authenticated requests must go through a **centralised API client wrapper**.

### Why

- prevents duplicated request logic
- standardises error handling
- centralises auth header behaviour
- makes 401/403 handling predictable

### Rule

Components should not invent their own auth fetch logic.

---

## Decision 11 — 401 Unauthorized Handling

### Decision

A `401 Unauthorized` response should be treated as an invalid or expired session.

### Behaviour

- clear session
- redirect user to `/login`
- show standard expired-session message

### Why

- keeps auth failure behaviour consistent
- avoids leaving the user inside a broken protected area

---

## Decision 12 — 403 Forbidden Handling

### Decision

A `403 Forbidden` response should **not** automatically log the user out.

### Behaviour

- keep session intact
- show access denied state/message

### Why

- user may still be authenticated
- forbidden is an authorization issue, not necessarily an authentication failure

---

## Decision 13 — Redirect After Login

### Decision

Default post-login redirect goes to:

```txt
/app
```

### Why

- gives a stable initial landing point
- simple for first-phase protected shell

### Return URL after login

Safe return via `?from=` (pathname + optional query) is implemented for the shell; see [`safe-return-path.ts`](../src/lib/config/safe-return-path.ts) and middleware. Further edge cases can be ticketed separately.

---

## Decision 14 — Redirect After Logout

### Decision

Default logout redirect goes to:

```txt
/login
```

### Why

- makes logout outcome clear
- keeps the user at the auth entry point
- avoids ambiguity about current session state

---

## Decision 15 — Handling Authenticated Users on Login Page

### Decision

Authenticated users visiting `/login` should be redirected to `/app`.

### Why

- prevents confusing access to the login page while signed in
- creates clean, expected navigation behaviour
- reduces duplicate auth state handling in the login UI

---

## Decision 16 — Error Handling Structure

### Decision

Use Next.js error boundaries and shared feedback components for production-safe failure handling.

### Why

- keeps route failures isolated
- prevents full-app crashes
- supports consistent recovery UI

### Minimum Required

- `error.tsx`
- `not-found.tsx`
- shared reusable error-state components

---

## Decision 17 — User Messaging Tone

### Decision

All auth and system messages should be:

- clear
- calm
- direct
- non-technical

### Why

- improves product feel
- reduces user confusion
- avoids exposing technical implementation details

### Rule

Never show raw backend or exception messages directly to users.

---

## Decision 18 — Middleware Scope

### Decision

Middleware should only handle:

- route classification
- auth cookie inspection
- redirect enforcement

### Why

- keeps middleware small and predictable
- reduces performance risk
- avoids business logic in the request edge layer

### Rule

Do not place application feature logic in middleware.

---

## Decision 19 — Placeholder Protected Pages

### Decision

Include minimal placeholder protected pages in the initial build to validate the shell architecture.

### Minimum Suggested Pages

- `/app`
- `/app/home`
- `/app/account`

### Why

- proves routing works
- validates private shell structure
- gives middleware and navigation something real to protect

---

## Decision 20 — Provider Strategy

### Decision

Use providers only where necessary, and keep auth concerns minimal.

### Why

- avoids unnecessary app-wide complexity
- prevents over-abstracting before the shell is stable
- keeps the initial build easier to reason about

### Notes

A lightweight auth provider is acceptable, but must not replace middleware enforcement.

---

## 4. Resolved implementation details (shell build)

Aligned with [`getAuthCookieBaseOptions()`](../src/lib/auth/auth-cookie.ts), [`AUTH_COOKIE_*`](../src/lib/auth/auth-constants.ts), and [`src/app/api/auth`](../src/app/api/auth).

### Cookie settings (locked)

| Setting    | Value                               | Notes                                                                                                                       |
| ---------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Name       | `fixtura_members_jwt`               | Single auth cookie                                                                                                          |
| `httpOnly` | `true`                              | Decision 02                                                                                                                 |
| `secure`   | `true` in production, else `false`  | Local dev over HTTP                                                                                                         |
| `sameSite` | `lax`                               | Balances CSRF and redirect flows                                                                                            |
| `path`     | `/`                                 | Entire app origin                                                                                                           |
| `domain`   | _(default / host-only)_             | Not set in code; use deployment defaults unless cross-subdomain sharing is required                                         |
| `maxAge`   | 7 days (`60 * 60 * 24 * 7` seconds) | Matches `AUTH_COOKIE_MAX_AGE_SECONDS`; JWT expiry is enforced in UI/API via [`jwt-payload`](../src/lib/auth/jwt-payload.ts) |

### Session check endpoint

`GET` [`/api/auth/session`](../src/app/api/auth/session/route.ts) is **required** for the shell: it exposes `{ authenticated: boolean }` using the HTTP-only cookie and JWT `exp` checks for [`MembersSessionBoundary`](../src/components/auth/members-session-boundary.tsx) and related UX. It is not a replacement for middleware protection (Decision 08).

### Redirect memory

Safe post-login return to `/app/*` URLs is **in scope** for the shell (see Decision 13 and [`safe-return-path.ts`](../src/lib/config/safe-return-path.ts)).

---

## 5. Rejected Complexity for This Phase

The following are intentionally not part of the initial shell build:

- refresh token system
- advanced RBAC
- admin/member role segmentation
- deep token introspection on every request
- complex auth provider state machines
- feature-level authorization mapping

These can be planned once the shell is stable.

---

## 6. Decision Summary Table

| Area                 | Decision                                 |
| -------------------- | ---------------------------------------- |
| Auth backend         | Strapi JWT                               |
| Token storage        | HTTP-only cookie                         |
| Route protection     | Next.js middleware                       |
| Protected namespace  | `/app/*`                                 |
| Shell structure      | separate public/auth/app layouts         |
| Login handling       | internal API route                       |
| Logout handling      | internal API route                       |
| Session model        | cookie presence for initial route access |
| UI auth awareness    | lightweight only                         |
| API access           | centralised client wrapper               |
| 401 handling         | logout + redirect to login               |
| 403 handling         | keep session, show access denied         |
| Post-login redirect  | `/app`                                   |
| Post-logout redirect | `/login`                                 |
| Error handling       | Next.js boundaries + shared feedback UI  |

---

## 7. Summary

These decisions define the technical foundation for the initial Fixtura Members Area shell.

They are intended to:

- keep the build secure
- keep the architecture clean
- reduce implementation ambiguity
- support production readiness from the first version

Any deviation from these decisions should be deliberate and documented before implementation begins.

---
