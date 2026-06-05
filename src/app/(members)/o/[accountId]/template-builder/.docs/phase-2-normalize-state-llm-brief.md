# Phase 2 LLM Brief: Normalize Template Builder State

## Objective

Create the state foundation for the template builder POC.

This phase should define and implement the local editor state model only. It should not build the final picker UI and should not implement CMS save behavior.

The goal is to make the next UI phase simple:

- `savedState` comes from CMS `currentSelection`.
- `draftState` starts as a copy of `savedState`.
- comparison helpers identify changed fields.
- reset helpers can restore the draft to the saved state.

## Route Context

- App route: `/o/[accountId]/template-builder`
- Route folder: `src/app/(members)/o/[accountId]/template-builder`
- Current UI: read-only diagnostic/data dump.
- Phase 1 contract: `phase-1-data-contract.md`

## Inputs

Use the GET catalog response types from:

- `src/types/api/all-template-options.ts`

Important input type:

- `CurrentTemplateSelection`

Important response field:

- `AllTemplateOptionsPayload.currentSelection`

When `currentSelection` is `null`, Phase 2 should treat the saved state as empty.

## Normalized Editor State

Create a normalized state shape using ids only for relations.

Expected shape:

```ts
export type TemplateBuilderOptionId = number | null;

export interface TemplateBuilderEditorState {
  templateCategoryId: TemplateBuilderOptionId;
  templateModeId: TemplateBuilderOptionId;
  templatePaletteId: TemplateBuilderOptionId;
  templateGradientId: TemplateBuilderOptionId;
  templateImageId: TemplateBuilderOptionId;
  templateNoiseId: TemplateBuilderOptionId;
  templateParticleId: TemplateBuilderOptionId;
  templatePatternId: TemplateBuilderOptionId;
  templateTextureId: TemplateBuilderOptionId;
  templateVideoId: TemplateBuilderOptionId;
  useBackground: boolean | null;
}
```

Use `null` for unset relation ids. Do not use `0`, empty strings, or `undefined` for unset values.

## Mapping From Current Selection

Map `CurrentTemplateSelection | null | undefined` into `TemplateBuilderEditorState`.

Expected mapping:

| Editor field         | Source                                           |
| -------------------- | ------------------------------------------------ |
| `templateCategoryId` | `currentSelection?.templateCategory?.id ?? null` |
| `templateModeId`     | `currentSelection?.templateMode?.id ?? null`     |
| `templatePaletteId`  | `currentSelection?.templatePalette?.id ?? null`  |
| `templateGradientId` | `currentSelection?.templateGradient?.id ?? null` |
| `templateImageId`    | `currentSelection?.templateImage?.id ?? null`    |
| `templateNoiseId`    | `currentSelection?.templateNoise?.id ?? null`    |
| `templateParticleId` | `currentSelection?.templateParticle?.id ?? null` |
| `templatePatternId`  | `currentSelection?.templatePattern?.id ?? null`  |
| `templateTextureId`  | `currentSelection?.templateTexture?.id ?? null`  |
| `templateVideoId`    | `currentSelection?.templateVideo?.id ?? null`    |
| `useBackground`      | `currentSelection?.useBackground ?? null`        |

Create an explicit empty-state constant or factory so null-current-selection behavior is consistent.

## Comparison Model

Create helpers to compare `savedState` and `draftState`.

The comparison should support:

- field-level equality
- field-level changed status
- overall dirty status
- changed field count
- reset-to-saved behavior

Suggested types:

```ts
export type TemplateBuilderEditorField = keyof TemplateBuilderEditorState;

export interface TemplateBuilderFieldComparison {
  field: TemplateBuilderEditorField;
  savedValue: TemplateBuilderEditorState[TemplateBuilderEditorField];
  draftValue: TemplateBuilderEditorState[TemplateBuilderEditorField];
  isChanged: boolean;
  isUnset: boolean;
}

export interface TemplateBuilderStateComparison {
  fields: TemplateBuilderFieldComparison[];
  isDirty: boolean;
  changedCount: number;
}
```

`isUnset` should be true when the draft value is `null`.

## Suggested File Structure

Keep the implementation local to the route for now.

Suggested folder:

- `src/app/(members)/o/[accountId]/template-builder/_utils`

Suggested files:

- `_utils/template-builder-editor-state.ts`
- `_utils/template-builder-editor-state.test.ts`

If the route already has a stronger local pattern by the time this phase starts, follow that pattern.

## Suggested Helpers

Implement small pure helpers:

- `createEmptyTemplateBuilderEditorState()`
- `mapCurrentSelectionToTemplateBuilderEditorState(currentSelection)`
- `compareTemplateBuilderEditorStates(savedState, draftState)`
- `hasTemplateBuilderEditorChanges(savedState, draftState)`
- `getTemplateBuilderChangedFields(savedState, draftState)`

Optional:

- `cloneTemplateBuilderEditorState(state)`
- `isTemplateBuilderEditorField(field)`
- `TEMPLATE_BUILDER_EDITOR_FIELDS`

Keep helpers pure and framework-free so they are easy to test.

## Integration Scope

Phase 2 may lightly integrate the helpers into `template-builder-content.tsx` only if useful for proving the state model.

Acceptable integration:

- derive `savedState` from `catalogQ.data.data.currentSelection`
- initialize or display a draft-state debug summary
- keep existing JSON dumps available

Do not replace the route with the picker UI yet. That belongs to Phase 3.

## Tests

Add focused tests for the pure helpers.

Test cases:

- `null` current selection maps to all relation ids `null` and `useBackground: null`
- full current selection maps every relation id correctly
- partially empty current selection maps missing relations to `null`
- identical saved/draft states are not dirty
- one changed id marks dirty and increments changed count
- changing `useBackground` is detected
- `null` draft values are marked unset
- reset/clone helpers do not mutate the saved state

## Guardrails

- Do not implement CMS save in this phase.
- Do not guess CMS save payload field names.
- Do not add a BFF write route.
- Do not add dependency/filter rules between category, mode, and other options yet.
- Do not make product decisions about private categories.
- Keep unset relation ids as `null`.
- Keep code local to this route unless an existing shared pattern clearly requires otherwise.

## Phase 2 Completion Criteria

Phase 2 is complete when:

- normalized editor state type exists
- empty saved state behavior is explicit
- `currentSelection` maps into `savedState`
- comparison helpers return dirty/changed-field information
- pure helper tests cover the expected mappings and comparisons
- Phase 3 can build simple controls using `savedState`, `draftState`, and comparison output

## Phase 2 Output

Expected implementation output:

- local state utility file
- local utility tests
- optional small diagnostic integration in the route

Expected documentation output:

- update `template-builder-poc-phases.md` to mark Phase 2 complete when done
- add notes to `phase-1-data-contract.md` only if the implementation discovers a mismatch
