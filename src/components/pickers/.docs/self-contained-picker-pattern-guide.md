# Self-Contained Picker Pattern Guide

This folder contains self-contained picker ecosystems that can be moved around the app without rewriting page-level fetch or selection logic.

The best current reference is:

- `src/components/pickers/template-category/*`

That package is the pattern to copy for other template/data-lab selectors such as:

- `template-gradients`
- `template-images`
- `template-modes`
- `template-noises`
- `template-particles`

## Goal

Convert page-local selection UIs into reusable picker packages that:

- live under `src/components/pickers/<domain>/`
- fetch their own data
- store their own selection state
- expose reusable UI variants such as select, cards, combobox, toggle, and detail
- can be imported anywhere in the app without rebuilding fetch/state wiring in the parent

## What "Self-Contained" Means Here

A picker is considered self-contained when the parent can render it like this:

```tsx
<TemplateGradientSelectPicker />
```

and the picker package itself is responsible for:

- calling the correct API hook
- deriving normalized option lists
- resolving fallback selection
- storing selection in a local picker state hook
- rendering the UI primitive wrapper (`Select`, cards, combobox, and so on)

The parent page may still provide layout, tabs, and headings, but it should not have to manage:

- `useTemplate...Ui()` data fetching
- `useState()` for selected id
- `resolvedId`
- item label helpers
- detail lookup logic

## Reference Architecture

Use `template-category` as the canonical example:

- `src/components/pickers/template-category/index.ts`
- `src/components/pickers/template-category/template-category-select-picker.tsx`
- `src/components/pickers/template-category/template-category-card-picker.tsx`
- `src/components/pickers/template-category/template-category-combobox-picker.tsx`
- `src/components/pickers/template-category/template-category-toggle-picker.tsx`
- `src/components/pickers/template-category/template-category-picker-detail.tsx`
- `src/components/pickers/template-category/_hooks/use-template-category-picker-list.ts`
- `src/components/pickers/template-category/_hooks/use-template-category-picker-selection.ts`
- `src/components/pickers/template-category/_utils/*`
- `src/components/pickers/template-category/_consts/*`

## Required Folder Shape

When converting a page-local selector into a reusable picker package, use this structure:

```text
src/components/pickers/<domain>/
  index.ts
  <domain>-select-picker.tsx
  <domain>-card-picker.tsx
  <domain>-combobox-picker.tsx           # optional
  <domain>-toggle-picker.tsx             # optional
  <domain>-picker-detail.tsx             # recommended
  _hooks/
    index.ts
    use-<domain>-picker-list.ts
    use-<domain>-picker-selection.ts
  _utils/
    index.ts
    <domain>-label.ts
    resolve-selected-<domain>-id.ts
  _consts/
    index.ts
    query-keys.ts
  _types/
    index.ts                              # optional, only if local view-model types help
```

For simple domains like gradients or images, start with:

- select picker
- card picker
- picker detail
- hooks
- utils
- consts
- index barrel

Add combobox or toggle variants only if the UX actually needs them.

## Data Flow Rules

Every picker ecosystem should follow this flow:

1. `use-<domain>-picker-selection.ts`
   Stores shared picker selection state for that domain.

2. `use-<domain>-picker-list.ts`
   Calls the API hook, derives normalized data, resolves the selected id, and returns picker-ready state.

3. UI picker components
   Render select/cards/detail using only the picker hook, not page-owned state.

4. Parent page
   Imports picker components and arranges them, but does not own the selection internals.

## State Pattern

Prefer the same state pattern used by `template-category`:

- keep selected id in TanStack Query cache
- use a dedicated query key for that picker package
- expose `selectedId` and `setSelectedId`
- do not mix picker selection state into unrelated feature state

This gives us:

- shared selection across multiple picker views in the same package
- easy reuse in different pages
- no prop drilling for basic usage

## Hook Responsibilities

### `use-<domain>-picker-selection.ts`

Responsibilities:

- define or consume the picker selection query key
- read the current selected id from query cache
- expose `setSelectedId`
- default to `null`
- use infinite stale/gc times for UI-only selection state

This hook should not:

- fetch remote data
- build labels
- resolve fallback ids

### `use-<domain>-picker-list.ts`

Responsibilities:

- call the domain API hook such as `useTemplateGradientsUi()`
- derive `items` from `q.data?.data ?? []`
- resolve current selected id against available items
- choose a default item when needed
- derive `selectValue`
- derive `selectedItem`
- expose any display-ready option arrays
- expose the underlying query result if helpful for consumers

This hook should be the single source of truth for picker-ready data.

## UI Component Responsibilities

### Select picker

The select picker should:

- import shared primitives from `@/components/ui/select`
- call only the package hook
- render label, trigger, content, and items
- never contain its own fetch logic
- never contain page-local `useState` for selection

### Card picker

The card picker should:

- use the same hook as the select picker
- write selection through `setSelectedId`
- reflect selected state visually
- keep keyboard support

### Detail component

The detail component should:

- use the same hook
- render details for the currently resolved selection
- be optional for consumers to include

## Naming Rules

Follow the established naming style exactly.

Examples:

- `TemplateGradientSelectPicker`
- `TemplateGradientCardPicker`
- `TemplateGradientPickerDetail`
- `useTemplateGradientPickerList`
- `useTemplateGradientPickerSelection`
- `templateGradientPickerSelectedIdKey`

For plural API resources, keep the picker package naming singular when the UI represents a single selected item.

## Implementation Rules

- Keep all picker-specific logic inside the picker package.
- Reuse API hooks from `src/lib/api/hooks/...`; do not duplicate fetch clients.
- Reuse shared UI primitives from `src/components/ui/...`.
- Put item label formatting in `_utils`, not inline in page files.
- Put selection resolution in `_utils`, not duplicated across components.
- Export only the public picker surface from the package `index.ts`.
- Keep sandbox pages thin. They should demonstrate the picker, not implement it.

## Anti-Pattern To Avoid

Do not keep code in this form inside sandbox or feature pages:

```tsx
const q = useTemplateImagesUi();
const items = useMemo(() => q.data?.data ?? [], [q.data]);
const [userSelectedId, setUserSelectedId] = useState<string | null>(null);

const resolvedId = useMemo(() => {
  const first = items[0];
  if (!first) return "";
  if (userSelectedId && items.some((item) => String(item.id) === userSelectedId)) {
    return userSelectedId;
  }
  return String(first.id);
}, [items, userSelectedId]);
```

That is exactly the logic that should be moved into the picker package hook.

## Conversion Plan For Existing Template Selectors

For each of these:

- `src/app/sandbox/data-lab/template-gradients/ui/page.tsx`
- `src/app/sandbox/data-lab/template-images/ui/page.tsx`
- `src/app/sandbox/data-lab/template-modes/ui/page.tsx`
- `src/app/sandbox/data-lab/template-noises/ui/page.tsx`
- `src/app/sandbox/data-lab/template-particles/ui/page.tsx`

do this:

1. Create a new picker package under `src/components/pickers/<domain>/`.
2. Move label helpers into `_utils`.
3. Create a dedicated query key constant for selected id.
4. Create `use-<domain>-picker-selection.ts`.
5. Create `use-<domain>-picker-list.ts` that wraps the existing API hook.
6. Create `SelectPicker`, `CardPicker`, and `PickerDetail` components.
7. Add `index.ts` barrel exports.
8. Replace the page-local select/cards/detail implementation with imports from the new picker package.
9. Leave the sandbox page responsible only for header, tabs, loading shell, and explanatory copy if still needed.

## Recommended Public API

Each picker package should export a minimal public surface:

```ts
export { TemplateGradientSelectPicker } from "./template-gradient-select-picker";
export { TemplateGradientCardPicker } from "./template-gradient-card-picker";
export { TemplateGradientPickerDetail } from "./template-gradient-picker-detail";
export { useTemplateGradientPickerList, useTemplateGradientPickerSelection } from "./_hooks";
```

If a package only needs one UI variant right now, still structure it as a package so it can grow without rework.

## LLM Conversion Instructions

Use the following prompt when asking an LLM to convert one of the template selectors.

```md
Convert the page-local `<domain>` selector into a self-contained picker ecosystem using
`src/components/pickers/template-category/*` as the reference architecture.

Requirements:

- Create a new package at `src/components/pickers/<domain>/`
- Keep all fetch logic, selection state, derived ids, labels, and selected-item lookup inside that package
- Reuse the existing API hook from `src/lib/api/hooks/...`
- Store selected id in a dedicated TanStack Query cache key, matching the template-category pattern
- Create:
  - `index.ts`
  - `<domain>-select-picker.tsx`
  - `<domain>-card-picker.tsx`
  - `<domain>-picker-detail.tsx`
  - `_hooks/use-<domain>-picker-list.ts`
  - `_hooks/use-<domain>-picker-selection.ts`
  - `_hooks/index.ts`
  - `_utils/<domain>-label.ts`
  - `_utils/resolve-selected-<domain>-id.ts`
  - `_utils/index.ts`
  - `_consts/query-keys.ts`
  - `_consts/index.ts`
- Keep the sandbox page thin by replacing inline selection logic with imports from the new picker package
- Do not leave `useState` selection logic in the page
- Do not duplicate fetch logic across page and picker
- Preserve the current UI behavior and labels unless a small cleanup is necessary
- Prefer ASCII-only edits

Definition of done:

- The picker can be imported and rendered elsewhere without parent-managed fetch/state wiring
- The sandbox page is only a consumer of the picker components
- Shared selection works across the picker views in that package
- All new exports are wired through the package barrel
```

## Review Checklist

When reviewing a converted picker, confirm:

- the page no longer owns selected id state
- the page no longer computes `resolvedId`
- the picker hook owns fetch + derivation
- the picker selection hook owns selected id storage
- all variants read from the same picker ecosystem
- the package can be imported anywhere with a simple component import
- no domain-specific label logic is still stranded in sandbox pages

## Practical Meaning For Fixtura

If this pattern is followed, you should be able to move from:

```tsx
// page-local implementation
```

to:

```tsx
import {
  TemplateImageCardPicker,
  TemplateImagePickerDetail,
  TemplateImageSelectPicker,
} from "@/components/pickers/template-image";
```

with no parent-managed fetch setup and no parent-managed selected id state.
