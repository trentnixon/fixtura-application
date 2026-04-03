# PUBLIC SHELL — MEMBERS ENTRY LAYER

## Overview

The public shell is the **unauthenticated entry layer** for the Fixtura members application.

It provides a **minimal, structured, branded environment** that:

- allows users to sign in
- supports authentication-related flows
- provides access to limited support/help pages

The homepage (`/`) is **login-first**.

---

## Mental Model

> A lightweight, branded gateway into the application — not the product itself.

This is **not**:

- the marketing site
- the authenticated app
- a feature-rich experience

---

## Core Principles

- minimal
- calm
- structured
- focused
- distraction-free

---

## Hard Constraints

### Navigation

Allowed:

- simple top bar navigation (2–4 links max)

Not allowed:

- sidebar navigation
- dashboard navigation
- feature-level navigation
- complex menus

---

### UI Complexity

Do NOT introduce:

- grids or complex layouts
- tables or data-heavy components
- feature UI from the authenticated app

---

### Logic

- no business logic
- no product data fetching
- no client-side auth handling
- UI triggers API only

---

## Layout System

The public shell consists of three persistent regions:

```

[ Top Bar ]

[ Main Content ]

[ Footer ]

```

---

## Container System

### Shell Container (shared)

Used for:

- top bar
- main layout framing
- footer

```

max-w-7xl mx-auto px-4 sm:px-6 lg:px-8

```

---

### Content Container (auth-focused)

Used for:

- login form
- verification flows
- auth states

```

max-w-md mx-auto

```

---

## Top Bar

### Purpose

- provide light navigation
- reinforce brand
- orient the user

---

### Structure

Left:

- Fixtura logo / wordmark

Right:

- small navigation list

---

### Allowed Links

- Help
- Support
- Contact (optional)
- System Status (optional)

---

### Constraints

- no primary CTA overload
- no dropdown menus
- no complex interactions
- must remain visually minimal

---

## Main Content

### Purpose

- host page-specific content
- prioritise login experience

---

### Homepage (`/`)

The homepage is the **login entry point**.

---

### Layout

```

[ Heading ]

[ Supporting text ]

[ Login form ]

[ Secondary actions (help/support) ]

```

---

### Content Rules

- short, clear headings
- minimal supporting text
- no marketing copy
- no long paragraphs

---

## Footer

### Purpose

- provide legal and support links
- close the layout cleanly

---

### Content

- copyright
- privacy policy
- terms
- support/help link

---

### Constraints

- small typography
- low visual weight
- no promotional content

---

## Routes Covered

### `/`

Login-first entry page

Includes:

- heading
- short description
- login form

---

### `/sign-in`

Email input + submission

---

### `/verify`

OTP / magic link verification

Includes:

- code input or waiting state
- resend option

---

### `/auth-error`

Displays authentication errors

Includes:

- error message
- retry action

---

### `/session-expired`

Session timeout state

Includes:

- explanation
- re-authenticate CTA

---

### `/help` / `/support`

Support pathways

---

## Behaviour Rules

- all authentication handled via API layer
- UI does not manage tokens or sessions
- UI only triggers actions (submit, resend, retry)
- redirects handled outside UI (middleware / API response)

---

## UI States

Each page must support:

### Default

- clean, minimal layout

---

### Loading

- button loading state
- optional inline feedback

---

### Error

- inline alert component
- clear messaging

---

### Success

- redirect or confirmation state

---

## Accessibility

- inputs must be labeled
- buttons must be clear and accessible
- keyboard navigation supported
- visible focus states required

---

## Design Rules

- maximum 2 fonts
- maximum 2 primary colours (+ neutrals)
- consistent spacing system
- minimal component variants

---

## Acceptance Criteria

This is complete when:

- all public routes share the same shell
- top bar and footer are consistent across pages
- login is clearly the primary action on `/`
- layout respects container constraints
- no authenticated UI patterns appear
- all states (loading, error, success) are handled

---

## Summary

> The public shell is a minimal, branded entry layer with a top bar, constrained layout, and footer, where the primary purpose is to guide users into authentication without exposing application complexity.

```


```
