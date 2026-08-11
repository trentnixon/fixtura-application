# Phase 08 — Production Grouping and Ordering Screen

> Monday child `2785807604` | Primary repository: Application

## Outcome

Replace the `/o/[accountId]/sort-order` placeholder with a responsive, typed, accessible workspace rendering independent sortable Grade groups from Phase 07.

## Proposed component layout

```text
src/app/(members)/o/[accountId]/sort-order/
  page.tsx
  sort-order-content.tsx
  _components/
    grade-ordering-workspace.tsx
    grade-ordering-header.tsx
    grade-ordering-group-card.tsx
    sortable-grade-list.tsx
    sortable-grade-row.tsx
    grade-ordering-loading.tsx
    grade-ordering-empty.tsx
  _hooks/
    use-grade-ordering-editor.ts
  _utils/
    grade-ordering-draft.ts
    grade-ordering-draft.test.ts
  sort-order-content.test.tsx
  _components/sortable-grade-list.test.tsx
```

Keep API DTOs in `src/types/api/grade-ordering.ts`; feature-local draft/view types may live under `_types` only if they differ from transport types.

## Page and data shell

- Keep `page.tsx` as a server component that reads `accountId`, exports metadata, and renders a max-width container.
- `sort-order-content.tsx` is the client boundary and follows `account-settings-content.tsx` for account ID validation, gateway redirects, loading, retry, and error handling.
- Render `BrandedLoader` during GET, `ErrorState` on query failure, and `EmptyState` when no visible Grades exist.
- Unsupported organisation types receive an explanatory non-error empty state.
- Use `PageHeader`/`Surface` to match members settings/workspace pages.

## Draft model

Normalize the canonical DTO immediately:

```ts
type GradeOrderingDraftGroup = {
  groupType: "club-age-group" | "competition";
  groupKey: string;
  label: string;
  itemIds: number[];
};
```

Keep a Grade lookup keyed by CMS ID. Reorder only `itemIds`. Derive zero-based `position` from the current array index. Never mutate query data in place.

Use stable equality across group type/key and ordered IDs so Phase 09 can detect dirty state. Reset draft when canonical response changes only when the editor is clean; do not overwrite a dirty draft on background refetch.

## dnd-kit implementation

Use installed `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/modifiers`, and `@dnd-kit/utilities`.

- One `DndContext`/`SortableContext` per group is simplest and makes cross-group movement structurally impossible.
- `PointerSensor` with a small distance activation constraint prevents accidental drag.
- `KeyboardSensor` uses `sortableKeyboardCoordinates`.
- `verticalListSortingStrategy`, `closestCenter`, and `arrayMove` are appropriate.
- Use a drag overlay for stable layout.
- Restrict movement to the vertical axis where appropriate.
- Validate `active`/`over` IDs belong to the same group before state changes even with isolated contexts.
- Position badges display `index + 1` to users while stored positions remain zero-based.

Do not import the sandbox component directly. It uses demo copy and one-based `order` mutation; extract/reimplement only the proven interaction concepts with feature types.

## Group presentation

- Club group order: `junior`, `senior`, `masters`, `unclassified`, omitting empty groups unless the API intentionally returns them.
- Association groups preserve CMS response order, which is produced by the shared deterministic resolver; identity remains Competition CMS ID.
- Display API-provided normalized labels.
- Display Grade name and optionally provider/reference metadata useful for distinguishing equal names.
- Do not persist labels or names.
- Explain that Grades can be moved inside a section but not between sections.

## Accessibility

- Drag handle is a semantic button, not a clickable `div`.
- Accessible name includes Grade, current position, total, and group.
- Provide visible/associated instructions for Space/arrow/Escape interaction.
- Use a polite live region to announce pickup, movement, drop, and cancellation.
- Preserve focus on the moved row/handle after keyboard drop.
- Visible focus, sufficient target size, reduced-motion support, and touch scrolling are required.
- If dnd-kit keyboard announcements are insufficient, add explicit announcements in the feature hook.

## Tests

- Club and Association response rendering.
- Group labels and Grade names.
- Empty, loading, error, retry, unsupported, and redirect states.
- Deduplicated response is not duplicated by the UI.
- Pointer/keyboard reorder changes one group only.
- Cross-group payload/event is ignored.
- Position badges derive from draft array.
- Equal Grade names remain stable by ID.
- Canonical query objects are not mutated.

## Exit gate

The real Phase 07 GET response renders at the production route, all groups reorder independently by pointer/touch/keyboard, and no save occurs until the explicit Phase 09 action.
