# Kitchen Sink Spec — Feedback Cards Expansion

## Route

`/sandbox/kitchen-sink/cards`

---

## Purpose

This document defines the next expansion for the Cards route inside the kitchen sink.

The current route already includes standard content cards such as:

- project overview
- premium feature upsell
- surface vs card examples

The next step is to expand this route with a new family of **persistent feedback cards**.

These are not temporary notifications like a toast or sonner.
They are more permanent, more structured, and more useful for ongoing system states that need to remain visible until the user understands them, acts on them, or resolves them.

---

# Goal

Add a **Feedback Cards** section to the cards kitchen sink page.

This section should demonstrate a reusable card pattern for communicating persistent product states such as:

- informational reminders
- success states
- warnings
- errors
- critical blocking issues
- premium or upgrade prompts

The output should feel like part of the same design system as the existing standard card, not like a separate alert library.

---

# Core Design Intent

These cards should sit between:

- **Toast / Sonner**
  - temporary
  - lightweight
  - dismissible
  - short-lived

and

- **Standard Card**
  - structured
  - content-oriented
  - persistent
  - layout-driven

A feedback card should feel like:

- a normal product card
- with semantic meaning
- with clearer messaging
- with a stronger action path

It should **not** feel like:

- a harsh warning banner
- a browser alert
- a thin inline callout
- an overly flashy notification block

The visual language should remain calm, polished, and product-oriented.

---

# Section to Add

## Feedback Cards

**Section description:**
Persistent state-based cards used for notices, blockers, warnings, confirmations, and guided actions.

This new section should sit alongside the existing card examples within the cards kitchen sink route.

---

# Card Variants to Include

The page should include at least the following feedback card examples.

---

## 1. Info Card

### Purpose

Used for neutral guidance, reminders, onboarding prompts, or next-step suggestions.

### Example content

- **Label:** Info
- **Title:** Complete your organisation profile
- **Description:** Add your business details, branding, and contact settings to unlock the full onboarding experience.
- **CTA:** Continue setup

### Notes

This should feel helpful and directional, not urgent.

---

## 2. Success Card

### Purpose

Used for completed actions or positive states that should remain visible for reassurance or follow-up action.

### Example content

- **Label:** Success
- **Title:** Brand assets uploaded
- **Description:** Your logo, colors, and primary brand details have been saved successfully and are ready to use across the platform.
- **CTA:** View branding

### Notes

This should feel positive but still composed and restrained.

---

## 3. Warning Card

### Purpose

Used for issues that need attention but are not currently blocking the user.

### Example content

- **Label:** Warning
- **Title:** Two team members still need invites
- **Description:** Some members of your organisation have not yet been invited, which may delay setup and collaboration.
- **CTA:** Manage invites

### Notes

This should signal attention required without feeling destructive.

---

## 4. Error Card

### Purpose

Used for broken or failed states that require action.

### Example content

- **Label:** Error
- **Title:** Payment method failed
- **Description:** Your current billing method could not be processed. Update your payment details to avoid interruption.
- **CTA:** Update billing

### Notes

This should feel clearly more serious than warning, but still consistent with the card system.

---

## 5. Critical / Blocking Card

### Purpose

Used for high-severity states that block functionality or account access.

### Example content

- **Label:** Critical
- **Title:** Publishing is currently blocked
- **Description:** Your organisation cannot publish content until account verification is completed. Please review your account requirements.
- **CTA:** Review account
- **Secondary CTA:** Contact support

### Notes

Use sparingly. This is the strongest state in the family.

---

## 6. Premium / Upgrade Card

### Purpose

Used for feature gating, plan limits, or premium feature promotion.

### Example content

- **Label:** Premium
- **Title:** Unlock advanced reporting
- **Description:** Upgrade your plan to access analytics, exports, trend reporting, and deeper organisation insights.
- **CTA:** Compare plans

### Notes

This should feel aspirational and polished, not salesy or aggressive.

---

# Shared Component Behaviour

Each feedback card should follow a consistent structure so the pattern can later be converted into a reusable component.

## Required content structure

Each card should support:

- semantic icon
- label / eyebrow
- title
- supporting description
- primary CTA

## Optional content structure

Some cards may also support:

- secondary CTA
- dismiss action
- metadata row
- badge
- affected item count
- timestamp or sync status

Examples of optional metadata:

- `2 items affected`
- `Last synced 8 minutes ago`
- `Plan renews in 3 days`

---

# Visual System Rules

## General rule

These cards must feel like part of the same design system as the standard card examples already on the route.

Do not make them feel like unrelated alert components.

## Visual characteristics

Use:

- same card radius language
- same spacing rhythm
- same typography system
- same general surface treatment
- subtle semantic styling per state

Avoid:

- bright full-color panels
- overly aggressive border colors
- heavy warning-strip treatment
- banner-like emergency layouts unless absolutely necessary

---

# Semantic Styling Guidance

Use semantic styling through a restrained combination of:

- soft tinted background
- subtle state border
- icon badge or icon container
- small label / eyebrow
- slightly adjusted emphasis per severity

Possible state styling direction:

- **Info:** calm neutral or soft brand tint
- **Success:** soft positive tint
- **Warning:** warm muted tint
- **Error:** restrained negative tint
- **Critical:** stronger contrast, but still elegant
- **Premium:** premium accent treatment that aligns with product branding

The goal is clarity without visual noise.

---

# Variants to Explore

The kitchen sink should ideally show 2–3 visual approaches to test how feedback cards behave within the system.

## Variant A — Soft Semantic

A mostly standard white/surface card with:

- subtle semantic border
- tinted icon chip
- small label
- restrained CTA

This should likely be the safest and most reusable baseline.

---

## Variant B — Tinted Surface

A card with a lightly tinted full background based on semantic state.

Use this to test whether the feedback cards can feel more distinct while still staying polished.

---

## Variant C — Strong Action Card

A slightly more prominent version for stronger states such as errors, blockers, or premium gates.

This should include:

- clearer action emphasis
- slightly stronger hierarchy
- potential secondary CTA

Do not overdo intensity.

---

# Layout Expectations on the Kitchen Sink Page

The new feedback cards section should be visually organised and easy to compare.

Possible layout options:

- single-column stacked examples
- responsive grid of cards
- grouped by severity
- grouped by visual variant

Preferred direction:

- show the six card types in a clean responsive grid or stacked comparison layout
- ensure spacing between cards is generous enough for visual evaluation
- allow room to compare icon treatment, hierarchy, and CTA weight

---

# UX Notes

These cards are intended for **persistent communication**, not transient notification.

That means each card should answer:

1. What is happening?
2. Why does it matter?
3. What should the user do next?

Each card should be immediately scannable.

The hierarchy should be:

1. semantic cue
2. title
3. short explanation
4. action

---

# Suggested Future Reusability

The implementation should be built with the expectation that this may later become a reusable component family.

The kitchen sink examples should help define:

- shared anatomy
- prop structure
- supported states
- visual severity levels
- CTA handling
- optional metadata support

This does **not** need to become a final reusable component yet unless it naturally makes sense during implementation.
For now, the main goal is to prototype and compare the patterns inside the kitchen sink.

---

# Suggested Folder / Implementation Direction

The Cursor LLM should:

1. review the existing `/sandbox/kitchen-sink/cards` page
2. identify the current card patterns already used there
3. add a new **Feedback Cards** section below or alongside the current standard examples
4. create multiple semantic card examples using a shared structure
5. optionally test 2–3 visual styling directions before settling on the strongest one
6. keep the design aligned with the broader Fixtura kitchen sink system

---

# Plan for Cursor LLM

## Phase 1 — Inspect Existing Route

- review the current cards route
- understand how standard cards are currently structured
- identify existing spacing, typography, card radius, and surface rules
- avoid introducing a completely different visual language

## Phase 2 — Define Feedback Card Pattern

- create a shared card anatomy for semantic messaging
- decide how icon, label, title, body, and actions should stack
- define how semantic state changes the visual treatment

## Phase 3 — Build the Feedback Cards Section

- add a new titled section called `Feedback Cards`
- include the six required examples
- keep the examples realistic and product-oriented
- ensure all cards remain visually consistent with the system

## Phase 4 — Explore Variants

- test subtle differences in:
  - background treatment
  - semantic border styling
  - label emphasis
  - icon container styling
  - CTA emphasis
- compare which direction feels most polished and reusable

## Phase 5 — Refine

- reduce unnecessary visual noise
- align spacing and hierarchy with the rest of the kitchen sink
- ensure the cards feel permanent, calm, and product-grade
- make sure success/warning/error/critical feel distinct without becoming loud

---

# Success Criteria

This task is successful if:

- the cards page includes a clearly labeled **Feedback Cards** section
- the section demonstrates multiple persistent semantic card states
- each example feels more permanent than a toast
- the cards still feel like part of the same card system
- the visual hierarchy is clear and polished
- the result helps define a reusable feedback card pattern for the app

---

# Final Instruction to Cursor

Create a new **Feedback Cards** section inside `/sandbox/kitchen-sink/cards` that extends the existing card system with persistent semantic card patterns.

These cards should communicate ongoing product states such as info, success, warning, error, critical blockers, and premium feature gates.
They should feel more permanent and structured than a toast or sonner, while still matching the existing card surface language, spacing, typography, and tone.

Prioritise:

- calm product UI
- subtle semantic styling
- clear hierarchy
- realistic product copy
- reusable structural thinking

Do not design these as banners or temporary alerts.
Design them as structured, persistent cards that communicate state and guide action.
