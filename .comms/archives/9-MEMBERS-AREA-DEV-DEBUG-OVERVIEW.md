# 8 — `MEMBERS-AREA-DEV-DEBUG-OVERVIEW.md`

```md id="dev-001"
# Fixtura Members Area — Dev Debug System Overview

## 1. Purpose

This document defines the development-only debugging system used during the build of the Fixtura Members Area.

The goal is to provide:

- real-time visibility into auth and session state
- clarity on routing and middleware behaviour
- visibility into API failures and auth breakdowns
- faster debugging during development

This system is **strictly development-only** and must never be exposed in production.

---

## 2. Scope

The dev debug system includes:

- on-screen debug panel
- API error tracking
- middleware console logging
- session state inspection
- route and query visibility

---

## 3. What This Solves

Without this system, debugging requires:

- switching between console logs
- inspecting network calls manually
- guessing session state

With this system:

- auth issues are immediately visible
- redirect issues are obvious
- API failures are surfaced clearly
- session lifecycle becomes transparent

---

## 4. Core Principle

> Debug state must be visible, not inferred.

---

## 5. Environment Rules

The debug system:

- must only run in `development`
- must not expose sensitive data
- must not affect production performance
- must be removable without affecting core logic

---

## 6. Components

The system consists of:

1. Dev Debug Panel (UI overlay)
2. API Error Tracking Layer
3. Middleware Logging
4. Optional Session Introspection

---

## 7. Relationship to Core System

This system:

- observes auth, routing, and API layers
- does not control them
- must not introduce logic dependencies

---

## 8. Summary

The dev debug system is a lightweight observability layer that improves developer velocity and reduces debugging complexity during the build of the members area shell.

---
```

---

# 9 — `MEMBERS-AREA-DEV-DEBUG-PANEL.md`

````md id="dev-002"
# Dev Debug Panel

## 1. Purpose

The Dev Debug Panel is a development-only UI overlay that provides real-time visibility into:

- route state
- session state
- auth state
- query parameters

---

## 2. Behaviour

The panel:

- renders only in development
- appears fixed in the viewport
- updates dynamically with route/session changes

---

## 3. Data Displayed

Minimum:

- current pathname
- query string
- session state (authenticated / not)
- session expiry (if available)
- user identifier (safe fields only)

---

## 4. Example Component

```tsx
// src/components/dev/dev-debug-panel.tsx
"use client";
...
```
````

(Use implementation from code block)

---

## 5. Mounting Strategy

The panel should be mounted in:

- `(app)` layout (required)
- `(auth)` layout (optional)

---

## 6. Design Constraints

- minimal styling
- monospace for readability
- high contrast
- non-blocking UI

---

## 7. Safety Rules

- do not display JWT
- do not display sensitive data
- do not expose raw API responses

---

## 8. Summary

The debug panel provides immediate insight into application state and is the primary visual debugging tool during development.

---

````

---

# 10 — `MEMBERS-AREA-DEV-DEBUG-API-TRACKING.md`

```md id="dev-003"
# API Debug Tracking

## 1. Purpose

This layer tracks API failures and exposes them to the dev debug panel.

---

## 2. Responsibilities

- capture last API error
- expose error metadata
- assist debugging auth failures (401/403)

---

## 3. Implementation

### In `apiFetch`

```ts
(window as any).__LAST_API_ERROR__ = {
  status,
  url,
};
````

---

## 4. Display in Panel

Show:

- last API status
- request URL

---

## 5. Use Cases

- detecting 401 loops
- identifying failing endpoints
- debugging network issues

---

## 6. Safety

- do not expose request bodies
- do not expose tokens

---

## 7. Summary

API tracking bridges the gap between network inspection and UI awareness.

---

````

---

# 11 — `MEMBERS-AREA-DEV-DEBUG-MIDDLEWARE-LOGGING.md`

```md id="dev-004"
# Middleware Debug Logging

## 1. Purpose

Provide visibility into middleware decisions during development.

---

## 2. Logging Scope

Log:

- pathname
- auth presence
- redirect decisions

---

## 3. Example

```ts
if (process.env.NODE_ENV === "development") {
  console.log("[middleware]", {
    pathname,
    hasToken,
  });
}
````

---

## 4. Why This Matters

Middleware is:

- invisible in UI
- difficult to debug

This logging makes it observable.

---

## 5. Limitations

- cannot render UI from middleware
- logs only visible in terminal

---

## 6. Summary

Middleware logging is essential for understanding route protection behaviour.

---

````

---

# 12 — `MEMBERS-AREA-DEV-DEBUG-IMPLEMENTATION.md`

```md id="dev-005"
# Dev Debug System — Implementation Plan

## 1. Purpose

Define how to implement the dev debug system safely and incrementally.

---

## 2. Phase 1 — Debug Panel

- create `dev-debug-panel.tsx`
- mount in `(app)` layout
- validate route + session display

---

## 3. Phase 2 — Middleware Logging

- add dev-only logs
- validate redirect behaviour

---

## 4. Phase 3 — API Tracking

- extend `apiFetch`
- track last error
- display in panel

---

## 5. Phase 4 — Session Introspection

- connect `/api/auth/session`
- display expiry + user

---

## 6. Validation

- login flow visible in panel
- logout reflected instantly
- session expiry observable
- API failures visible

---

## 7. Completion Criteria

The system is complete when:

- auth state is visible at all times
- routing issues are diagnosable instantly
- API failures are surfaced clearly
- no production impact exists

---

## 8. Removal Strategy (Future)

The system can be:

- fully removed
- or gated behind feature flag

No core logic should depend on it.

---

## 9. Summary

This implementation ensures fast, reliable debugging during development without compromising production integrity.

---
````
