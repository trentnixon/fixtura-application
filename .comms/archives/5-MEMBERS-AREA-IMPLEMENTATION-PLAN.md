# Fixtura Members Area — Implementation Plan

## 1. Purpose

This document defines the step-by-step implementation plan for the Fixtura Members Area initial shell.

It translates:

- scope
- architecture
- authentication strategy
- error handling

into a structured build sequence with phases and tasks.

---

## 2. Implementation Strategy

### Guiding Principles

- build foundation first
- validate each layer before moving forward
- keep auth and routing clean from the start
- avoid mixing concerns across phases

---

## 3. Phase Overview

1. Project Structure Setup
2. Layout & Route Groups
3. Authentication Flow
4. Middleware Protection
5. API Client Layer
6. Session Handling & UX
7. Error Handling & Messaging
8. Logout & Edge Cases
9. Testing & Validation

---

## 4. Phase 1 — Project Structure Setup

### Goal

Establish folder and route structure aligned with architecture.

---

### Tasks

- create route groups:
  - `(public)`
  - `(auth)`
  - `(app)`
- create base layouts:
  - public layout
  - auth layout
  - private layout
- scaffold basic pages:
  - `/` (public)
  - `/login`
  - `/app`
- ensure app builds and routes correctly

---

### Validation

- routes load correctly
- layouts render as expected
- no auth logic yet

---

## 5. Phase 2 — Layout & Shell Implementation

### Goal

Implement visual and structural shells.

---

### Tasks

#### Public Shell

- header navigation
- basic layout wrapper

---

#### Auth Shell

- centred layout
- login page structure

---

#### Private Shell

- app layout (sidebar or topbar)
- placeholder navigation
- protected layout wrapper (no logic yet)

---

### Validation

- shells are visually distinct
- navigation behaves correctly
- `/app` renders placeholder content

---

## 6. Phase 3 — Authentication Flow

### Goal

Implement login and token handling.

---

### Tasks

- build login form (shadcn)
- connect to Strapi auth endpoint
- handle:
  - loading state
  - success response
  - error response
- implement token storage (HTTP-only cookie via API route or server action)
- redirect to `/app` after login

---

### Validation

- valid login works
- invalid login shows message
- token stored correctly

---

## 7. Phase 4 — Middleware Protection

### Goal

Enforce route protection.

---

### Tasks

- create `middleware.ts`
- implement route detection:
  - public
  - auth
  - protected
- implement redirect rules:
  - unauthenticated → `/login`
  - authenticated → `/app`
- exclude static assets and API routes

---

### Validation

- `/app` blocked without login
- `/login` redirects if authenticated
- no redirect loops

---

## 8. Phase 5 — API Client Layer

### Goal

Centralise API communication.

---

### Tasks

- create API client wrapper
- attach JWT automatically
- standardise:
  - headers
  - JSON parsing
- implement error handling:
  - 401 → logout
  - 403 → access denied
- ensure compatibility with client and server usage

---

### Validation

- authenticated requests include token
- 401 triggers logout
- errors handled consistently

---

## 9. Phase 6 — Session Handling & UX

### Goal

Make auth state predictable and user-friendly.

---

### Tasks

- implement auth loading state
- prevent UI flicker on protected routes
- handle session expiry:
  - redirect
  - message
- implement redirect-after-login logic
- create lightweight auth awareness hook/context

---

### Validation

- no flicker on `/app`
- session expiry handled cleanly
- redirects behave correctly

---

## 10. Phase 7 — Error Handling & Messaging

### Goal

Implement resilience and user messaging.

---

### Tasks

- add `error.tsx` to route groups
- create fallback UI components
- implement:
  - API error messages
  - auth error messages
  - network error handling
- standardise messaging patterns

---

### Validation

- errors do not crash app
- messages are clear and consistent
- recovery actions work

---

## 11. Phase 8 — Logout & Edge Cases

### Goal

Handle all session termination scenarios.

---

### Tasks

- implement logout function
- clear auth cookie
- reset client state
- redirect to `/login`
- handle:
  - token invalid
  - token missing
  - API-triggered logout

---

### Validation

- logout works reliably
- session fully cleared
- no stale state remains

---

## 12. Phase 9 — Testing & Validation

### Goal

Ensure production readiness.

---

### Functional Tests

- login success/failure
- route protection
- redirect logic
- logout flow

---

### Edge Case Tests

- expired session
- invalid token
- API 401 response
- network failure

---

### UX Tests

- loading states
- error messaging
- navigation consistency

---

## 13. Final Checklist

Before completion:

- protected routes fully secure
- no auth leaks
- middleware stable
- API client centralised
- error handling complete
- session UX clean
- logout reliable

---

## 14. Deliverables

At the end of this implementation:

- public shell
- auth flow
- private protected shell
- middleware protection
- API client layer
- error handling system
- production-ready auth foundation

---

## 15. Future Phases (Not Included)

To be planned next:

- dashboard
- account management
- feature modules
- role-based access control
- admin tools

---

## 16. Summary

This plan ensures:

- structured implementation
- minimal rework
- strong security foundation
- scalable architecture
- production-quality behaviour

---
