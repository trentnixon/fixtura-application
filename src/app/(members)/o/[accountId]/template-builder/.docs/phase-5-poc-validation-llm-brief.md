# Phase 5 LLM Brief: POC Validation

## Objective

Validate the template builder POC end to end after the read, edit, save, and refetch loop is working.

This phase is primarily smoke testing, regression checks, and sign-off. It should not introduce new product behavior unless a validation issue requires a small fix.

## Route Context

- App route: `/o/[accountId]/template-builder`
- Current editor: `template-builder-editor.tsx`
- Read BFF: `GET /api/accounts/:accountId/all-template-options`
- Save BFF: `PUT /api/accounts/:accountId/template-options`
- CMS save handoff: `../.comms/response/handoff-put-template-options.md`
- Phase 4 smoke checklist: `phase-4-integration-smoke-checklist.md`

## Scope

Validate:

- account with existing `templateOptionId`
- account without `templateOptionId`, if supported in the target environment
- public category selection only
- draft vs saved state
- required field validation
- optional relation clears
- `useBackground` enum saves
- save success refetch
- save error handling
- route access/redirect behavior

## Preconditions

- User is logged in.
- User owns the test `accountId`.
- CMS `getAllTemplateOptions` permission is enabled.
- CMS `putTemplateOptions` permission is enabled.
- Catalog data exists for:
  - public categories
  - modes
  - at least one optional relation group where possible
- Browser/network tools are available for checking requests.

## Test Accounts

Use at least:

- Account A: existing `templateOptionId`
- Account B: no `templateOptionId`, if such an account exists and create-on-save is supported

If Account B cannot be produced safely, document that the create path was not tested.

## Validation Checklist

### A. Initial Load

- Open `/o/{accountId}/template-builder`.
- Branding card loads.
- Full catalog dump loads.
- Category-list dump loads.
- Editor loads above raw dumps.
- Existing saved fields are preselected when available.
- Category select does not show private categories.
- If saved category was private, it is not available for re-saving until a public category is chosen.

### B. Draft State

- Change one field.
- Confirm `Dirty = Yes`.
- Confirm changed count increments.
- Confirm changed field appears in changed fields list.
- Confirm Save button enables.
- Reset to saved.
- Confirm field returns to saved value.
- Confirm `Dirty = No`.

### C. Required Fields

Attempt to save after unsetting each required field:

- Category
- Mode
- Use background

Expected:

- inline validation appears
- no PUT is sent
- draft state is preserved

### D. Optional Field Clears

For optional fields that have values:

- Palette
- Gradient
- Image
- Noise
- Particle
- Pattern
- Texture
- Video

Expected:

- choose `Unset`
- save
- PUT sends `null` for that field
- refetch shows relation cleared
- reload keeps cleared state

### E. `useBackground` Enum

Test available values:

- Solid
- Gradient
- Video
- Image
- Graphics
- Texture
- Particle

Expected:

- selected value saves as a string enum
- refetch shows the same value
- dirty state clears after save

### F. Save Success

- Change one or more fields.
- Click Save changes.
- Confirm button shows saving state.
- Confirm success message appears.
- Confirm `/account/me`, catalog, and branding queries refetch.
- Confirm dirty state returns to false.
- Reload page.
- Confirm saved settings persist.

### G. Save Errors

Validate at least one error path if safe:

- disable `putTemplateOptions` permission in test env, or use an invalid id through controlled dev tooling

Expected:

- inline error appears
- draft state is not discarded
- reset still works
- no gateway redirect unless route access itself is invalid

### H. Access / Redirect Regression

- invalid account segment redirects to select-org
- account not owned redirects or errors according to existing access boundary
- stale/wrong `templateOptionId` behavior remains unchanged

## Automated Checks

Run focused checks:

```powershell
npx vitest run 'src/app/(members)/o/[accountId]/template-builder/template-builder-editor.test.ts' 'src/app/(members)/o/[accountId]/template-builder/_utils/template-builder-editor-state.test.ts' 'src/app/(members)/o/[accountId]/template-builder/_utils/template-builder-option-labels.test.ts' 'src/app/(members)/o/[accountId]/template-builder/_utils/template-builder-select-value.test.ts' 'src/app/(members)/o/[accountId]/template-builder/_utils/template-builder-save-payload.test.ts' 'src/app/api/accounts/[accountId]/template-options/validate-put-template-options-body.test.ts'
```

Run focused lint on template-builder and template-options files.

Full `npm run typecheck` currently has known unrelated season failures; record whether template-builder introduces any new errors.

## Sign-Off Output

Create or update:

- `phase-5-poc-validation-results.md`

Include:

- date
- environment
- account ids tested
- tester
- checklist results
- failures found
- fixes made
- remaining blockers
- App/CMS/Product sign-off if available

## Guardrails

- Do not change CMS contract in this phase.
- Do not add fallback defaults for missing user settings.
- Do not show private categories in the category select.
- Do not remove raw dumps until validation is signed off.
- Keep fixes scoped to validation failures.

## Completion Criteria

Phase 5 is complete when:

- existing-account save path is verified
- create-on-save path is verified or explicitly marked not tested
- required field validation is verified
- optional clears are verified
- `useBackground` enum is verified
- save success/refetch/reload behavior is verified
- public-category-only behavior is verified
- results doc is complete
