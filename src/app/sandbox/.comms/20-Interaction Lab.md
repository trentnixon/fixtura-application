# Interaction Lab

## Overview

This document defines the purpose, boundaries, structure, and implementation rules for the `/interaction-lab` development sandbox in the Fixtura Members Area.

The interaction lab is a development-only route space for testing **interactive mechanics, stateful UI behaviours, and async user flows** outside the real application environment.

It exists alongside the other sandbox routes:

- `/kitchen-sink` → component and design primitive sandbox
- `/route-lab` → page and route sandbox
- `/interaction-lab` → behaviour and interaction sandbox

This route is intended to support development when real backend access is unavailable, JWT authentication cannot complete, or the developer needs a controlled environment for testing UI mechanics in isolation.

---

## Purpose

The interaction lab exists to support development of UI behaviours that are too complex for a simple component sandbox and do not need a full production page context.

This route should be used for:

- upload interactions
- drag and drop interactions
- sorting and reordering
- bulk selection and batch actions
- async form submission
- progress indicators
- loading/success/error transitions
- validation behaviour
- clipboard actions
- modal and dialog flows
- multi-step behaviour testing
- optimistic UI interactions
- retry and recovery behaviour

The purpose of this lab is to test **how things behave**, not just how they look.

---

## Core Principle

The interaction lab is the sandbox for **stateful interaction patterns**.

If the kitchen sink answers:

> what does this component look like?

and the route lab answers:

> how does this page fit together?

then the interaction lab answers:

> how does this behaviour actually work?

---

## Why This Exists

Some development work is difficult to do well in either a component-only or full-page-only environment.

Examples:

- a drag-and-drop list needs state, movement, and feedback
- an upload flow needs file selection, validation, progress, and retry states
- a bulk action toolbar needs selection mechanics and state transitions
- an async form needs loading, validation, success, and failure behaviour

These mechanics are often too stateful for `/kitchen-sink`, but too implementation-specific or isolated for `/route-lab`.

The interaction lab fills that gap.

---

## Relationship to Other Sandbox Routes

### `/kitchen-sink`

Use for:

- visual primitives
- component variants
- isolated UI patterns
- design system reference

### `/route-lab`

Use for:

- full pages
- shell composition
- page-level layouts
- route-state development
- screen-level scenarios

### `/interaction-lab`

Use for:

- mechanics
- interaction behaviours
- UI state transitions
- asynchronous flows
- user action testing
- multi-state interactive patterns

---

## Rule of Use

### Use `/kitchen-sink` when:

- testing a component in isolation
- reviewing approved styling and variants
- working on visual primitives

### Use `/route-lab` when:

- testing a full page or route
- working on layout and shell composition
- simulating page-level route conditions

### Use `/interaction-lab` when:

- testing behaviour over time
- simulating state transitions
- handling async interactions
- building drag/drop, upload, reorder, or validation mechanics
- validating how a user action changes UI state

---

## Access Model

The interaction lab follows the same sandbox access model as `/kitchen-sink` and `/route-lab`.

It is **environment-controlled**, not auth-controlled.

It must:

- work without JWT authentication
- work without organisation resolution
- work without a live CMS connection
- work with mock or fixture-driven state

Recommended shared env flag:

```env
NEXT_PUBLIC_ENABLE_DEV_SANDBOX=true
```

When sandbox mode is enabled, `/interaction-lab` is available.

When sandbox mode is disabled, `/interaction-lab` should return `404`.

---

## Critical Constraint

The interaction lab must never depend on:

- live JWT auth
- real CMS connectivity
- real file upload infrastructure
- real organisation context
- real backend success

It is a development-only sandbox and must remain offline-safe.

---

## What Belongs in the Interaction Lab

### Upload Mechanics

Examples:

- single file upload
- multiple file upload
- drag-and-drop upload area
- upload progress
- upload success
- upload failure
- retry upload
- invalid file type
- invalid file size
- remove uploaded item
- upload queue behaviour

### Drag and Drop Mechanics

Examples:

- list reorder
- card reorder
- move between drop zones
- drag hover feedback
- invalid drop target
- empty drop zone
- drag handle interactions

### Form Interaction Mechanics

Examples:

- async submit
- validation feedback
- dirty state
- submit disabled/enabled logic
- retry flow
- save and cancel flow
- autosave simulation
- optimistic save UI

### Selection Mechanics

Examples:

- bulk row selection
- select all / deselect all
- partial selection state
- action toolbar state changes
- batch action confirmation flow

### Feedback Mechanics

Examples:

- progress feedback
- toast chains
- success state transitions
- failure recovery
- loading overlays
- pending action indicators

### Dialog and Workflow Mechanics

Examples:

- confirmation dialogs
- destructive action confirm flows
- multi-step modal flows
- wizard-style interactions
- handoff and success transitions

### Clipboard and Utility Mechanics

Examples:

- copy to clipboard
- copy success/failure feedback
- generated link copy
- token or key copy state

---

## What Does Not Belong Here

The interaction lab should not become:

- a general dumping ground for unfinished features
- a replacement for real production implementation
- a random collection of UI experiments without structure
- a full feature environment that depends on live systems

If the work is purely visual, it belongs in `/kitchen-sink`.

If the work is primarily about full-page layout or shell composition, it belongs in `/route-lab`.

If the work is specifically about behaviour, interaction, or state transition mechanics, it belongs in `/interaction-lab`.

---

## Structure Recommendation

Recommended route structure:

```txt
/interaction-lab
  /overview
  /upload
    /single-file
    /multi-file
    /drag-drop
    /progress
    /validation
  /drag-drop
    /list-reorder
    /card-reorder
    /drop-zones
  /forms
    /async-submit
    /validation
    /dirty-state
    /autosave
  /selection
    /bulk-actions
    /table-selection
  /feedback
    /toast-flow
    /success-error
    /loading-progress
  /dialogs
    /confirm-flows
    /multi-step
  /clipboard
    /copy-actions
```

This structure should stay purposeful and grouped by behaviour type.

---

## Scenario Pattern

The interaction lab should support scenario-based rendering so a single route can test multiple realistic interaction states.

Recommended params:

- `state`
- `scenario`
- `mode` when useful

Examples:

```txt
/interaction-lab/upload/drag-drop?state=idle
/interaction-lab/upload/drag-drop?state=dragging
/interaction-lab/upload/drag-drop?state=uploading
/interaction-lab/upload/drag-drop?state=success
/interaction-lab/upload/drag-drop?state=error
```

```txt
/interaction-lab/drag-drop/list-reorder?scenario=populated
/interaction-lab/drag-drop/list-reorder?scenario=empty
```

```txt
/interaction-lab/forms/async-submit?state=submitting
/interaction-lab/forms/async-submit?state=success
/interaction-lab/forms/async-submit?state=error
```

### Suggested meanings

#### `state`

Represents the immediate interaction state:

- `idle`
- `dragging`
- `uploading`
- `validating`
- `submitting`
- `success`
- `error`
- `disabled`

#### `scenario`

Represents a broader setup or test case:

- `empty`
- `populated`
- `multiple`
- `invalid-file`
- `oversized`
- `partial-selection`
- `full-selection`

#### `mode`

Optional when a higher-level context matters:

- `mock`
- `preview`
- `optimistic`
- `recovery`

---

## Data and State Rules

The interaction lab should use:

- fixtures
- local mock state
- fake async helpers
- scenario-driven rendering
- development-only utility helpers

It should not require:

- live APIs
- real uploads
- real auth state
- real websocket/state sync
- real persistence

The goal is to simulate behaviour clearly and predictably.

---

## Mocking Principles

### 1. Mock first

Every interaction in this lab should work with local fixture state before any real integration is considered.

### 2. Prefer deterministic behaviour

Interaction states should be easy to trigger and reproduce.

### 3. Expose transition states clearly

Each interaction page should make it easy to observe:

- current state
- current scenario
- transition result
- active selection / upload / reorder state

### 4. Make failures testable

Error and retry states should be first-class scenarios, not afterthoughts.

### 5. Reuse fake mechanics

Shared fake helpers should be created for repeated interaction patterns.

Examples:

- fake uploader
- fake progress generator
- fake validation engine
- fake delayed response helper
- fake reorder state helper

---

## Shared Access Pattern

This route should use the same shared gate as the other sandbox routes.

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

### Route layout

```tsx
// app/interaction-lab/layout.tsx
import { DevSandboxGate } from "@/components/dev/DevSandboxGate";

export default function InteractionLabLayout({ children }: { children: React.ReactNode }) {
  return <DevSandboxGate>{children}</DevSandboxGate>;
}
```

---

## Recommended Support Components

The interaction lab will be easier to maintain if it includes a small set of shared helper components.

Suggested helpers:

- `InteractionLabPage`
- `InteractionScenarioSwitcher`
- `InteractionStateBadge`
- `MockProgressBar`
- `FakeAsyncBoundary`
- `SelectionDebugPanel`
- `UploadDebugPanel`

These are optional, but recommended for consistency.

---

## Recommended Page Wrapper Pattern

Each interaction-lab page should clearly describe:

- what interaction it is testing
- what real feature it may eventually support
- what scenario is being shown
- what states are available

Example:

```tsx
<InteractionLabPage
  title="Drag and Drop Upload"
  description="Tests drag state, file validation, upload progress, and retry behaviour."
  scenarios={["idle", "dragging", "uploading", "success", "error"]}
>
  {/* interaction content */}
</InteractionLabPage>
```

---

## Production Safety Rules

### 1. Interaction-lab routes are not production features

Do not treat them as real app routes.

### 2. No production dependency

No real user flow should depend on `/interaction-lab` being enabled.

### 3. No live infrastructure requirement

The lab must remain useful even when backend systems are unavailable.

### 4. Hide completely when disabled

Return `404` when sandbox mode is off.

### 5. Keep it behaviour-focused

Pages should exist to test mechanics, not to hold random unfinished app code.

---

## First Recommended Interaction Lab Pages

The first pages to build should be:

- `/interaction-lab/upload/drag-drop`
- `/interaction-lab/upload/multi-file`
- `/interaction-lab/drag-drop/list-reorder`
- `/interaction-lab/forms/async-submit`
- `/interaction-lab/selection/bulk-actions`
- `/interaction-lab/dialogs/confirm-flows`

These cover the most reusable and behaviour-heavy patterns.

---

## First Recommended Scenario Coverage

### Upload Drag and Drop

- idle
- drag hover
- invalid file
- oversized file
- uploading
- success
- error
- retry

### Multi File Upload

- empty
- queued
- partial failure
- full success
- remove file

### List Reorder

- empty list
- populated list
- dragging
- dropped
- invalid move

### Async Submit Form

- idle
- dirty
- validating
- submitting
- success
- error

### Bulk Actions

- no selection
- one selected
- multiple selected
- partial select
- confirm action
- action success
- action error

---

## Folder Structure Recommendation

```txt
app/
  interaction-lab/
    layout.tsx
    page.tsx
    overview/
      page.tsx
    upload/
      drag-drop/
        page.tsx
      multi-file/
        page.tsx
    drag-drop/
      list-reorder/
        page.tsx
    forms/
      async-submit/
        page.tsx
    selection/
      bulk-actions/
        page.tsx
    dialogs/
      confirm-flows/
        page.tsx

src/
  features/
    interaction-lab/
      components/
        InteractionLabPage.tsx
        InteractionScenarioSwitcher.tsx
      fixtures/
        uploads.ts
        selections.ts
        reorder.ts
      utils/
        fakeAsync.ts
        fakeUpload.ts
        getInteractionScenario.ts
```

---

## Relationship to Real Product Work

The interaction lab is not the final destination for production features.

Instead, it acts as a controlled proving ground where interaction logic, feedback patterns, and state transitions can be refined before being moved into real member features.

This helps reduce risk and improve consistency before interaction-heavy mechanics are integrated into actual pages.

---

## Summary

`/interaction-lab` is the behaviour-focused development sandbox for the Fixtura Members Area.

It exists to support testing of uploads, drag-and-drop, selection mechanics, async flows, validation, feedback, and other stateful user interactions in a stable, offline-safe environment.

Like the other sandbox routes, it is development-only, controlled by the shared sandbox env flag, and must work without JWT auth or live CMS access.

Together, the sandbox system now has three clear layers:

- `/kitchen-sink` → what components look like
- `/route-lab` → how pages are assembled
- `/interaction-lab` → how behaviours work

This gives the project a clear and scalable development sandbox model for UI, routes, and interaction mechanics.
