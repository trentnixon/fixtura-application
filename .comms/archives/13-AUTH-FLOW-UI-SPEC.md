# AUTH-FLOW-UI-SPEC.md

## Overview

This document defines the **complete authentication UI and interaction flow** for the Fixtura Members application.

It covers:

- all public authentication routes
- UI composition per route
- component requirements
- user journeys (success, failure, retry, recovery)
- navigation and redirect behaviour
- error handling and edge cases

This is the **source of truth for all auth-related UI**.

---

## Mental Model

> The authentication system is a controlled public entry flow that moves a user from unauthenticated access into the protected application with minimal friction and clear recovery paths.

---

## Auth Model (CRITICAL)

This application uses:

> **Password-based authentication via Strapi (email + password)**

### Supported flows

- sign in with email and password
- forgot password request
- reset password via email link (Strapi recovery)
- retry sign in
- contact support

### Recovery support

Strapi provides built-in endpoints for:

- forgot password (request reset email)
- reset password (via tokenised link)

The UI must support these flows.

---

## Shared Public Shell

All routes in this spec must render within the **public shell**:

- top bar (minimal navigation)
- constrained responsive container
- main content area
- footer

No authenticated UI patterns are allowed.

---

## Routes

### Core Auth Routes

- `/`
- `/sign-in`
- `/forgot-password`
- `/reset-password`
- `/auth-error`
- `/session-expired`

---

### Support Routes

- `/help`
- `/support`

---

### Optional Utility Routes

- `/check-email` (after forgot password request)

---

## Primary User Journey

### Standard Sign-In Flow

1. User lands on `/`
2. Login form is immediately visible
3. User enters email and password
4. User submits form
5. System validates credentials
6. On success → redirect to `/app/*`
7. On failure → show inline error

---

## Password Recovery Flow

### Forgot Password

1. User clicks "Forgot password"
2. User navigates to `/forgot-password`
3. User enters email
4. System sends reset email via Strapi
5. User sees confirmation state (`/check-email` or inline)

---

### Reset Password

1. User clicks reset link from email
2. User lands on `/reset-password?code=XYZ`
3. User enters new password + confirm password
4. System validates and updates password
5. On success → redirect to `/sign-in`
6. On failure → show error or invalid token state

---

## Route Specifications

---

## `/` — Login Entry

### Purpose

Primary entry into the members area.

---

### UI Composition

- Heading
- Supporting text
- Login form
- Forgot password link
- Secondary links (help/support)

---

### Components

- AuthPageHeader
- EmailInput
- PasswordInput
- SubmitButton
- InlineAlert
- SecondaryLinkGroup
- SupportLink

---

### Behaviour

- submit → attempt login
- success → `/app`
- failure → inline error
- already authenticated → `/app`

---

---

## `/sign-in`

Same as `/`.

---

---

## `/forgot-password`

### Purpose

Allow user to request password reset.

---

### UI Composition

- Heading
- Supporting text
- Email input
- Submit button
- Inline error
- Support link

---

### Components

- AuthPageHeader
- EmailInput
- SubmitButton
- InlineAlert
- SecondaryLinkGroup

---

### Behaviour

- submit → trigger Strapi forgot password endpoint
- success → `/check-email` or inline success state
- failure → inline error

---

---

## `/reset-password`

### Purpose

Allow user to set a new password using reset token.

---

### UI Composition

- Heading
- New password input
- Confirm password input
- Submit button
- Inline error
- Support link

---

### Components

- AuthPageHeader
- PasswordInput
- ConfirmPasswordInput
- SubmitButton
- InlineAlert

---

### Behaviour

- valid token + valid input → success → `/sign-in`
- invalid/expired token → `/auth-error` or inline error
- password mismatch → inline validation error

---

---

## `/auth-error`

### Purpose

Handle unrecoverable authentication failures.

---

### UI Composition

- Heading
- Error message
- Retry button
- Support link

---

### Behaviour

- retry → `/sign-in`

---

---

## `/session-expired`

### Purpose

Handle expired sessions.

---

### UI Composition

- Heading
- Explanation
- Re-authenticate button

---

### Behaviour

- redirect → `/sign-in`

---

---

## `/help` / `/support`

### Purpose

Provide assistance for access issues.

---

### UI Composition

- common issues
- support instructions
- contact pathway
- return-to-sign-in action

---

## Form States

Each form must support:

- idle
- typing
- valid
- invalid
- submitting
- success
- server error
- rate limited (if applicable)

---

## Validation Rules

### Email

- required
- valid format

---

### Password

- required
- minimum length (as defined by backend)
- confirm password must match (reset flow only)

---

## Navigation Rules

### Unauthenticated User

- allowed: all public routes
- blocked: `/app/*`
- redirect → `/sign-in`

---

### Authenticated User

- visiting `/`, `/sign-in` → redirect `/app`
- visiting auth routes → redirect `/app`

---

## Redirect Logic

### Sign-In

- success → `/app`
- failure → inline error

---

### Reset Password

- success → `/sign-in`
- invalid token → `/auth-error`

---

## Error Scenarios

- invalid credentials
- incorrect password
- missing fields
- invalid email
- invalid reset token
- expired reset token
- password mismatch
- server unavailable
- rate limiting (if enforced)

---

## Recovery Paths

- forgot password
- reset password
- retry sign in
- contact support

---

## Edge Cases

- user refreshes reset-password page
- user uses expired token
- user already authenticated mid-flow
- network failure during submission
- duplicate submissions

---

## Accessibility

- labeled inputs
- keyboard navigation
- visible focus states
- clear error messaging
- sufficient contrast

---

## Copy Guidelines

- short
- clear
- direct
- reassuring

Avoid:

- marketing language
- technical jargon

---

## Acceptance Criteria

This spec is complete when:

- all routes are implemented
- all states are handled
- forgot/reset password flows are fully supported
- navigation is correct
- no authenticated UI appears in public routes
- UI remains consistent with public shell

---

## Summary

> The authentication flow is a structured, password-based entry system using Strapi email/password authentication, with full support for forgot password and reset password recovery, guiding users into the protected Fixtura members application.
