# Template Builder

Route: `/o/[accountId]/template-builder`

Status: Pending review

## Customer Purpose

Let customers select or configure template options used for generated content.

## Features To Prove

- [ ] Loads full template option catalog.
- [ ] Shows current selection.
- [ ] Saves selected template option.
- [ ] Handles unavailable or unpublished options.
- [ ] Preview reflects the chosen option where supported.

## Related API Routes

- `GET /api/accounts/[accountId]/all-template-options`
- `PUT /api/accounts/[accountId]/template-options`
- `GET /api/account/template-categories/list-for-selection`
- `GET /api/template-gradients/ui`
- `GET /api/template-images/ui`
- `GET /api/template-modes/ui`
- `GET /api/template-noises/ui`
- `GET /api/template-palettes/ui`
- `GET /api/template-particles/ui`
- `GET /api/template-patterns/ui`
- `GET /api/template-textures/ui`
- `GET /api/template-videos/ui`

## Tests Required

- Unit: option filtering/selection and save payload.
- Component: catalog loading, empty state, selection, save success/failure.
- API: published/private visibility and account ownership.
- Browser/manual: select template option and confirm persistence.

## Production Sign-off

- Owner:
- Known gaps:
- Test evidence:
- Production decision: Pending
