# Typography System Expansion — Product / Design Requirements Document

## Purpose

This document defines the next phase of the application typography system.

The goal is to move from a **small visual typography reference** into a **full reusable application type system** that:

- supports real product UI scenarios across the app
- provides a clear and consistent hierarchy
- is implemented through reusable components
- reduces one-off typography decisions in feature work
- becomes the enforced typography pattern across the codebase
- is reflected in the `/.skills` guidance so future LLM and developer work uses the approved typography components by default

---

## Current State

Right now the application typography system is limited to a basic visual definition:

- **Headings** using **Plus Jakarta Sans**
- **Body text** using **Inter**
- a small set of sizes:
  - Heading 1 → `text-4xl`
  - Heading 2 → `text-3xl`
  - Heading 3 → `text-2xl`
  - Heading 4 → `text-xl`
  - Heading 5 → `text-lg`
  - Standard Paragraph → `text-base`
  - Small Print → `text-sm`
  - Blockquote

This is a good foundation, but it is currently **presentation-only** and does not yet cover the range of typography scenarios a real application requires.

---

## Problem

The current typography setup does not yet provide:

- application-specific text patterns
- reusable semantic components for type
- guidance for metadata, labels, helper text, captions, overlines, stats, UI headings, table text, empty states, alerts, cards, dashboards, forms, dialogs, badges, or navigation
- consistent implementation rules for future feature work
- an enforceable rule that new UI should use typography components instead of ad hoc utility classes

Without this, the app will drift into inconsistent text sizing, weight, spacing, and hierarchy.

---

## Objectives

### Primary objectives

1. Expand the typography system into a **complete application typography scale**.
2. Define reusable typography components for the most common UI scenarios.
3. Ensure new product UI uses shared type components instead of raw text utility combinations where practical.
4. Update the `/.skills` folder so design/system guidance explicitly requires these typography components.
5. Keep the system flexible enough for product UI, dashboard UI, forms, and marketing-adjacent internal surfaces like the kitchen sink.

### Secondary objectives

- improve visual consistency
- reduce cognitive load during UI implementation
- make LLM-generated UI output more accurate
- simplify design reviews
- make future theme refinement easier

---

## Non-Goals

This document does not aim to:

- replace all Tailwind text utilities across the codebase immediately
- define final brand voice or content strategy
- solve all spacing/layout rules outside of typography
- create a rich text editor system
- cover long-form CMS editorial typography in depth

This is specifically about **application UI typography** and the reusable components that support it.

---

# Typography Foundations

## Font families

### Heading font

- **Plus Jakarta Sans**
- used for headings, prominent UI labels, section titles, and stronger interface moments

### Body font

- **Inter**
- used for paragraphs, descriptions, supporting text, metadata, labels, helper text, tables, and most functional UI copy

---

## Typography principles

### 1. Hierarchy must be obvious

A user should be able to scan a page and instantly understand what is primary, secondary, and supportive.

### 2. Function over decoration

Typography should support clarity first. The app is product-focused, not editorial.

### 3. Reuse over improvisation

Most product text should map to a known typography component rather than be styled from scratch.

### 4. Semantic intent matters

The component name should reflect how the text is used, not just what size it is.

### 5. Consistency across surfaces

Cards, dialogs, forms, tables, dashboard panels, and navigation should feel like they belong to one system.

---

# Expanded Typography Inventory

Below is the proposed expanded set of reusable typography options.

---

## A. Display and Page Headings

These are used for major page-level hierarchy.

### `Display`

**Use for:** hero-style page intros, major route headers, key empty states, premium upsell headers when needed sparingly.

- font: Plus Jakarta Sans
- suggested scale: `text-5xl` or `text-6xl`
- weight: bold / semibold depending on brand direction
- tracking: slightly tight
- usage notes:
  - should be rare
  - not for regular cards or sections
  - avoid overuse in app screens

### `PageTitle`

**Use for:** the main heading on a route or major screen.

- font: Plus Jakarta Sans
- suggested scale: `text-3xl` to `text-4xl`
- weight: semibold / bold
- usage notes:
  - the main title for a page
  - paired with `PageDescription`

### `PageDescription`

**Use for:** supporting summary text under a page title.

- font: Inter
- suggested scale: `text-base` or `text-lg`
- tone: muted but readable
- usage notes:
  - should explain the purpose of the page
  - not too long

---

## B. Section and Container Headings

These are used inside app layouts, panels, cards, and grouped sections.

### `SectionTitle`

**Use for:** major content sections within a page.

- font: Plus Jakarta Sans
- suggested scale: `text-2xl`
- usage notes:
  - for sections beneath a page title
  - useful in dashboards and settings pages

### `SectionDescription`

**Use for:** support text under section titles.

- font: Inter
- suggested scale: `text-sm` or `text-base`
- muted treatment

### `CardTitle`

**Use for:** card headers, feature cards, summary tiles, settings cards, modal body cards.

- font: Plus Jakarta Sans
- suggested scale: `text-lg` or `text-xl`
- usage notes:
  - should be one of the most common heading components

### `CardDescription`

**Use for:** explanatory copy inside cards.

- font: Inter
- suggested scale: `text-sm` or `text-base`
- usage notes:
  - body support inside cards
  - should wrap cleanly and remain readable

### `SubsectionTitle`

**Use for:** nested sections inside larger containers.

- font: Plus Jakarta Sans
- suggested scale: `text-base` or `text-lg`
- usage notes:
  - useful in forms, settings panels, onboarding steps

---

## C. Body Copy Variants

These are for general readable content.

### `Body`

**Use for:** default paragraph copy.

- font: Inter
- suggested scale: `text-base`
- usage notes:
  - standard body copy across the app

### `BodyLarge`

**Use for:** slightly more prominent descriptive text.

- font: Inter
- suggested scale: `text-lg`
- usage notes:
  - useful in onboarding, key summaries, feature intros

### `BodySmall`

**Use for:** compact supporting copy.

- font: Inter
- suggested scale: `text-sm`
- usage notes:
  - default secondary copy option

### `Caption`

**Use for:** image captions, chart notes, supplementary information, inline metadata.

- font: Inter
- suggested scale: `text-xs`
- usage notes:
  - must remain legible
  - never too faint

### `FinePrint`

**Use for:** disclaimers, secondary legal notes, tiny support text.

- font: Inter
- suggested scale: `text-xs`
- usage notes:
  - use sparingly
  - must still meet readability expectations

### `Blockquote`

**Use for:** quoted content or featured message callouts.

- font: Inter or heading font depending on style direction
- usage notes:
  - include a border/spacing pattern if needed

---

## D. Labels and Form Text

These support forms and interactive UI.

### `Label`

**Use for:** form field labels.

- font: Inter
- suggested scale: `text-sm`
- weight: medium
- usage notes:
  - should be consistent across all forms

### `LabelRequired`

**Use for:** required form field labels with optional required marker support.

- same base as `Label`
- may include an asterisk or required indicator

### `HelperText`

**Use for:** hint text beneath an input.

- font: Inter
- suggested scale: `text-sm`
- muted treatment
- usage notes:
  - explains expected input or formatting

### `ErrorText`

**Use for:** validation errors, destructive inline form messaging.

- font: Inter
- suggested scale: `text-sm`
- usage notes:
  - clear and immediate
  - should pair with field state styling

### `SuccessText`

**Use for:** positive inline validation or success messages.

### `FieldsetLegend`

**Use for:** grouped form section titles.

- font: Plus Jakarta Sans or Inter medium depending on visual system
- suggested scale: `text-base` or `text-lg`

---

## E. Navigation and Interface Text

These support sidebars, menus, tabs, and utility UI.

### `NavLabel`

**Use for:** primary sidebar navigation labels, top nav items.

- font: Inter
- suggested scale: `text-sm` or `text-base`
- weight: medium

### `NavSectionLabel`

**Use for:** grouped navigation headings.

- font: Inter
- suggested scale: `text-xs`
- uppercase optional
- usage notes:
  - useful for sidebar grouping

### `TabLabel`

**Use for:** tabs and segmented controls.

- font: Inter
- suggested scale: `text-sm`
- weight: medium

### `BreadcrumbText`

**Use for:** breadcrumb links and current page label.

- font: Inter
- suggested scale: `text-sm`

### `ButtonText`

**Use for:** standard button content.

- this may remain inside the button component rather than standalone, but should still map to a typography rule

---

## F. Data Display and Dashboard Text

These are crucial for product dashboards and admin areas.

### `MetricValue`

**Use for:** KPI numbers, dashboard stats, high-emphasis numeric values.

- font: Plus Jakarta Sans
- suggested scale: `text-2xl` to `text-4xl`
- weight: semibold / bold
- usage notes:
  - designed for high scan value

### `MetricLabel`

**Use for:** labels paired with metric values.

- font: Inter
- suggested scale: `text-sm`
- muted or medium treatment

### `MetricChange`

**Use for:** change indicators like +12.4% or -3.2%.

- font: Inter
- suggested scale: `text-sm`
- may rely on colour and iconography from surrounding component

### `DataLabel`

**Use for:** short labels in charts, summaries, filters, legends.

- font: Inter
- suggested scale: `text-xs` or `text-sm`

### `DataValue`

**Use for:** tabular or inline data values requiring a strong but compact presentation.

- font: Inter or Plus Jakarta Sans depending on context
- suggested scale: `text-sm` to `text-base`

### `TableHeading`

**Use for:** table headers.

- font: Inter
- suggested scale: `text-xs` or `text-sm`
- weight: medium / semibold
- usage notes:
  - should work in dense data environments

### `TableCell`

**Use for:** default cell text.

- font: Inter
- suggested scale: `text-sm`

### `TableMeta`

**Use for:** secondary cell text such as supporting context or timestamps.

- font: Inter
- suggested scale: `text-xs`

### `CodeInline` / `MonoText`

**Use for:** IDs, slugs, technical values, small code snippets.

- font: monospace
- suggested scale: `text-sm`
- usage notes:
  - should be a controlled exception to the 2 primary font system
  - used only when functionally needed

---

## G. State, Feedback, and Status Text

These support alerts, notices, banners, and persistent message cards.

### `AlertTitle`

**Use for:** success, warning, error, info card/banner titles.

- font: Plus Jakarta Sans
- suggested scale: `text-base` or `text-lg`
- usage notes:
  - for persistent inline feedback surfaces

### `AlertDescription`

**Use for:** supporting copy within alerts, banners, warning cards.

- font: Inter
- suggested scale: `text-sm` or `text-base`

### `StatusLabel`

**Use for:** status indicators like Active, Paused, Failed, Draft.

- font: Inter
- suggested scale: `text-xs` or `text-sm`
- weight: medium
- usage notes:
  - often used inside badge/chip components

### `EmptyStateTitle`

**Use for:** empty screens and no-data messages.

- font: Plus Jakarta Sans
- suggested scale: `text-xl` or `text-2xl`

### `EmptyStateDescription`

**Use for:** support text in empty states.

- font: Inter
- suggested scale: `text-sm` or `text-base`

---

## H. Dialog, Drawer, and Overlay Text

### `DialogTitle`

**Use for:** modal and drawer headings.

- font: Plus Jakarta Sans
- suggested scale: `text-xl`

### `DialogDescription`

**Use for:** modal and drawer supporting text.

- font: Inter
- suggested scale: `text-sm` or `text-base`

### `PopoverTitle`

**Use for:** structured popovers or contextual info cards.

### `PopoverDescription`

**Use for:** support text inside popovers.

---

## I. Eyebrow and Overline Styles

These help create structured visual hierarchy in dashboards and cards.

### `Eyebrow`

**Use for:** short labels above headings, such as section category or state.

- font: Inter
- suggested scale: `text-xs`
- may use uppercase and tracking
- usage notes:
  - useful above card titles, page titles, or empty states

### `Overline`

**Use for:** compact, stylised, upper hierarchy labels.

- should be visually restrained
- not for overuse

---

# Recommended Component Structure

## Goal

All reusable application typography should live in the shared components layer and be easy to compose.

---

## Proposed implementation approach

Create a dedicated typography component module such as:

- `components/typography.tsx`

or

- `components/ui/typography.tsx`

This file should export a collection of reusable typography primitives.

---

## Suggested component API patterns

There are two good approaches.

### Option A — Named exports for each type variant

Example conceptual API:

- `Display`
- `PageTitle`
- `PageDescription`
- `SectionTitle`
- `CardTitle`
- `Body`
- `BodySmall`
- `Caption`
- `Label`
- `HelperText`
- `ErrorText`
- `MetricValue`
- `MetricLabel`
- `AlertTitle`
- `AlertDescription`
- `DialogTitle`
- etc

**Benefits:**

- explicit
- very readable in JSX
- best for LLM use
- reduces ambiguity

### Option B — Single `Typography` component with `variant`

Example conceptual API:

- `<Typography variant="page-title" />`
- `<Typography variant="body-small" />`
- `<Typography variant="metric-value" />`

**Benefits:**

- centralised logic
- more compact internal implementation

### Recommended direction

Use a **hybrid pattern**:

- one internal base typography primitive
- named exports for common variants

This gives the codebase:

- readable JSX
- flexible extension
- easier LLM adoption
- centralised styling rules

---

## Suggested component capabilities

Typography components should support:

- `as` prop for semantic element choice
  - example: render as `h1`, `h2`, `p`, `span`, `label`, `div`

- `className` extension for local overrides when truly needed
- variant-specific default styles
- optional tone modifiers such as:
  - default
  - muted
  - destructive
  - success
  - warning

- truncation where appropriate for nav/table/meta use cases
- semantic accessibility support

---

# Application Scenarios to Support

This section maps typography needs to real product surfaces.

---

## 1. Page headers

Need:

- page title
- page description
- optional eyebrow

Use:

- `Eyebrow`
- `PageTitle`
- `PageDescription`

---

## 2. Dashboard cards

Need:

- card title
- card description
- metric value
- metric label
- status label

Use:

- `CardTitle`
- `CardDescription`
- `MetricValue`
- `MetricLabel`
- `StatusLabel`

---

## 3. Forms

Need:

- field label
- required state
- helper text
- error text
- success text
- fieldset legend

Use:

- `Label`
- `LabelRequired`
- `HelperText`
- `ErrorText`
- `SuccessText`
- `FieldsetLegend`

---

## 4. Table views

Need:

- table heading
- cell text
- metadata text
- numeric data emphasis

Use:

- `TableHeading`
- `TableCell`
- `TableMeta`
- `DataValue`

---

## 5. Alerts / feedback cards / persistent notices

Need:

- title
- support copy
- optional fine print

Use:

- `AlertTitle`
- `AlertDescription`
- `FinePrint`

---

## 6. Empty states

Need:

- title
- description
- optional eyebrow

Use:

- `Eyebrow`
- `EmptyStateTitle`
- `EmptyStateDescription`

---

## 7. Dialogs and drawers

Need:

- dialog title
- description
- small support/legal note

Use:

- `DialogTitle`
- `DialogDescription`
- `FinePrint`

---

## 8. Navigation

Need:

- nav labels
- grouped nav headings
- breadcrumbs
- tab labels

Use:

- `NavLabel`
- `NavSectionLabel`
- `BreadcrumbText`
- `TabLabel`

---

## 9. Settings pages

Need:

- section titles
- subsection titles
- card titles
- helper/support copy

Use:

- `SectionTitle`
- `SubsectionTitle`
- `CardTitle`
- `BodySmall`

---

## 10. Onboarding and step flows

Need:

- step title
- step description
- small helper notes

Use:

- `SectionTitle`
- `Body`
- `HelperText`

---

## 11. Badges / chips / status pills

Need:

- compact state labels

Use:

- `StatusLabel`

---

## 12. Charts and reporting UI

Need:

- chart title
- chart description
- axis/meta notes
- data labels

Use:

- `CardTitle` or `SubsectionTitle`
- `CardDescription`
- `Caption`
- `DataLabel`

---

## 13. Search and filter areas

Need:

- filter headings
- helper notes
- result summaries

Use:

- `SubsectionTitle`
- `HelperText`
- `BodySmall`

---

## 14. Inline technical values

Need:

- slugs
- IDs
- short code values

Use:

- `CodeInline` / `MonoText`

---

# Rules for Usage

## Core rule

**New application UI should use the shared typography components instead of ad hoc text class combinations wherever possible.**

---

## Allowed direct utility usage

Direct Tailwind text classes may still be acceptable for:

- one-off prototypes inside sandbox exploration
- extremely local temporary experiments
- third-party integration edge cases
- layout wrappers where typography is not the focus

But once a pattern is used more than once or enters production UI, it should be moved to the shared typography system.

---

## Do not

- create random new text size combinations in feature files without system review
- mix heading and body styles inconsistently
- use muted text so lightly that accessibility suffers
- use large headings inside dense data UIs unless structurally justified
- let individual cards invent their own typography hierarchy

---

# Accessibility Considerations

The typography system must support:

- clear semantic heading order
- sufficient contrast for muted/support text
- readable text sizes across desktop and mobile
- reasonable line-height defaults
- restrained use of ultra-small type
- semantic tags through the `as` prop where needed

Recommended minimums:

- avoid using `text-xs` for critical information
- reserve `text-xs` primarily for captions, metadata, and support copy
- ensure labels and helper text remain readable on smaller screens

---

# Implementation Requirements

## Required deliverables

### 1. Shared typography component module

Create the typography system in the shared components layer.

Suggested file:

- `components/ui/typography.tsx`

### 2. Exported reusable components

Implement the approved variants as reusable exports.

### 3. Kitchen sink typography route update

Expand the typography sandbox/demo page to show:

- all variants
- their intended use case
- sample content
- semantic usage examples
- do/don’t examples if useful

### 4. Refactor priority surfaces

Apply the new typography components first to high-value areas such as:

- page headers
- cards
- forms
- alerts
- dialogs
- dashboard stats
- table headings and cell text where practical

---

# Recommended Build Order

## Phase 1 — Foundation

- define variant inventory
- align naming
- implement base typography component
- export named primitives

## Phase 2 — Kitchen sink

- expand `/sandbox/kitchen-sink/typography`
- add grouped demo sections by scenario
- show examples in realistic application contexts

## Phase 3 — Apply to common surfaces

- cards
- page headers
- forms
- alerts
- dialogs
- empty states

## Phase 4 — Extend to dense UI

- tables
- dashboard stats
- navigation
- filters
- data-heavy panels

## Phase 5 — Skills and enforcement

- update `/.skills`
- document the usage rule
- reference typography system in relevant design/system skills

---

# `/.skills` Update Requirements

The typography guidance in `/.skills` must be extended so future work follows the system.

---

## New or updated skill content should include

### Rule 1

When creating or updating UI, prefer shared typography components over raw text utility classes.

### Rule 2

Use semantic typography variants based on UI purpose, not visual guesswork.

### Rule 3

When a new text pattern appears repeatedly, it should be proposed as a shared typography variant.

### Rule 4

Kitchen sink typography examples are the source of truth for application type usage.

### Rule 5

Cards, forms, dialogs, tables, alerts, and page shells should all consume the typography system consistently.

---

## Skills files likely to update

This depends on current repo structure, but likely includes:

- a typography or design-system skill
- kitchen sink / branding / UI skills
- component creation skill
- page/shell/layout skills
- any card/form/dialog skill docs

---

## Suggested skills wording

You can add guidance like:

> Always use the shared typography components for headings, labels, descriptions, helper text, alerts, metrics, and other common interface text patterns. Do not create ad hoc text styling in feature components unless it is a genuine one-off sandbox exploration. If a new typography pattern is needed more than once, add it to the typography component system and document it in the kitchen sink.

And:

> The typography kitchen sink route is the reference surface for approved text hierarchy, semantic roles, and component usage. New UI work should align to those examples.

---

# Component Naming Recommendation

Use names that are:

- semantic
- readable in JSX
- easy for LLMs to infer correctly
- tied to application usage

Recommended naming style:

- `PageTitle`
- `PageDescription`
- `SectionTitle`
- `CardTitle`
- `CardDescription`
- `Body`
- `BodySmall`
- `Caption`
- `Label`
- `HelperText`
- `ErrorText`
- `MetricValue`
- `MetricLabel`
- `AlertTitle`
- `AlertDescription`
- `DialogTitle`
- `DialogDescription`
- `StatusLabel`
- `Eyebrow`

This is better than purely size-based naming for most app UI.

---

# Acceptance Criteria

This work is complete when:

- the typography system includes variants for the main application scenarios
- shared typography components exist in the components layer
- new typography variants are reusable and semantic
- the kitchen sink typography route demonstrates the full system
- relevant high-value UI areas begin consuming the new system
- `/.skills` documentation is updated to require typography component usage in future UI work
- the team has a clear rule for when to add a new type variant versus styling locally

---

# Recommended Next Deliverables

After this PDR, the next documents/tasks should be:

1. **Typography component spec**
   - exact component API
   - variant list
   - semantic tag defaults
   - class structure

2. **Kitchen sink typography expansion spec**
   - page structure
   - section groupings
   - realistic demo examples

3. **`/.skills` typography update doc**
   - exact wording to append/update in design and component guidance

4. **Implementation task list for Cursor/LLM**
   - build order
   - file targets
   - refactor targets

---

# Final Direction

The typography system should evolve from a style reference into a **real application primitive layer**.

Typography should no longer be treated as scattered utility classes applied case by case.

Instead, it should become:

- a reusable component system
- a documented product standard
- a design-system rule
- and a requirement enforced through both implementation patterns and `/.skills` guidance

This will make the UI more cohesive, make new feature work faster, and give LLM-assisted development a much stronger system to follow.
