# Fixtura Members Area — Folder Structure and File Map

## 1. Purpose

This document defines the recommended folder structure and file map for the initial Fixtura Members Area shell build.

It is designed for:

- Next.js App Router
- Strapi JWT authentication
- public and private shell separation
- middleware-based protection
- centralised auth and API handling
- production-ready error handling

This structure focuses only on the **initial protected shell build**, not future feature modules.

---

## 2. Goals of the Structure

The folder structure should:

- clearly separate public, auth, and protected app areas
- isolate auth logic from UI components
- centralise API and session handling
- make middleware behaviour easy to understand
- support future expansion without major refactor

---

## 3. Recommended High-Level Structure

````txt
src/
  app/
    (public)/
      layout.tsx
      page.tsx

    (auth)/
      layout.tsx
      login/
        page.tsx

    (app)/
      layout.tsx
      app/
        page.tsx
        home/
          page.tsx
        account/
          page.tsx

    api/
      auth/
        login/
          route.ts
        logout/
          route.ts
        session/
          route.ts

    error.tsx
    not-found.tsx
    globals.css

  components/
    layout/
      public/
        public-shell.tsx
        public-header.tsx
        public-footer.tsx

      auth/
        auth-shell.tsx

      app/
        app-shell.tsx
        app-sidebar.tsx
        app-header.tsx
        app-nav.tsx

    auth/
      login-form.tsx
      logout-button.tsx
      protected-route-fallback.tsx
      session-expired-message.tsx

    feedback/
      error-state.tsx
      loading-state.tsx
      empty-state.tsx
      access-denied-state.tsx

    ui/
      ...
      shadcn components

  lib/
    auth/
      auth-cookie.ts
      auth-session.ts
      auth-redirect.ts
      auth-constants.ts
      auth-errors.ts

    api/
      api-client.ts
      api-error.ts
      api-response.ts

    config/
      routes.ts
      navigation.ts

    utils/
      cn.ts
      logger.ts

  hooks/
    use-auth-session.ts
    use-logout.ts

  providers/
    app-providers.tsx
    auth-provider.tsx

  middleware.ts

  types/
    auth.ts
    api.ts
    user.ts
``` id="72184"

---

## 4. App Router Structure

The `app/` directory should reflect the shell architecture directly.

---

### 4.1 `(public)`

```txt
app/(public)/
  layout.tsx
  page.tsx
``` id="59302"

**Purpose:**
- public-facing pages
- no auth requirement
- public shell wrapper

---

### 4.2 `(auth)`

```txt
app/(auth)/
  layout.tsx
  login/page.tsx
``` id="77415"

**Purpose:**
- authentication entry pages
- minimal focused layout
- redirect authenticated users away

---

### 4.3 `(app)`

```txt
app/(app)/
  layout.tsx
  app/
    page.tsx
    home/page.tsx
    account/page.tsx
``` id="24506"

**Purpose:**
- protected application shell
- authenticated routes only
- placeholder internal pages for initial validation

---

## 5. API Route Structure

These routes act as the secure bridge between UI and auth/session handling.

```txt
app/api/auth/
  login/route.ts
  logout/route.ts
  session/route.ts
``` id="90157"

---

### 5.1 `login/route.ts`

**Responsibility:**
- receive credentials from login form
- call Strapi auth endpoint
- set auth cookie
- return success/failure response

---

### 5.2 `logout/route.ts`

**Responsibility:**
- clear auth cookie
- reset server-side session state if needed

---

### 5.3 `session/route.ts`

**Responsibility:**
- return current session status
- support client-side auth awareness
- allow lightweight session validation

---

## 6. Layout Components

Layout-specific components should live under `components/layout/`.

This keeps page-level route files small and makes shell structure reusable and easy to reason about.

---

### 6.1 Public Layout Components

```txt
components/layout/public/
  public-shell.tsx
  public-header.tsx
  public-footer.tsx
``` id="10655"

**Purpose:**
- public shell wrapper
- top-level navigation
- footer and basic framing

---

### 6.2 Auth Layout Components

```txt
components/layout/auth/
  auth-shell.tsx
``` id="41382"

**Purpose:**
- minimal auth page wrapper
- centred form layout
- distraction-free experience

---

### 6.3 Private App Layout Components

```txt
components/layout/app/
  app-shell.tsx
  app-sidebar.tsx
  app-header.tsx
  app-nav.tsx
``` id="81174"

**Purpose:**
- authenticated shell
- private navigation
- app framing and structure

---

## 7. Auth Components

Keep auth UI concerns together.

```txt
components/auth/
  login-form.tsx
  logout-button.tsx
  protected-route-fallback.tsx
  session-expired-message.tsx
``` id="66124"

---

### Responsibilities

#### `login-form.tsx`
- credential input
- submission state
- auth error display

#### `logout-button.tsx`
- logout trigger
- session cleanup initiation

#### `protected-route-fallback.tsx`
- loading or blocked state while session resolves

#### `session-expired-message.tsx`
- standardised expired-session messaging

---

## 8. Feedback Components

Centralise reusable UI for failures and system states.

```txt
components/feedback/
  error-state.tsx
  loading-state.tsx
  empty-state.tsx
  access-denied-state.tsx
``` id="53780"

These should be generic, reusable, and styling-consistent.

---

## 9. Auth Library Structure

All low-level auth logic should live in `lib/auth/`.

```txt
lib/auth/
  auth-cookie.ts
  auth-session.ts
  auth-redirect.ts
  auth-constants.ts
  auth-errors.ts
``` id="63911"

---

### 9.1 `auth-cookie.ts`

**Responsibility:**
- set auth cookie
- read auth cookie
- clear auth cookie

---

### 9.2 `auth-session.ts`

**Responsibility:**
- interpret current session state
- provide helpers for protected routes and auth checks

---

### 9.3 `auth-redirect.ts`

**Responsibility:**
- shared redirect helpers
- centralise redirect logic for auth flows

---

### 9.4 `auth-constants.ts`

**Responsibility:**
- cookie names
- route constants
- auth-related configuration values

---

### 9.5 `auth-errors.ts`

**Responsibility:**
- standard auth error mapping
- consistent error keys/messages

---

## 10. API Library Structure

All API access should go through a shared layer.

```txt
lib/api/
  api-client.ts
  api-error.ts
  api-response.ts
``` id="75294"

---

### 10.1 `api-client.ts`

**Responsibility:**
- central fetch wrapper
- attach auth token when required
- standardise headers and parsing

---

### 10.2 `api-error.ts`

**Responsibility:**
- normalise API errors
- identify 401 / 403 / 5xx / network failures

---

### 10.3 `api-response.ts`

**Responsibility:**
- response helpers
- typed success/failure mapping

---

## 11. Config Structure

Use dedicated config files for routes and navigation.

```txt
lib/config/
  routes.ts
  navigation.ts
``` id="95861"

---

### `routes.ts`
- public paths
- auth paths
- protected paths
- redirect defaults

### `navigation.ts`
- public nav config
- app nav config
- keeps shell UI declarative

---

## 12. Hooks

Hooks should stay small and focused.

```txt
hooks/
  use-auth-session.ts
  use-logout.ts
``` id="17728"

---

### `use-auth-session.ts`
- lightweight session state access
- UI awareness only
- not the source of truth for protection

**Repo implementation:** [`src/hooks/use-session.ts`](../src/hooks/use-session.ts) defines `useSession` (canonical). [`src/hooks/use-auth-session.ts`](../src/hooks/use-auth-session.ts) re-exports the same API for filename parity with this document.

### `use-logout.ts`
- centralise logout action
- trigger cleanup and redirect

---

## 13. Providers

Use providers only where needed.

```txt
providers/
  app-providers.tsx
  auth-provider.tsx
``` id="32451"

---

### `app-providers.tsx`
- mount shared app-level providers
- query client, theme, etc

### `auth-provider.tsx`
- optional lightweight auth/session awareness
- should not replace middleware protection

---

## 14. Middleware

```txt
middleware.ts
``` id="21546"

**Responsibility:**
- classify route type
- inspect auth cookie
- enforce redirects
- protect `/app/*`
- redirect authenticated users away from `/login`

This file should stay focused and small.

Do not place business logic here.

---

## 15. Types

```txt
types/
  auth.ts
  api.ts
  user.ts
``` id="49037"

Keep auth/session/API types centralised so components and lib code do not invent their own shapes.

---

## 16. Error Files in App Router

At minimum, include:

```txt
app/
  error.tsx
  not-found.tsx
``` id="58701"

You may also add route-group-level `error.tsx` files later if needed.

---

## 17. Suggested Initial File Responsibilities

### Route Files
Keep thin.
They should mainly compose layout and page-level components.

### Components
Handle display and interaction.

### `lib/auth`
Own auth mechanics.

### `lib/api`
Own request/response handling.

### `middleware.ts`
Own access enforcement.

This keeps responsibility boundaries clear.

---

## 18. Example Initial Build Order by File

### Step 1
Create route groups and layouts:
- `app/(public)/layout.tsx`
- `app/(auth)/layout.tsx`
- `app/(app)/layout.tsx`

### Step 2
Create pages:
- `app/(public)/page.tsx`
- `app/(auth)/login/page.tsx`
- `app/(app)/app/page.tsx`

### Step 3
Create shell components:
- `public-shell.tsx`
- `auth-shell.tsx`
- `app-shell.tsx`

### Step 4
Create auth foundation:
- `auth-cookie.ts`
- `auth-session.ts`
- `login/route.ts`
- `logout/route.ts`

### Step 5
Create protection:
- `middleware.ts`

### Step 6
Create API client:
- `api-client.ts`

### Step 7
Add feedback and error handling:
- `error-state.tsx`
- `loading-state.tsx`
- `app/error.tsx`

---

## 19. Future Expansion Compatibility

This structure supports future additions such as:

- dashboard modules
- account settings
- role-based access
- admin-only sections
- feature-based route groups

without needing to rebuild the auth and shell foundation.

---

## 20. Summary

This folder structure is designed to make the initial Fixtura Members Area:

- clear to navigate
- easy to scaffold
- secure by default
- production-ready
- scalable for future internal features

It gives the project a professional base before any protected business functionality is introduced.

---
````
