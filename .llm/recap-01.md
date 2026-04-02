# Fixtura Members Area — Design & System Context Summary

## Overview

We are building a **production-grade members application** for Fixtura, delivered on a subdomain and protected via **Strapi JWT authentication (HTTP-only cookies)**.

The system is intentionally structured to be:

- secure by default (middleware-controlled auth boundary)
- predictable (centralised API + routing rules)
- extensible (clear separation of concerns)
- LLM-friendly (agent rules + skills system)

This phase focuses on establishing a **consistent design and UI foundation**, not feature completeness.

---

## Architectural Model

The application follows a strict **two-shell structure**:

- **Auth Shell** → login experience
- **App Shell** → protected `/app/*` environment

Key system rules:

- Middleware is the **source of truth for access control**
- API layer is **centralised and auth-aware**
- UI is **stateless with respect to security**
- Session state is **for UX only, not protection**

---

## Skill System (Core Concept)

We have implemented a structured **LLM skill system** to enforce consistency and prevent drift.

### There are three layers:

### 1. Agent (Rules)

Defines:

- architecture constraints
- auth model
- routing rules
- what must never break

### 2. Skills (Execution)

Define:

- how to perform tasks correctly
- patterns for building UI, API calls, auth flows, etc.

### 3. Kitchen Sink (Visual Source of Truth)

Provides:

- real UI examples
- approved component usage
- layout and state patterns

---

## Design System Approach

We are not building a rigid design system yet.

Instead, we have created a **Design System Foundation** with strict constraints:

### Design Philosophy

The app must feel:

- clean
- structured
- calm
- professional
- functional (not decorative)

### Hard Constraints

- max **2 fonts**
- max **2 primary colours (+ black/white)**
- consistent spacing system
- minimal variants
- no visual noise or gimmicks

---

## Kitchen Sink System

We are building a **protected `/app/kitchen-sink/*` route system**.

This is:

- the **live visual reference**
- the **source of truth for UI patterns**
- tightly coupled to real app layout + styling

It includes pages for:

- typography
- colors
- layout/containers
- components (buttons, cards, inputs, etc.)
- states (loading, empty, error, access)
- forms
- navigation
- feedback/toasts
- and other UI primitives

### Critical Rule

All UI work must:

1. check the relevant skill
2. check the kitchen sink page
3. match the pattern

---

## UI System Coverage

We now have skills covering:

### Layout & Structure

- layout and spacing system
- navigation UI patterns

### Components

- component usage patterns
- form patterns
- icons and visual elements

### UX Behaviour

- UI state patterns
- session-aware UI
- feedback and notifications

### System Integration

- kitchen sink maintenance
- debug system

---

## Key Principles to Maintain

### 1. Consistency over creativity

Do not invent new patterns if one already exists.

### 2. Reuse before creation

Always check existing components and kitchen sink examples first.

### 3. System boundaries are strict

- middleware = protection
- API layer = auth handling
- UI = presentation only

### 4. Kitchen sink is authoritative

If something is not represented there, it is not yet a defined pattern.

### 5. Calm, structured UI always wins

Avoid:

- visual noise
- excessive styling
- complex layouts

---

## What Comes Next

The next phase is:

👉 **Building out the kitchen sink pages using shadcn**

This will:

- establish real UI patterns
- refine spacing, typography, and components
- act as the base for all future feature work

---

## Mental Model

This system should be understood as:

> A protected application with strict architectural boundaries, supported by a skill-driven development system and a live visual reference (kitchen sink), designed to produce consistent, scalable, and professional UI.

Absolutely—this is a great moment to lock in a **clean handoff summary**.
This is written specifically so an LLM (or future you) can **pick up instantly without drift**.

---

````md
# Fixtura Members Area — Build Context Summary

## Overview

We are building a **members application on a subdomain** for Fixtura.

This is **not the marketing site**.

The purpose of this application is to:

- provide secure access to member features
- handle authentication and session management
- deliver a consistent, structured UI system
- serve as the operational interface for Fixtura users

---

## Architecture

The application is structured into two route groups:

### `(public)` — Unauthenticated

Accessible without login.

Handles:

- entry into the members system
- authentication flow (sign-in, verify)
- system state pages (errors, expired session, maintenance)
- support/help
- **kitchen sink (design system reference)**

---

### `(auth)` — Authenticated

Restricted via middleware.

Handles:

- all member-only functionality
- business features (dashboard, bundles, templates, etc.)
- account and settings

---

## Core System Rules

### 1. Strict Route Separation

- `(public)` → no authentication required
- `(auth)` → authentication required

---

### 2. Authentication Flow is Public

> Authentication-related pages are public until access is granted.

Includes:

- `/sign-in`
- `/verify`
- `/auth-error`
- `/session-expired`

---

### 3. Middleware is the Source of Truth

- all access control is handled in middleware
- UI must not implement security logic
- no client-side auth gating

---

### 4. Redirect Behaviour

- unauthenticated → `(auth)` → redirect to `/sign-in`
- authenticated → `/` → redirect to `/dashboard`

---

## Design System Approach

We are building a **Design System Foundation**, not a full design system.

### Philosophy

The UI must feel:

- clean
- structured
- calm
- professional
- functional (not decorative)

---

### Hard Constraints

- maximum **2 fonts**
- maximum **2 primary colours (+ neutral system)**
- consistent spacing system
- minimal component variants
- no visual noise

---

## Design Tokens (Locked In)

### Colours

```ts
primary: "#4C82C6";

background: "#FAFBFC";
surface: "#FFFFFF";
border: "#E6EAF0";

text: "#111827";
textMuted: "#4B5563";

success: "#2CA58D";
error: "#D64545";
warning: "#E6A23C";
```
````

---

### Typography

- Headings → Plus Jakarta Sans
- Body → Inter

---

## Kitchen Sink System

### Location

```
/kitchen-sink/*
```

### Purpose

The kitchen sink is the:

- **visual source of truth**
- **UI pattern reference**
- **component standard library**

---

### Coverage

Includes:

- typography
- colors
- layout/containers
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
- command UI

---

### Critical Rule

> If a UI pattern does not exist in the kitchen sink, it is not yet defined.

---

### Design-First Rule

> All new UI patterns must be implemented in the kitchen sink before being used in production.

---

## Public Layer

The `(public)` layer is a **pre-auth utility shell**.

### Responsibilities

- orient the user
- provide access to authentication
- handle system states
- provide support pathways

### Characteristics

- minimal UI
- centered layout
- no app navigation
- no product complexity

---

## Auth Layer

The `(auth)` layer is the **actual product interface**.

### Responsibilities

- deliver member functionality
- provide persistent navigation
- manage session-aware UI

### Core Routes

- `/dashboard`
- `/bundles`
- `/template-builder`
- `/media-gallery`
- `/manage-sponsors`
- `/season`
- `/settings`
- `/account`
- `/logout`

---

## Key Principles

### 1. Consistency over creativity

Reuse patterns. Do not invent new ones.

---

### 2. Reuse before creation

Always check kitchen sink first.

---

### 3. System boundaries are strict

- middleware = security
- API layer = auth + data
- UI = presentation only

---

### 4. Kitchen sink is authoritative

All UI must match defined patterns.

---

### 5. Calm UI always wins

Avoid:

- visual noise
- excessive styling
- unnecessary complexity

---

## Current Phase

We are currently:

- defining route architecture
- establishing design system foundations
- building out kitchen sink structure
- preparing for component-driven UI development

---

## Next Steps

1. Build `(public)/layout.tsx`
2. Build kitchen sink pages using shadcn
3. Define spacing system + layout grid
4. Map routes → components
5. Begin implementing `(auth)` UI using kitchen sink patterns

---

## Mental Model

> A secure, middleware-controlled members application with a strict public/auth split, powered by a constrained design system and a kitchen sink-driven UI architecture.

Yes — here’s a clean recap of what we’ve been building out after that initial summary.

We moved from broad architecture thinking into defining the **public members entry experience** in a much more concrete way. The focus shifted to the unauthenticated side of the Fixtura Members app: the shell, the auth flow, and the supporting component system. The goal has been to turn vague ideas like “login page” or “public routes” into structured internal docs that another LLM or developer could use without guessing.

The first big step was clarifying the **public shell**. Rather than a bare centered login card, you decided this area should still have a little bit of structure: a **top bar**, a **footer**, and a **shared responsive container**. The login form should be the main content on the landing page, but the shell also needs room for support/help routes and other minimal public pages. From that, we wrote a proper `PUBLIC-SHELL` style document that defines the shell as a **lightweight branded entry layer**, not a feature area and not a full marketing site.

From there, we expanded into the **authentication flow itself**. You wanted a full outline of the UI, routes, components, navigation paths, and the different outcomes: success, failure, retry, recovery, session expiry, and anything missing. That became the first version of `AUTH-FLOW-UI-SPEC.md`, but at that point I incorrectly assumed the app was moving to a passwordless OTP/magic-link model. That led to a spec that removed forgot password and reset password entirely.

You then caught that and asked where that assumption came from. We established that it had not come from your earlier docs — it was an introduced assumption. After that, you clarified the actual implementation: **Strapi with email and password login**, with Strapi’s built-in **forgot password recovery**. That was the turning point where we corrected the auth model and rewrote the spec so it matched the real system instead of an imagined passwordless one.

Once that was clear, we produced a corrected full version of `AUTH-FLOW-UI-SPEC.md` based on **Strapi email/password authentication**. That revised spec now includes the real routes and behaviours: sign-in, forgot password, reset password, auth error, session expired, and support/help. It also maps the actual journey: user logs in with email/password, users can request a reset email, follow a reset link containing a token/code, set a new password, and return to sign in. It removed OTP and magic-link logic and replaced it with Strapi-aligned recovery flows. This was directly based on the doc you uploaded.

After that, we moved into the component layer and created `AUTH-COMPONENT-INVENTORY.md`. The original version of that file was still heavily shaped around the earlier OTP-style assumption, with things like `OTPInput`, `ResendCodeAction`, and `ChangeEmailAction`. You then asked to update that file as well, and we rewrote it to match the revised Strapi auth model. The updated inventory now centers on components like `EmailInput`, `PasswordInput`, `ConfirmPasswordInput`, `ForgotPasswordLink`, `SubmitButton`, `SuccessMessageBlock`, `ReturnToSignInAction`, and the supporting state/feedback components for sign-in and password recovery. That brought the component inventory into line with the corrected auth flow spec.

You also brought in **Strapi documentation** for login and forgot-password handling. We took that technical reference material and rewrote it into a Fixtura-specific internal doc. That version explains the Strapi endpoints in the context of your members application: using `/api/auth/local` for sign-in, `/api/auth/forgot-password` for recovery request, and `/api/auth/reset-password` for completing the password reset. It also rewrote the Strapi notes around security, email configuration, and reset flows in a way that suits your application and route structure, instead of sounding like generic product docs.

Then we created another small but important policy doc: how to handle an **already authenticated user who returns to the public home page**. That doc defines the behaviour for someone with a valid session hitting `/` again. The conclusion there was clear: the public home page is an unauthenticated entry point, so signed-in users should be redirected into the authenticated app rather than seeing sign-in UI again. That reinforced the boundary between the public shell and the protected app area, and helped define the expected redirect behaviour for `/`, `/sign-in`, and related public routes.

So in practical terms, the work after the opening summary has been about building a **coherent documentation set** for the unauthenticated side of the members app:

- a document for the **public shell**
- a corrected **auth flow specification**
- a corrected **auth component inventory**
- a Fixtura-specific explanation of **Strapi auth and password recovery**
- a doc defining what happens when an **authenticated user returns to `/`**

The main theme through all of it has been taking abstract decisions and turning them into **clear, enforceable, LLM-friendly docs** that match the real implementation. The biggest correction along the way was moving from an incorrect OTP/passwordless assumption back to your real stack: **Strapi email/password with forgot password recovery**.

The natural next step from here is probably to document either the **route guard rules / middleware behaviour** for these public auth pages, or the **actual page/component implementation structure** in Next.js so the docs start turning directly into code.
