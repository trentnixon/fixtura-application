# Folder Overview

Season member route that displays account-scoped competitions, grades, fixtures, and detail drill-down views.

## Files

- `page.tsx`: Route entry that resolves `accountId` and renders season overview.
- `layout.tsx`: Shared route layout wrapper for season pages.
- `_components/season-overview.tsx`: Overview UI with recon/stats/list loading and action buttons.
- `_components/season-competition-detail.tsx`: Competition-level detail presentation.
- `_components/season-grade-view.tsx`: Grade-level fixtures listing and filtering.
- `_components/season-fixture-view.tsx`: Fixture-level detail presentation and contextual metadata.
- `_components/season-onboarding-shell.tsx`: Access gate based on onboarding setup status.

## Child Modules

- `./_components/`
- `./.docs/request/frontend-handoff.md`

## Relations

- Parent: `src/app/(members)/o/[accountId]/.docs/readMe.md` (if present)
- Consumed by: Members route segment `/o/[accountId]/season`
- Key dependencies: `src/lib/api/hooks/season-hub`, `src/lib/api/services/season-hub.api.ts`, `src/types/api/season-hub.ts`
