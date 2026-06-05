# Phase 3 LLM Brief: Simple Picker UI

## Objective

Replace the Phase 2 diagnostic state view with a simple, usable picker UI for the template builder POC.

This phase should let a user select template option values locally and see how the draft differs from the saved CMS state.

Do not implement CMS save behavior in this phase.

## Route Context

- App route: `/o/[accountId]/template-builder`
- Route folder: `src/app/(members)/o/[accountId]/template-builder`
- Current data source: `GET /api/accounts/:accountId/all-template-options`
- Phase 1 contract: `phase-1-data-contract.md`
- Phase 2 state helpers: `_utils/template-builder-editor-state.ts`

## Inputs

Use catalog data from `AllTemplateOptionsPayload`:

- `categories`
- `modes`
- `palettes`
- `gradients`
- `images`
- `noises`
- `particles`
- `patterns`
- `textures`
- `videos`
- `currentSelection`

Use Phase 2 helpers:

- `mapCurrentSelectionToTemplateBuilderEditorState`
- `cloneTemplateBuilderEditorState`
- `compareTemplateBuilderEditorStates`
- `getTemplateBuilderChangedFields`
- `TEMPLATE_BUILDER_EDITOR_FIELDS`

## UI Scope

Build a simple editor surface with:

- one control per template option group
- saved value display
- draft value display through the selected control value
- field-level changed indicator
- overall dirty state
- changed count
- reset-to-saved action

Option groups:

- category
- mode
- palette
- gradient
- image
- noise
- particle
- pattern
- texture
- video
- use background

**Visibility (implemented):** Primary settings always show category, use background, mode, and palette. Background asset pickers (gradient, image, noise, particle, texture, video) show only when `useBackground` matches the CMS enum (`Graphics` → noise, etc.; `Solid` → none). Pattern is hidden in the editor for now (still in state/API). Inactive background relation ids are cleared on use-background change and nulled in preview/save via `_utils/template-builder-field-visibility.ts`.

Use basic controls for now:

- `Select` for relation fields
- `Switch`, `Checkbox`, or segmented control for `useBackground`
- a simple button for reset

## Suggested Component Structure

Keep implementation local to the route.

Suggested files:

- `template-builder-editor.tsx`
- `_components/template-builder-field-row.tsx`
- `_utils/template-builder-option-labels.ts`

If fewer files are cleaner, keep it simpler. Avoid large abstractions unless the repeated field UI becomes hard to read.

## Draft State Behavior

Inside the editor component:

1. Derive `savedState` from `currentSelection`.
2. Initialize `draftState` from `savedState`.
3. Re-sync `draftState` when `savedState` changes because the catalog/currentSelection refetched.
4. Update one field at a time when the user changes a control.
5. Use `compareTemplateBuilderEditorStates(savedState, draftState)` for dirty state.
6. Reset button should restore `draftState` to `savedState`.

Do not persist changes yet.

## Field Rendering

For each relation field:

- include an "Unset" option with value `null`
- render catalog options from the matching array
- use item `id` as the selected value
- use a stable label helper
- show saved value label
- show changed/unchanged state

Recommended label fallback:

```ts
name ?? slug ?? value ?? String(id);
```

Use field-specific extras only when cheap and useful:

- palette: show `value` if present
- texture: show media url or mime if useful
- video: show name plus position/size only if it stays readable

Keep the UI plain and readable. This is a POC editor, not the final branded builder.

## Null Handling

Relation fields:

- `null` means unset
- select control should support choosing unset
- do not convert unset to `0`, empty string, or `undefined`

`useBackground`:

- support `true`, `false`, and `null` if the control can do that cleanly
- if a binary control is used, document how `null` is represented

Preferred for POC:

- use a select/segmented control with `Unset`, `Yes`, `No`

## Current JSON Dumps

Keep the existing raw JSON dumps available for now.

The picker UI should appear before or near the dumps so the route becomes useful, while the dumps remain available for debugging.

## Save Button

Do not wire a real save.

Allowed:

- show a disabled "Save" button with copy such as `Save blocked pending CMS contract`
- show dirty state next to it

Not allowed:

- no BFF write route
- no CMS `PUT`
- no guessed payload mapping

## Tests

Add focused tests where practical.

Suggested test targets:

- label helper fallbacks
- field option conversion for `null` values
- editor initializes draft from saved state
- reset restores saved state
- changing a field updates dirty state

If component tests are heavy for the route, prioritize pure helper tests for label/value mapping and keep UI tests minimal.

## Guardrails

- Do not implement CMS save.
- Do not guess CMS save payload names.
- Do not remove Phase 2 state helpers.
- Do not remove raw dumps yet.
- Do not introduce category/mode filtering rules yet.
- Do not decide private category behavior unless the user gives direction.
- Use full catalog `categories` for category picker by default, which means public categories only.
- Keep visual design simple, compact, and consistent with existing app components.

## Phase 3 Completion Criteria

Phase 3 is complete when:

- route shows a simple picker/editor UI
- all known option groups can be changed locally
- saved values and draft values are visible
- dirty state and changed count update when fields change
- reset-to-saved works
- raw dumps remain available
- save is clearly blocked/disabled pending CMS contract
- lint/tests pass for touched files

## Phase 3 Output

Expected implementation output:

- simple editor component
- local field/label helpers as needed
- tests for helper behavior and/or basic editor behavior
- updated route integration

Expected documentation output:

- update `template-builder-poc-phases.md` when Phase 3 is complete
- create an outstanding-items doc only if Phase 3 leaves concrete local work unfinished
