# Season Sections Refactor Findings

Date: 2026-04-29

Reviewed folder:

`src/app/(members)/o/[accountId]/season/_components/_sections`

Target supporting folders already exist:

- `../_types`
- `../_hooks`
- `../_utils`
- `../_constants`

## Summary

The `_sections` folder is already partly split from the top-level season screens, but most section files still own their prop types, some event orchestration, small display helpers, repeated card/tile patterns, and route-building details. The best next sweep is not a single large move. It should be done by feature group: overview, competition detail, grade detail, fixture detail, then shared section UI.

The current structure is healthy enough to refactor incrementally. The main risks are changing component contracts while the parent containers spread hook output into sections, and moving sync logic without preserving toast/error behavior.

## Current Inventory

There are 27 TSX files in `_sections`:

- Overview: `season-overview-header.tsx`, `season-overview-summary-section.tsx`, `season-overview-empty-states.tsx`, `season-overview-sync-dialog.tsx`, `season-overview-competition-card.tsx`, `season-overview-tracked-competitions-section.tsx`
- Competition detail: `season-competition-detail-header.tsx`, `season-competition-coverage-summary-section.tsx`, `season-competition-sync-grades-dialog.tsx`, `season-competition-tracked-grades-section.tsx`
- Grade detail: `season-grade-view-header.tsx`, `season-grade-coverage-summary-section.tsx`, `season-grade-sync-dialog.tsx`, `season-grade-fixtures-section.tsx`, `season-grade-fixtures-toolbar.tsx`, `season-grade-fixtures-table.tsx`
- Fixture detail: `season-fixture-view-header.tsx`, `season-fixture-detail-tabs-section.tsx` (Match / Scorecard / Teams / Outputs — `tabber.pill.borderless.default`), `season-fixture-match-summary-section.tsx`, `season-fixture-scorecards-section.tsx`, `season-fixture-scorecard-table.tsx`, `season-fixture-grade-context-section.tsx`, `season-fixture-context-meta-section.tsx`, `season-fixture-content-note-section.tsx`, `season-fixture-grade-fixtures-error-banner.tsx`, `season-fixture-outputs-section.tsx`, `season-fixture-teams-section.tsx`, `season-fixture-result-sync-dialog.tsx`. External Scorecard link and Back live in the header; sidebar actions section removed.

Supporting code already exists in:

- `_types/season-components.ts`
- `_hooks/use-season-overview-state.ts`
- `_hooks/use-season-overview-filters.ts`
- `_hooks/use-season-grade-view-state.ts`
- `_hooks/use-season-grade-fixture-filters.ts`
- `_hooks/use-season-fixture-view-model.ts`
- `_hooks/use-season-competition-detail-state.ts`
- `_utils/season-overview.ts`
- `_utils/season-grade.ts`
- `_utils/season-grade-view.ts`
- `_utils/season-fixture.ts`
- `_utils/season-fixture-display.ts`
- `_utils/season-fixture-view-model.ts`
- `_utils/season-fixture-detail-model.ts`
- `_utils/season-competition.ts`
- `_utils/season-record.ts`
- `_constants/season-copy.ts`

## Types To Extract

Every section currently declares its own props type inline. That keeps each file readable in isolation, but it makes the sections folder noisy and harder to scan. Move section prop contracts into `_types/season-section-props.ts` and re-export from `_types/index.ts`.

High value candidates:

- `SeasonOverviewTrackedCompetitionsSectionProps` and local `PaginationMeta` in `season-overview-tracked-competitions-section.tsx`
- `OrgSyncForDialog` and `SeasonOverviewSyncDialogProps` in `season-overview-sync-dialog.tsx`
- `SeasonGradeFixturesSectionProps`, `SeasonGradeFixturesToolbarProps`, and `SeasonGradeFixturesTableProps`
- `SeasonGradeSyncDialogProps`, especially the mutation function shapes
- `SeasonCompetitionSyncGradesDialogProps`, including the `TriggerGradesCompsSingleScrapeRequest` relation
- `SeasonFixtureMatchSummarySectionProps`, `SeasonFixtureTeamsSectionProps`, `SeasonFixtureOutputsSectionProps`, and other fixture view section props

Recommended type layout:

- Keep domain/view-model types in `_types/season-components.ts`
- Add `_types/season-section-props.ts` for section component props
- Add `_types/season-sync.ts` only if the sync dialog mutation contracts become shared between hooks and sections

## Logic To Extract To Hooks

The existing hooks already own most data normalization and filter state. The main remaining inline logic is mutation orchestration inside dialog click handlers.

Move these to hooks:

- `season-grade-sync-dialog.tsx`: extract the `Promise.allSettled` orchestration into a hook such as `useSeasonGradeSyncAction`.
- `season-competition-sync-grades-dialog.tsx`: extract the single competition grade sync action into `useSeasonCompetitionGradesSyncAction`.
- Parent-level numeric sync eligibility in `season-grade-view.tsx` can stay in the parent for now, but if reused, extract to a small hook or util.

Why: the dialog components should mostly render confirmation UI. The hooks can own mutation calls, success/error toast policy, `onSynced`, and close behavior.

Suggested hook outputs:

```ts
{
  runSync: () => void;
  disabled: boolean;
}
```

or, if retaining async semantics:

```ts
{
  syncGrade: () => Promise<void>;
  isSyncMutating: boolean;
}
```

## Functions To Extract To Utils

Several section-local calculations are pure and should move to `_utils`.

Recommended candidates:

- Route builders currently assembled inline with `accountScopedRoutes.season(accountId)` in competition cards, grade fixtures table, and tracked grades. Add focused helpers like `buildSeasonCompetitionHref`, `buildSeasonGradeHref`, and `buildSeasonFixtureHref`.
- Active status checks such as `/\bactive\b/i.test(String(grade.status))` in `season-competition-tracked-grades-section.tsx`. Move to a `isSeasonStatusActive` utility.
- Fixture table display fallback logic for home/away/type/status/venue in `season-grade-fixtures-table.tsx`. Move to a formatter or row view-model helper.
- `tileSurface` in `season-fixture-match-summary-section.tsx` is a render helper, not a data util. It should either become a small shared component or be replaced by a reusable stat tile component.
- Repeated coverage/stat tuple creation in overview, grade, competition, and fixture sections. Either extract data builders to utils or create a shared `SeasonMetricTileGrid` component.

Avoid moving JSX-returning helpers into `_utils`; prefer `_components/shared` for reusable UI.

## Constants To Extract

There is already a good constants file, but section copy and repeated table/card labels are still inline.

Good candidates for `_constants`:

- Empty-state titles/descriptions used by overview, competition, grade, and fixture sections
- Dialog titles/descriptions and confirm labels
- Fixture table column labels
- Filter placeholder labels
- Stat labels such as `Teams`, `Fixtures`, `Grades`, `Round`, `Date`, `Type`, `Venue`

Keep dynamic copy close to the component if it depends heavily on JSX context. Move stable strings and label maps.

## Shared UI Extraction Candidates

There is repeated visual structure across multiple sections:

- Header cards with dark `bg-primary-950`
- Metric tiles using `Surface` with `bg-primary/5 ring-primary/10`
- Status badges using `cn(..., statusClass)`
- `SeasonRowLink` footer card links
- Search/filter toolbars with `Input`, `Select`, and clear button

Recommended shared components:

- `SeasonMetricTile`
- `SeasonMetricTileGrid`
- `SeasonStatusBadge`
- `SeasonSectionToolbar`

These should live in `_components/shared` if they are JSX components. Do not put them in `_utils`.

## Import Cleanup

Some section files import season utils through absolute app paths, for example:

- `@/app/(members)/o/[accountId]/season/_components/_utils/season-fixture-display`

Prefer sibling relative imports from `_sections`:

```ts
import { formatFixtureDateDisplay } from "../_utils";
```

This keeps the feature slice easier to move and matches the existing `../_types` and `../_constants` pattern.

## Encoding Issue To Fix During The Sweep

Several files appear to contain mojibake for punctuation:

- dash placeholders where the UI likely intends an em dash or ASCII hyphen
- ellipsis placeholders where the UI likely intends `...` or a proper ellipsis
- separator placeholders where the UI likely intends a middle dot or ASCII separator

Examples are visible in sync dialog copy, fixture table fallbacks, fixture summary score display, and loading copy constants. Decide whether the project wants ASCII fallbacks (`-`, `...`, `*`) or proper UTF-8 punctuation, then fix consistently. This is worth doing during the constants/copy extraction pass.

## Suggested Refactor Order

1. Add `_types/season-section-props.ts` and move section prop types with no behavior changes.
2. Normalize section imports to `../_types`, `../_constants`, and `../_utils` barrels.
3. Extract route builders and status/display helpers into `_utils`.
4. Extract sync orchestration into hooks and leave dialogs as presentation components.
5. Extract shared metric/status UI into `_components/shared`.
6. Move stable copy and labels to `_constants`.
7. Run lint/typecheck after each feature group rather than after the whole folder.

## Feature Group Notes

### Overview

The overview group is already closest to the desired shape. Filter state lives in `useSeasonOverviewFilters`, and constants are partially centralized. Remaining work is mostly prop type extraction, route helper extraction from `season-overview-competition-card.tsx`, and copy/constants cleanup.

### Competition Detail

`season-competition-tracked-grades-section.tsx` has enough inline card rendering and route/status logic to justify either a smaller `SeasonCompetitionGradeCard` component or a shared card/tile extraction. The sync dialog should delegate mutation/toast behavior to a hook.

### Grade Detail

The grade group has the clearest split between data state and sections. Main cleanup targets are section prop types, fixture row display formatting, route building, and the `Promise.allSettled` sync flow.

### Fixture Detail

Fixture sections are mostly presentational, but `season-fixture-match-summary-section.tsx` has a local JSX helper and repeated fallback formatting. Pull display fallbacks into utils and turn the tile helper into shared UI if another section can use it.

## Verification Checklist

After each refactor batch:

- Run `npm run typecheck`
- Run eslint on the touched files
- Check overview, competition detail, grade detail, and fixture detail routes
- Confirm sync dialogs still show the same success/error toasts
- Confirm filters still preserve selected values and clear correctly
- Confirm empty states still appear for unavailable or zero-count data
