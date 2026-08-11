# Fixtura Interaction Lab — Drag & Drop List Sandbox PDR

## Overview

This PDR defines a new **drag-and-drop sandbox** for the Fixtura app inside the **interaction-lab** area.

The goal is to introduce and test a reusable **sortable list pattern** for Fixtura using **dnd kit**, with examples focused on practical Fixtura use cases such as:

- grade ordering
- team ordering
- grouped competition ordering
- category-based list sorting

The sandbox is **not** intended to save to any backend in this phase.
Instead, it should simulate the full interaction flow, including:

- drag and drop reordering
- local state updates
- grouped / category examples
- a **Save** button
- a confirmation **dialog** that says the order was saved

No API, CMS, or persistence logic is required in this sandbox version.

dnd kit’s current docs describe it as production-ready, extensible, and suitable for sortable interfaces, with support for drag, drop, sort, and reorder in any layout or direction. The docs also show a current migration path from the legacy `@dnd-kit/core` package family toward the newer React package path. ([dnd-kit][1])

---

## Primary Goal

Create a dedicated **interaction-lab example page** that demonstrates drag-and-drop ordering patterns Fixtura can later reuse in the main app.

This page should allow the team to evaluate:

- interaction quality
- component structure
- state handling
- layout behaviour
- grouped sorting patterns
- save UX pattern

---

## Objectives

### Functional objectives

Build a sandbox page that includes:

1. **Single sortable list**
   - reorder a flat list of items
   - example: grades in display order

2. **Grouped sortable lists**
   - multiple categories, each with its own sortable list
   - example: teams grouped under divisions or categories

3. **Save interaction**
   - user clicks **Save Order**
   - a dialog appears confirming the order is saved
   - no real save request is made

4. **Object-driven data**
   - list content must come from structured objects / arrays
   - do not hardcode JSX list items directly in the component

---

## Non-Goals

This sandbox should **not** include:

- API integration
- Strapi integration
- BFF integration
- database persistence
- optimistic server syncing
- permission handling
- audit history
- undo / redo
- multi-user sync
- production-level settings management

---

## Package Direction

For this lab, use **dnd kit** as the drag-and-drop library.

### Preferred package direction

Because the current dnd kit docs include a migration path from the older package family to the new React package structure, the implementation should use the **current recommended package path for a fresh build** where practical. The migration guide shows moving from:

- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

to:

- `@dnd-kit/react`
- `@dnd-kit/helpers` ([dnd-kit][2])

### Important implementation note

However, dnd kit’s legacy sortable documentation still clearly documents the sortable concepts most people know today, including:

- sortable context
- sortable items
- drag overlay
- sensors
- modifiers
- keyboard support ([dnd-kit][3])

For this sandbox:

- prefer the **current package direction**
- but keep the architecture aligned to the familiar sortable pattern:
  - provider
  - sortable context
  - sortable item rows
  - reorder helper
  - save state

If the newer API introduces friction in the lab, it is acceptable to document that clearly in code comments and keep the lab focused on validating interaction patterns first.

---

## Route / Placement

Create a new page inside the existing interaction-lab area.

### Suggested route

`/interaction-lab/drag-drop-lists`

If a subsection naming pattern already exists in the app, follow that convention.

---

## UX Intent

This sandbox should feel like a **Fixtura admin interaction pattern**, not a toy demo.

### Desired feel

- clean
- structured
- practical
- easy to scan
- clear row hierarchy
- minimal motion noise
- obvious drag handle
- obvious save action

### Behaviour expectations

- dragging should feel smooth
- rows should clearly indicate draggable affordance
- the active item should feel distinct while moving
- reordered items should update in local state immediately
- clicking Save should open a dialog confirming the action
- the dialog is purely presentational in this phase

---

## Required Examples

## Example 1 — Flat Sortable List

### Purpose

Demonstrate the simplest reorderable list pattern.

### Example content

Use a dataset such as:

- First Grade
- Second Grade
- Third Grade
- Fourth Grade
- Fifth Grade

### Behaviour

- user drags rows up/down
- order updates immediately in UI
- save button opens saved dialog

### Notes

This is the baseline reusable pattern.

---

## Example 2 — Grouped Lists by Category

### Purpose

Demonstrate multiple independent sortable lists on one page.

### Example structure

Use object-driven category data such as:

- Senior Competitions
  - First Grade
  - Second Grade
  - Third Grade

- Junior Competitions
  - Under 17s
  - Under 15s
  - Under 13s

- Women’s Competitions
  - First XI
  - Development Squad

### Behaviour

- each category has its own sortable list
- items can be reordered within that category only
- each category can have its own save button, or the page can use one shared save button

### Recommendation

Use one shared page-level Save button for this sandbox unless your current lab patterns already prefer section-level actions.

---

## Example 3 — Team Ordering Within Groups

### Purpose

Demonstrate a more realistic Fixtura-style use case.

### Example structure

Use data shaped more like actual app entities:

- category / division title
- team objects with id, label, short metadata

For example:

- First Grade
  - Hawkesbury Hawks
  - Blue Mountains United
  - Western Rangers

- Second Grade
  - Eastside Lions
  - Riverdale CC
  - Central District

### Behaviour

- drag rows within each grade
- show secondary metadata in each row
- save triggers confirmation dialog only

### Notes

This example should feel closest to an eventual production admin use case.

---

## Data Requirements

All examples must be driven from **objects / arrays**, not hardcoded JSX rows.

### Flat list example shape

```ts
type SortItem = {
  id: string;
  label: string;
  order: number;
};
```

### Grouped list example shape

```ts
type SortGroup = {
  id: string;
  title: string;
  items: SortItem[];
};
```

### Extended Fixtura-style row shape

```ts
type TeamSortItem = {
  id: string;
  label: string;
  subtitle?: string;
  order: number;
  isLocked?: boolean;
};
```

### Example source pattern

Create example data in a separate mock data object/file and import it into the lab page.

Do not define the list directly inside JSX.

---

## UI Requirements

Each row should include:

- drag handle
- title
- optional subtitle / metadata
- clear row boundary
- hover state
- active dragging state

### Recommended row content

- left: drag handle
- centre: label + metadata
- right: optional badge or order number

### Suggested page structure

- page title
- short helper text
- three example sections
- each section inside a card/container
- save button area at section bottom or page footer
- dialog component for “saved” confirmation

---

## Save Interaction

This phase does **not** persist anything.

### Required behaviour

- clicking **Save Order** opens a dialog
- dialog copy confirms the updated order was saved
- closing the dialog returns the user to the page
- the page state remains as reordered locally

### Suggested dialog copy

**Title:** Order saved
**Body:** Your updated list order has been saved in this interaction demo. No backend save was performed.

Alternative shorter version:
**Title:** Saved
**Body:** This sandbox confirms the save interaction only. No data was persisted.

---

## Accessibility Requirements

dnd kit supports multiple input methods and accessibility features, including sensors and keyboard support, so the sandbox should preserve accessible interaction patterns rather than building a mouse-only demo. ([dnd-kit][1])

### Minimum expectations

- visible focus states
- keyboard reachable controls
- drag handle should be operable with keyboard if supported by the chosen implementation path
- buttons and dialog must use proper accessible primitives
- no colour-only state communication

---

## Technical Requirements

## Core structure

Create a reusable internal sandbox component structure such as:

- `DragDropLabPage`
- `SortableSectionCard`
- `SortableList`
- `SortableListItem`
- `SaveOrderDialog`

### Suggested component separation

#### `SortableList`

Reusable list wrapper that:

- accepts items
- handles local reorder
- renders children / rows
- emits updated order

#### `SortableListItem`

Reusable sortable row that:

- receives item data
- attaches drag behaviour
- renders drag handle and content

#### `SaveOrderDialog`

Simple shared dialog component:

- open / close state
- title and body
- close button

---

## State Management

Use local component state only.

### Requirements

- initialise from mock object data
- reorder state in-memory on drag end
- preserve updated order until page refresh
- no external store required for this lab unless your sandbox patterns already use one

---

## Styling Direction

Match existing Fixtura interaction-lab standards.

### Visual direction

- clean card layout
- consistent spacing
- moderate radius
- subtle border / background separation
- drag handle icon should be visible but not loud
- row spacing should be compact enough for admin lists
- motion should feel responsive but controlled

---

## Suggested Interaction Details

### Row states

Include visual states for:

- default
- hover
- focus
- dragging
- disabled / locked if trialled

### Optional extras for the lab

These are nice-to-have only if quick to implement:

- drag overlay
- lightweight badges
- “reset to original order” button
- item count per group

dnd kit documents `DragOverlay` as the pattern for rendering a draggable overlay outside normal document flow, which can help the active item feel clearer while dragging. ([dnd-kit][4])

---

## Success Criteria

This sandbox is successful if:

1. the page loads with mock object-driven data
2. users can reorder a single list
3. users can reorder multiple grouped lists
4. the UI clearly communicates draggable rows
5. save button opens a confirmation dialog
6. no real persistence is attempted
7. the code structure is reusable enough to evolve into production components later

---

## Deliverables

### Required deliverables

- new interaction-lab route/page
- installed dnd kit packages
- mock data file(s)
- flat sortable list example
- grouped sortable list example
- team ordering example
- save button and saved dialog
- tidy, reusable component structure

### Optional deliverables

- drag overlay
- reset button
- locked row example
- notes in code for future API persistence hook-in points

---

## Suggested Build Order

### Phase 1

Install packages and create route scaffold.

### Phase 2

Build flat sortable list example from object data.

### Phase 3

Build grouped sortable list example.

### Phase 4

Build Fixtura-style team ordering example.

### Phase 5

Add Save button and dialog.

### Phase 6

Polish row states, spacing, drag handle, and lab documentation comments.

---

## Implementation Notes for Cursor LLM

When building this sandbox:

- do not wire to backend
- do not create API calls
- do not fake network requests
- use object-driven mock data
- keep components reusable
- keep styles aligned with Fixtura admin UI
- prefer clarity over feature overload
- ensure the save dialog is presentational only
- structure code so this can later evolve into a reusable production sortable-list component

---

## Final Recommendation

This interaction-lab implementation should be treated as the **foundation pattern** for future Fixtura ordering interfaces.

The focus is not just to prove drag and drop works, but to define:

- how Fixtura sortable lists should look
- how they should behave
- how grouped ordering should be structured
- how save confirmation should feel in the app

Once approved in the interaction-lab, this pattern can be promoted into a reusable app component for:

- grade ordering
- team ordering
- competition priority
- content block ordering
- other manual display order flows
