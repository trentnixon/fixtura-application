# Logo Uploader Lab Update Requirements

## Purpose

This document captures the next focused improvements for the Route Lab logo uploader screen:

```txt
/sandbox/route-lab/app/logo-uploader
```

The goal is not to turn this into a full production implementation yet. The goal is to make the lab better at validating the product experience users will eventually have when adding, replacing, cropping, and reviewing an organisation logo.

## Scope

These requirements cover five selected updates:

- Reduce heavy lab/internal copy in the production-like screen.
- Strengthen the empty-state flow for accounts with no logo.
- Add minimum dimension validation scenarios.
- Include a recrop-existing-logo state once an existing media source is available.
- Add a compact payload preview panel near the save action.

Out of scope for this update:

- Real CMS/API persistence.
- Full branding colour editing.
- Template mode editing.
- Media library integration.
- Dashboard/sidebar logo propagation.

## 1. Refine Production-Like Copy

### Problem

The current lab is honest about persistence being stubbed, which is useful, but some of that implementation detail appears inside the main production-like UI. This makes the screen feel more like a developer note than the future user experience.

### Requirement

Keep the main workspace copy focused on user intent:

- Upload a logo.
- Crop or replace it.
- Preview how it appears in generated assets.
- Save the pending logo.

Move lab/internal caveats into lab-specific surfaces:

- Route Lab page description.
- Scenario summary.
- Save confirmation dialog.
- Optional compact payload/debug panel.

### Acceptance Criteria

- The main card does not mention CMS, API, PATCH, or persistence failure in normal helper text.
- The save dialog may still state that no real upload or PATCH runs in Route Lab.
- The Route Lab wrapper may still document that saves are stubbed.
- User-facing copy should read as if it could mostly survive into production.

## 2. Stronger Empty-State Flow

### Problem

The `empty` state currently removes the saved logo, but the screen does not give the no-logo case enough product shape. It mostly becomes the default screen with "None" where the saved logo would be.

### Requirement

When `state=empty`, the lab should clearly model a first-time logo setup flow:

- Show an empty visual placeholder where the saved logo preview would normally appear.
- Use copy that frames the next action positively, e.g. "No logo added yet."
- Keep exactly one uploader.
- Make the asset preview show the generated asset without a logo, so the value of adding one is obvious.
- After crop completion, immediately transition the local UI into a pending-logo state.

### Acceptance Criteria

- `state=empty&mode=view` communicates that no logo exists and does not show edit controls.
- `state=empty&mode=edit` gives a clear first action to add a logo.
- The asset preview renders successfully with no `logoSrc`.
- After upload/crop, the pending logo appears both in the pending logo area and in the asset preview.
- The save button remains disabled until there is a pending logo change.

## 3. Minimum Dimension Validation Scenarios

### Problem

The uploader supports validation props, but the lab does not currently model minimum source or output requirements for logo quality. Production will need to protect generated assets from tiny or blurry uploads.

### Requirement

Add lab scenarios that exercise minimum logo dimensions. The first production-minded baseline should be:

- Minimum source dimensions: `500x500px`.
- Minimum cropped output dimensions: `400x400px`.

The lab should make this visible in a way users can understand without overloading the core screen.

Suggested approach:

- Add one or more Route Lab `state` values for validation exploration, such as `validation` or `small-image`.
- Enable `showValidationHints` on `ImageUploaderCrop` for those scenarios.
- Pass `minSourceWidth`, `minSourceHeight`, `minOutputWidth`, and `minOutputHeight` to the uploader in those scenarios.
- Keep the default scenario simple if the validation hints make the standard screen too busy.

### Acceptance Criteria

- There is a Route Lab scenario where minimum source and output dimensions are active.
- Small images are rejected before cropping when source dimensions are too small.
- Crops that produce too-small output are rejected with a clear error.
- The user can see the active validation limits in the relevant scenario.
- The validation scenario does not require real API persistence.

## 4. Recrop Existing Logo State

### Problem

The current crop component can recrop a newly selected local file because it still has the source file in memory. It cannot truly recrop an existing saved logo unless the app has access to a suitable existing media source.

### Requirement

Add a lab state that models the future "recrop existing logo" behavior once production can provide an existing editable media source.

This should not pretend the current fixture logo is automatically recroppable if the original source is unavailable. The lab should distinguish between:

- A saved display logo URL.
- An editable source image URL or media id that can be loaded into the cropper.

Suggested state:

```txt
state=recrop
```

In this state, the UI should show an existing logo and provide a recrop path only if the fixture includes an editable source reference.

### Acceptance Criteria

- `state=recrop` clearly shows an existing logo.
- The UI exposes a "Recrop" action only when the lab fixture includes an editable source.
- If the editable source is unavailable, the UI should explain that the user can replace the logo instead.
- Recropping should create a pending logo change and update the asset preview immediately.
- The save summary should identify the change as a recrop/replacement rather than a brand-new first upload where possible.

## 5. Compact Payload Preview Panel

### Problem

The save dialog contains useful metadata, but it is hidden until the user clicks save. For a lab, it is valuable to see the pending payload at a glance while interacting with the uploader.

### Requirement

Add a compact payload preview near the save action. This should summarize the current pending change without requiring the confirmation dialog.

Suggested placement:

- Inside the upload card footer above or beside the save button.
- Or as a small panel in the right column under the asset preview.

Suggested contents when a cropped file exists:

- File name.
- MIME type.
- File size.
- Output dimensions.
- Crop aspect label.
- Change type: first upload, replacement, recrop, or seeded lab preview.

Suggested contents when no pending file exists:

- A quiet empty state such as "No pending logo changes."

### Acceptance Criteria

- The payload preview updates immediately after crop completion.
- The payload preview resets when the pending image is cleared.
- The save dialog can remain as the final confirmation, but should no longer be the only place to inspect metadata.
- The panel stays compact and does not dominate the production-like screen.
- The panel does not imply that a real upload has occurred in Route Lab.

## Suggested Implementation Notes

- Keep all new behavior local to the Route Lab screen unless a shared component change is clearly required.
- Prefer expanding the logo uploader fixture file for new states rather than embedding all fixture differences in the page.
- Keep the production-like UI user-first; keep lab caveats in Route Lab surfaces and debug/payload surfaces.
- If `state` options grow, keep the list understandable and avoid overlapping scenarios.
- Add targeted lint/type verification for the route files after implementation.

## Open Questions

- Should the minimum dimension baseline be enforced in the default lab state, or only in a dedicated validation scenario first?
- What existing-logo source will production expose for recropping: original media URL, current logo URL, or media id resolved through a media endpoint?
- Should "remove logo" be added in the same pass as stronger empty-state work, or handled separately as a destructive/account-impacting action?
