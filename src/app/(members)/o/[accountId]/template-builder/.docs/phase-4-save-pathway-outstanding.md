# Phase 4 Outstanding Items

## Status

Phase 4 app code is implemented and locally verified.

Remaining items are environment / sign-off tasks, not local code blockers.

## Outstanding

- Enable the CMS permission for the save endpoint:
  - Strapi Admin -> Users & Permissions -> Authenticated -> Template-option -> `putTemplateOptions`
- Run the live integration smoke checklist:
  - `phase-4-integration-smoke-checklist.md`
- Confirm save behavior for:
  - account with an existing `templateOptionId`
  - account without a `templateOptionId` (create path)
  - required-field validation
  - `useBackground` enum values
  - optional relation clears with `null`
  - `templateVideoId` persistence
- Sign off App / CMS / Product rows in the smoke checklist.

## Local Verification Completed

- Focused Vitest passed for Phase 4 helpers and BFF validation.
- Focused ESLint passed for Phase 4 touched files.
- Full typecheck has no template-builder errors.

## Known Non-Phase-4 Typecheck Failures

Full `npm run typecheck` still fails in unrelated season files:

- `src/app/(members)/o/[accountId]/season/_components/_sections/season-fixture-detail-tabs-section.tsx`
- `src/app/(members)/o/[accountId]/season/_components/_utils/season-fixture-detail-model.ts`
- `src/app/(members)/o/[accountId]/season/_components/_utils/season-fixture-tabs.test.ts`

These are outside the template-builder Phase 4 scope.
