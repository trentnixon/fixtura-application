# Fixtura Members Subdomain — Public Routes

## Overview

This document defines all routes available in the **(public)** section of the Fixtura members subdomain application.

The `(public)` group includes:

- all routes accessible **without authentication**
- all **authentication flow pages** (sign-in, verify, etc.)
- all **support and system state pages**
- the **kitchen sink (design system reference)**

---

## Core Rule

> Any route that must be accessible before a user is authenticated belongs in `(public)`.

This includes authentication-related pages.

---

## Route List

### `/`

**Purpose:** Members entry / landing page

**Responsibilities:**

- orient the user (Fixtura Members area)
- provide clear **Sign in CTA**
- provide **Help / Support CTA**
- minimal explanation of what this area is for

---

### `/sign-in`

**Purpose:** Start authentication flow

**Responsibilities:**

- capture user email
- initiate login process (OTP / magic link)
- handle basic validation

---

### `/verify`

**Purpose:** Complete authentication

**Responsibilities:**

- accept verification code / token
- validate login attempt
- transition user into `(auth)` on success

---

### `/auth-error`

**Purpose:** Authentication failure handling

**Responsibilities:**

- display error state (invalid/expired code, failed login)
- provide retry path
- link back to `/sign-in`

---

### `/session-expired`

**Purpose:** Session timeout handling

**Responsibilities:**

- inform user their session has expired
- provide clear re-login path
- avoid confusion or silent redirects

---

### `/help`

**Purpose:** Access and login support

**Responsibilities:**

- explain common login issues
- guide users through recovery steps
- provide support/contact direction

---

### `/maintenance`

**Purpose:** System unavailable state

**Responsibilities:**

- inform users of downtime
- provide simple retry messaging
- act as fallback during outages

---

## Kitchen Sink (Public Design System)

### `/kitchen-sink`

**Purpose:** Entry point for design system reference

**Responsibilities:**

- overview of available UI patterns
- navigation into all design system sections

---

### `/kitchen-sink/typography`

Typography scale, font usage, hierarchy

### `/kitchen-sink/colors`

Colour system and usage rules

### `/kitchen-sink/containers`

Layout and spacing patterns

### `/kitchen-sink/navigation`

Navigation UI patterns

### `/kitchen-sink/buttons`

Button styles and interaction states

### `/kitchen-sink/cards`

Card layouts and usage

### `/kitchen-sink/states`

Loading, empty, error, and access states

### `/kitchen-sink/toasts`

Toast and notification patterns

### `/kitchen-sink/forms`

Form structure and validation patterns

### `/kitchen-sink/dialogs`

Dialog and modal patterns

### `/kitchen-sink/tables`

Table layouts and data presentation

### `/kitchen-sink/popovers`

Popover and overlay patterns

### `/kitchen-sink/loading`

Loading indicators and skeletons

### `/kitchen-sink/inputs`

Input components and field states

### `/kitchen-sink/avatar`

Avatar usage and variations

### `/kitchen-sink/icons`

Icon system and usage

### `/kitchen-sink/carousel`

Carousel patterns (if applicable)

### `/kitchen-sink/command`

Command menu / command palette

---

### Kitchen Sink Rules

- must be accessible **without authentication**
- is the **single source of truth for UI patterns**
- all production UI must match patterns defined here
- new patterns must be created here before being used elsewhere

---

## Public Layout (`(public)/layout.tsx`)

### Responsibilities

- provide a **minimal branded shell**
- maintain consistent spacing and typography
- support all public routes uniformly

---

### Includes

- Fixtura logo / wordmark
- optional "Members" label
- centered content container
- minimal footer (support, privacy, terms)

---

### Excludes

- app navigation
- sidebar
- authenticated UI elements
- complex layouts

---

## Behaviour Rules

### 1. Public routes must remain shallow

Do not create deep or complex public route trees.

---

### 2. No duplication of marketing site

The main domain handles:

- marketing
- pricing
- product storytelling

The subdomain handles:

- access
- authentication
- member entry

---

### 3. Clear next action

Every public page should guide the user toward:

- signing in
- retrying auth
- getting help

---

### 4. Authentication flow is public

> Authentication-related pages are public until access is granted.

---

### 5. Kitchen sink is authoritative

All UI patterns must:

1. exist in the kitchen sink
2. be reused across the application
3. not introduce new patterns without definition

---

### 6. Design-first rule

> All new UI patterns must be implemented in the kitchen sink before being used in production screens.

---

## Summary

The `(public)` section is a **pre-auth utility layer** that:

- enables user access to the system
- supports authentication flows
- provides system state feedback
- hosts the design system reference

It is intentionally:

- minimal
- structured
- functional
- non-marketing
