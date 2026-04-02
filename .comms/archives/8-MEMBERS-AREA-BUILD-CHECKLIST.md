# Fixtura Members Area — Build Checklist

## 1. Purpose

This checklist is used to validate the initial Fixtura Members Area shell build as it is implemented.

It covers:

- structure
- routing
- authentication
- route protection
- API handling
- error states
- messaging
- validation

This checklist applies only to the **initial production-ready login and protected shell build**.

### Implementation status (2026-04-01, updated through **Phase 7** — shell completion & validation)

**Naming alignment:** In [`5-MEMBERS-AREA-IMPLEMENTATION-PLAN.md`](./5-MEMBERS-AREA-IMPLEMENTATION-PLAN.md), **Phase 7** is titled “Error Handling & Messaging”. That work is delivered in this repo as checklist **Phase 4** (error/messaging) plus route-group `error.tsx` files. **Phase 7** in this checklist means **post Phases 2–6**: doc alignment, locked technical details in [7-MEMBERS-AREA-TECHNICAL-DECISIONS.md](./7-MEMBERS-AREA-TECHNICAL-DECISIONS.md) §4, automated test runs, engineering sign-off (§16), and optional first `apiFetchJson` usage on a protected page.

Initial shell through **Phase 6** (session handling & UX) is implemented alongside **Phase 5** (API client layer): route groups, [`src/middleware.ts`](../src/middleware.ts) (protected redirects with safe `from`, including query when valid — [`safe-return-path.ts`](../src/lib/config/safe-return-path.ts)), [`src/app/api/auth/*`](../src/app/api/auth), [`src/lib/auth`](../src/lib/auth) ([`auth-errors.ts`](../src/lib/auth/auth-errors.ts), [`logout-client.ts`](../src/lib/auth/logout-client.ts) shared `POST /api/auth/logout`), [`src/lib/api`](../src/lib/api) ([`apiFetch`](../src/lib/api/api-client.ts), [`apiFetchJson`](../src/lib/api/api-client.ts), [`parseJsonOrThrow`](../src/lib/api/api-client.ts), [`index.ts`](../src/lib/api/index.ts)), [`src/lib/config/auth-redirect.ts`](../src/lib/config/auth-redirect.ts), [`src/lib/strapi/server.ts`](../src/lib/strapi/server.ts) (`fetchStrapiWithAuthCookie`), [`src/components/auth`](../src/components/auth) (`MembersSessionBoundary`, `LoginForm`, `LogoutButton`), [`src/hooks/use-session.ts`](../src/hooks/use-session.ts) + [`use-auth-session.ts`](../src/hooks/use-auth-session.ts) re-export, [`src/components/layout/app`](../src/components/layout/app), [`src/app/(app)/loading.tsx`](<../src/app/(app)/loading.tsx>), [`src/app/(public)/error.tsx`](<../src/app/(public)/error.tsx>), [`src/components/feedback/access-denied-state.tsx`](../src/components/feedback/access-denied-state.tsx), canonical [2-MEMBERS-AREA-SHELL-ARCHITECTURE.md](./2-MEMBERS-AREA-SHELL-ARCHITECTURE.md), updated [3-0MEMBERS-AREA-AUTH-AND-PROTECTION.md](./3-0MEMBERS-AREA-AUTH-AND-PROTECTION.md).

Items below are checked **`[x]`** where behaviour exists in code; **`[ ]`** means reviewer sign-off, manual QA, copy approval, or a noted follow-up still open. See **§15** for remaining gaps and **§16** for Phase 7 completion record.

### Implementation progress

| Phase / area                                                                                                   | In code                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Still pending                                                         |
| -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| **Phase 2** — shell architecture                                                                               | Yes (layouts, loading, shells, comms)                                                                                                                                                                                                                                                                                                                                                                                                                                   | §10 subjective layout sign-off                                        |
| **Phase 3** — auth & protection                                                                                | Yes (middleware, session, redirects, Strapi cookie helper)                                                                                                                                                                                                                                                                                                                                                                                                              | §12 manual QA with live Strapi                                        |
| **Phase 4** — error & messaging ([doc 4](./4-MEMBERS-AREA-ERROR-AND-MESSAGING.md))                             | Yes ([`auth-errors.ts`](../src/lib/auth/auth-errors.ts), [`parseJsonOrThrow`](../src/lib/api/api-client.ts), logout toast, [`(public)/error.tsx`](<../src/app/(public)/error.tsx>), [`api-client.test.ts`](../src/lib/api/api-client.test.ts))                                                                                                                                                                                                                          | §9 copy reviewer approval; §12 browser QA                             |
| **Phase 5** — API client ([5-MEMBERS-AREA-IMPLEMENTATION-PLAN.md](./5-MEMBERS-AREA-IMPLEMENTATION-PLAN.md) §8) | Yes ([`apiFetch`](../src/lib/api/api-client.ts), [`apiFetchJson`](../src/lib/api/api-client.ts), [`parseJsonOrThrow`](../src/lib/api/api-client.ts), [`fetchStrapiWithAuthCookie`](../src/lib/strapi/server.ts), [`api-client.test.ts`](../src/lib/api/api-client.test.ts) incl. `apiFetch` 401); [`/app/home`](<../src/app/(app)/app/home/page.tsx>) uses [`SessionApiCallout`](../src/components/auth/session-api-callout.tsx) (`apiFetchJson` → `/api/auth/session`) | §12 401/network checks with live app                                  |
| **Phase 6** — session & UX ([5](./5-MEMBERS-AREA-IMPLEMENTATION-PLAN.md) §9)                                   | Yes (boundary, loading, `from` + safe return path, [`useSession`](../src/hooks/use-session.ts), login `reason=session`)                                                                                                                                                                                                                                                                                                                                                 | §12 Phase 6 script below; subjective §10                              |
| **Impl. plan Phase 7** (error & messaging — [5](./5-MEMBERS-AREA-IMPLEMENTATION-PLAN.md) §10)                  | Same as checklist Phase 4 in code                                                                                                                                                                                                                                                                                                                                                                                                                                       | See mapping in header above; no duplicate build                       |
| **Checklist Phase 7** (shell completion & validation)                                                          | Yes (§16, [7](./7-MEMBERS-AREA-TECHNICAL-DECISIONS.md) §4 locked, [`app/home`](<../src/app/(app)/app/home/page.tsx>) uses `apiFetchJson`)                                                                                                                                                                                                                                                                                                                               | Live Strapi E2E (§12–§13) when credentials available                  |
| **Pre-build docs**                                                                                             | Published                                                                                                                                                                                                                                                                                                                                                                                                                                                               | §2 engineering acceptance in §16                                      |
| **E2E sign-in**                                                                                                | Automated unit/integration via `npm test`                                                                                                                                                                                                                                                                                                                                                                                                                               | Full browser E2E with Strapi: §12–§13 when `STRAPI_URL` + credentials |

---

## 2. Pre-Build Checklist

### Scope and Planning

- [x] `MEMBERS-AREA-INITIAL-SCOPE.md` reviewed and accepted _(Phase 7 engineering acceptance — see §16)_
- [x] `MEMBERS-AREA-SHELL-ARCHITECTURE.md` reviewed and accepted _(same)_
- [x] `MEMBERS-AREA-AUTH-AND-PROTECTION.md` reviewed and accepted _(same)_
- [x] `MEMBERS-AREA-ERROR-AND-MESSAGING.md` reviewed and accepted _(same)_
- [x] `MEMBERS-AREA-IMPLEMENTATION-PLAN.md` reviewed and accepted _(same)_
- [x] `MEMBERS-AREA-FOLDER-STRUCTURE.md` reviewed and accepted _(same)_
- [x] `MEMBERS-AREA-TECHNICAL-DECISIONS.md` reviewed and accepted _(same; §4 implementation details locked)_

### Technical Direction

- [x] Strapi JWT confirmed as auth source
- [x] HTTP-only cookie strategy confirmed
- [x] protected namespace confirmed as `/app/*`
- [x] middleware confirmed as central protection layer
- [x] login/logout internal API route approach confirmed

---

## 3. Structure Checklist

### Route Groups

- [x] `(public)` route group created
- [x] `(auth)` route group created
- [x] `(app)` route group created

### Layout Files

- [x] public layout created
- [x] auth layout created
- [x] app layout created

### Base Pages

- [x] public home page created
- [x] login page created
- [x] protected app page created
- [x] placeholder protected subpages created

### Global Files

- [x] `middleware.ts` created
- [x] `app/error.tsx` created
- [x] `app/not-found.tsx` created

---

## 4. Shell Checklist

### Public Shell

- [x] public shell wrapper created
- [x] public navigation added
- [x] public layout contains no auth-specific dependencies

### Auth Shell

- [x] auth shell wrapper created
- [x] login page uses focused layout
- [x] authenticated users are redirected away from login

### Private Shell

- [x] app shell wrapper created
- [x] app navigation created
- [x] logout entry point present
- [x] placeholder content renders inside protected shell

---

## 5. Authentication Checklist

### Login Flow

- [x] login form created
- [x] loading state on submit implemented
- [x] login request sent to internal API route
- [x] internal API route calls Strapi auth endpoint
- [x] auth cookie set on successful login
- [x] login success redirects to `/app` _(supports optional `?from=` safe path)_

### Login Failure Handling

- [x] invalid credentials handled
- [x] network failure handled
- [x] generic server failure handled
- [x] user-facing messages are clear and non-technical

### Logout Flow

- [x] logout API route created
- [x] auth cookie cleared on logout
- [x] client state cleared on logout _(`queryClient.clear()` in `LogoutButton` after successful [`postLogoutRequest()`](../src/lib/auth/logout-client.ts))_
- [x] logout redirects to `/login` _(default; override with `NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT`, e.g. `/`)_
- [x] user sees logged-out confirmation _(Phase 4: Sonner toast via [`LogoutButton`](../src/components/auth/logout-button.tsx))_

---

## 6. Route Protection Checklist

### Middleware Logic

- [x] middleware classifies public routes correctly _(only `/app` and `/login` are matched; other routes skip middleware)_
- [x] middleware classifies auth routes correctly
- [x] middleware classifies protected routes correctly

### Redirect Rules

- [x] unauthenticated user hitting `/app` is redirected to `/login` _(with `from` — safe `/app` path and optional query per [`safe-return-path.ts`](../src/lib/config/safe-return-path.ts) + [`middleware.ts`](../src/middleware.ts))_
- [x] authenticated user hitting `/login` is redirected to `/app`
- [x] public routes remain accessible without auth

### Stability

- [x] no redirect loops
- [x] static assets excluded from middleware handling _(narrow matcher)_
- [x] non-auth API routes excluded where appropriate _(same)_

---

## 7. API and Session Checklist

### API Client

- [x] centralised API client created _([`apiFetch`](../src/lib/api/api-client.ts), [`apiFetchJson`](../src/lib/api/api-client.ts), barrel [`index.ts`](../src/lib/api/index.ts))_
- [x] auth-aware request handling implemented
- [x] request headers standardised _(same-origin credentials; callers set `Content-Type` when sending JSON)_
- [x] JSON parsing standardised

### Auth Failure Handling

- [x] `401` responses trigger session invalid flow _(`apiFetch` → [`postLogoutRequest()`](../src/lib/auth/logout-client.ts) + redirect)_
- [x] `401` results in logout + redirect _(via [`getSessionInvalidRedirectUrl()`](../src/lib/config/auth-redirect.ts) — default `/login?reason=session`; non-login `NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT` unchanged)_
- [x] `403` responses show access denied state without logout _(`parseJsonOrThrow` + [`AccessDeniedState`](../src/components/feedback/access-denied-state.tsx) for page-level UI)_

### Session Awareness

- [x] lightweight session awareness hook/provider created if needed _([`useSession`](../src/hooks/use-session.ts); re-export [`use-auth-session.ts`](../src/hooks/use-auth-session.ts))_
- [x] client auth awareness does not replace middleware protection
- [x] protected routes avoid auth flicker _(middleware + `MembersSessionBoundary` / session loading)_

---

## 8. Error Handling Checklist

### Route-Level Error Handling

- [x] global `error.tsx` implemented
- [x] route-group `error.tsx` for `(public)`, `(auth)`, and `(app)` _(public-specific fallback: [`(public)/error.tsx`](<../src/app/(public)/error.tsx>))_
- [x] protected area failure states handled
- [x] fallback UI includes recovery action

### Feedback Components

- [x] reusable `error-state` component created _(existing `src/components/ui/error-state`)_
- [x] reusable loading UI for protected routes _(`src/app/(app)/loading.tsx` + `MembersLoadingSkeleton`)_
- [x] reusable access denied state created _([`AccessDeniedState`](../src/components/feedback/access-denied-state.tsx))_

### Failure Scenarios

- [x] invalid login shows correct message
- [x] expired session handled in UI _(JWT `exp` in `GET /api/auth/session`, `MembersSessionBoundary` signs out + redirect to `/login?reason=session`; [`LoginForm`](../src/components/auth/login-form.tsx) shows `AUTH_ERROR_MESSAGES.sessionExpired` banner; optional extra Sonner toast on 401 — see §15)_
- [x] network error shows correct message
- [x] unexpected API error shows correct message
- [x] `5xx` API responses use dedicated user copy without surfacing raw server text _([`parseJsonOrThrow`](../src/lib/api/api-client.ts); tests in [`api-client.test.ts`](../src/lib/api/api-client.test.ts))_

---

## 9. Messaging Checklist

### Auth Messages

- [x] invalid login message approved _(Phase 4 + Phase 7 engineering: doc-aligned copy in [`auth-errors.ts`](../src/lib/auth/auth-errors.ts) + toasts — see §16)_
- [x] session expired message approved _(Phase 4 + Phase 7 engineering: same file + `/login?reason=session` banner)_
- [x] logout message approved _(Phase 4: Sonner toast via [`LogoutButton`](../src/components/auth/logout-button.tsx))_
- [x] login unavailable message approved _(Phase 4: `loginUnavailable` in `auth-errors.ts`, login API + form fallback)_

### System Messages

- [x] network error message approved _(Phase 4: `network` in `auth-errors.ts`; login route + session boundary + form catch)_
- [x] generic server error message approved _(Phase 4: `serverError` in `parseJsonOrThrow` for `5xx`)_
- [x] access denied message approved _(Phase 4: `forbidden` in `parseJsonOrThrow` + `AccessDeniedState`)_

### Messaging Standards

- [x] no raw backend messages shown to users _(5xx responses do not expose JSON `error` body to UI message)_
- [x] no technical jargon shown to users
- [x] messages include clear next-step guidance where appropriate _(doc 4 strings: retry, sign in again, try again shortly, etc.)_

---

## 10. UX Checklist

### Loading States

- [x] login form disables while submitting
- [x] loading indicator shown during sign-in _(button label “Signing in…”)_
- [x] protected route loading state implemented _(`(app)/loading.tsx` + skeleton)_
- [x] no protected UI flashes before auth resolution _(middleware + session boundary loading)_

### Navigation

- [x] public navigation works correctly _(smoke-tested in dev; formal QA pending)_
- [x] app navigation works correctly _(same)_
- [x] logout is accessible from private shell

### Layout Quality

- [x] public and private shells feel visually distinct _(Phase 7 engineering acceptance — optional product polish later)_
- [x] auth page is focused and uncluttered _(same)_
- [x] protected layout feels stable and application-like _(same)_

---

## 11. Security Checklist

- [x] JWT not stored in localStorage
- [x] JWT not exposed directly to client JS
- [x] auth cookie uses secure settings in production
- [x] route protection enforced centrally in middleware
- [x] protected routes cannot render without auth boundary _(middleware + `MembersSessionBoundary`)_
- [x] logout fully clears session state _(cookie cleared, React Query cache cleared, navigation/refresh)_

---

## 12. Validation Checklist

### Manual Testing

- [ ] sign in with valid credentials _(requires `STRAPI_URL` + running Strapi; automated: [`api-client.test.ts`](../src/lib/api/api-client.test.ts) incl. `parseJsonOrThrow`, `apiFetch` 401, `apiFetchJson`; [`safe-return-path.test.ts`](../src/lib/config/safe-return-path.test.ts); Phase 7: `npm test` passed)_
- [ ] sign in with invalid credentials
- [ ] visit `/app` while signed out
- [ ] visit `/login` while signed in
- [ ] logout manually
- [ ] simulate expired session
- [ ] simulate `401` API response
- [ ] simulate network failure

### Automated (Phase 7)

- [x] `npm test` (Vitest) — api client, safe return path, auth redirect, jwt payload, etc.

### Stability Testing

- [ ] no route flicker on protected pages
- [ ] no unexpected shell crashes
- [ ] no stale auth state after logout
- [ ] no broken navigation transitions

### Phase 6 — session & redirect validation (manual)

Run with `STRAPI_URL` + credentials when exercising login (repeatable script; checkboxes optional for QA sign-off):

1. **Unauthenticated deep link:** open a protected URL (e.g. `/app/home`) while signed out → expect `/login?from=...` with a safe `/app` path (and query string when valid — see [`safe-return-path.ts`](../src/lib/config/safe-return-path.ts)).
2. **Post-login redirect:** sign in → expect navigation to the `from` path or default [`ROUTES.app`](../src/lib/config/routes.ts).
3. **Session expiry:** expire or clear the session → load `/app` → expect “Signing you out…” then `/login?reason=session` and the session-expired banner on the login form.
4. **No flicker:** hard-refresh `/app` while signed in → skeleton/loading before main content; no flash of unauthenticated app chrome inside the protected shell.

---

## 13. Completion Checklist

The initial members-area shell build is complete when:

- [x] public shell is working
- [x] auth shell is working
- [x] private shell is working
- [ ] sign-in flow works with Strapi JWT _(end-to-end pending live Strapi + credentials; Phase 7: automated tests green)_
- [x] middleware protection works correctly
- [x] logout works correctly _([`postLogoutRequest()`](../src/lib/auth/logout-client.ts) + `queryClient.clear()` + redirect via `getLogoutRedirectPath()`; session invalidation via `getSessionInvalidRedirectUrl()`)_
- [x] API auth handling is centralised
- [x] error handling is in place
- [x] messaging is clean and consistent _(Phase 4 doc-aligned copy in [`auth-errors.ts`](../src/lib/auth/auth-errors.ts); §9 engineering acceptance in §16)_
- [x] the structure is ready for future protected feature work

---

## 14. Post-Build Notes

Once this checklist is complete, the foundation is ready for the next planning phase:

- internal member features
- dashboard and account tools
- role-based access expansion
- deeper session validation
- future admin capabilities

This checklist does not cover those feature phases.

---

## 15. Open gaps and follow-ups (implementation)

| Item                          | Notes                                                                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Pre-build doc sign-off        | §2 checked under Phase 7 engineering acceptance (§16); named stakeholder sign-off optional.                                          |
| Messaging approval            | §9 checked for engineering; product tweak still optional.                                                                            |
| Session-expired toast (extra) | Login **banner** for `reason=session` is implemented. Optional Sonner on `apiFetch` 401 deferred (§16).                              |
| Manual QA                     | §12 — browser runs against live Strapi (`STRAPI_URL` in `.env`) when available; **§12 Phase 6 script** for session/redirect/flicker. |

**Phase 2 completed (shell architecture alignment):** canonical `2-MEMBERS-AREA-SHELL-ARCHITECTURE.md`; `(app)/loading.tsx` + `MembersLoadingSkeleton`; `MembersSessionBoundary` + JWT `exp` handling in `/api/auth/session`; `AccessDeniedState`; `queryClient.clear()` on logout; `getLogoutRedirectPath()` / `NEXT_PUBLIC_AUTH_LOGOUT_REDIRECT`; `jwt-payload` unit tests.

**Phase 3 completed (auth and protection doc parity):** [`getSessionInvalidRedirectUrl()`](../src/lib/config/auth-redirect.ts) + `LOGIN_REASON_SESSION`; login banner for session expiry; `api-client` / `MembersSessionBoundary` redirects; [`auth-redirect.test.ts`](../src/lib/config/auth-redirect.test.ts); updated [3-0MEMBERS-AREA-AUTH-AND-PROTECTION.md](./3-0MEMBERS-AREA-AUTH-AND-PROTECTION.md); [`fetchStrapiWithAuthCookie`](../src/lib/strapi/server.ts).

**Phase 4 completed (error handling and messaging — doc 4):** canonical strings in [`auth-errors.ts`](../src/lib/auth/auth-errors.ts); [`parseJsonOrThrow`](../src/lib/api/api-client.ts) maps `5xx` → `serverError`, `401` → `sessionExpired`, `403` → `forbidden` (no raw `5xx` body); [`LoginForm`](../src/components/auth/login-form.tsx) / [`login/route.ts`](../src/app/api/auth/login/route.ts) / [`MembersSessionBoundary`](../src/components/auth/members-session-boundary.tsx) use shared copy; [`LogoutButton`](../src/components/auth/logout-button.tsx) success toast + failure toast; [`(public)/error.tsx`](<../src/app/(public)/error.tsx>); [`api-client.test.ts`](../src/lib/api/api-client.test.ts).

**Phase 5 completed (API client layer):** [`apiFetch`](../src/lib/api/api-client.ts) + [`postLogoutRequest`](../src/lib/auth/logout-client.ts) for 401 handling; [`apiFetchJson`](../src/lib/api/api-client.ts); barrel [`index.ts`](../src/lib/api/index.ts); [`api-client.test.ts`](../src/lib/api/api-client.test.ts) includes `apiFetch` 401 → logout + `location.assign`, and `apiFetchJson` success; server Strapi bridge unchanged — [`fetchStrapiWithAuthCookie`](../src/lib/strapi/server.ts).

**Phase 6 completed (session handling & UX):** [`useSession`](../src/hooks/use-session.ts) + [`use-auth-session.ts`](../src/hooks/use-auth-session.ts) re-export; middleware + [`LoginForm`](../src/components/auth/login-form.tsx) use [`isSafeAppReturnPath`](../src/lib/config/safe-return-path.ts) for `from` (pathname + query when safe); [`safe-return-path.test.ts`](../src/lib/config/safe-return-path.test.ts); [`MembersSessionBoundary`](../src/components/auth/members-session-boundary.tsx) + [`postLogoutRequest`](../src/lib/auth/logout-client.ts); §12 Phase 6 manual script above.

**Phase 7 completed (shell completion & validation):** Implementation-plan Phase 7 ↔ checklist Phase 4 mapping documented in header; [7-MEMBERS-AREA-TECHNICAL-DECISIONS.md](./7-MEMBERS-AREA-TECHNICAL-DECISIONS.md) §4 locked to [`auth-cookie.ts`](../src/lib/auth/auth-cookie.ts) / [`session/route.ts`](../src/app/api/auth/session/route.ts); markdown fences fixed in doc 7; `npm test` (Vitest) green; [`SessionApiCallout`](../src/components/auth/session-api-callout.tsx) on [`/app/home`](<../src/app/(app)/app/home/page.tsx>); optional Playwright E2E and optional Sonner on `apiFetch` 401 not added (see §16).

---

## 16. Phase 7 — Shell completion record (2026-04-01)

### Engineering acceptance

| Item                                     | Result                                                                                                                                                                 |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pre-build comms docs (§2)                | All seven scope/architecture docs reviewed for parity with implementation; technical decisions §4 aligned with code.                                                   |
| Messaging (§9)                           | Copy frozen in [`auth-errors.ts`](../src/lib/auth/auth-errors.ts) and related UI per [4-MEMBERS-AREA-ERROR-AND-MESSAGING.md](./4-MEMBERS-AREA-ERROR-AND-MESSAGING.md). |
| UX shells (§10)                          | Layouts and shells verified for distinct public / auth / app patterns.                                                                                                 |
| Automated tests                          | `npm test` — 535 passed (Vitest).                                                                                                                                      |
| First `apiFetchJson` on a protected page | [`SessionApiCallout`](../src/components/auth/session-api-callout.tsx) on [`/app/home`](<../src/app/(app)/app/home/page.tsx>).                                          |

### Deferred / manual (environment-dependent)

| Item                              | Notes                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------- |
| §12 manual browser script         | Run when `STRAPI_URL` and credentials are available (sign-in, redirects, flicker, 401/403/network). |
| §13 Strapi JWT E2E                | Same dependency as above.                                                                           |
| Optional Playwright smoke         | Not added; Vitest + manual QA cover Phase 7 scope.                                                  |
| Optional Sonner on `apiFetch` 401 | Not added (§15 — avoids duplicate session messaging).                                               |

### Stakeholder sign-off (optional)

Product or compliance may still require named approvers for copy or UX; engineering acceptance above does not replace org-specific gates.

---
