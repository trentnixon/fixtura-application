# Fixtura Members Area — Initial Scope

## 1. Purpose

This document defines the scope for the **initial implementation** of the Fixtura Members Area.

The goal of this phase is to establish a **production-ready authentication boundary and protected application shell** using:

- Next.js (App Router)
- Strapi JWT authentication
- Middleware-based route protection
- Public and private layout separation
- Error handling and user messaging

This phase focuses **only on the shell and protection layer**, not on internal member features.

---

## 2. Objective

Create a stable, secure, and scalable foundation that:

- separates public and private application areas
- enforces authentication across protected routes
- provides a consistent authenticated app shell
- handles session state cleanly and predictably
- supports future expansion without architectural rework

---

## 3. In Scope

### 3.1 Authentication

- Sign-in page (email/password)
- Strapi JWT authentication flow
- Token handling strategy (to be defined in auth doc)
- Login success + redirect handling
- Logout flow
- Expired/invalid session handling

---

### 3.2 Route Protection

- Public routes (unprotected)
- Auth routes (login)
- Protected routes (members area)
- Middleware-based protection
- Redirect rules:
  - unauthenticated → login
  - authenticated → app (if hitting login)

---

### 3.3 Application Shells

#### Public Shell

- marketing pages
- sign-in page
- public navigation

#### Private Shell

- authenticated layout
- app navigation
- protected route wrapper
- placeholder content pages

---

### 3.4 Layout Architecture

- Next.js route groups for:
  - public
  - auth
  - protected
- layout separation between shells
- shared vs isolated components defined

---

### 3.5 API & Auth Integration

- Centralised API client
- JWT attached to protected requests
- Standardised error handling
- 401/403 handling behaviour

---

### 3.6 Session Handling

- initial auth resolution state
- loading states for protected routes
- session expiry handling
- redirect after login
- safe fallback when session unknown

---

### 3.7 Error Handling

- route-level error boundaries (`error.tsx`)
- global fallback patterns
- auth failure messaging
- API failure messaging
- recovery actions (retry, sign in again)

---

### 3.8 Messaging

Standardised messaging for:

- invalid login
- session expired
- unauthorized access
- network errors
- unexpected failures
- logout confirmation

---

### 3.9 Logout Handling

- token/session removal
- state reset
- redirect to public shell

---

### 3.10 Placeholder Protected Pages

Used to validate structure only:

- `/login`
- `/app`
- `/app/home` (or similar)

---

### 3.11 Observability Hooks

- auth failures
- API failures
- unexpected errors

(Integration can be minimal but structure must exist)

---

## 4. Out of Scope

The following are explicitly excluded from this phase:

- dashboards
- account settings
- profile management
- downloads or content tools
- branding configuration
- user management
- role-based access systems (beyond basic auth)
- business logic inside protected pages

---

## 5. Success Criteria

This phase is complete when:

- users can sign in via Strapi
- protected routes cannot be accessed without auth
- authenticated users are redirected correctly
- public and private shells are clearly separated
- API requests include auth safely
- session expiry is handled cleanly
- logout fully resets the session
- error states are handled gracefully
- structure supports future expansion

---

## 6. Key Principles

### Build the frame, not the features

This phase establishes structure only.

### Security first

All protected access must be enforced centrally.

### Predictable behaviour

Auth, routing, and error handling must behave consistently.

### Separation of concerns

Auth, API, layout, and UI responsibilities must be clearly defined.

### Future-safe

Decisions made here must not block future feature expansion.

---

## 7. Risks

- inconsistent token handling across client/server
- weak middleware protection
- scattered API auth logic
- poor session UX (flicker, redirects, loops)
- unclear separation between public and private shells

---

## 8. Next Documents

This scope feeds into:

1. `MEMBERS-AREA-SHELL-ARCHITECTURE.md`
2. `MEMBERS-AREA-AUTH-AND-PROTECTION.md`
3. `MEMBERS-AREA-ERROR-AND-MESSAGING.md`
4. `MEMBERS-AREA-IMPLEMENTATION-PLAN.md`

---
