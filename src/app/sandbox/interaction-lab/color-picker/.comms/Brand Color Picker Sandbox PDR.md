Absolutely — here’s a Cursor-ready `.md` document you can drop straight into the project.

````md
# Fixtura Interaction Lab — Brand Color Picker Sandbox PDR

## Purpose

This document defines the full end-to-end user experience, UI behaviour, validation rules, feedback patterns, and implementation expectations for the **Brand Color Picker** feature to be built first inside the `/interaction-lab` sandbox.

This sandbox version is a **pre-production UX and component proving ground**.

The goal is to validate:

- the full user interaction flow
- the correct component structure
- reusable prop-driven design
- validation and error handling
- persistent success/error feedback patterns
- live visual preview of selected brand colors in context

This is **not** intended to be a quick experimental throwaway.
It should be built with production-level structure and reusable patterns so it can later be extracted into the main application with minimal rework.

---

# Feature Summary

Users need a simple and reliable way to choose their Fixtura brand colors.

These users are **not designers**.

They only need to:

- view their current brand color
- select a color visually
- optionally enter an exact HEX value
- see preset/recent swatches
- see the selected color in context on a preview asset card
- understand immediately if the value is valid or invalid
- receive clear persistent feedback without using toast/sonner notifications

The experience should feel:

- simple
- fast
- calm
- obvious
- branded
- safe for non-technical users

This should behave like a **focused brand color field**, not like a full creative design tool.

---

# Core UX Principle

> Make the easiest action the most common action.

Most users should succeed by doing one of these:

1. clicking a visible swatch
2. opening the picker and selecting visually
3. pasting or typing an exact HEX code

The UI should always support both:

- **visual selection**
- **direct exact input**

---

# Sandbox Route

## Route

`/interaction-lab`

## Sandbox Area

Create a dedicated section or card group for:

- `Brand Color Picker`
- possibly under a heading such as:
  - `Brand Controls`
  - `Color Selection`
  - `Brand Customisation`

This should feel like a focused feature lab, not a random demo block.

---

# Primary User Story

As a Fixtura user,
I want to choose my brand colors easily,
so I can quickly apply them to my account or assets without needing design knowledge.

---

# Secondary User Stories

As a user:

- I want to see the currently selected color immediately
- I want to paste a HEX code if I already know it
- I want to choose from visible swatches if I do not know the code
- I want to see whether my selection looks good in context
- I want obvious inline feedback if my entry is invalid
- I want success and warning states to remain visible until I act on them
- I do not want temporary toast messages that disappear

---

# Recommended Tech Direction

## Picker Engine

Use:

- `react-colorful`

Reason:

- lightweight
- modern
- good fit for custom wrapped UI
- works well with Tailwind/ShadCN patterns
- appropriate for a focused controlled picker experience

## UI Wrapper

Build a Fixtura-owned wrapper component around the picker.

The wrapper should control:

- label
- current value
- swatches
- recent selections
- validation
- feedback state
- live preview
- helper text
- error handling
- success messaging
- accessibility labels
- reusable styling

---

# Out of Scope

The first sandbox version should **not** include:

- gradients
- alpha/transparency controls
- RGB/HSL sliders exposed to the user
- multi-color theme systems
- automatic palette generation
- full template editing
- upload-based logo color extraction
- modal-based complex workflow unless later required

This is a focused color selection feature only.

---

# Primary Component Architecture

## Recommended Components

### 1. `BrandColorField`

Main reusable field wrapper.

Responsibilities:

- label + description
- current swatch display
- hex input
- choose/edit trigger
- inline validation state
- persistent feedback region
- connection to preview area

### 2. `BrandColorPopover`

Popover or panel containing:

- preset swatches
- recent swatches
- visual picker area
- hue slider
- optional reset action

### 3. `BrandColorPreviewCard`

Mini mock asset preview showing selected color in context.

Should preview:

- asset header / title strip
- accent panel
- CTA/button treatment
- text on colored surface
- secondary supporting element such as badge/chip/tag

### 4. `PersistentFieldFeedback`

Reusable persistent feedback component for:

- success
- error
- warning
- helper/info state

This replaces toast/sonner-style messaging for this feature.

---

# Proposed Component API

## `BrandColorField`

```ts
type BrandColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
  placeholder?: string;
  presets?: string[];
  recentColors?: string[];
  disabled?: boolean;
  required?: boolean;
  showPreview?: boolean;
  previewVariant?: "asset-card" | "button-only" | "full";
  allowReset?: boolean;
  defaultValue?: string;
  validateContrast?: boolean;
  minContrastMode?: "none" | "recommended" | "strict";
  onValidChange?: (isValid: boolean) => void;
};
```
````

This should stay controlled and reusable.

---

# Full End-to-End User Experience

# 1. Initial Load State

When the user lands on the sandbox area:

- the field is visible
- the current selected brand color is already populated
- the swatch displays the current color
- the hex input displays the current hex value
- the preview card shows the current color applied in context
- helper text explains what this control is for

Example intent:

- `Choose your primary brand color`
- `Use a preset, pick visually, or enter an exact HEX value`

No success or error message should appear on first load unless the initial value is invalid.

---

# 2. Default Field Layout

The default closed state should contain:

- field label
- short helper text
- prominent color swatch button
- hex input
- choose/edit trigger
- optional reset action
- persistent feedback region under the field
- preview card underneath or adjacent

The current color should be visible without opening the picker.

---

# 3. Open Picker Interaction

When the user clicks:

- the swatch
- the choose/edit trigger
- optionally the input adornment

The picker panel opens.

The panel should include, in order:

## 3.1 Current color summary

- larger swatch preview
- current hex value
- optional small status label

## 3.2 Preset swatches

A row/grid of preset colors.

Purpose:

- fast selection
- easier for non-design users
- reduce need to drag around the picker

## 3.3 Recent swatches

A row/grid of recently selected colors.

Purpose:

- quick backtracking
- encourages experimentation without penalty

## 3.4 Visual color selection

Use `react-colorful` here.

Include:

- saturation/value area
- hue slider

Keep this visually compact and easy to understand.

## 3.5 HEX input

Should remain visible and editable.

Users must be able to:

- type
- paste
- replace the value directly

## 3.6 Optional reset

A lightweight action to return to the default/original value.

---

# 4. Swatch Selection Flow

When the user clicks a preset or recent swatch:

- the selected color updates immediately
- the hex field updates immediately
- the preview card updates immediately
- validation runs immediately
- any feedback region updates immediately

This should feel instant and obvious.

---

# 5. Visual Picker Flow

When the user drags/selects a color in the picker:

- the swatch updates live
- the hex value updates live
- the preview card updates live
- validation runs live or on interaction end depending on implementation preference

Recommended:

- update live
- but keep error messaging calm and not overly noisy

---

# 6. HEX Input Flow

When the user types or pastes a hex value:

- input should accept values with or without `#`
- display should normalize to canonical format
- lowercase/uppercase behaviour should be consistent across the app

Recommended canonical storage:

- uppercase hex with leading `#`

Example:

- user types `f20100`
- component normalizes to `#F20100`

The preview should update only when the hex is valid enough to parse safely.

---

# 7. Live Preview Behaviour

This is a critical part of the feature.

Users should not choose colors in isolation.

## Preview Requirements

The preview card must show the selected color applied to realistic UI surfaces.

Recommended preview elements:

### Header strip

Simulates an asset header or top band.

### Button / CTA

Shows how the color looks as an action color.

### Badge / label / sponsor chip

Shows small-surface usage.

### Text on color

Shows whether readability is acceptable.

### Supporting neutral area

Shows balance against the rest of the UI.

## Preview Goals

The preview should help answer:

- does this look like a club brand color?
- does it feel strong enough?
- is text readable on top of it?
- does it work as an accent inside Fixtura card designs?

---

# 8. Closing the Picker

When the user closes the picker:

- the latest valid selected color remains in the field
- the preview remains updated
- any validation or warning state remains visible
- any success confirmation remains visible if applicable

Do not rely on temporary disappearing notifications.

---

# Validation Rules

Validation should be simple, predictable, and visible.

## 1. Required Validation

If the field is required and empty:

- show a persistent inline error state
- do not show a toast
- the field border/input state should reflect error
- the feedback message should remain visible until resolved

## 2. HEX Format Validation

Accept:

- `#FFFFFF`
- `FFFFFF`

Normalize internally to:

- `#FFFFFF`

Reject:

- incomplete hex values
- invalid characters
- unsupported lengths unless deliberately supporting shorthand

Recommended for v1:

- only support 6-digit hex

This keeps the experience cleaner and avoids ambiguity.

## 3. Normalisation Rules

- trim spaces
- add `#` if missing
- uppercase output
- store canonical value as `#RRGGBB`

## 4. Contrast / Readability Validation

This feature should include **readability checks**.

At minimum, warn if the selected color creates poor contrast for white text in the preview.

Possible levels:

### Recommended mode

- allow the color
- show warning if readability is weak

### Strict mode

- block saving if contrast falls below defined threshold

For sandbox phase, recommended approach:

- allow color
- show persistent warning
- preview text updates to demonstrate the issue

This is less frustrating for testing and gives better UX insight.

## 5. Duplicate / No-Change State

If the selected color matches the current saved value:

- do not show “saved successfully”
- optionally show a neutral helper:
  - `No changes made`

---

# Error Handling

Errors must be displayed in persistent UI, not as disappearing notifications.

## Error Display Principles

Errors should be:

- inline
- persistent
- calm
- specific
- easy to recover from

## Error Types

### 1. Invalid HEX Error

Example:

- `Enter a valid 6-digit HEX color`

### 2. Empty Required Field Error

Example:

- `A brand color is required`

### 3. Readability Warning

Example:

- `This color may be difficult to read with light text`

### 4. Save Failure Error

If sandbox includes simulated save:

- `We could not save this color right now. Please try again.`

### 5. System State / Unexpected Error

If parsing or component state fails:

- show persistent danger-style message within the component region
- keep the UI usable where possible
- do not collapse the field silently

---

# Success Handling

Success should also be persistent and local to the component.

Do not use toast/sonner.

## Success Display Pattern

Use a visible inline success block under the field or in the card footer.

Example messages:

- `Brand color updated`
- `Color saved successfully`
- `Primary color applied to preview`

Success messages may be dismissed manually or replaced automatically on the next interaction.

They should not disappear immediately on a timer.

---

# Persistent Feedback Pattern

Build a reusable feedback block for this feature.

## Supported Variants

- `info`
- `success`
- `warning`
- `error`

## Behaviour

- shown directly under the field
- remains visible until:
  - the issue is resolved
  - the state changes
  - the user dismisses it if dismissal is allowed

## Styling Intent

This should feel more like a permanent card message or inline field state than a transient alert.

It should align with the design direction of:

- calm
- structured
- professional
- easy to scan

---

# Accessibility Requirements

The sandbox implementation should still follow good accessibility practice.

## Must support

- keyboard access to trigger and interact with picker
- visible focus states
- label association for input
- helper/error text association
- readable state messaging
- non-color-only error indication
- clear button labels for reset/choose actions

Do not rely on color alone to communicate:

- invalid
- warning
- success

---

# State Model

The component should distinguish between:

## 1. Current saved value

The last committed/saved brand color

## 2. Current editing value

The color being actively selected or typed

## 3. Validation state

Whether the current editing value is valid, invalid, or warning state

## 4. Feedback state

Inline status message currently displayed

This distinction matters for future production behaviour.

---

# Suggested Local State Shape

```ts
type BrandColorFieldState = {
  savedValue: string;
  draftValue: string;
  isPickerOpen: boolean;
  isValid: boolean;
  validationMessage?: string;
  validationType?: "info" | "success" | "warning" | "error";
  hasChanges: boolean;
};
```

---

# Preset Swatches Strategy

Preset swatches should help non-designers succeed quickly.

For sandbox testing, include:

- a balanced set of strong brand-like colors
- dark and light options
- warm and cool options
- a neutral/dark fallback

Avoid overwhelming the user with too many choices.

Recommended:

- 8 to 12 presets

Example categories:

- navy
- royal blue
- red
- maroon
- green
- teal
- orange
- gold
- charcoal
- black

---

# Recent Colors Strategy

Recent colors should:

- capture the last few valid selections
- allow quick backtracking
- remain local to the component for sandbox phase
- optionally persist later in production

Recommended limit:

- 5 to 8 recent colors

Only valid normalized colors should be stored in recent colors.

---

# Save / Commit Behaviour for Sandbox

The interaction lab should simulate realistic save behaviour.

Recommended controls:

- `Apply`
- `Reset`
- optional `Save`
- optional `Cancel`

## Recommended sandbox approach

### Option A — instant apply with explicit save simulation

- changing the color updates preview live
- pressing `Save` commits it as saved value
- feedback region shows persistent success or failure

This is the best testable flow.

### Option B — immediate save on change

Less ideal for sandbox UX testing.

Recommended direction:

- use **Option A**

This allows clearer testing of:

- editing state
- invalid state
- dirty state
- success/error handling

---

# User Flow Summary

## Happy Path

1. user sees current brand color
2. user clicks swatch
3. user selects preset or custom color
4. hex field updates
5. preview updates live
6. validation confirms acceptable value
7. user clicks save/apply
8. persistent success message appears
9. new saved value becomes current state

## HEX Path

1. user pastes exact hex
2. value normalizes
3. preview updates
4. validation runs
5. user saves
6. success message appears

## Error Path

1. user types invalid hex
2. field shows invalid state
3. preview does not break
4. persistent inline error appears
5. save is blocked or disabled
6. error remains until corrected

## Warning Path

1. user chooses a low-readability color
2. preview updates
3. warning message appears
4. user may still save in recommended mode
5. saved state reflects chosen value

---

# Visual Design Expectations

The sandbox UI should feel consistent with the Fixtura direction:

- clean
- composed
- practical
- not overly decorative
- not playful
- not enterprise-boring
- not designer-tool heavy

## Field styling should feel:

- structured
- branded
- reusable
- production-level

## Preview card should feel:

- close to a real Fixtura asset surface
- visually helpful, not overly detailed
- compact and readable

---

# Feedback UI Without Toasts / Sonner

This feature must explicitly avoid temporary notification systems for key feedback.

## Instead use

### Inline persistent feedback under the field

For:

- validation messages
- save success
- save failure
- warnings

### Card-level status block

Optional for larger save/system messages.

### Static state styling

Use:

- border state
- label state
- helper text state
- icon + text combination

This creates a more stable and understandable experience for non-design users.

---

# Sandbox Testing Goals

The interaction lab implementation should let the team test:

- whether swatches-first works better than picker-first
- whether users understand the HEX input easily
- whether the preview is useful enough
- whether warnings are clear without being annoying
- whether persistent feedback is more effective than toasts
- whether the component API feels reusable
- whether this can become a shared account/settings control later

---

# Acceptance Criteria

## UX

- user can select color via swatch
- user can select color visually
- user can enter/paste hex
- selected color is always visible
- preview updates live
- feedback is persistent and local

## Validation

- invalid hex is blocked and clearly explained
- required state is handled
- normalization is consistent
- readability warning is supported

## UI

- no toast/sonner dependency
- success and error are displayed inline/persistently
- picker is easy for non-designers
- component feels reusable and production-ready

## Technical

- built in `/interaction-lab`
- uses `react-colorful`
- wrapped in reusable Fixtura component structure
- prop-driven enough for later extraction
- preview and feedback are separate reusable concerns where practical

---

# Recommended Build Order

## Phase 1 — UI shell

- create field layout
- swatch button
- hex input
- preview card
- feedback region

## Phase 2 — picker integration

- add `react-colorful`
- add hue/saturation controls
- sync to field state

## Phase 3 — swatches

- preset swatches
- recent swatches
- active state styling

## Phase 4 — validation

- required
- hex parsing/normalization
- invalid state
- readability warning

## Phase 5 — feedback states

- inline persistent success
- inline persistent error
- warning/info patterns
- no toast usage

## Phase 6 — save simulation

- dirty state
- save/apply flow
- reset flow
- simulated failure state for testing

## Phase 7 — cleanup for reuse

- prop cleanup
- reusable component extraction planning
- notes for migration into real settings/account flows

---

# Final Recommendation

Build the sandbox version as a **focused, reusable brand color selection field** with:

- swatch trigger
- exact HEX input
- popover picker using `react-colorful`
- preset + recent swatches
- live Fixtura asset preview
- persistent inline success/error/warning feedback
- no toast/sonner dependency

This should prove the complete user experience end-to-end before promoting the component into production settings flows.

The feature should feel like a stable Fixtura account control, not a temporary lab experiment.
