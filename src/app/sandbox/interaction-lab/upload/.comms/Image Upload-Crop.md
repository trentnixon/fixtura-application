Absolutely — here’s a **PDR-style document** you can give to Cursor for the **Interaction Lab uploader/cropper sandbox** in the new Fixtura build.

---

# Fixtura Interaction Lab — Image Upload + Crop Sandbox PDR

## Document Purpose

This document defines the requirements, scope, structure, and implementation guidance for a new **Image Upload + Crop sandbox** inside the **`/interaction-lab`** area of the Fixtura members application.

The goal of this sandbox is to create a **pre-production testing environment** for image upload interaction patterns before the feature is integrated into production-facing forms and workflows.

This is not a temporary throwaway demo.
It should be built as a **real internal capability lab** that helps validate:

- UI and UX flow
- drag-and-drop behavior
- click-to-upload behavior
- crop interaction
- aspect-ratio enforcement
- reusable component design
- client-side cropped output generation
- readiness for later integration with Strapi/AWS upload flows

---

# Primary Goal

Create a reusable frontend upload-and-crop workflow using:

- **`react-dropzone`** for image selection
- **`react-easy-crop`** for image cropping

The sandbox should allow Fixtura to test the feature in isolation, validate multiple use cases, and prepare the component system for later production rollout.

---

# Core Outcome

The final result of this sandbox should be:

1. a working **interaction-lab route/page** for upload + crop testing
2. a reusable uploader component architecture
3. a reusable crop modal/workflow
4. support for configurable aspect ratios via props
5. generation of a final cropped image file/blob on the client
6. a clean separation between:
   - file selection
   - crop UI
   - crop processing
   - upload handoff

7. a structure that is safe to move into production later

---

# Route / Placement

This work belongs in:

- **`/interaction-lab`**

Recommended sub-section or page title:

- **Image Upload & Crop**
- or
- **Media Upload Lab**

This should sit alongside other interactive capability tests in the lab and clearly be marked as:

- internal
- sandbox/testing
- pre-production
- not connected to final production user workflows yet

---

# Why This Sandbox Exists

Fixtura needs image upload capability for multiple future use cases such as:

- club logos
- sponsor logos
- team photos
- player photos
- branded media assets
- cover images
- avatar/profile-style images
- square / portrait / landscape crops depending on context

Because upload + crop interactions can become messy once embedded directly into business forms, this needs to be validated first in a controlled lab route.

The interaction-lab version should help answer:

- does the UX feel clean and predictable?
- is the crop step intuitive?
- does drag-and-drop behave well?
- does click-upload work correctly?
- can we reuse one component for multiple ratio-based use cases?
- is the output file generation reliable?
- is the structure production-ready enough to later wire into Strapi upload flows?

---

# Scope

## In Scope

### Upload interaction

- click to upload
- drag and drop upload
- image preview handling
- basic validation for file type
- basic validation for file size
- loading / processing states

### Crop interaction

- crop selected image after upload
- enforce aspect ratio via props
- zoom / pan interaction
- crop confirmation
- cancel / reset flow
- preview cropped result after confirmation

### Reusability

- component should be prop-driven
- ratios should be configurable
- labels and helper copy should be configurable
- component should support multiple future use cases

### Sandbox visibility

- show current state
- show selected file details
- show crop settings
- show resulting cropped image preview
- show output metadata for debugging / testing

### Client-side output

- generate cropped blob/file in browser
- support passing cropped output to later upload logic
- do not depend on production storage for sandbox completion

---

## Out of Scope

For this first sandbox version, do **not** build:

- direct Strapi upload integration
- AWS upload implementation
- image library/media gallery selection
- multi-image upload
- advanced editing like rotation, filters, annotations
- server-side crop pipeline
- permanent persistence requirements
- production form integration
- permissions / role logic beyond existing lab access

Those can be added later once the interaction model is proven.

---

# Recommended Stack

## Required libraries

### `react-dropzone`

Use for:

- drag-and-drop file input
- click-to-select file input
- accepted file configuration
- validation handling

### `react-easy-crop`

Use for:

- crop UI
- crop box behavior
- zoom / pan
- aspect-ratio enforcement

---

# Functional Requirements

## 1. File selection

The sandbox must support:

- drag image into drop area
- click to open file picker
- accept supported image files only
- reject unsupported files with visible error state

Recommended accepted types:

- `image/png`
- `image/jpeg`
- `image/webp`

Optional later:

- `image/svg+xml` only if ever needed, but not recommended for crop workflows

---

## 2. File validation

The sandbox should validate:

- file type
- file size
- basic image readiness before entering crop state

Recommended initial max size:

- configurable via prop
- start with something practical like **5MB to 10MB**

Validation errors should be visible inside the sandbox UI.

---

## 3. Crop step

Once an image is selected:

- open crop UI
- show the selected image inside cropper
- allow zoom and panning
- lock crop to the supplied aspect ratio
- allow user to confirm crop
- allow user to cancel and reselect

This should feel like a real production flow, not a debug-only raw cropper dump.

---

## 4. Ratio configuration

The cropper must be reusable for different use cases.

The ratio should be passed in as a prop.

Examples:

- `1 / 1` for square
- `16 / 9` for landscape banners
- `4 / 5` for portrait
- `9 / 16` for vertical/social story
- `3 / 1` for header/banner style crops if needed later

The sandbox page should include multiple test examples so ratios can be verified visually.

---

## 5. Output generation

After crop confirmation:

- generate the cropped result on the client
- return a `Blob` or `File`
- generate a preview URL for the sandbox UI
- surface useful metadata

Recommended metadata to show in sandbox:

- file name
- mime type
- output size
- width / height if available
- selected aspect ratio
- crop area data if useful for debugging

---

## 6. Reset / retry flow

The sandbox must support:

- remove selected image
- re-upload a different image
- re-open crop flow
- reset current state cleanly

This is important for testing repeated interactions.

---

# UX Requirements

## General UX goals

The interaction should feel:

- clean
- deliberate
- stable
- production-oriented
- minimal but polished

The lab is still a sandbox, but it should reflect the real Fixtura design direction.

## Upload zone

The drop area should clearly communicate:

- drag and drop supported
- click upload supported
- accepted file types
- optional size guidance

## Crop step

The crop experience should be presented in a focused UI, ideally:

- modal
- dialog
- or dedicated crop panel/card

Preferred direction:

- **modal/dialog workflow**

Why:

- isolates the crop interaction
- feels closer to production UX
- avoids clutter in the sandbox layout

## Result state

After confirming crop, show:

- final preview
- metadata/debug summary
- buttons for:
  - replace image
  - recrop
  - clear/reset

---

# Technical Design

## Suggested component structure

### `ImageUploaderCrop`

Main reusable orchestrator component.

Responsibilities:

- handles dropzone
- tracks selected file
- opens crop UI
- manages result state
- exposes final cropped output

Suggested props:

- `aspect`
- `label`
- `helperText`
- `accept`
- `maxSizeMb`
- `outputFormat`
- `outputQuality`
- `minWidth`
- `minHeight`
- `onComplete`
- `onError`
- `className`

---

### `ImageCropDialog`

Dedicated crop UI wrapper.

Responsibilities:

- renders cropper
- manages crop position / zoom state
- confirms or cancels crop
- hands crop data back to parent

Suggested props:

- `open`
- `imageSrc`
- `aspect`
- `onCancel`
- `onConfirm`

---

### `getCroppedImage` utility

A client-side helper utility.

Responsibilities:

- receive original image source + crop coordinates
- render to canvas
- export cropped blob/file
- return preview URL or file object

This should live in a utility file and stay independent from the UI.

---

# Suggested State Model

The flow should be structured roughly as:

- `idle`
- `file-selected`
- `cropping`
- `cropped`
- `error`

Suggested state responsibilities:

### Idle

No file yet. Show dropzone.

### File selected

Valid file chosen. Prepare crop UI.

### Cropping

Crop dialog open. User adjusts crop.

### Cropped

Final output available. Show preview + metadata.

### Error

Validation or processing error shown.

This state flow should be explicit and easy to reason about.

---

# Sandbox Page Requirements

The interaction-lab page should not just render one uploader and stop.
It should demonstrate the component across multiple likely Fixtura use cases.

## Recommended sandbox sections

### 1. Standard square upload

Use case:

- logo
- avatar
- sponsor mark

Aspect:

- `1:1`

### 2. Landscape upload

Use case:

- cover image
- hero/banner asset

Aspect:

- `16:9`

### 3. Portrait upload

Use case:

- player image
- social vertical art

Aspect:

- `4:5` or `9:16`

### 4. Debug / output panel

For each example or in a shared section, show:

- selected file name
- output type
- output size
- crop result preview
- state transitions if useful

This helps validate logic before integration elsewhere.

---

# Design / Presentation Notes

This is part of the new Fixtura build, so keep the UI aligned with the broader system:

- use the app’s existing design language
- use existing card/container patterns where possible
- use ShadCN-compatible primitives where appropriate
- avoid “developer tool” styling that feels raw or temporary
- make the page useful for real internal review

The lab can expose technical detail, but it should still look intentional.

---

# Production Readiness Expectation

Although this is in the sandbox, the code should be written as if it may graduate into production later.

That means:

- reusable component extraction
- clear prop API
- small focused utilities
- no deeply coupled one-off page logic
- no hardcoded ratios inside the component internals
- no unnecessary duplication across examples
- avoid “just for sandbox” hacks unless clearly isolated

The sandbox page is for testing.
The components should be written to survive beyond the sandbox.

---

# Integration Direction Later

This sandbox does **not** need to upload to Strapi yet.

However, the architecture should anticipate that next step.

Later integration path:

1. sandbox proves upload/crop UX
2. reusable component is stabilized
3. component is used in real forms
4. final cropped `File`/`Blob` is passed to Fixtura upload action
5. Strapi/AWS persistence happens outside the crop UI component

Important separation:

- **component handles interaction**
- **application layer handles upload/persistence**

Do not merge those concerns yet.

---

# Acceptance Criteria

The task is complete when:

- `/interaction-lab` contains a working image upload + crop sandbox
- click upload works
- drag and drop works
- unsupported file types are rejected visibly
- crop UI opens after valid image selection
- crop ratio can be configured by prop
- at least 3 aspect-ratio use cases are demonstrated
- cropped output is generated client-side
- cropped preview is shown
- reset / replace flow works
- code is structured into reusable components/utilities
- the result is clean enough to act as pre-production groundwork

---

# Implementation Notes for Cursor

## Build order

Recommended sequence:

1. install and wire `react-dropzone`
2. build basic upload zone
3. validate file selection
4. install and wire `react-easy-crop`
5. build crop dialog flow
6. add crop export utility using canvas
7. add result preview
8. add reusable prop-based API
9. add multiple sandbox examples
10. refine UI states and cleanup

---

## Important implementation principles

- keep upload selection and crop logic separate
- keep crop export utility outside the component
- prefer explicit state over hidden side effects
- avoid premature backend coupling
- make sandbox examples realistic and reusable
- build it in a way that can later move into shared components

---

# Deliverables

## Required deliverables

- interaction-lab page section for image upload + crop
- reusable upload/crop component
- reusable crop dialog component
- crop utility/helper
- example variants for multiple aspect ratios

## Optional nice-to-haves

- slider for zoom
- crop metadata display
- remove/retry button set
- helper copy per use case
- visual state badges for idle/cropping/cropped/error

---

# Final Direction

This feature should be treated as a **pre-production capability build**, not a throwaway experiment.

The interaction-lab version is where Fixtura proves the upload/crop experience, validates the reusable component design, and prepares the feature for future rollout into real account, branding, sponsor, and media workflows.

The end result should feel like:

- a proper internal product lab
- a realistic foundation for production
- a reusable image interaction system, not just a page demo

---

If you want, I can turn this into a **cleaner final `.md` file version** next, with tighter headings and less commentary so it’s ready to paste straight into Cursor.
