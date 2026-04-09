Absolutely — here’s a **new PDR extension** focused on **image validation rules** for the upload/crop sandbox you just put in place.

This is written as a follow-on spec to extend the current uploader/cropper work, not replace it.

---

# Fixtura Interaction Lab — Image Validation Extension PDR

## Document Purpose

This document defines the next extension to the existing **Image Upload + Crop sandbox** in the Fixtura **`/interaction-lab`** area.

The goal of this phase is to add **image validation controls** so the uploader can more accurately test and enforce image suitability before a file enters the crop workflow.

This work should extend the current sandbox and reusable component system by introducing validation for:

- file size
- image dimensions
- minimum width
- minimum height
- maximum width
- maximum height
- optionally output dimension constraints after crop

The purpose is to ensure Fixtura can test realistic image rules now, before this capability is reused in production-facing forms.

---

# Primary Goal

Extend the current reusable upload/crop workflow so it can validate both:

1. **raw uploaded image constraints**
2. **cropped output constraints** where needed

The validation system should be configurable via props so the same uploader component can support different rules for different use cases.

---

# Why This Extension Exists

The current upload/crop sandbox proves the interaction model.

The next requirement is to prove that the uploader can also enforce practical image standards such as:

- rejecting images that are too small
- rejecting images that are too large
- preventing low-quality uploads from entering the crop flow
- helping define standards for logos, cover images, sponsor assets, player images, and other future media

Without this validation layer, the interaction works, but the component is not yet robust enough for real production use.

---

# Core Outcome

The final outcome of this extension should be:

1. validation rules added to the reusable uploader component
2. image dimension checks before crop begins
3. file size checks before crop begins
4. clear user-facing validation messages
5. optional cropped-output validation where required
6. sandbox examples demonstrating different validation rule sets
7. production-friendly architecture that remains reusable and prop-driven

---

# Scope

## In Scope

### File-level validation

- max file size
- optional min file size if needed
- accepted mime types
- image readable/decodable check

### Raw image dimension validation

- minimum width
- minimum height
- maximum width
- maximum height

### Crop/output validation

- optional output minimum width
- optional output minimum height
- optional output maximum width
- optional output maximum height

### UX handling

- clear validation errors
- prevent invalid files from entering crop flow
- allow user to retry with a different image
- show rule requirements in helper copy where useful

### Sandbox testing

- demonstrate multiple rule sets
- make it easy to test valid vs invalid uploads
- show metadata/debug output for dimensions and file size

---

## Out of Scope

For this phase, do **not** add:

- server-side validation
- Strapi-side upload validation
- image moderation/content checks
- EXIF/orientation correction pipeline unless already required
- format conversion policy beyond current crop/export flow
- advanced quality analysis such as blur detection or DPI enforcement
- multi-file validation workflows

Those can be handled later if needed.

---

# Validation Strategy

The validation system should be split into two distinct stages.

## Stage 1 — Pre-crop validation

Run immediately after file selection and before crop UI opens.

This should validate:

- file type
- file size
- raw image width
- raw image height

If these checks fail:

- do not open crop UI
- show a clear error message
- allow retry/reset

## Stage 2 — Post-crop validation

Run after the crop is confirmed and the final cropped output is generated.

This should validate only if required by props.

This is useful when:

- a final output must meet a minimum usable size
- a crop could reduce the image below acceptable resolution
- specific production use cases need fixed output standards

If these checks fail:

- do not finalize the cropped result
- show a clear validation error
- keep the user in the crop flow or allow retry

---

# Recommended Validation Rules

## 1. File type validation

Continue supporting:

- `image/png`
- `image/jpeg`
- `image/webp`

Optional future support:

- `image/avif` if needed later

Do not allow unsupported formats into crop processing.

---

## 2. File size validation

Add configurable file size validation.

Suggested prop:

- `maxFileSizeMb`

Optional:

- `minFileSizeKb`

Recommended first-pass defaults:

- common images: **5MB**
- richer media use cases: **10MB**

This should be configurable per use case, not hardcoded globally.

---

## 3. Raw image dimension validation

Add support for checking source image dimensions before crop.

Suggested props:

- `minWidth`
- `minHeight`
- `maxWidth`
- `maxHeight`

These checks should be based on the original uploaded image dimensions.

Examples:

- reject a logo that is too small to crop cleanly
- reject an image that is excessively large if you want to keep client-side processing reasonable
- ensure banners and portraits start with enough source resolution

---

## 4. Cropped output validation

Add optional output checks after crop.

Suggested props:

- `minOutputWidth`
- `minOutputHeight`
- `maxOutputWidth`
- `maxOutputHeight`

These checks should validate the final generated cropped image.

This is especially useful where:

- the crop ratio is valid
- but the resulting usable image is still too small

---

# Functional Requirements

## 1. File inspection before crop

After a file is chosen through click or drag/drop:

- inspect mime type
- inspect file size
- load image in memory
- inspect natural width and height
- evaluate configured validation rules
- only proceed to crop if valid

This inspection should happen automatically and feel fast.

---

## 2. Dimension reading

The component must be able to read source image dimensions before crop begins.

The preferred approach is:

- create an object URL from the selected file
- load the image
- read natural width and natural height
- dispose of temporary URLs when no longer needed

This logic should live in a utility/helper, not inline in page-level code.

---

## 3. Validation result structure

Validation should not be handled as ad hoc booleans scattered through the component.

Use a structured result model such as:

- valid
- errors[]
- metadata

Example metadata:

- width
- height
- fileSize
- mimeType
- fileName

This makes debugging and future reuse easier.

---

## 4. Error handling

When validation fails:

- crop dialog should not open for pre-crop failures
- a clear error message should be shown in the uploader UI
- the user should be able to remove/reset and try again
- the component should not become stuck in an invalid state

Errors should be readable and user-facing, not raw dev messages.

Examples:

- “Image must be at least 1200px wide.”
- “Image exceeds the maximum file size of 5MB.”
- “Image must be at least 800 × 800 pixels.”
- “Cropped result is too small. Adjust the crop or use a larger image.”

---

## 5. Validation helper copy

Where useful, the uploader should optionally display requirement hints before upload.

Examples:

- “PNG, JPG or WebP up to 5MB”
- “Minimum size: 1200 × 675”
- “Recommended ratio: 16:9”

This should be driven by props/config rather than hardcoded text.

---

# UX Requirements

## General UX goals

Validation should feel:

- immediate
- clear
- helpful
- non-technical
- production-oriented

Avoid vague errors like:

- invalid image
- upload failed
- unsupported file

Prefer actionable messages that explain exactly what rule failed.

---

## Validation placement

Validation feedback should appear:

- near the uploader
- in the crop dialog if output validation fails
- in the sandbox debug area if needed for internal review

Errors should not rely only on toast notifications.

A persistent inline message is preferred.

---

## Retry flow

After a failed validation:

- user can try another file immediately
- old invalid state can be cleared
- uploader returns to a clean ready state

After a failed post-crop validation:

- user can adjust crop again
- or abandon and choose another source image

---

# Technical Design

## Existing component extension

Extend the existing `ImageUploaderCrop` component.

### New suggested props

- `maxFileSizeMb`
- `minFileSizeKb`
- `minWidth`
- `minHeight`
- `maxWidth`
- `maxHeight`
- `minOutputWidth`
- `minOutputHeight`
- `maxOutputWidth`
- `maxOutputHeight`
- `validationMode`
- `validationMessages`
- `showValidationHints`

These should all be optional and prop-driven.

---

## Utility additions

### `validateImageFile`

New utility for pre-crop checks.

Responsibilities:

- validate file type
- validate file size
- read raw image dimensions
- return structured validation result

### `validateCroppedImage`

New utility for post-crop output checks.

Responsibilities:

- inspect final cropped file/blob
- validate output width/height if configured
- return structured validation result

### `getImageDimensions`

Small helper utility.

Responsibilities:

- load image from file or blob
- read width/height
- return dimension metadata

These should be isolated from UI components.

---

# Suggested Validation Model

Use a validation object structure similar to:

- `isValid`
- `errors`
- `warnings`
- `metadata`

### `errors`

Blocking issues that prevent the next step.

### `warnings`

Non-blocking signals for sandbox review or future UX refinement.

Examples:

- “Image is valid but much larger than recommended.”
- “This file may be slow to process on lower-powered devices.”

Warnings are optional for this phase, but the model should allow for them later.

---

# Sandbox Page Extension Requirements

The interaction-lab page should now demonstrate validation rule sets across multiple scenarios.

## Recommended examples

### 1. Square logo upload

Use case:

- sponsor mark
- club logo
- avatar

Aspect:

- `1:1`

Example rules:

- min width: 500
- min height: 500
- max file size: 3MB

---

### 2. Landscape cover upload

Use case:

- banner
- hero image
- media cover

Aspect:

- `16:9`

Example rules:

- min width: 1200
- min height: 675
- max file size: 5MB

---

### 3. Portrait image upload

Use case:

- player image
- profile art
- social crop

Aspect:

- `4:5`

Example rules:

- min width: 800
- min height: 1000
- max file size: 5MB

---

### 4. Validation stress test section

Optional but useful:

- one sandbox section that intentionally surfaces all configured validation rules
- ideal for testing small, oversized, or badly shaped images during development

---

# Debug / Internal Review Output

The sandbox should show useful internal detail after file inspection.

Recommended debug information:

- original filename
- mime type
- original file size
- original width
- original height
- active validation rules
- validation pass/fail state
- cropped output width/height
- cropped output size

This should help Fixtura confirm the logic is working before the feature is used elsewhere.

---

# State Model Extension

Extend the existing state flow to include validation-aware handling.

Suggested state concepts:

- `idle`
- `validating`
- `validation-error`
- `ready-to-crop`
- `cropping`
- `cropped`
- `output-error`

### `validating`

Temporary inspection state while image dimensions are read.

### `validation-error`

Pre-crop blocking error.

### `output-error`

Post-crop blocking error.

This should make the flow clearer and reduce hidden edge cases.

---

# Acceptance Criteria

This task is complete when:

- uploader validates file size before crop
- uploader validates source image width/height before crop
- invalid files do not enter crop flow
- validation messages are visible and understandable
- optional post-crop validation is supported
- reusable component accepts validation props
- sandbox demonstrates at least 3 rule-driven use cases
- reset/retry flow still works cleanly
- metadata/debug output helps confirm behavior
- architecture remains reusable and production-friendly

---

# Implementation Notes for Cursor

## Build order

Recommended sequence:

1. add image dimension helper utility
2. add structured pre-crop validation utility
3. extend uploader props for validation rules
4. wire validation before crop dialog opens
5. surface inline error states
6. add optional post-crop validation
7. extend sandbox examples with rule sets
8. refine debug output and UX copy

---

## Important implementation principles

- keep validation logic outside JSX-heavy components
- do not hardcode use-case-specific rules into core component internals
- prefer structured validation responses over one-off checks
- preserve clean reset and retry flows
- make the validation model reusable for future production forms

---

# Deliverables

## Required deliverables

- extended uploader/crop component props for validation
- image dimension helper utility
- pre-crop validation utility
- optional post-crop validation utility
- updated interaction-lab examples demonstrating validation rules
- inline validation messaging

## Optional nice-to-haves

- warning states in addition to hard errors
- “requirements” summary UI generated from props
- debug card showing actual vs required dimensions
- configurable validation copy overrides

---

# Final Direction

This phase should turn the current upload/crop sandbox into a more realistic **pre-production media input system**.

The goal is no longer just to prove the interaction works.
The goal is to prove the interaction can be trusted.

By adding configurable validation for file size and image dimensions, Fixtura will have a reusable uploader component that is much closer to real production readiness and much safer to reuse across branding, sponsor, profile, and content workflows.

---
