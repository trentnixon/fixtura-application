# Remotion Wrappers Refactor Plan

## Goal

Refactor `src/components/remotion` into a small, single-purpose wrapper package.

The package should:

- keep file sizes smaller
- separate rendering wrappers from data/logic/helpers
- move all local types into `_types`
- move wrapper components into `_components`
- move pure functions into `_utils`
- move hooks into `_hooks`
- move constants/registries into `_constants`
- stay non-opinionated about visual design
- act as a wrapper around vendored Remotion assets, not a design system

## Current Folder Inventory

Current files in `src/components/remotion`:

- `remotion-preview.tsx` - 2.6 KB
- `remotion-sandbox-panel.tsx` - 7.1 KB
- `remotion-thumbnail-carousel.tsx` - 5.6 KB
- `remotion-sandbox-options.ts` - 3.2 KB
- `remotion-sandbox-preview-data.ts` - 2.3 KB
- `remotion-sandbox-dataset.ts` - 1.4 KB
- `remotion-preview.css` - 0.7 KB

## Current Refactor Signals

### 1. `remotion-sandbox-panel.tsx` is carrying too much responsibility

It currently mixes:

- page/panel layout
- CMS category loading state
- template-category selection resolution
- template fallback messaging
- composition selection state
- preview composition wiring
- thumbnail carousel wiring

This is the clearest candidate for splitting into wrapper components plus hooks/helpers.

### 2. `remotion-sandbox-options.ts` combines constants, types, and logic

It currently contains:

- template id registry
- composition id registry
- related union types
- defaults
- dataset path mapping
- slug-to-template resolution logic

This should be split so constants are constants, types are types, and resolver logic lives elsewhere.

### 3. Preview wrappers still include repeated player configuration

`remotion-preview.tsx` and `remotion-thumbnail-carousel.tsx` both define:

- `FPS`
- composition width/height
- repeated Remotion wrapper root usage
- direct `FixturaTemplateScene` wiring

These should be centralized so preview wrappers stay thin.

### 4. Dataset transformation and fetch logic are adjacent but not clearly separated by intent

Current split:

- `remotion-sandbox-dataset.ts` handles data merging and thumbnail frame extraction
- `remotion-sandbox-preview-data.ts` handles fetch, local state, memoized merge, and duration derivation

This is a good base, but it should be normalized under `_utils` and `_hooks`.

### 5. The folder naming does not show architectural intent

The current flat structure makes it hard to see:

- what is a wrapper component
- what is a hook
- what is a constant registry
- what is a type contract
- what is a pure helper

That slows down future work and encourages mixed-purpose files.

## Target Folder Shape

Proposed structure inside `src/components/remotion`:

```text
remotion/
  _components/
    remotion-preview.tsx
    remotion-thumbnail-carousel.tsx
    remotion-sandbox-panel.tsx
    remotion-sandbox-fallback-note.tsx
    remotion-composition-select.tsx
    remotion-preview-shell.tsx
  _hooks/
    use-remotion-sandbox-preview-data.ts
    use-remotion-sandbox-selection.ts
  _utils/
    merge-sandbox-dataset.ts
    get-sandbox-thumbnail-frames.ts
    resolve-remotion-template-from-slug.ts
    get-remotion-duration.ts
  _constants/
    remotion-composition.ts
    remotion-templates.ts
    remotion-datasets.ts
    remotion-player.ts
  _types/
    remotion.ts
    remotion-sandbox.ts
  remotion-preview.css
  index.ts
```

Notes:

- `_components` should only contain wrapper UI and composition assembly
- `_hooks` should contain stateful client logic
- `_utils` should contain pure transforms and selectors
- `_constants` should contain registries, defaults, and shared static config
- `_types` should contain local contracts only
- `index.ts` should expose the small public API for the folder

## Proposed File Responsibilities

### `_components/remotion-sandbox-panel.tsx`

Keep only:

- high-level wrapper assembly
- layout slots
- composition of smaller internal wrapper pieces

Move out:

- category/template selection resolution
- composition select UI block
- fallback note rendering
- any repeated status message logic

### `_components/remotion-preview.tsx`

Keep only:

- preview shell rendering
- empty/error/loading wrapper states
- `Player` mount

Move out:

- shared player constants
- any reusable shell wrapper class decisions

### `_components/remotion-thumbnail-carousel.tsx`

Keep only:

- thumbnail carousel layout
- thumbnail card rendering
- `Thumbnail` mount

Move out:

- frame extraction logic
- frame clamping logic if it grows further
- shared player constants

### `_components/remotion-composition-select.tsx`

New wrapper component for:

- `Label`
- `Select`
- `SelectItem` list
- typed `onValueChange`

This removes select-specific UI noise from the panel file.

### `_components/remotion-sandbox-fallback-note.tsx`

New wrapper component for:

- template slug fallback copy
- unknown slug messaging
- empty slug messaging

This keeps status copy out of the panel composition.

### `_hooks/use-remotion-sandbox-preview-data.ts`

Own:

- dataset fetch
- request cancellation
- local loading/error state
- template override application
- duration derivation

Do not own:

- panel layout
- presentation copy beyond returned error strings

### `_hooks/use-remotion-sandbox-selection.ts`

New hook for:

- category query normalization
- selected category resolution
- template resolution
- fallback state derivation

This will shrink `remotion-sandbox-panel.tsx` materially.

### `_utils/*`

Split current mixed helpers into focused utilities:

- `merge-sandbox-dataset.ts`
- `get-sandbox-thumbnail-frames.ts`
- `resolve-remotion-template-from-slug.ts`

Only pure functions should live here.

### `_constants/*`

Split current `remotion-sandbox-options.ts` into:

- `remotion-templates.ts`
- `remotion-composition.ts`
- `remotion-datasets.ts`
- `remotion-player.ts`

This removes the current "constants + logic + types in one file" problem.

### `_types/*`

Extract local types such as:

- `RemotionSandboxTemplateId`
- `RemotionSandboxCricketCompositionId`
- `UseRemotionSandboxPreviewDataArgs`
- wrapper prop types if they are reused across files

If a type is file-local and trivial, it can stay local. Shared contracts should move.

## Wrapper Rules

These are the constraints the refactor should enforce.

### 1. Wrappers only

This folder should not become the place where visual design decisions live.

Allowed:

- minimal layout needed to host Remotion player/thumbnail wrappers
- state wrappers for loading, error, and empty data
- simple composition of existing UI primitives

Not allowed:

- bespoke brand styling
- template-specific design logic
- opinionated visual treatments that belong in product UI or vendor assets

### 2. Single purpose per file

Each file should have one reason to change.

Examples:

- selection hook changes because category/template resolution changes
- player constants change because Remotion runtime config changes
- thumbnail utility changes because dataset frame rules change

It should not be possible for a single file to change because of all three.

### 3. Shared contracts are explicit

Any shared ids, defaults, or data maps should be imported from `_constants` or `_types`, not recreated inline.

### 4. Pure logic stays out of components

If logic can run without React, it belongs in `_utils`.

### 5. Client state stays in hooks

If code uses `useEffect`, `useMemo`, or `useState` for package behavior, it should be strongly considered for `_hooks`.

## Suggested Refactor Sequence

### Phase 1. Split constants, types, and utilities

Create:

- `_constants/remotion-templates.ts`
- `_constants/remotion-composition.ts`
- `_constants/remotion-datasets.ts`
- `_constants/remotion-player.ts`
- `_types/remotion-sandbox.ts`
- `_utils/resolve-remotion-template-from-slug.ts`
- `_utils/merge-sandbox-dataset.ts`
- `_utils/get-sandbox-thumbnail-frames.ts`

Outcome:

- removes the current multi-purpose `remotion-sandbox-options.ts`
- gives the rest of the refactor stable imports

### Phase 2. Normalize hooks

Create:

- `_hooks/use-remotion-sandbox-preview-data.ts`
- `_hooks/use-remotion-sandbox-selection.ts`

Outcome:

- moves stateful resolution/fetch work out of panel rendering

### Phase 3. Split panel wrappers

Create:

- `_components/remotion-composition-select.tsx`
- `_components/remotion-sandbox-fallback-note.tsx`
- optional `_components/remotion-preview-shell.tsx`

Outcome:

- `remotion-sandbox-panel.tsx` becomes a thin assembly wrapper

### Phase 4. Simplify preview wrappers

Update:

- `_components/remotion-preview.tsx`
- `_components/remotion-thumbnail-carousel.tsx`

Outcome:

- shared player config comes from one place
- rendering files stay focused on rendering

### Phase 5. Add an `index.ts`

Export only the intended public surface for this package.

Outcome:

- future imports stop depending on internal file layout

## Immediate Candidates For Reduction

These should shrink first:

1. `remotion-sandbox-panel.tsx`
2. `remotion-sandbox-options.ts`
3. `remotion-thumbnail-carousel.tsx`

## Proposed End State

After refactor, the folder should read as:

- wrappers in `_components`
- state in `_hooks`
- pure functions in `_utils`
- static config in `_constants`
- shared contracts in `_types`

The package should remain a thin integration layer over the vendored Remotion scene and dataset shape.

## Working Rule For Future Changes

Before adding code to this folder, ask:

1. Is this UI assembly?
2. Is this React state logic?
3. Is this a pure function?
4. Is this a shared type?
5. Is this static configuration?

If the answer is unclear, the file is probably taking on more than one responsibility.
