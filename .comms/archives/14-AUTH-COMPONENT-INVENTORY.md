# AUTH-COMPONENT-INVENTORY.md

## Overview

This document defines the full **UI component inventory** for the Fixtura Members authentication flow.

It exists to:

- identify every component used in the public auth experience
- define the purpose of each component
- establish reuse rules
- prevent unnecessary variation
- align implementation with the public shell and auth flow specifications

This document should be read alongside:

- `PUBLIC-SHELL.md`
- `AUTH-FLOW-UI-SPEC.md`

---

## Mental Model

> The authentication UI is a small, reusable system of tightly controlled components designed to support sign-in, password recovery, failure states, session expiry, and support pathways without introducing product-level complexity.

---

## Component System Rules

### 1. Reuse before creation

If a component already exists in this inventory, it must be reused before a new variation is introduced.

---

### 2. Keep auth UI small

The authentication flow is not a large design surface.
Component count and variation must remain intentionally limited.

---

### 3. No product leakage

Do not introduce authenticated app components into the public auth flow.

Examples of components that do **not** belong here:

- app sidebar
- dashboard panels
- data cards
- charts
- tables
- complex settings patterns

---

### 4. Variants must be minimal

Use a small number of approved visual patterns.

Avoid:

- decorative versions
- marketing-style layouts
- multiple competing card styles
- multiple competing header patterns

---

### 5. Components must map cleanly to auth states

Each component must clearly support one or more auth flow needs:

- sign in
- password recovery
- reset password
- error
- retry
- support
- session recovery

---

## Component Groups

The auth UI component system is grouped into:

1. Shell Components
2. Layout Components
3. Page Structure Components
4. Form Components
5. Action Components
6. Feedback Components
7. Support Components
8. State Components

---

# 1. Shell Components

These components define the persistent public-shell structure.

---

## `PublicTopBar`

### Purpose

Provides lightweight navigation and brand framing for all public auth routes.

---

### Responsibilities

- render logo / wordmark
- render minimal public navigation
- keep the layout aligned to shared shell container width

---

### Allowed Content

- Fixtura logo / wordmark
- 2–4 simple navigation links
- optional support/help link

---

### Not Allowed

- authenticated navigation
- dropdown menus
- dense menus
- app actions
- user menus
- avatar/account controls

---

### Suggested Structure

- left: brand
- right: simple text links

---

### Reuse Rule

Used across all public auth routes without route-specific redesign.

---

## `PublicFooter`

### Purpose

Provides legal and support links at the bottom of public auth routes.

---

### Responsibilities

- close the shell layout cleanly
- provide low-priority utility links
- maintain visual consistency across auth pages

---

### Allowed Content

- copyright
- privacy
- terms
- support/help

---

### Not Allowed

- promotional sections
- feature marketing
- newsletter signups
- social-heavy layouts

---

### Reuse Rule

Shared across all public routes.

---

## `PublicShellContainer`

### Purpose

Provides the shared responsive width constraint for shell framing.

---

### Responsibilities

- constrain top bar, footer, and main shell layout
- keep public pages visually composed on wide screens

---

### Suggested Class Strategy

```tsx
max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
```

---

### Reuse Rule

Do not create route-specific shell container widths.

---

# 2. Layout Components

These components define the layout of the auth content inside the shell.

---

## `PublicPageWrapper`

### Purpose

Defines the page-level vertical structure between top bar and footer.

---

### Responsibilities

- create a stable page composition
- provide spacing around page content
- ensure auth pages do not feel cramped or stretched

---

### Behaviour

- supports full-height page layout when needed
- allows centered or top-aligned auth content depending on route

---

## `AuthContentContainer`

### Purpose

Constrains auth-specific content to a narrower readable width.

---

### Responsibilities

- wrap sign-in form, forgot password form, reset password form, and state pages
- maintain focus on the auth content
- prevent long, stretched content areas

---

### Suggested Class Strategy

```tsx
max-w-md mx-auto
```

For wider support/help content, a controlled variation may be used:

```tsx
max-w-lg mx-auto
```

---

### Reuse Rule

Use this container for all auth-centric content before introducing custom width rules.

---

## `AuthPageSection`

### Purpose

Provides consistent vertical spacing between auth content blocks.

---

### Responsibilities

- separate header, form, alerts, and secondary actions
- keep auth layouts predictable

---

### Reuse Rule

Prefer a shared section wrapper rather than ad hoc margin stacks on each page.

---

# 3. Page Structure Components

These components define repeated content structure across auth routes.

---

## `AuthPageHeader`

### Purpose

Provides the standard heading block for auth pages.

---

### Responsibilities

- display page title
- display short supporting text
- establish a consistent intro pattern across auth routes

---

### Content Rules

- heading should be short and direct
- supporting text should be brief and functional
- no marketing copy
- no long paragraphs

---

### Examples of usage

- Sign in to Fixtura Members
- Reset your password
- Check your email
- Session expired
- We couldn’t sign you in

---

### Props Suggestion

```ts
type AuthPageHeaderProps = {
  title: string;
  description?: string;
  align?: "left" | "center";
};
```

---

### Reuse Rule

Use one shared auth header pattern across all auth-related pages.

---

## `AuthSurface`

### Purpose

Provides the main visual surface for forms and state content.

---

### Responsibilities

- wrap sign-in and recovery content
- provide subtle separation from page background
- support a calm, structured presentation

---

### Visual Rules

- simple surface or card
- soft border
- subtle radius
- no heavy shadows
- no decorative treatment

---

### Reuse Rule

This should be the default auth content surface across all auth pages.

---

## `SecondaryLinkGroup`

### Purpose

Groups secondary actions below or beside primary auth content.

---

### Responsibilities

- present supporting links consistently
- avoid scattered or improvised secondary navigation

---

### Typical Content

- Forgot password?
- Need help?
- Contact support
- Back to sign in

---

### Reuse Rule

Use a standard spacing and text treatment for secondary links.

---

# 4. Form Components

These components are used for data input in auth flows.

---

## `EmailInput`

### Purpose

Collect user email for sign-in and password recovery.

---

### Responsibilities

- capture email address
- expose validation state
- align with shared form styling

---

### Requirements

- labeled
- accessible
- email keyboard/input mode on supported devices
- supports error display
- supports disabled state

---

### Validation

- required
- valid email format

---

### Props Suggestion

```ts
type EmailInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
};
```

---

## `PasswordInput`

### Purpose

Collect password input for sign-in and reset password flows.

---

### Responsibilities

- capture password securely
- support validation and error state
- support hidden/visible toggle if approved by UI rules

---

### Requirements

- labeled
- accessible
- supports error display
- supports disabled state
- uses password input type by default

---

### Validation

- required where applicable
- minimum length and format should follow backend enforcement
- do not invent password rules not enforced by backend

---

### Props Suggestion

```ts
type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
};
```

---

## `ConfirmPasswordInput`

### Purpose

Collect password confirmation during reset password flow.

---

### Responsibilities

- confirm new password matches intended password
- expose mismatch state clearly
- align with shared form styling

---

### Requirements

- labeled
- accessible
- supports field-level mismatch error
- supports disabled state

---

### Validation

- required on reset flow
- must match `PasswordInput`

---

### Props Suggestion

```ts
type ConfirmPasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoComplete?: string;
};
```

---

## `AuthForm`

### Purpose

Provides a consistent wrapper for auth field groups and submit actions.

---

### Responsibilities

- handle spacing between inputs and actions
- standardise auth form structure
- prevent page-by-page form drift

---

### Typical Structure

```text
[ Alert if present ]
[ Input(s) ]
[ Primary action ]
[ Secondary actions ]
```

---

### Reuse Rule

Auth forms should share one compositional pattern even if fields differ.

---

# 5. Action Components

These components trigger user actions in the auth flow.

---

## `SubmitButton`

### Purpose

Primary action button for form submission.

---

### Responsibilities

- initiate auth request
- show loading state
- prevent duplicate submissions while pending

---

### Requirements

- clear label
- loading state
- disabled state when invalid or submitting
- consistent width and sizing rules

---

### Common Labels

- Sign in
- Send reset link
- Reset password
- Re-authenticate

---

### Props Suggestion

```ts
type SubmitButtonProps = {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
};
```

---

## `ForgotPasswordLink`

### Purpose

Provide a clear recovery path from the sign-in form.

---

### Responsibilities

- link user from sign-in to password recovery
- remain visually secondary to the main submit action
- appear consistently in sign-in UI

---

### Typical Destination

- `/forgot-password`

---

### Reuse Rule

Use one shared pattern and placement for forgot password access across sign-in views.

---

## `RetryAction`

### Purpose

Allow retry after auth failure.

---

### Responsibilities

- return user to a recoverable point
- give clear next action after unrecoverable or generic failure

---

### Typical Destination

- `/sign-in`

---

## `ReturnToSignInAction`

### Purpose

Allow user to return from recovery/support routes to the sign-in page.

---

### Responsibilities

- provide a clean exit from support and password recovery pages
- reduce dead-end navigation

---

### Typical Destination

- `/sign-in`

---

## `SupportLink`

### Purpose

Provide direct path to support/help when self-recovery is insufficient.

---

### Responsibilities

- appear consistently across failure and recovery states
- remain secondary in visual hierarchy

---

### Reuse Rule

Do not rewrite support access differently across every auth page.

---

# 6. Feedback Components

These components communicate status, validation, and errors.

---

## `InlineAlert`

### Purpose

Display inline feedback within auth content.

---

### Responsibilities

- show validation or server error states
- keep messaging attached to the relevant form or page
- avoid detached notification patterns for core auth errors

---

### Types

- error
- warning
- info
- success (limited use)

---

### Use Cases

- invalid email
- invalid password
- missing fields
- password mismatch
- reset token invalid
- generic auth failure

---

### Reuse Rule

Use one alert pattern for all auth pages.

---

## `FieldErrorText`

### Purpose

Display field-level validation feedback.

---

### Responsibilities

- provide immediate and accessible feedback for invalid fields
- remain visually subordinate to the field itself

---

### Use Cases

- invalid email format
- required password missing
- confirm password mismatch

---

## `FormHintText`

### Purpose

Provide supporting instruction beneath or beside an input or action.

---

### Responsibilities

- clarify what the user should do
- reduce confusion without adding long copy

---

### Use Cases

- Use the email address linked to your Fixtura account.
- We’ll send a password reset link to this email address.
- Enter your new password below.

---

## `SuccessMessageBlock`

### Purpose

Display successful completion of a recovery action.

---

### Responsibilities

- confirm that a reset request was accepted
- reassure the user about what happens next
- keep recovery flows clear and low-friction

---

### Use Cases

- password reset email sent
- password successfully updated

---

## `CooldownMessage`

### Purpose

Communicate temporary action lockouts if backend throttling or rate limiting is surfaced.

---

### Responsibilities

- explain why an action is unavailable
- reduce confusion during temporary lockouts

---

### Use Cases

- Too many requests. Please wait a moment and try again.
- You’ve tried too many times. Please try again shortly.

---

# 7. Support Components

These components support non-primary auth paths.

---

## `SupportPanel`

### Purpose

Provide structured support guidance on help/support routes.

---

### Responsibilities

- present common access issues
- provide instructions or escalation path
- remain simple and non-promotional

---

### Typical Content

- common login issues
- password reset guidance
- support contact pathway
- return to sign-in link

---

## `AccessHelpList`

### Purpose

Provide a compact list of common access problems and actions.

---

### Example Topics

- I forgot my password
- I didn’t receive the reset email
- My reset link expired
- My session expired
- I still can’t access my account

---

### Reuse Rule

Use a repeatable content pattern for help content, not ad hoc prose blocks.

---

# 8. State Components

These components represent page-level auth states.

---

## `LoadingStateBlock`

### Purpose

Represent pending auth states clearly inside the page.

---

### Responsibilities

- communicate ongoing action
- reassure user that progress is happening
- reduce accidental re-submission

---

### Use Cases

- signing in
- requesting password reset
- resetting password
- loading auth transition state

---

### Notes

This should be lightweight and inline with the auth surface, not a full app loader.

---

## `EmptyStateBlock`

### Purpose

Represent utility states where expected auth context is missing.

---

### Use Cases

- reset password page opened without required token
- invalid route state after refresh
- no usable recovery context

---

### Responsibilities

- explain the issue briefly
- provide a clear path back to sign-in

---

## `ErrorStateBlock`

### Purpose

Represent non-field, page-level auth errors.

---

### Use Cases

- invalid reset link
- unrecoverable auth failure
- unavailable service state

---

### Responsibilities

- explain issue in plain language
- provide retry path
- provide support path

---

## `SessionExpiredBlock`

### Purpose

Represent expired session state.

---

### Responsibilities

- explain that access has timed out
- provide a clear re-authentication action

---

# Component-to-Route Mapping

This section defines which components are expected on each route.

---

## `/` and `/sign-in`

### Required

- PublicTopBar
- PublicFooter
- PublicShellContainer
- PublicPageWrapper
- AuthContentContainer
- AuthPageHeader
- AuthSurface
- AuthForm
- EmailInput
- PasswordInput
- SubmitButton
- ForgotPasswordLink
- InlineAlert (when needed)
- SecondaryLinkGroup
- SupportLink

---

## `/forgot-password`

### Required

- PublicTopBar
- PublicFooter
- PublicShellContainer
- PublicPageWrapper
- AuthContentContainer
- AuthPageHeader
- AuthSurface
- AuthForm
- EmailInput
- SubmitButton
- InlineAlert
- SecondaryLinkGroup
- ReturnToSignInAction
- SupportLink
- SuccessMessageBlock (if inline success is used)

---

## `/reset-password`

### Required

- PublicTopBar
- PublicFooter
- PublicShellContainer
- PublicPageWrapper
- AuthContentContainer
- AuthPageHeader
- AuthSurface
- AuthForm
- PasswordInput
- ConfirmPasswordInput
- SubmitButton
- InlineAlert
- ReturnToSignInAction
- SupportLink
- EmptyStateBlock or ErrorStateBlock (if token missing/invalid)
- SuccessMessageBlock (if inline success is used)

---

## `/auth-error`

### Required

- PublicTopBar
- PublicFooter
- PublicShellContainer
- PublicPageWrapper
- AuthContentContainer
- AuthPageHeader
- AuthSurface
- ErrorStateBlock
- RetryAction
- SupportLink

---

## `/session-expired`

### Required

- PublicTopBar
- PublicFooter
- PublicShellContainer
- PublicPageWrapper
- AuthContentContainer
- AuthPageHeader
- AuthSurface
- SessionExpiredBlock
- SubmitButton or RetryAction

---

## `/help` and `/support`

### Required

- PublicTopBar
- PublicFooter
- PublicShellContainer
- PublicPageWrapper
- AuthContentContainer or wider controlled content container
- PageHeader or AuthPageHeader
- SupportPanel
- AccessHelpList
- SupportLink
- RetryAction or ReturnToSignInAction

---

## `/check-email` (optional)

### Required

- PublicTopBar
- PublicFooter
- PublicShellContainer
- PublicPageWrapper
- AuthContentContainer
- AuthPageHeader
- AuthSurface
- SuccessMessageBlock
- ReturnToSignInAction
- SupportLink

---

# shadcn / UI Primitive Mapping

These auth components should map to a small set of primitives.

---

## Recommended base primitives

- `Button`
- `Input`
- `Label`
- `Card` or simple bordered surface
- `Alert`
- `Separator` (limited use)

---

## Use with restraint

- `Dialog`
- `Popover`
- `Tooltip`

These are generally unnecessary for core auth flow and should not be introduced unless a clear accessibility or usability reason exists.

---

## Avoid for auth flow

- `Table`
- `Tabs`
- `Accordion` for core auth actions
- `DropdownMenu`
- `Sheet`
- `Drawer`
- `Command`

These add complexity that is not needed in the public auth system.

---

# Styling Rules

## Visual tone

All auth components must feel:

- calm
- structured
- minimal
- trustworthy

---

## Hard styling constraints

- maximum 2 fonts
- maximum 2 primary colours + neutrals
- subtle borders
- controlled spacing
- minimal shadow usage
- no decorative illustration dependency

---

## Layout behaviour

- shell width is shared
- auth content width is constrained
- spacing should be consistent across all routes
- no improvised page-level spacing systems

---

# Interaction Rules

## Buttons

- primary action should be obvious
- secondary actions should remain visually secondary
- loading states must be clear
- disabled states must be intentional

---

## Inputs

- labels always visible
- placeholder text must not replace labels
- errors must be shown clearly
- input layout must remain stable when errors appear

---

## Password fields

- password values must be masked by default
- show/hide control is optional, but if used it must be accessible and consistent
- autofill/autocomplete should be configured intentionally for sign-in and reset flows

---

## Links

- support/recovery links should be grouped consistently
- avoid scattering links around the page
- no excessive link count on small auth surfaces

---

# Accessibility Rules

All auth components must support:

- keyboard navigation
- visible focus states
- labeled fields
- sufficient contrast
- clear error communication
- sensible tab order

Password recovery and reset flows should avoid fragile interactions and clearly announce errors and success states.

---

# Copy Rules by Component

## Page headers

- short
- direct
- reassuring

---

## Alerts

- plain language
- no technical jargon
- explain what happened and what the user can do next

---

## Actions

- use conventional labels
- avoid clever wording
- keep CTA text predictable

Examples:

- Sign in
- Forgot password?
- Send reset link
- Reset password
- Try again
- Back to sign in
- Contact support

---

# Non-Goals

The following are intentionally out of scope for the auth component inventory:

- authenticated app navigation
- dashboard UI
- account settings UI
- profile management UI
- feature marketing content
- OTP-only login
- magic link login
- social login variations unless explicitly introduced by product requirements

---

# Acceptance Criteria

This inventory is complete when:

- all auth routes can be built using listed components
- component responsibilities are clear
- route-to-component mapping is defined
- no unnecessary variants exist
- auth UI remains isolated from app UI
- shadcn usage is constrained and intentional
- support, retry, and password recovery paths are represented

---

# Summary

> The Fixtura auth component inventory is a small, disciplined set of reusable public-facing UI components designed to support sign-in, password recovery, reset password, support flows, and failure states with consistency, minimalism, and architectural clarity.
