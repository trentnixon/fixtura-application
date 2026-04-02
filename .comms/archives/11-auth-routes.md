# Fixtura Members Subdomain — Route Architecture

## Overview

This document defines the full route structure for the Fixtura members subdomain application.

The application is split into two route groups:

- `(public)` → accessible without authentication
- `(auth)` → requires authenticated session

---

## Core Rule

> Any route that must be accessible before authentication belongs in `(public)`.

> Any route that requires a valid session belongs in `(auth)`.

---

# (public) — Unauthenticated Routes

## Purpose

The `(public)` group handles:

- user entry into the members system
- authentication flow
- support and system state pages
- design system reference (kitchen sink)

---

## Routes

### `/`

**Members Entry Page**

- orient the user
- explain this is the Fixtura Members area
- primary CTA → Sign in
- secondary CTA → Help

---

### `/sign-in`

**Start authentication flow**

- capture email
- initiate OTP / magic link

---

### `/verify`

**Complete authentication**

- input verification code
- validate login
- redirect to `(auth)` on success

---

### `/auth-error`

**Authentication failure**

- invalid or expired token/code
- retry flow
- link back to `/sign-in`

---

### `/session-expired`

**Session timeout**

- inform user
- provide re-login path

---

### `/help`

**Access support**

- login issues
- account issues
- support direction

---

### `/maintenance`

**System unavailable**

- downtime messaging
- retry guidance

---

## Kitchen Sink (Public Design System)

### `/kitchen-sink`

Design system entry point

- overview of UI patterns
- navigation to all sections

---

### `/kitchen-sink/*`

Includes:

- typography
- colors
- containers
- navigation
- buttons
- cards
- states (loading, empty, error, access)
- toasts
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

---

### Kitchen Sink Rules

- must be accessible **without authentication**
- is the **single source of truth for UI patterns**
- all production UI must match patterns defined here
- new patterns must be created here before use

---

## Public Layout (`(public)/layout.tsx`)

### Responsibilities

- minimal branded shell
- centered content layout
- consistent spacing and typography

---

### Includes

- logo / wordmark
- optional "Members" label
- centered container
- minimal footer (support, privacy, terms)

---

### Excludes

- app navigation
- sidebar
- authenticated UI
- complex layouts

---

# (auth) — Authenticated Routes

## Purpose

The `(auth)` group contains all **protected member functionality**.

These routes require:

- valid JWT session
- middleware-controlled access

---

## Core Business Routes

### `/dashboard`

Primary landing after login

- account overview
- key actions
- recent activity

---

### `/bundles`

Content bundles

- weekly content packs
- downloads and previews
- grouped assets

---

### `/template-builder`

Template builder

- create/edit templates
- manage branding rules
- define layouts

---

### `/media-gallery`

Media library

- view generated assets
- filter/search media
- manage downloads

---

### `/manage-sponsors`

Sponsor management

- add/edit sponsors
- manage placements
- assign to assets

---

### `/season`

Season configuration

- manage competition data
- control active season
- configure rules/settings

---

### `/settings`

Application settings

- user preferences
- system configuration
- UI/feature toggles

---

### `/account`

Account management

- user details
- organisation info
- billing (if applicable)

---

### `/logout`

Session termination

- clear session
- redirect to `/sign-in`

---

## Auth Layout (`(auth)/layout.tsx`)

### Responsibilities

- authenticated application shell
- persistent navigation
- session-aware UI

---

### Includes

- header/navigation
- account controls
- app layout structure

---

### Excludes

- public-only UI patterns
- authentication entry flows

---

# Behaviour Rules

## 1. Strict separation

- `(public)` → no auth required
- `(auth)` → auth required

---

## 2. Authentication flow is public

> Authentication-related pages are public until access is granted.

Includes:

- sign-in
- verify
- auth-error
- session-expired

---

## 3. Kitchen sink is public

`/kitchen-sink/*` must remain publicly accessible.

---

## 4. Middleware controls access

- no UI-based protection
- no client-side auth gating

---

## 5. Redirect behaviour

- unauthenticated access to `(auth)` → redirect to `/sign-in`
- authenticated access to `/` → redirect to `/dashboard`

---

## 6. Design-first rule

> All new UI patterns must be implemented in the kitchen sink before being used in production screens.

---

# Summary

The Fixtura members subdomain is structured as:

- `(public)` → entry, authentication, support, system states, kitchen sink
- `(auth)` → protected member application

This ensures:

- clean separation of concerns
- predictable routing behaviour
- scalable architecture
- consistent UI implementation
