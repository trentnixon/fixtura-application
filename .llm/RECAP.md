Absolutely — here’s a more coherent, consolidated version that removes repetition, tightens the structure, and reads like a proper project context document.

---

# Fixtura Members Area — Consolidated Build Context

## Overview

We are building a **production-grade Fixtura Members Area** on a dedicated subdomain.

This application is **not the marketing site**. It is the secure operational product used by Fixtura members to access authenticated features, manage content-related workflows, and interact with the platform through a consistent, professional interface.

The current phase is focused on establishing the **architectural, UI, and system foundations** required for long-term consistency and scalable feature development.

---

## Product Intent

The Members Area is being designed to be:

- secure by default
- structurally predictable
- visually consistent
- extensible over time
- easy for both developers and LLMs to work within without introducing drift

This phase is **foundation-first**, not feature-complete. The goal is to lock in the right patterns before deeper product functionality is built.

---

## Core Architectural Model

The application follows a strict **two-shell model**:

### Public/Auth Shell

This is the unauthenticated layer of the application.

It handles:

- entry into the members area
- sign-in and password recovery
- session and auth state messaging
- basic support/help pages

This shell is intentionally lightweight, minimal, and separate from the main product UI.

### App Shell

This is the authenticated members environment.

It handles:

- protected product routes
- navigation
- shared member layout structure
- page framing and content scaffolding

This shell becomes the structural foundation for all member-facing product features.

---

## Route Structure

The system uses a clear split between:

- **public routes** → available without login
- **authenticated routes** → protected and accessible only with a valid session

### Public Layer Responsibilities

The public layer is responsible for:

- orienting the user
- providing authentication access
- handling recovery and error flows
- providing a minimal branded entry experience

Typical public routes include:

- `/`
- `/sign-in`
- `/forgot-password`
- `/reset-password`
- `/auth-error`
- `/session-expired`
- `/help`

### Authenticated Layer Responsibilities

The authenticated layer is responsible for:

- delivering product functionality
- persistent app navigation
- session-aware member UI
- operational workflows and tools

Typical protected routes are expected to include:

- `/app/dashboard`
- `/app/bundles`
- `/app/template-builder`
- `/app/media-gallery`
- `/app/manage-sponsors`
- `/app/season`
- `/app/settings`
- `/app/account`

---

## Security Model

Security boundaries are intentionally strict.

### Core Rules

- **Middleware is the source of truth for access control**
- **UI must not implement security logic**
- **Client-side session state is for UX only, not protection**
- **The API layer is auth-aware and centralised**
- **Protected routes are enforced by middleware, not by page components**

### Redirect Behaviour

The desired behaviour is:

- unauthenticated users attempting to access protected routes are redirected to sign-in
- authenticated users attempting to access public entry routes are redirected into the app
- the public home route functions as a pre-auth entry point, not a signed-in landing page

---

## Authentication Model

The auth system is based on **Strapi email/password authentication** using **JWT stored in HTTP-only cookies**.

This replaced an earlier incorrect assumption around OTP/passwordless login. The current documented auth model is now aligned with the real system.

### Supported Auth Flows

- sign in with email and password
- forgot password request
- password reset via Strapi token/code
- auth error handling
- session expired handling

### Important Auth Principles

- authentication pages remain public until access is granted
- auth flow documentation must reflect Strapi’s real endpoints and behaviour
- UI components and route flows must match the Strapi implementation, not an imagined auth model

---

## Public/Auth UI Foundation

A significant part of the recent work has been defining the unauthenticated user experience as a system rather than as isolated pages.

### Public Shell Intent

The public shell is a **lightweight branded entry layer**. It is not a marketing site and not a feature area.

It should include:

- a simple top bar
- a footer
- a shared responsive container
- minimal, clear authentication-focused layout patterns

### Auth Documentation Created

This work has already produced or clarified:

- a public shell definition
- a corrected auth flow specification
- a corrected auth component inventory
- Strapi-specific login and password recovery documentation
- rules for how authenticated users should be redirected when hitting public routes

---

## App Shell Foundation

We also shifted into defining the **private authenticated shell** that all protected pages will use.

This began from a shadcn sidebar shell reference, but the goal was to adapt it into a Fixtura-specific app shell rather than use generic starter UI.

### App Shell Decisions Locked In

- persistent full sidebar on desktop
- collapsible icon-only sidebar state on desktop
- drawer-style behaviour on mobile
- title-based header rather than breadcrumb-heavy header
- full-width content region with controlled page padding
- Fixtura-specific styling rather than template-default aesthetics

### Shell Responsibilities

The app shell should own:

- navigation
- framing
- header structure
- spacing conventions
- page-level layout consistency

Individual pages should only own their own content.

This is important to prevent layout drift as more routes and features are introduced.

---

## Data Layer Architecture

The members area is also being built with a strict, centralised data model.

The agreed system flow is:

**UI → TanStack Query hook → domain API service → central fetch client → route registry**

### Data Layer Principles

- TanStack Query owns server state
- temporary UI state stays local to components
- global client state is reserved for true UI-only cross-page concerns
- fetch behaviour is centralised
- route definitions are structured and typed
- domain services provide the stable interface between UI and backend

### Planned Data Layer Structure

The system includes:

- a central fetch client
- a route registry with metadata
- domain API service files
- TanStack Query hooks
- clear type ownership
- an admin-only diagnostics/fetch health page

### Route Metadata Intent

Each route should carry metadata like:

- key
- method
- path
- auth requirement
- admin-only status
- implementation status
- description
- domain

This makes the system easier to maintain, easier to inspect, and far more LLM-friendly.

---

## Skill System

A major part of this build is the structured **LLM skill system** used to maintain consistency.

The system has three layers:

### 1. Agent Rules

These define the fixed constraints of the application, including:

- architecture boundaries
- auth model
- routing rules
- non-negotiable implementation rules

### 2. Skills

These define how tasks should be performed correctly, including:

- UI implementation patterns
- API usage patterns
- auth flow handling
- component and layout decisions
- system integration behaviours

### 3. Kitchen Sink

This acts as the live visual reference for approved UI usage.

Together, these three layers are intended to reduce ambiguity, prevent drift, and make the project easier to continue consistently across future sessions.

---

## Design System Approach

We are **not building a full rigid design system yet**.

Instead, we are building a **Design System Foundation** with clear constraints.

### Design Philosophy

The Members Area should feel:

- clean
- structured
- calm
- professional
- functional rather than decorative

### Hard Constraints

- maximum of 2 fonts
- maximum of 2 primary colours, plus black and white / neutrals
- consistent spacing system
- minimal component variants
- no visual noise
- no gimmicks
- no unnecessary complexity

The goal is composure, clarity, and repeatability.

---

## Kitchen Sink System

The kitchen sink is being built as a **protected visual reference system** inside the members app.

### Purpose

It serves as the:

- live UI reference
- visual source of truth
- approved pattern library
- component and state guide for future product work

### Coverage

It is intended to include pages for:

- typography
- colours
- layout and containers
- navigation
- buttons
- cards
- forms
- inputs
- tables
- dialogs
- popovers
- toasts
- loading states
- empty states
- error states
- avatars
- icons
- command patterns
- other primitives required by the app

### Critical Rule

If a UI pattern is not represented in the kitchen sink, it is not yet an approved pattern.

### Workflow Rule

All new UI work should:

1. check the relevant skill
2. check the kitchen sink
3. match the established pattern
4. avoid inventing new patterns unless the system is intentionally being expanded

---

## Key Working Principles

### Consistency over creativity

The goal is not novelty. The goal is system cohesion.

### Reuse before creation

Check what already exists before introducing something new.

### Boundaries must stay clean

- middleware handles protection
- API layer handles auth-aware data access
- UI handles presentation only

### The kitchen sink is authoritative

The kitchen sink defines what approved UI looks like in practice.

### Calm, structured UI always wins

Avoid:

- visual noise
- over-styling
- decorative complexity
- unnecessary layout variation

---

## Current Project Phase

The project is currently in a foundational phase focused on:

- route architecture
- auth/public shell documentation
- private app shell definition
- design system foundations
- kitchen sink planning
- centralised data-layer planning
- skill and agent system setup

This work is intentionally preparing the system so feature implementation happens inside a controlled structure.

---

## Immediate Next Steps

The next logical steps are:

1. build the shared public/auth shell layout
2. build the private app shell in code
3. build the kitchen sink pages using shadcn
4. define spacing and layout grid rules more concretely
5. implement the first data-layer primitives
6. begin real protected feature pages using the shell and kitchen sink patterns

---

## Mental Model

The Fixtura Members Area should be understood as:

> A secure, middleware-controlled members application with strict public/auth separation, a centralised data architecture, a constrained design foundation, and a skill-driven development system supported by a live kitchen sink reference.

Multi-Organisation Route Logic Pattern Added

We have now introduced a new route logic pattern for the Fixtura members area to support the planned multi-organisation model.

The key architectural change is that the app no longer treats login as the final gateway into the members UI. Instead, login now establishes user identity only. After authentication, the system must resolve the user’s active organisation context before loading the main application shell.

The new flow is:

Login
→ fetch user + organisation summary
→ select organisation OR create organisation
→ fetch active organisation data
→ load organisation UI

This creates a new middle layer between authentication and the protected app UI.

New Route Layer Thinking

The members area is now understood as three layers:

Public layer
landing
sign in
forgot password
help/support
Authenticated but unscoped layer
select organisation
create organisation
organisation onboarding
Authenticated and organisation-scoped app layer
dashboard
downloads
settings
scheduler
templates
all main members UI
Core Principle

Authentication identifies the user.
Organisation selection establishes the working context.

The main app shell must only load once both are true:

the user is authenticated
an organisation has been selected or created
Route Protection Logic

Protected route logic now needs two checks:

Is the user authenticated?
if not, redirect to sign in
Does the route require organisation context?
if yes, and no valid organisation is resolved, redirect to organisation selection

This means a user can be logged in but still not yet allowed into the main app until organisation context is established.

Main Behaviour Decisions
If the user has no organisations, they should be routed into create organisation / onboarding
If the user has one or more organisations, they should be routed into organisation selection
The app should not immediately push users into /app after login
Organisation resolution is now a required step before mounting the full members UI
Why This Matters

This gives the members area a cleaner multi-organisation architecture by separating:

identity
from
organisation context

This improves clarity in:

route logic
middleware decisions
onboarding flow placement
app shell mounting
frontend hydration order
future account/org switching support
Document Created

A dedicated LLM-facing markdown document was created for this pattern:

FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md

This document explains the route model, state flow, route protection logic, shell model, and the required login → organisation resolution → app load sequence.

Development Sandbox System Added

We defined a clearer sandbox structure for the Fixtura Members Area so development can be split by what is being worked on, rather than using one catch-all development route.

The sandbox system now has three distinct layers:

/kitchen-sink → component and design primitive sandbox
/route-lab → full page, route, layout, and screen-state sandbox
/interaction-lab → behaviour, mechanics, and interaction sandbox

This creates a much cleaner development model:

Kitchen Sink = what components look like
Route Lab = how pages are assembled
Interaction Lab = how behaviours work
Shared Sandbox Access Model

A key decision was made that these sandbox routes must not depend on JWT auth or live CMS access.

This is important because development sometimes happens away from the normal local environment, including situations where:

Strapi is offline
localhost CMS is unavailable
login cannot complete
backend services are disconnected
work needs to continue while out of office

Because of that, the sandbox routes are now defined as environment-controlled, not auth-controlled.

The agreed shared env flag is:

NEXT_PUBLIC_ENABLE_DEV_SANDBOX=true

This flag controls access to all sandbox routes.

When enabled:

/kitchen-sink
/route-lab
/interaction-lab

are available.

When disabled, these routes should return 404 and behave as though they do not exist.

Route Lab Defined

/route-lab was introduced as the page and route development sandbox.

Its purpose is to support:

full page development
layout composition
shell work
route-state testing
organisation flow development
onboarding flow testing
app page scaffolding
loading, empty, and error page states

This route is especially useful because the members area now has a more advanced route model with:

public routes
authenticated but unscoped routes
authenticated and organisation-scoped routes

The route lab gives a way to visually develop and test these flows without needing real auth or real organisation resolution.

A dedicated markdown doc was created for this:

DEV_SANDBOX_ROUTES.md

This doc defines:

sandbox purpose
access rules
env control
differences between /kitchen-sink and /route-lab
scenario param patterns
implementation examples for the shared sandbox gate
production safety rules
Interaction Lab Defined

A third sandbox route was then added:

/interaction-lab

This route is intended for functionality and behaviour testing.

It exists for interaction-heavy mechanics that are too stateful for the kitchen sink and do not need a full production page context like the route lab.

Examples include:

uploads
drag and drop
sorting and reordering
bulk selection
async form submission
validation flows
loading / success / error transitions
retry behaviour
dialog flows
clipboard actions
optimistic UI behaviour

This gives the sandbox system a much stronger separation of concerns and avoids mixing component work, page work, and interaction work together.

A dedicated markdown doc was also created for this:

INTERACTION_LAB.md

This doc defines:

purpose and boundaries
what belongs in interaction lab
what does not belong there
route structure
scenario/state patterns
mock and fake async rules
production safety rules
recommended first interaction pages
Shared Implementation Direction

The agreed implementation direction is that all sandbox routes should share the same development gate pattern.

Recommended shared helper:

export const isDevSandboxEnabled =
process.env.NEXT_PUBLIC_ENABLE_DEV_SANDBOX === "true";

Recommended shared gate component:

use one common DevSandboxGate
wrap /kitchen-sink, /route-lab, and /interaction-lab
return 404 when sandbox mode is disabled

This keeps sandbox access consistent across all dev-only route spaces.

Sandbox Philosophy Now Established

The sandbox system is now understood as a development-only suite that supports work across three levels:

1. Component sandbox

/kitchen-sink

Used for:

isolated UI primitives
design patterns
approved visual states 2. Page sandbox

/route-lab

Used for:

route and screen development
shell/layout composition
page-level scenarios 3. Behaviour sandbox

/interaction-lab

Used for:

interactive mechanics
async flows
user behaviour and state transitions

All three routes are:

development-only
env-gated
offline-safe
mock/fixture friendly
not part of the real production access model
Documents Created

The following new LLM-facing docs were created during this work:

DEV_SANDBOX_ROUTES.md
INTERACTION_LAB.md

These documents now give Cursor a clear implementation guide for the sandbox route system and how each sandbox area should be used.
