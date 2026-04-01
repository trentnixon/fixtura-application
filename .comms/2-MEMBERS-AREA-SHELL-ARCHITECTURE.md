# Fixtura Members Area — Shell Architecture

## 1. Purpose

This document defines the **application shell architecture** for the Fixtura Members Area using Next.js App Router.

It establishes:

- route grouping strategy
- public vs private shell separation
- layout ownership
- middleware boundaries
- rendering responsibilities

This is the **structural backbone** of the protected application area.

**Implementation map (code):** `src/middleware.ts` (route protection); `src/app/(public)/layout.tsx` (public shell); `src/app/(auth)/layout.tsx` (auth shell); `src/app/(app)/layout.tsx` (private shell + `MembersSessionBoundary`); `src/app/(app)/loading.tsx` (protected segment loading UI); `src/components/auth/members-session-boundary.tsx`; `src/app/api/auth/session/route.ts` (JWT `exp` check).

---

## 2. Core Concept

The application is split into two distinct UI environments:

### Public Application Surface

Unprotected, content-focused, accessible to all users.

### Private Application Surface

Protected, authenticated, app-focused, accessible only to logged-in users.

These two surfaces must be:

- physically separated in routing
- visually distinct in layout
- logically isolated in responsibility

---

## 3. Route Group Structure (Next.js App Router)

We use route groups to separate concerns cleanly. Parentheses mean the segment **does not** appear in the URL.

```txt
src/app/
  layout.tsx                 # root: fonts, providers, html/body
  (public)/
    layout.tsx               # public shell
    page.tsx                 # URL: /
    components/...           # URL: /components (example)
  (auth)/
    layout.tsx               # centred auth shell
    login/page.tsx           # URL: /login
  (app)/
    layout.tsx               # private shell (members area chrome)
    loading.tsx              # loading UI for /app/* segment transitions
    app/
      page.tsx               # URL: /app
      home/page.tsx          # URL: /app/home
      account/page.tsx       # URL: /app/account
```

Protected routes are nested under `(app)/app/` so URLs stay under `/app/*` while the group name `(app)` stays out of the path.

---

## 4. Route Group Responsibilities

### 4.1 `(public)`

**Purpose:**

- marketing and informational pages
- unauthenticated browsing

**Characteristics:**

- no auth required
- lightweight layout
- no dependency on user/session state

---

### 4.2 `(auth)`

**Purpose:**

- authentication entry points

**Routes:**

- `/login`

**Characteristics:**

- accessible without auth
- redirects authenticated users away
- minimal layout (focused UX)

---

### 4.3 `(app)` (Protected Area)

**Purpose:**

- authenticated application experience

**Routes:**

- `/app`
- `/app/home`
- `/app/*`

**Characteristics:**

- requires valid session
- wrapped in protected layout
- depends on user/session state

---

## 5. Layout Architecture

Each route group owns its own layout.

---

### 5.1 Public Layout

`/(public)/layout.tsx`

**Responsibilities:**

- public navigation
- branding
- general page container
- no auth awareness

---

### 5.2 Auth Layout

`/(auth)/layout.tsx`

**Responsibilities:**

- minimal wrapper
- centred form layout
- no global nav
- distraction-free UX

---

### 5.3 Private App Layout

`/(app)/layout.tsx`

**Responsibilities:**

- authenticated app shell
- main navigation (sidebar/topbar)
- user context awareness
- protected route wrapper (`MembersSessionBoundary` — session UX + invalid/expired JWT fallback)
- layout-level error boundaries

---

## 6. Shell Separation Rules

### Hard Separation

- Public and private layouts must not share stateful logic
- Private shell must not render without auth validation
- Public shell must not depend on session state

---

### Shared Components (Allowed)

- UI primitives (buttons, inputs, etc)
- design tokens (theme, colours, typography)
- generic layout utilities

---

### Non-Shared Components

- navigation systems
- auth-aware components
- user/session logic
- protected data rendering

---

## 7. Middleware Boundary

Middleware is responsible for **access control at the routing level**.

### Middleware Responsibilities

- detect presence of auth token
- validate access to protected routes
- redirect unauthenticated users
- prevent authenticated users from accessing login

---

### Route Protection Rules

| Route Type      | Behaviour                 |
| --------------- | ------------------------- |
| Public          | always accessible         |
| Auth (login)    | redirect if authenticated |
| App (protected) | require authentication    |

---

### Example Behaviour

- `/app` without token → redirect to `/login`
- `/login` with valid session → redirect to `/app`
- `/` → always allowed

---

## 8. Rendering Strategy

### Public Routes

- no auth dependency
- render immediately

---

### Auth Routes

- render immediately
- may redirect if already authenticated

---

### Protected Routes

Protected routes require:

- session validation before rendering (middleware + optional JWT expiry check via `/api/auth/session`)
- loading state while segments resolve (`(app)/loading.tsx`)
- fallback if session invalid (`MembersSessionBoundary`)

---

## 9. Auth Resolution Strategy (High-Level)

Auth state can be resolved via:

- middleware (route-level protection)
- server-side validation (optional)
- client-side session awareness (UI-level)

This phase focuses on:

- middleware enforcement
- lightweight client awareness

---

## 10. Navigation Model

### Public Navigation

- simple header navigation
- links to marketing pages
- link to login

---

### Private Navigation

- application-style navigation
- persistent (sidebar or topbar)
- includes:
  - home
  - account (placeholder)
  - logout action

---

## 11. Protected Layout Wrapper

The private layout should include a wrapper that:

- assumes authenticated context
- safely handles missing/invalid session
- provides fallback UI if needed

**Implementation:** `MembersSessionBoundary` wraps children in `(app)/layout.tsx`, uses `useSession` + `/api/auth/session` (JWT expiry validated server-side), and redirects or shows a short fallback when the session is not usable.

---

## 12. Error Boundaries (Layout Level)

Private layout should include:

- error boundary for child routes
- fallback UI for:
  - failed render
  - missing data
  - unexpected errors

---

## 13. Redirect Strategy

### After Login

- redirect to `/app` (or stored intended route)

### After Logout

- redirect to `/login` or `/` (configurable via `AUTH_LOGOUT_REDIRECT` in `.env`)

### Unauthorized Access

- redirect to `/login`

---

## 14. URL Structure Guidelines

Keep URLs predictable and clean:

- `/` → public
- `/login` → auth
- `/app/*` → protected

Avoid mixing public and private paths.

---

## 15. Future Compatibility

This structure supports:

- role-based routing later
- admin vs member separation
- feature-based route expansion
- nested protected sections

---

## 16. Key Principles

### Clear boundaries

Public and private areas must never blur.

### Predictable routing

Users should always understand where they are.

### Centralised protection

All access control must live in middleware.

### Layout ownership

Each shell controls its own UI and behaviour.

---

## 17. Summary

This architecture ensures:

- clean separation of concerns
- strong route protection
- scalable layout structure
- predictable user experience
- maintainable codebase

It forms the foundation for all future member functionality.

---
