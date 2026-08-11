Absolutely — here is a **new PDR** written as a fresh follow-on document, focused only on the added requirements for **dual brand color selection**, Fixtura asset preview, validation, and the lab save behaviour.

````md
# Fixtura Interaction Lab — Dual Brand Color Selector PDR

## Purpose

This document defines the next stage of the Fixtura brand color selector feature for the `/interaction-lab` sandbox.

This phase extends the single-color concept into a **dual brand color selection experience**, where the user must select:

- a **primary brand color**
- a **secondary brand color**

These colors will be used together in Fixtura assets and paired against fixed text colors for light and dark content treatment.

The purpose of this lab build is to test the full interaction for selecting, validating, previewing, and outputting the final brand color object before integrating it into production account/settings flows.

This is a sandbox-first, production-minded interaction build.

---

# Feature Goal

The user must be able to select two distinct brand colors:

- `primary`
- `secondary`

These values will ultimately produce a final object shaped like:

```json
{
  "primary": "#79001F",
  "secondary": "#FDBC2C",
  "dark": "#111",
  "white": "#FFF"
}
```
````

The lab version should support:

- selecting both colors visually
- entering exact HEX codes
- validating each value
- validating the relationship between the two values
- showing both colors together in a Fixtura-style asset preview
- simulating save by displaying the final object inside a dialog on click

---

# Core UX Intent

This should remain easy for non-designers.

The experience should feel like:

- select first color
- select second color
- see both together
- understand if anything is wrong
- click save
- see the final output object

This should not feel like an advanced design tool.

---

# Route

`/interaction-lab`

Create or extend a dedicated brand color section for this dual-color flow.

---

# Primary User Story

As a Fixtura user,
I want to choose my primary and secondary brand colors,
so my assets can be styled correctly using my club or organisation branding.

---

# Output Shape

The sandbox save action should generate and display the final object in this structure:

```json
{
  "primary": "#79001F",
  "secondary": "#FDBC2C",
  "dark": "#111",
  "white": "#FFF"
}
```

## Notes

- `primary` and `secondary` are user-selected
- `dark` is fixed as `#111`
- `white` is fixed as `#FFF`

The lab should treat `dark` and `white` as constants, not editable inputs.

---

# Scope

## In Scope

- primary color selection
- secondary color selection
- visual swatches
- hex input
- validation for each color
- validation between both colors
- asset preview card
- save button
- dialog output of final object
- persistent inline feedback

## Out of Scope

- CMS integration
- actual backend save
- logo upload or palette extraction
- gradient editing controls
- multiple preview templates
- accessibility scoring beyond basic readable checks
- dynamic text color generation
- user-editable dark/white constants

---

# UX Structure

The interface should be split into two major areas:

## Left side

Color selection controls

## Right side

Fixtura asset preview

This should feel balanced and easy to scan.

---

# Layout Recommendation

## Left Column

Stacked form controls for:

- Primary Brand Color
- Secondary Brand Color
- validation/help feedback
- save action

## Right Column

A fixed preview panel showing:

- a 4:5 Fixtura-style asset card
- a gradient using the primary and secondary colors
- simple sample text over the preview using white and/or dark text treatment

---

# Form Structure

## 1. Primary Brand Color Field

Should include:

- label
- swatch trigger
- hex input
- optional preset swatches
- optional recent colors
- inline validation area

## 2. Secondary Brand Color Field

Should include:

- label
- swatch trigger
- hex input
- optional preset swatches
- optional recent colors
- inline validation area

## 3. Shared Feedback Region

Should support persistent validation or warning messaging relating to:

- both colors together
- save readiness
- duplicate colors
- preview suitability

## 4. Save Action

A clear action button such as:

- `Show Brand Object`
- `Preview Save Object`
- `Save Test Object`

Recommended:

- `Show Brand Object`

---

# Preview Requirements

The preview is **not UI preview**.

It is a **Fixtura asset preview**.

The preview should be a simple, stylised placeholder asset card in **4:5 ratio**.

## Preview Card Rules

- fixed 4:5 aspect ratio
- use a gradient composed from `primary` and `secondary`
- show simple sample content only
- should sit to the right of the selectors
- should update live as the colors change

## Suggested Preview Content

The exact design can remain simple, but should include enough to communicate the brand pairing.

For example:

- top label such as `WEEKEND RESULTS`
- secondary line such as `Round 6`
- one or two content blocks
- optional footer strip
- sample use of white text
- sample use of dark text in a smaller element if useful

The goal is not realism at template level.
The goal is to show whether the two chosen colors work together visually in a Fixtura asset context.

---

# Gradient Rules

The preview should use both selected colors in a visible way.

## Recommended

Use a linear gradient composed from:

- primary
- secondary

This should be obvious and stable.

Example intent:

- diagonal gradient
- soft but clearly visible mix of both colors

Do not add extra decorative effects in this phase.

---

# Core Validation Requirements

Validation must apply to:

- each individual color
- both colors together

---

# Individual Color Validation

Each field must validate:

## 1. Required

The field cannot be empty.

## 2. Valid HEX format

Accept:

- `#79001F`
- `79001F`

Normalise to:

- `#79001F`

## 3. Canonical formatting

Store/output as:

- uppercase
- 6-digit HEX
- leading `#`

## 4. Invalid format handling

If invalid:

- show persistent inline field error
- do not allow save
- do not break preview rendering

Recommended error text:

- `Enter a valid 6-digit HEX color`

---

# Cross-Field Validation

The two colors must also be validated together.

## 1. Colors cannot be identical

If primary and secondary are the same after normalization:

- show persistent error
- prevent save
- make the message clear and local to the form

Recommended message:

- `Primary and secondary colors must be different`

## 2. Colors should not be too visually similar

This should be considered as a **warning**, not an error, for sandbox phase.

Example:

- very close shades of the same tone
- differences so minor they reduce contrast in the asset preview

Recommended behaviour:

- allow save
- show warning message

Suggested warning text:

- `These colors are very similar and may not create enough distinction in assets`

This does not need to be overly technical in the lab build.
A simple approximation is acceptable.

## 3. Very low contrast against text treatment

Because the asset may use white and dark text treatments, warn if the selected colors create likely readability problems.

Recommended sandbox behaviour:

- warnings only
- do not block save unless the field values themselves are invalid

Possible warning cases:

- both colors are extremely light
- both colors are extremely dark
- one of the text treatments becomes hard to read in preview

---

# Save Eligibility Rules

The save/test action should only be available when:

- primary is valid
- secondary is valid
- primary and secondary are not identical

Warnings should not block save.

Errors should block save.

---

# Error Handling

Errors must be shown inline and persistently.

Do not use:

- toast
- sonner
- temporary disappearing notifications

## Field-Level Errors

Examples:

- `Primary color is required`
- `Secondary color is required`
- `Enter a valid 6-digit HEX color`

## Form-Level Errors

Examples:

- `Primary and secondary colors must be different`

## Warning Messages

Examples:

- `These colors are very similar and may not create enough separation`
- `White text may be difficult to read on parts of this gradient`
- `Dark text may be difficult to read on parts of this gradient`

---

# Success Behaviour

For the lab build, success is represented by the dialog output.

A separate persistent success message is optional, but not required if the dialog interaction clearly shows success.

---

# Save Interaction for Lab

This is not a real save.

For lab testing, on click of the save action:

- validate the inputs
- if valid, open a dialog
- display the final object
- allow the user to inspect the exact output values

## Dialog Purpose

The dialog confirms:

- what would be sent to CMS
- that normalization is working
- that the final payload is structurally correct

## Dialog Content

Display the object clearly, for example in a code-style block:

```json
{
  "primary": "#79001F",
  "secondary": "#FDBC2C",
  "dark": "#111",
  "white": "#FFF"
}
```

## Dialog Actions

Recommended:

- `Close`

Optional:

- `Copy JSON`

If copy is added, it should remain secondary.

---

# State Model

The component/system should distinguish between:

## Saved/Test Output State

The final valid object prepared for save preview

## Draft Primary Value

Current editing value for primary

## Draft Secondary Value

Current editing value for secondary

## Field Validation State

Validity of each field individually

## Cross Validation State

Validity/warnings for the pair together

## Dialog State

Whether the output dialog is open

---

# Suggested State Shape

```ts
type DualBrandColorState = {
  primary: string;
  secondary: string;
  white: "#FFF";
  dark: "#111";
  primaryValid: boolean;
  secondaryValid: boolean;
  canSave: boolean;
  fieldErrors: {
    primary?: string;
    secondary?: string;
  };
  formError?: string;
  formWarning?: string;
  isDialogOpen: boolean;
};
```

---

# Recommended Component Structure

## 1. `DualBrandColorSelector`

Main wrapper for the full lab experience.

Responsibilities:

- owns state
- coordinates both fields
- runs validation
- controls preview
- controls save dialog

## 2. `BrandColorField`

Reusable single color field used twice:

- once for primary
- once for secondary

## 3. `FixturaAssetColorPreview`

Right-side preview component.

Responsibilities:

- 4:5 card
- gradient rendering
- text overlay samples
- live updates based on selected colors

## 4. `BrandColorObjectDialog`

Dialog shown on save/test.

Responsibilities:

- render final object
- show normalized values
- allow close
- optional copy support

## 5. `PersistentFieldFeedback`

Reusable inline message component for:

- info
- warning
- error

---

# Behaviour Details

# 1. Initial Load

On first load:

- primary and secondary may be prefilled with demo values
- preview renders immediately
- no error shown unless defaults are invalid
- save action is available only if defaults pass validation

---

# 2. Editing Primary

When primary changes:

- normalize input
- validate format
- re-run pair validation
- update preview live
- update save eligibility

---

# 3. Editing Secondary

When secondary changes:

- normalize input
- validate format
- re-run pair validation
- update preview live
- update save eligibility

---

# 4. Duplicate Detection

When both fields match after normalization:

- show a form-level persistent error
- disable save/test action
- keep preview visible

The user should immediately understand the issue.

---

# 5. Similarity Warning

If colors are close:

- show a warning
- keep save enabled
- keep preview live

This is advisory only in the lab phase.

---

# 6. Save Click

When save/test button is clicked:

## If invalid

- keep dialog closed
- surface errors clearly

## If valid

- open dialog
- show normalized final object

---

# Text Constants

These values are fixed and should not be editable in this lab phase:

```json
{
  "dark": "#111",
  "white": "#FFF"
}
```

These should always be included in the final previewed output object.

---

# Recommended Validation Additions

In addition to "not the same", the following checks are recommended:

## Strongly Recommended

- required
- valid 6-digit hex
- normalization
- primary !== secondary

## Recommended Warning-Level Checks

- colors are extremely similar
- both colors are too light
- both colors are too dark
- white text visibility likely weak
- dark text visibility likely weak

These warnings help guide better selections without overcomplicating the UX.

---

# Acceptance Criteria

## UX

- user can choose both primary and secondary colors
- both fields support swatch + hex input
- preview updates live using both colors
- preview sits to the right of the selectors
- save action opens a dialog with the final object

## Validation

- both colors are required
- both colors must be valid hex
- both colors must not be identical
- warnings may appear for similarity/readability
- invalid form cannot open dialog

## Preview

- 4:5 card is used
- gradient uses primary and secondary
- preview clearly reflects both selected colors
- preview updates in real time

## Output

- dialog shows normalized object
- output includes:
  - primary
  - secondary
  - dark
  - white

## Feedback

- no toast/sonner
- errors are persistent and inline
- warnings are persistent and inline
- success is represented by dialog output

---

# Recommended Build Order

## Phase 1

Create dual field layout and right-side preview shell

## Phase 2

Hook up both color pickers and hex inputs

## Phase 3

Add live gradient preview card

## Phase 4

Add field validation and duplicate-color validation

## Phase 5

Add warning-level similarity/readability checks

## Phase 6

Add dialog output for final object

## Phase 7

Polish layout, feedback states, and reusable props

---

# Final Recommendation

Build this as a focused dual-color selector for Fixtura branding with:

- primary and secondary color fields
- live hex normalization
- duplicate prevention
- warning-level similarity/readability checks
- 4:5 Fixtura asset gradient preview
- dialog-based lab save output showing the exact CMS object
