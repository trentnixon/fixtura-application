# AUTHENTICATED-USER-RETURN-TO-HOME.md

## Overview

This document defines how the Fixtura Members application should handle a user who is **already authenticated** and returns to the public home page.

In the Fixtura Members application, the public home page (`/`) is part of the **unauthenticated public shell** and primarily exists to support sign-in and access guidance.

Because of that, authenticated users should **not remain on this page**.

---

## Core Rule

> If a user is already authenticated and visits the public home page (`/`), they should be redirected to the authenticated application area.

The public home page is an entry point for unauthenticated users, not a destination for signed-in users.

---

## Purpose

This behaviour exists to:

- prevent authenticated users from seeing sign-in UI unnecessarily
- reduce confusion
- keep the public shell clearly separated from the authenticated app
- maintain a predictable route model

---

## Expected Behaviour

### Scenario

A user:

- already has a valid authenticated session
- manually visits `/`
- clicks the logo or bookmark that points to `/`
- returns to the site later while still signed in

### Result

The application should:

- detect the valid authenticated session
- prevent the public sign-in page from rendering as the final user destination
- redirect the user to the authenticated app landing route

---

## Redirect Target

The redirect target should be the agreed authenticated entry route.

Typical example:

```text
/app
```

or, if the product uses a more specific default route:

```text
/app/dashboard
```

Only one route should be treated as the default authenticated landing route.

---

## Route Rule

### Public Home Page

```text
/
```

### Behaviour

- unauthenticated user → allowed
- authenticated user → redirected to authenticated app

---

## Why This Matters

If an authenticated user is allowed to remain on `/`, the experience becomes unclear:

- they may see a login form even though they are already signed in
- they may think their session has failed
- they may attempt to log in again unnecessarily
- the boundary between public and authenticated routes becomes weaker

Redirecting immediately keeps the system clear and intentional.

---

## Architectural Rule

This behaviour should be enforced by the **auth boundary layer**, not by ad hoc UI logic.

That means the redirect decision should be driven by the application’s session/auth architecture, such as:

- middleware
- server-side auth guard
- central route protection logic

The UI should not be responsible for security decisions.

---

## UX Rule

The redirect should feel automatic and unsurprising.

Requirements:

- no login prompt shown as the intended final state
- no extra decision step for the user
- no “You are already logged in” dead-end page unless explicitly needed
- no duplicate sign-in flow

---

## Recommended Behaviour by Route

### `/`

- unauthenticated → render public home/login experience
- authenticated → redirect to authenticated app

---

### `/sign-in`

- unauthenticated → render sign-in page
- authenticated → redirect to authenticated app

---

### `/forgot-password`

- unauthenticated → render forgot password page
- authenticated → redirect to authenticated app

---

### `/reset-password`

This route is a special case.

Recommended rule:

- if the user is unauthenticated and has a valid reset flow → allow
- if the user is authenticated and intentionally visiting a reset link, application behaviour should be explicitly defined

In most cases for Fixtura Members, an authenticated user visiting `/reset-password` should still be redirected into the app unless there is a specific product reason to allow public reset flow while signed in.

---

### `/auth-error`

- unauthenticated → allow
- authenticated → usually redirect to authenticated app unless the error state must be shown

---

### `/session-expired`

- unauthenticated or expired session → allow
- authenticated with valid session → redirect to authenticated app

---

## Preferred Fixtura Rule

For simplicity and consistency:

> Any user with a valid authenticated session who visits a public auth route should be redirected to the authenticated app landing route.

This includes:

- `/`
- `/sign-in`
- `/forgot-password`
- `/session-expired`

Special routes like `/reset-password` may be handled separately if needed.

---

## State Detection

A user should be considered authenticated when the application has a valid session according to the active auth/session architecture.

Examples may include:

- valid auth cookie
- valid JWT-backed server session
- successful session validation through middleware or server logic

The exact implementation depends on the application architecture, but the route outcome should remain the same.

---

## Error Handling

If the system cannot verify whether the session is valid:

- do not assume authenticated access
- fall back to the safer auth/session validation process
- avoid showing contradictory UI states

If a session appears present but is invalid:

- clear the invalid state if appropriate
- treat the user as unauthenticated
- allow the public auth flow to render

---

## Non-Goals

This behaviour is not intended to:

- show dashboard content inside the public shell
- allow mixed public/authenticated layout states
- let users “choose” between public home and app home once signed in
- create a separate authenticated marketing-style landing page

---

## Acceptance Criteria

This behaviour is complete when:

- authenticated users visiting `/` are redirected to the authenticated app
- public auth routes do not act as final destinations for signed-in users
- unauthenticated users can still access the public home page normally
- route behaviour is enforced consistently across the public auth layer
- no confusing login UI is shown to users with a valid session

---

## Summary

> In the Fixtura Members application, the public home page is for unauthenticated entry only. If a user already has a valid authenticated session and returns to `/`, they should be redirected to the authenticated app landing route rather than remaining in the public shell.
