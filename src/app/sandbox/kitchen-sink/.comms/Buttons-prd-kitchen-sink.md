# Buttons System PRD — Fixtura Members Area Kitchen Sink

## Purpose

This document defines the full button and CTA system for the Fixtura Members Area design system.

It is intended to guide implementation inside the kitchen sink first, then support extraction into reusable production components used across the application.

This document should be treated as the planning and implementation brief for expanding the current ShadCN button setup into a more complete, app-ready button system.

---

## Why this work is needed

The current button page covers only a basic default set:

- Default
- Secondary
- Outline
- Ghost
- Destructive
- Link
- Small / Default / Large sizes
- A small number of state examples
- Teal and Orange brand extensions

This is a useful starting point, but it is not yet enough for a full application UI system.

As the members area grows, buttons will appear in many different contexts:

- primary page actions
- form submission
- onboarding flows
- auth flows
- inline table actions
- card actions
- empty states
- warning and error states
- modal and dialog footers
- mobile layouts
- icon-only controls
- split actions
- loading and async actions
- persistent system feedback surfaces
- navigation-like CTA patterns that visually resemble buttons

We need a system that is broad enough to handle all of these situations consistently, while still staying simple, clean, and easy to maintain.

---

## Core goal

Expand the current ShadCN button implementation into a complete Fixtura button system that:

- supports common real-world app scenarios
- remains visually consistent with Fixtura brand direction
- clearly communicates action hierarchy
- handles edge cases and system states
- can be documented and previewed in the kitchen sink
- can be reused safely throughout the site

---

## High-level product goals

The button system should:

1. define clear action hierarchy
2. reduce inconsistency across routes and features
3. support both simple and advanced application states
4. improve accessibility and usability
5. provide enough flexibility without becoming visually chaotic
6. remain aligned with ShadCN foundations where practical
7. be easy for future LLM-assisted development to understand and extend

---

## Design direction

Buttons should feel:

- clean
- composed
- modern
- professional
- product-focused
- confident, but not loud
- branded without looking overly decorative

Buttons should not feel:

- gimmicky
- overly glossy
- excessively animated
- crowded with too many visual styles
- inconsistent from page to page

The button system should favour clarity over novelty.

---

## Technical direction

Start from the existing ShadCN `Button` foundation and extend it carefully.

Preferred direction:

- retain ShadCN structure where possible
- extend with Fixtura-specific variants, states, and composition rules
- avoid creating one-off button implementations in feature folders
- centralise variants and usage rules
- ensure all approved variants are documented in the kitchen sink page

The kitchen sink page should become the visual and behavioural reference for button usage.

---

## Scope of this PRD

This PRD covers:

- visual variants
- size variants
- contextual usage
- state handling
- icon usage
- CTA composition
- grouping patterns
- accessibility expectations
- kitchen sink documentation requirements
- component architecture recommendations

This PRD does not yet require:

- final tokens for exact colours, radii, spacing, or shadows
- final motion system specification
- implementation of unrelated controls such as segmented toggles, tabs, or menu items unless intentionally button-derived

---

## Core principle: action hierarchy

Every button in the system should map to a clear level of importance.

### Level 1 — Primary action

Used for the most important action in a given area.

Examples:

- Save changes
- Continue
- Create organisation
- Publish
- Confirm

### Level 2 — Secondary action

Used for valid but less dominant actions.

Examples:

- Cancel
- Back
- View details
- Edit settings

### Level 3 — Tertiary / low-emphasis action

Used for optional or lightweight actions.

Examples:

- Learn more
- Dismiss
- Skip for now
- Preview

### Level 4 — Destructive / risky action

Used for actions with negative or irreversible consequences.

Examples:

- Delete account
- Remove organisation
- Revoke access

### Level 5 — Contextual accent action

Used sparingly for branded or feature-specific emphasis where needed.

Examples:

- Upgrade
- Unlock feature
- Start onboarding

---

## Required button situations to support

The kitchen sink and implementation plan should account for the following button situations.

### 1. Standard standalone CTA buttons

The base system should support common independent actions on pages, forms, cards, and dialogs.

Required examples:

- primary
- secondary
- outline
- ghost
- link
- destructive

### 2. Brand-specific CTA variants

The current teal and orange extensions should be reviewed and formalised.

Questions to resolve in implementation:

- are these true semantic variants, or only branded emphasis styles?
- when should orange be used instead of destructive?
- should teal replace default secondary, or live as a product-brand CTA?

Required examples:

- teal brand CTA
- orange accent CTA
- subtle teal outline or ghost style if useful
- subtle orange outline or ghost style if useful

### 3. Form action buttons

Forms have recurring patterns that need clear rules.

Required scenarios:

- primary submit
- cancel secondary
- back and next patterns
- save draft
- save changes
- loading submit
- disabled until valid
- success completion state if relevant

Required examples:

- Save
- Save changes
- Continue
- Back
- Next step
- Submit

### 4. Auth flow buttons

Authentication often has slightly different behaviour and tone.

Required scenarios:

- sign in
- continue with email
- request code
- verify code
- resend link/code
- loading auth action
- disabled pending validation

Required examples:

- Login with Email
- Send Code
- Verifying...
- Resend Code

### 5. Dialog and modal footer actions

Dialogs are one of the most important button contexts.

Required patterns:

- cancel + confirm
- dismiss + destructive confirm
- back + continue
- single acknowledge action
- loading confirm

Required examples:

- Cancel / Confirm
- Cancel / Delete
- Not now / Upgrade
- Close

### 6. Card-level action buttons

Cards may require different density and emphasis levels than full-page CTA areas.

Required scenarios:

- manage card
- view details
- quick action
- upgrade card
- retry action on error/warning card
- inline card footer CTA

Required examples:

- Manage Project
- View details
- Retry
- Upgrade now

### 7. Empty state CTAs

Empty states often need a stronger action prompt and sometimes a secondary support link.

Required scenarios:

- create first item
- connect integration
- invite team member
- learn more secondary link

Required examples:

- Create Organisation
- Add your first account
- Connect Data Source
- Learn more

### 8. Table and list actions

Dense interfaces need compact, careful action styles.

Required scenarios:

- row actions
- inline text buttons
- icon-only actions
- bulk action toolbar buttons
- table header CTA

Required examples:

- Edit
- Remove
- View
- Export
- Add new

### 9. Toolbar and utility buttons

Not every button is a major CTA. Some are control surfaces.

Required scenarios:

- filter toggle
- refresh
- export
- open panel
- compact shell actions
- top bar utilities

Required examples:

- Refresh
- Export CSV
- Filter
- Open sidebar

### 10. Warning and error recovery buttons

Because the design system is also expanding into persistent warning/error cards, buttons for system recovery should be considered directly.

Required scenarios:

- retry failed action
- review issue
- fix now
- dismiss warning
- contact support

Required examples:

- Retry
- Review issue
- Fix now
- Contact support

### 11. Upgrade and premium actions

Premium upsell actions may deserve distinct treatment.

Required scenarios:

- unlock feature
- upgrade plan
- compare plans
- start trial

Required examples:

- Unlock Pro
- Upgrade now
- View plans

### 12. Mobile and compact layout buttons

Buttons may need compressed forms in smaller layouts.

Required scenarios:

- full-width mobile CTA
- icon-leading compact buttons
- icon-only buttons with tooltip or accessible name
- stacked dialog actions on mobile

### 13. Multi-step flow buttons

Onboarding and setup flows need consistent navigation controls.

Required scenarios:

- previous / next
- save and exit
- skip for now
- complete setup
- return later

### 14. Async and long-running buttons

Async interactions need clear behavioural rules.

Required scenarios:

- loading text swaps
- spinner plus text
- disabled while pending
- preventing double submit
- success/failure follow-up state patterns

Required examples:

- Please wait
- Saving...
- Uploading...
- Processing...

### 15. Icon-only and icon-leading buttons

These should be deliberately designed, not improvised.

Required scenarios:

- icon-leading primary CTA
- icon-leading secondary CTA
- icon-only utility button
- icon-only destructive action
- icon placement consistency

### 16. Button groups and split decisions

Sometimes actions belong together.

Required scenarios:

- side-by-side confirm/cancel
- grouped page actions
- button row alignment rules
- overflow handling when too many actions exist

Optional exploration:

- split button / dropdown-trigger action pattern if genuinely needed later

---

## Recommended variant inventory

The implementation plan should evaluate and likely support the following button variants.

## Base variants

- `default`
- `secondary`
- `outline`
- `ghost`
- `link`
- `destructive`

## Fixtura extensions to evaluate

- `brand`
- `accent`
- `warning`
- `success` or success-like confirmation style only if a clear use case exists
- `soft-destructive` or subtle danger state if needed
- `toolbar` or `utility` if compact controls need their own treatment

Important note:
Do not add variants just because they are possible. Each variant must have a clear semantic role and repeated application use.

---

## Recommended size inventory

Current sizing includes:

- small
- default
- large

The implementation plan should evaluate whether the system also needs:

- icon size
- compact/dense size for tables and toolbars
- extra-large size for empty states or hero-like onboarding moments

Suggested target sizing model:

- `sm`
- `default`
- `lg`
- `icon`
- optional `compact`

---

## State model

Every approved button variant should be tested across states.

Required states:

- default
- hover
- focus-visible
- active / pressed
- disabled
- loading
- with icon
- icon only where applicable

Optional states to evaluate:

- selected / toggled, only if used semantically as a button rather than a segmented control
- success-complete, only if needed in async flows

The kitchen sink should show these states clearly.

---

## Behaviour rules

### Loading behaviour

When an action is pending:

- button should prevent duplicate action
- visual feedback should appear immediately
- loading text should remain readable and specific where possible
- layout shift should be minimised

Examples:

- Save → Saving...
- Delete → Deleting...
- Continue → Please wait

### Disabled behaviour

Disabled buttons must:

- remain visually clear but inactive
- not rely on colour alone to communicate disabled state
- still preserve readable label contrast where practical

### Icon behaviour

Icons should:

- support meaning, not replace it unnecessarily
- align consistently left or right based on action type
- keep spacing consistent across all variants and sizes
- never be the only accessible label for icon-only controls

---

## Semantic guidance

The plan should define when each button type should be used.

### Default

Use for the primary action in a local context.

### Secondary

Use for important but non-primary actions.

### Outline

Use when an action should be visible but quieter than default.

### Ghost

Use for lightweight utility or low-emphasis actions.

### Link

Use for textual actions that behave like lightweight navigation or support links.

### Destructive

Use only for dangerous, irreversible, or clearly negative actions.

### Brand / Accent

Use sparingly for moments where product identity or feature emphasis matters.
These should not replace core hierarchy.

### Warning

If implemented, use for cautionary but not destructive actions.
Example: Resolve issue, Review settings, Check billing.

---

## Accessibility requirements

All button work should include accessible behaviour.

Requirements:

- visible focus states
- sufficient contrast
- keyboard accessibility
- appropriate disabled semantics
- icon-only buttons must have accessible names
- loading buttons should communicate state where practical
- button vs link semantics must be correct

The kitchen sink should intentionally preview focus-visible behaviour and icon-only accessibility examples.

---

## Composition rules to document

The implementation should define layout rules, not just button styling.

Required composition rules:

- maximum one primary action per local action group
- destructive actions should not visually compete with safe primary actions unless intentionally critical
- button order rules for dialogs and forms
- spacing between adjacent CTAs
- full-width use cases on mobile or narrow panels
- when to use stacked actions instead of inline rows
- when a link is better than a button

---

## Kitchen sink page requirements

The `/sandbox/kitchen-sink/buttons` page should become a complete showcase and decision tool.

Recommended sections:

### 1. Introduction

Explain what buttons are for and how the Fixtura hierarchy works.

### 2. Base variants

Display all standard variants.

### 3. Brand extensions

Display approved teal/orange or renamed Fixtura variants.

### 4. Sizes

Show all approved sizes side by side.

### 5. States

Show hover/focus-disabled/loading examples as practical.

### 6. Icons

Show icon-leading, icon-trailing, and icon-only examples.

### 7. Contextual usage

Show examples inside:

- forms
- cards
- empty states
- dialogs
- tables/toolbars
- warning/error cards
- onboarding flows

### 8. Action groups

Show common paired patterns:

- cancel / save
- back / continue
- dismiss / retry
- cancel / delete

### 9. Guidance notes

Each section should explain intended use, not just render components.

### 10. Candidate patterns

If exploring new variants, clearly mark them as experimental until approved.

---

## Deliverables expected from implementation planning

The Cursor implementation plan should include:

### 1. Audit

Review current ShadCN button usage and current kitchen sink examples.

### 2. Variant proposal

Recommend which variants to keep, rename, add, or reject.

### 3. API proposal

Define the final component API for the button system.

Example areas to think through:

- `variant`
- `size`
- `loading`
- `leadingIcon`
- `trailingIcon`
- `asChild`
- `fullWidth`
- `iconOnly`

### 4. Style strategy

Explain how brand extensions should be implemented cleanly within the variant system.

### 5. Kitchen sink expansion plan

Describe how the kitchen sink page should be restructured to showcase all approved scenarios.

### 6. Reusability plan

Explain how this system will be reused safely across the app and how feature teams should avoid one-off styles.

### 7. Accessibility review

Call out key interaction and accessibility requirements.

### 8. Migration guidance

If existing buttons across the site differ, recommend how they should be updated over time.

---

## Suggested implementation questions for Cursor to answer

1. Which current variants are truly necessary?
2. Should teal and orange remain colour-based names, or become semantic names?
3. Do we need a warning variant separate from destructive?
4. Do we need a compact utility size for tables and toolbars?
5. Should loading be part of the base Button API?
6. Should icon placement be standardised through props rather than manual composition?
7. Which contexts need dedicated examples in the kitchen sink?
8. What rules will stop the system from becoming too visually noisy?

---

## Constraints

The implementation should respect the following constraints:

- stay aligned with Fixtura’s clean and composed visual direction
- do not introduce too many variants without semantic need
- avoid one-off feature styling
- preserve a simple mental model for developers
- keep compatibility with ShadCN patterns where reasonable
- ensure everything retained in production is represented in the kitchen sink documentation

---

## Success criteria

This work is successful when:

- the kitchen sink button page covers realistic app scenarios, not just abstract examples
- developers can choose the correct CTA style without guessing
- buttons feel consistent across auth, forms, cards, dialogs, tables, and app shell
- brand-specific styles are intentional and controlled
- async/loading/disabled states are handled consistently
- the final system is reusable and easy to extend

---

## Immediate next step for implementation planning

Use this PRD to create an implementation plan that:

1. audits the current button system
2. proposes the final approved button inventory
3. outlines the component API changes
4. defines the kitchen sink page structure
5. identifies any experimental variants to prototype before locking the system

---

## Notes for Cursor LLM

When planning this work:

- think in terms of system design, not single buttons
- prefer semantic naming over purely visual naming where possible
- recommend restraint where too many variants would weaken consistency
- use the kitchen sink as both showcase and source of truth
- optimise for reuse across the full members area application
