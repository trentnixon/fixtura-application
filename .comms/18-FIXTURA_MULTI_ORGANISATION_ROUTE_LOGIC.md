# Fixtura Members Area — Route Logic Pattern for Multi-Organisation Access

## Overview

This document defines the **route and state logic pattern** for the new Fixtura members area.

The application is moving to a **multi-organisation model**.

This means:

- a **user** can log in once
- that user may belong to or manage **one or more organisations**
- the application must determine the **active organisation context**
- only then can the main organisation-specific UI load

This introduces a new layer between **authentication** and the **main members application UI**.

---

## Core Idea

The system is no longer:

- login
- load app

It is now:

- login
- fetch user organisation options
- select existing organisation or create a new one
- load organisation context
- enter organisation-scoped app UI

This pattern ensures the app always knows:

- who the user is
- which organisation they are currently operating in

---

## Final Route Flow

```text
Login
→ fetch authenticated user + organisation summary data
→ if user has organisations:
    → show organisation selection screen
    → user selects organisation
    → fetch selected organisation data
    → load organisation UI
→ if user has no organisations:
    → send user to create organisation / onboarding
    → create organisation
    → fetch organisation data
    → load organisation UI
```

---

## Architectural Principle

Authentication identifies the **user**.

Organisation selection establishes the **working context**.

The members application must not load its full protected organisation UI until both are true:

1. the user is authenticated
2. an active organisation has been selected or created

---

## Route Layer Model

The route model should now be thought of as **three layers**, not two.

### 1. Public Layer

Accessible without authentication.

Used for:

- landing / entry page
- sign in
- forgot password
- help / support
- system state pages

### 2. Authenticated but Unscoped Layer

Accessible only after login, but before organisation context is established.

Used for:

- fetching available organisations
- selecting an organisation
- creating a new organisation
- onboarding a newly created organisation

This is the new middle layer.

### 3. Authenticated and Organisation-Scoped App Layer

Accessible only when:

- user is authenticated
- organisation context is established

Used for:

- dashboard
- account/organisation settings
- content
- downloads
- scheduler
- template/theme management
- any other members UI tied to an organisation

---

## Route Logic Rules

### Rule 1 — Authentication comes first

If there is no valid session:

- user can only access public routes
- any attempt to access organisation gateway or app routes redirects to sign in

### Rule 2 — Session does not equal organisation context

A valid session means:

- the user is known

It does **not** mean:

- the system knows which organisation the user is using

So a logged-in user must not automatically enter the full app unless an organisation has been resolved.

### Rule 3 — Organisation context is mandatory for app shell

The organisation app shell must only load when there is:

- authenticated user
- selected organisation identifier
- validated organisation ownership
- loaded organisation context data

If any of those are missing, the user should be routed back to the organisation selection or onboarding flow.

### Rule 4 — Organisation creation is part of access flow

If a user has no organisations yet, this is not an error state.

It is a valid onboarding path.

The system should route them into organisation creation and setup.

---

## Recommended User Flow Logic

### Scenario A — User logs in and has one or more organisations

```text
Sign in
→ auth success
→ fetch user organisations
→ show select organisation screen
→ user selects organisation
→ store active organisation id
→ fetch full organisation data
→ enter app shell
```

### Scenario B — User logs in and has no organisations

```text
Sign in
→ auth success
→ fetch user organisations
→ none found
→ redirect to create organisation / onboarding
→ user creates organisation
→ store active organisation id
→ fetch full organisation data
→ enter app shell
```

### Scenario C — User tries to open `/app` without organisation context

```text
Open protected app route
→ session exists
→ no active organisation context
→ redirect to /select-organisation
```

### Scenario D — User’s selected organisation is invalid

```text
Selected organisation id exists
→ backend validation fails
→ clear invalid organisation context
→ redirect to /select-organisation
```

---

## Middleware / Protection Model

The route protection system should think in two checks:

### Check 1 — Is the user authenticated?

If not:

- redirect to sign in

### Check 2 — Is organisation context resolved for this route?

If route is organisation-scoped and context is missing:

- redirect to organisation selection

This keeps route protection predictable.

---

## Shell Model

The members area should not be treated as one single shell anymore.

### Auth Shell

Used for:

- sign in
- forgot password
- public support flows

### Organisation Gateway Shell

Used for:

- selecting an organisation
- creating an organisation
- onboarding

This shell should feel lightweight and transitional.

Its purpose is to establish working context before entering the full app.

### App Shell

Used for:

- all organisation-specific members UI

This shell should only mount once organisation context is loaded.

---

## Data Loading Pattern

The frontend should load data in this order:

### Step 1 — Authenticate user

Establish session.

### Step 2 — Fetch current user summary

Fetch minimal user data needed for routing decisions.

This should include:

- user id
- profile basics
- list of available organisations or a count/summary

### Step 3 — Resolve organisation

Based on returned data:

- select existing organisation
- or create a new one

### Step 4 — Fetch active organisation data

Once an organisation is selected, fetch the organisation payload needed for app initialization.

### Step 5 — Load app shell

Only after organisation data is loaded should the full members application render.

---

## Suggested Routing Intent

### Public

```text
/
/sign-in
/forgot-password
/help
```

### Authenticated, no organisation required

```text
/select-organisation
/create-organisation
/onboarding/*
```

### Authenticated, organisation required

```text
/app
/app/*
```

---

## Behaviour Expectations

### On successful login

Do not immediately push the user into `/app`.

Instead:

- fetch organisation summary
- decide next route

### If exactly one organisation exists

You may choose one of two patterns:

#### Option A — Always show selector

Pros:

- consistent UX
- future-safe for users who later gain more organisations

#### Option B — Auto-select the only organisation

Pros:

- faster for single-organisation users

If auto-selecting, ensure the logic still supports later multi-organisation expansion cleanly.

---

## Recommended Default

A strong default is:

- if no organisations → go to create/onboarding
- if one or more organisations → go to select organisation

This keeps the logic explicit and avoids hidden assumptions.

---

## Why This Pattern Is Good

This route model is correct for a multi-organisation members area because it separates:

- **identity**
- from **working context**

That gives the system:

- cleaner mental model
- safer protected route logic
- clearer onboarding path
- future support for account switching
- easier testing and debugging

It also prevents a common problem where the app loads protected organisation-specific UI before the organisation has been established.

---

## LLM Guidance

When working on the Fixtura members area, always assume:

1. user authentication and organisation context are separate concerns
2. the main app shell is organisation-scoped
3. organisation selection or creation happens before app shell entry
4. onboarding is part of the protected access flow, not a public route
5. route logic must support users with zero, one, or many organisations

Do not design route protection around the assumption that login alone is enough to enter the members app.

The correct sequence is:

```text
authenticate user
→ resolve organisation context
→ load organisation-scoped application
```

---

## Implementation Direction

This pattern should influence:

- route grouping
- middleware decisions
- post-login redirects
- app shell mount logic
- onboarding flow placement
- backend organisation validation
- frontend state hydration order

The system should always treat **organisation resolution** as a required step between login and the main members UI.

---

## Final Pattern Summary

```text
Login
→ fetch user + organisation summary
→ select organisation OR create organisation
→ fetch active organisation data
→ load organisation UI
```

This is the correct route logic pattern for adopting a multi-organisation model in the Fixtura members area.

---

## Application implementation (code reference)

As implemented in this repository (aligned with this document and the CMS handoff for the selected-account aggregate):

| Concern                            | Location                                                                                                                                                                                                 |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Members route group (shared shell) | `src/app/(members)/layout.tsx` — `MembersSessionBoundary` + `MembersAppShell`                                                                                                                            |
| Gateway pages                      | `src/app/(members)/select-organisation/`, `src/app/(members)/create-organisation/` (create API **TBC**)                                                                                                  |
| Scoped pages                       | `src/app/(members)/o/[accountId]/...` — `OrgAccessBoundary` in `o/[accountId]/layout.tsx`                                                                                                                |
| Path builders                      | `src/lib/config/account-routes.ts` (`accountScopedRoutes`, `parseAccountScopePath`)                                                                                                                      |
| Route constants                    | `src/lib/config/routes.ts` (`ROUTES.selectOrganisation`, …)                                                                                                                                              |
| Middleware                         | `src/middleware.ts` — JWT check; protects `/o/*`, gateway, `/admin/*`, `/logout`; legacy flat `/dashboard` etc. → `/select-organisation`                                                                 |
| Post-login / safe return           | `src/components/auth/login-form.tsx`, `src/lib/config/safe-return-path.ts` (scoped `/o/...` only)                                                                                                        |
| Account list + aggregate           | `GET /api/account/me` (BFF), `GET /api/account/organisation/[accountId]` — see [`.comms/responses/app-handoff-account-organisation-endpoint.md`](responses/app-handoff-account-organisation-endpoint.md) |
| Sidebar / switcher                 | `src/components/app-sidebar.tsx`, `src/components/layout/account-switcher.tsx`                                                                                                                           |

LLM / developer onboarding: start with [`.skills/orchestrator-skill.md`](../.skills/orchestrator-skill.md) and [`.skills/index.md`](../.skills/index.md) (section **Members area — multi-organisation routes**).
