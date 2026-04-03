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
