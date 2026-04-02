---
description: First-stop orchestration skill that helps the AI assistant decide which other Fixtura skills to read before making changes
---

# 🧭 Orchestrator Skill

This skill is the **entry point** for any non-trivial task inside the **Fixtura Members Area** codebase.

Before writing code, editing files, proposing architecture, or generating implementation steps, the assistant should use this skill to determine:

1. **what kind of task is being requested**
2. **which parts of the app are affected**
3. **which supporting skills must be read first**
4. **whether the task spans multiple domains and needs a coordinated approach**

---

# Core Rule

> Do not begin implementation immediately.

> First classify the request, identify impacted systems, and read the relevant skills from `.skills/`.

This skill exists to prevent shallow or isolated changes that ignore existing app conventions.

---

# Purpose

Use this skill to:

- route the assistant to the correct supporting skills
- avoid skipping established implementation patterns
- maintain consistency across routing, auth, forms, layout, state, feedback, and shared components
- help the assistant understand whether a request is:
  - a page build
  - a route update
  - a layout change
  - an auth flow change
  - a form workflow
  - a state handling task
  - a design system task
  - a debugging / maintenance task
  - or a combination of several of these

---

# When To Use This Skill

Use this skill **first** whenever the task involves:

- creating a new page
- updating an existing page
- changing app flow
- adding or changing routes
- working on login/logout/session behaviour
- adding forms
- adding protected areas
- changing navigation
- building UI states
- adding notifications
- using shared components
- touching layout or spacing
- updating kitchen sink entries
- doing anything that may affect more than one feature area

---

# Workflow

## Step 1 — Classify the request

Read the user request and identify the task type.

Common task categories:

- authentication
- protected page creation
- public page creation
- route architecture
- navigation UI
- form implementation
- API integration
- session display
- loading / empty / error / success state handling
- notifications / feedback
- layout / spacing
- component composition
- icons / visual elements
- debug tooling
- kitchen sink maintenance

A request may belong to **multiple categories**.

---

## Step 2 — Identify impacted app layers

For each request, decide which app layers are affected:

- **Routing**
- **Authentication**
- **API / data fetching**
- **Page UI**
- **Forms**
- **Session state**
- **Feedback / notifications**
- **Shared components**
- **Design system**
- **Debug / maintenance**
- **Kitchen sink / component showcase**

Do not treat requests as single-file tasks unless they clearly are.

---

## Step 3 — Read the relevant supporting skills

After classifying the request, read all relevant skills before making recommendations or code changes.

---

# Skill Routing Map

## If the task involves login or authentication

Read:

- `login-Flow.md`
- `logoutFlow.md`
- `middleware-Update.md`
- `authenticated-api-call.md`
- `sessionStateUI.md`

Use these when working on:

- sign-in flow
- sign-out flow
- token handling
- redirect logic
- protected access
- authenticated API requests
- showing current user session info in UI

---

## If the task involves protected pages or authenticated areas

Read:

- `add-protected-page.md`
- `middleware-Update.md`
- `navigation-route-management.md`
- `layout-and-Spacing-System.md`
- `ui-State-Patterns.md`

Also read as needed:

- `sessionStateUI.md`
- `feedback-and-Notifications.md`

Use these when working on:

- new logged-in pages
- gated sections
- route protection
- page shell consistency
- page states
- authenticated user experiences

---

## If the task involves route structure or app navigation

Read:

- `navigation-route-management.md`
- `navigation-UI-Patterns.md`
- `layout-and-Spacing-System.md`

Also read as needed:

- `middleware-Update.md`
- `sessionStateUI.md`

Use these when working on:

- route groups
- top nav
- side nav
- breadcrumbs
- authenticated vs public shell decisions
- overall app movement and page access

---

## If the task involves forms

Read:

- `form-Patterns.md`
- `feedback-and-Notifications.md`
- `ui-State-Patterns.md`

Also read as needed:

- `authenticated-api-call.md`
- `layout-and-Spacing-System.md`
- `component-Usage-Patterns.md`

Use these when working on:

- input collection
- validation
- submit flows
- inline errors
- form success handling
- reusable form structures

---

## If the task involves loading, empty, error, or success handling

Read:

- `ui-State-Patterns.md`
- `feedback-and-Notifications.md`

Also read as needed:

- `component-Usage-Patterns.md`
- `layout-and-Spacing-System.md`

Use these when working on:

- async UI
- dashboards
- data panels
- API-driven pages
- state transitions
- retry patterns
- user reassurance during operations

---

## If the task involves authenticated data fetching or backend communication

Read:

- `authenticated-api-call.md`
- `ui-State-Patterns.md`
- `feedback-and-Notifications.md`

Also read as needed:

- `sessionStateUI.md`
- `form-Patterns.md`

Use these when working on:

- API calls from protected pages
- backend mutations
- loading/error handling for server actions
- secure requests requiring JWTs

---

## If the task involves layout, shared UI, or design consistency

Read:

- `layout-and-Spacing-System.md`
- `component-Usage-Patterns.md`
- `icons-and-Visual-Elements.md`

Also read as needed:

- `navigation-UI-Patterns.md`
- `ui-State-Patterns.md`
- `form-Patterns.md`

Use these when working on:

- page composition
- spacing rhythm
- card layouts
- headers
- section structure
- reusable presentation patterns
- icon usage
- visual consistency

---

## If the task involves session display or user identity in the UI

Read:

- `sessionStateUI.md`
- `navigation-UI-Patterns.md`

Also read as needed:

- `logoutFlow.md`
- `layout-and-Spacing-System.md`

Use these when working on:

- profile display
- user menu
- role indicators
- account area
- signed-in identity patterns

---

## If the task involves debugging, internal tooling, or maintenance flows

Read:

- `devDebugExtension.md`

Also read as needed:

- `ui-State-Patterns.md`
- `authenticated-api-call.md`

Use this when working on:

- debug panels
- development observability
- internal inspection tools
- feature diagnostics

---

## If the task adds or changes reusable UI components

Read:

- `component-Usage-Patterns.md`
- `layout-and-Spacing-System.md`
- `icons-and-Visual-Elements.md`

Also read as needed:

- `form-Patterns.md`
- `ui-State-Patterns.md`
- `kitchen-Sink-Maintenance.md`

Use these when working on:

- shared components
- variants
- reusable UI primitives
- visual consistency
- test/demo coverage in kitchen sink

---

## If the task changes or introduces UI patterns that should appear in the kitchen sink

Read:

- `kitchen-Sink-Maintenance.md`
- `component-Usage-Patterns.md`

Also read as needed:

- `form-Patterns.md`
- `icons-and-Visual-Elements.md`
- `layout-and-Spacing-System.md`

Use these when:

- adding new components
- changing existing component behaviours
- updating examples
- ensuring showcase/reference coverage stays current

---

# Multi-Skill Combination Rules

Most real tasks require more than one skill.

## Example combinations

### New protected page with a form

Read:

- `add-protected-page.md`
- `navigation-route-management.md`
- `form-Patterns.md`
- `authenticated-api-call.md`
- `ui-State-Patterns.md`
- `feedback-and-Notifications.md`
- `layout-and-Spacing-System.md`

---

### Login page refresh

Read:

- `login-Flow.md`
- `form-Patterns.md`
- `feedback-and-Notifications.md`
- `layout-and-Spacing-System.md`
- `component-Usage-Patterns.md`
- `icons-and-Visual-Elements.md`

---

### Update top navigation to show current user and logout

Read:

- `navigation-UI-Patterns.md`
- `sessionStateUI.md`
- `logoutFlow.md`
- `layout-and-Spacing-System.md`
- `icons-and-Visual-Elements.md`

---

### New API-driven dashboard card

Read:

- `authenticated-api-call.md`
- `ui-State-Patterns.md`
- `component-Usage-Patterns.md`
- `layout-and-Spacing-System.md`
- `feedback-and-Notifications.md`

---

### Shared component added to the design system

Read:

- `component-Usage-Patterns.md`
- `layout-and-Spacing-System.md`
- `icons-and-Visual-Elements.md`
- `kitchen-Sink-Maintenance.md`

---

# Decision Protocol

Before implementation, the assistant should produce an internal checklist like this:

## Request understanding

- What is the user asking for?
- Is this a page, flow, route, component, or system update?
- Is it public, protected, or shared?

## Affected layers

- Which app systems are touched?
- Does this involve auth?
- Does this involve routing?
- Does this involve forms?
- Does this involve shared UI?
- Does this need kitchen sink updates?

## Required skills to read

List all relevant `.md` skill files before proceeding.

---

# Implementation Behaviour Rule

After using this orchestrator skill, the assistant should:

1. read the relevant skills
2. synthesize their constraints together
3. only then propose structure, code, or implementation steps

Do not rely on generic framework knowledge if a local skill exists for that topic.

Local Fixtura skills take priority over default assumptions.

---

# Output Expectation

When operating in this codebase, the assistant should implicitly follow this pattern:

- first: use the Orchestrator Skill
- second: identify and read the required skills
- third: plan the change within Fixtura conventions
- fourth: implement consistently
- fifth: update related references such as kitchen sink or supporting UI states where needed

---

# In Short

> This skill is the traffic controller for the Fixtura Members Area skill system.

> Its job is to decide which other skills must be consulted before implementation begins.

Without this step, the assistant risks making changes that are technically correct but inconsistent with the established architecture, UX, and component standards.
