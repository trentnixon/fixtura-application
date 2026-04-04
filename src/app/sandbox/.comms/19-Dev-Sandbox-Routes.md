# Development Sandbox Routes

## Overview

This document defines the development-only sandbox route system for the Fixtura Members Area.

The sandbox system exists so page, route, shell, and component work can continue even when the local CMS is unavailable, JWT login cannot complete, or the developer is working away from the normal environment.

This is especially important for offline-safe development and for continuing UI work without requiring a live authenticated backend connection.

---

## Purpose

The sandbox route system provides two dedicated development areas:

- `/kitchen-sink` → component and design primitive development
- `/route-lab` → full page, route, layout, and flow development

These routes are **not part of the real application access-control model**.

They are **development tools only**.

They must be able to run:

- without JWT authentication
- without organisation resolution
- without a live CMS connection
- with mock or fixture-driven data

---

## Why This Exists

In normal application architecture, access to most private UI depends on:

- successful login
- valid JWT session
- resolved organisation context
- backend availability

That is correct for production.

However, this creates friction for development when:

- Strapi is offline
- localhost CMS is unavailable
- backend services are disconnected
- login cannot complete
- the developer is working remotely or out of office

The sandbox routes solve this by providing a controlled development surface that is independent from real authentication and backend state.

---

## Core Principle

Sandbox routes are **environment-controlled**, not auth-controlled.

That means:

- access is managed through an environment flag
- access is not dependent on JWT auth
- access is not dependent on middleware route protection for real members features
- routes should disappear entirely when sandbox mode is disabled

The goal is to make these routes available when needed for development, while keeping them out of production behaviour.

---

## Included Sandbox Routes

### 1. Kitchen Sink

Route:

`/kitchen-sink`

Purpose:

- component development
- visual pattern development
- primitive state testing
- approved UI reference patterns
- design system foundation work

Use this for:

- buttons
- cards
- forms
- inputs
- tables
- dialogs
- toasts
- loading states
- empty states
- icons
- navigation primitives
- typography and spacing reference

The kitchen sink is the **component-level sandbox**.

---

### 2. Route Lab

Route:

`/route-lab`

Purpose:

- full page development
- route and screen scaffolding
- shell composition
- onboarding flow development
- auth-state simulation
- organisation-state simulation
- full-page loading, empty, and error state development

Use this for:

- sign-in page layouts
- forgot/reset password pages
- organisation selection pages
- create organisation/onboarding pages
- dashboard page composition
- settings page structure
- page-level skeleton and empty states
- shell spacing and header treatment

The route lab is the **page and route-level sandbox**.

---

## Purpose Split

### `/kitchen-sink`

Use when building:

- isolated components
- small interaction patterns
- visual primitives
- approved UI states

### `/route-lab`

Use when building:

- full screens
- page composition
- route-level UX
- shell behaviour
- route state variations
- complete page scenarios

### Rule

If the work is about an individual UI primitive, it belongs in `/kitchen-sink`.

If the work is about a whole page, flow, or route state, it belongs in `/route-lab`.

---

## Environment Control

A shared environment flag should control access to both sandbox routes.

Recommended env:

```env
NEXT_PUBLIC_ENABLE_DEV_SANDBOX=true
```

This flag should be the single source of truth for whether sandbox routes are available.

---

## Access Rules

### When sandbox mode is enabled

These routes should be available:

- `/kitchen-sink`
- `/route-lab`

### When sandbox mode is disabled

These routes should:

- return `404`
- behave as though they do not exist

This is preferred over redirecting because these routes are development tools, not real product routes.

---

## Critical Constraint

The sandbox route system must:

- not require JWT auth
- not require CMS connectivity
- not require real organisation resolution
- not depend on real member session state

It must be safe for offline or disconnected development.

---

## Real App Architecture vs Sandbox Architecture

### Real App Architecture

The real members area still follows the true application route model:

1. Public layer
   - landing
   - sign in
   - forgot password
   - help/support

2. Authenticated but unscoped layer
   - select organisation
   - create organisation
   - onboarding

3. Authenticated and organisation-scoped app layer
   - dashboard
   - bundles
   - templates
   - settings
   - member tools

This remains correct for production.

### Sandbox Architecture

The sandbox routes are not part of that real security model.

They are development-only route spaces that may simulate any of the above states without requiring real auth or live backend data.

That means sandbox pages may simulate:

- signed out
- signed in
- no organisations
- one organisation
- multiple organisations
- first-time onboarding
- loading
- empty
- error
- success

---

## Mocking and Simulation Rules

Sandbox routes should use:

- local fixtures
- static mock objects
- scenario params
- development-only helpers

They should not require:

- live API responses
- real user session cookies
- real JWT validation
- CMS fetch success

The purpose is realistic UI development without infrastructure dependence.

---

## Scenario Pattern

Route-lab pages should support scenario-based rendering.

Recommended pattern:

- `state`
- `mode`

Examples:

```txt
/route-lab/public/sign-in?state=error
/route-lab/public/sign-in?state=default
/route-lab/org/select-organisation?state=multiple
/route-lab/org/select-organisation?state=none
/route-lab/app/dashboard?mode=org-selected&state=empty
/route-lab/app/dashboard?mode=org-selected&state=loading
```

### Suggested meanings

#### `state`

Represents the page condition, for example:

- `default`
- `loading`
- `empty`
- `error`
- `success`
- `partial`

#### `mode`

Represents the higher-level route or session context, for example:

- `signed-out`
- `signed-in`
- `no-org`
- `org-selected`
- `first-login`

This pattern allows one route to simulate multiple realistic page states without creating unnecessary route duplication.

---

## Route Lab Structure

Recommended structure:

```txt
/route-lab
  /overview
  /public
    /home
    /sign-in
    /forgot-password
    /reset-password
    /auth-error
    /session-expired
    /help
  /org
    /select-organisation
    /create-organisation
    /onboarding
    /switch-organisation
  /app
    /dashboard
    /bundles
    /templates
    /settings
    /account
  /states
    /empty
    /loading
    /error
    /not-found
    /maintenance
```

This structure should model intended real routes, not random concept screens.

---

## Kitchen Sink Structure

The kitchen sink should remain the visual primitive reference.

Typical coverage includes:

- typography
- brand colours
- containers
- navigation
- buttons
- cards
- forms
- dialogs
- tables
- popovers
- loading
- inputs
- avatar
- icons
- carousel
- command

This area should define approved component patterns and variants.

---

## Shared Implementation Pattern

Both `/kitchen-sink` and `/route-lab` should use the same sandbox gate.

### Shared helper

```ts
// src/lib/dev-sandbox.ts
export const isDevSandboxEnabled = process.env.NEXT_PUBLIC_ENABLE_DEV_SANDBOX === "true";
```

### Shared gate component

```tsx
// src/components/dev/DevSandboxGate.tsx
import { notFound } from "next/navigation";
import { isDevSandboxEnabled } from "@/lib/dev-sandbox";

export function DevSandboxGate({ children }: { children: React.ReactNode }) {
  if (!isDevSandboxEnabled) {
    notFound();
  }

  return <>{children}</>;
}
```

### Route layouts

```tsx
// app/kitchen-sink/layout.tsx
import { DevSandboxGate } from "@/components/dev/DevSandboxGate";

export default function KitchenSinkLayout({ children }: { children: React.ReactNode }) {
  return <DevSandboxGate>{children}</DevSandboxGate>;
}
```

```tsx
// app/route-lab/layout.tsx
import { DevSandboxGate } from "@/components/dev/DevSandboxGate";

export default function RouteLabLayout({ children }: { children: React.ReactNode }) {
  return <DevSandboxGate>{children}</DevSandboxGate>;
}
```

---

## Production Safety Rules

### 1. Sandbox routes must not be part of the real access model

Do not treat sandbox routes as real authenticated member routes.

### 2. Sandbox routes must not depend on backend success

They must continue to function when backend systems are unavailable.

### 3. Production features must not depend on sandbox routes

No production workflow, navigation path, or business logic should require `/kitchen-sink` or `/route-lab`.

### 4. Sandbox routes should be hidden when disabled

They should return `404`, not remain partially reachable.

### 5. Sandbox pages should model real route intent

They should reflect real route goals and UX patterns, not become a dumping ground for unrelated experiments.

---

## Relationship to Multi-Organisation Architecture

The real members application now has a three-layer routing model:

1. public
2. authenticated but unscoped
3. authenticated and organisation-scoped

The route lab is useful because it allows these states to be developed visually without requiring the full real auth and organisation resolution chain.

This is especially important for pages such as:

- select organisation
- create organisation
- onboarding
- dashboard before real data
- settings page structures
- signed-out and signed-in state comparisons

The route lab should therefore be treated as a route-state simulator for the new architecture.

---

## First Recommended Route Lab Pages

The first route-lab pages to build should be:

- `/route-lab/public/sign-in`
- `/route-lab/public/forgot-password`
- `/route-lab/org/select-organisation`
- `/route-lab/org/create-organisation`
- `/route-lab/app/dashboard`
- `/route-lab/app/settings`

These pages cover the most important current architectural work.

---

## First Recommended Scenario Coverage

### Sign In

- default
- validation error
- server error
- submitting

### Select Organisation

- loading
- no organisations
- one organisation
- multiple organisations
- error

### Create Organisation

- blank form
- validation error
- submitting
- success handoff

### Dashboard

- first-time empty state
- populated state
- partial state
- loading
- error

---

## Folder Structure Recommendation

```txt
app/
  kitchen-sink/
    layout.tsx
    page.tsx
    ...
  route-lab/
    layout.tsx
    page.tsx
    overview/
      page.tsx
    public/
      sign-in/
        page.tsx
      forgot-password/
        page.tsx
    org/
      select-organisation/
        page.tsx
      create-organisation/
        page.tsx
    app/
      dashboard/
        page.tsx
      settings/
        page.tsx

src/
  lib/
    dev-sandbox.ts
  components/
    dev/
      DevSandboxGate.tsx
      RouteLabPage.tsx
      ScenarioSwitch.tsx
  features/
    route-lab/
      fixtures/
        organisations.ts
        dashboard.ts
      utils/
        getScenario.ts
```

---

## Recommended Page Wrapper Pattern

Route-lab pages should use a shared wrapper to keep development screens consistent.

Example:

```tsx
<RouteLabPage
  title="Select Organisation"
  productionRoute="/select-organisation"
  description="Organisation selection screen for authenticated but unscoped users."
>
  {/* page content */}
</RouteLabPage>
```

This helps each lab page clearly communicate:

- what it represents
- which real route it is modelling
- what state or scenario is being shown

---

## Final Rule Set

### Kitchen Sink

- component sandbox
- visual primitive reference
- approved UI patterns

### Route Lab

- page and route sandbox
- flow and state development
- shell and layout composition
- route-state simulation

### Shared Rule

Both routes:

- are development-only
- are controlled by a shared env flag
- must work without JWT auth
- must work without live CMS access
- must be hidden when sandbox mode is disabled

---

## Summary

The Fixtura Members Area should include a shared development sandbox system with two route spaces:

- `/kitchen-sink` for component and design primitive work
- `/route-lab` for full page, route, and layout development

These routes exist to support fast, reliable, offline-safe development. They are not part of the real security model and must be controlled by environment configuration rather than JWT auth.

This gives the project a clean separation between:

- production routes
- component sandbox work
- page and route sandbox work

That separation will make the system easier to build, easier to maintain, and easier for both developers and LLMs to work within consistently.
