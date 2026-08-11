# Route Refactoring Standards

## Purpose

This document defines the standard folder structure for route refactors.

Use this structure when creating a new route or refactoring an existing one.

## Standard Route Structure

```text
/route
  /_components
  /_utils
  /_hooks
  /_types
  /_constants
  /.docs
    /handoff
    /response
    /request
  page.tsx
```

## Folder Rules

### `page.tsx`

This is the route entry file.

What goes here:

- route-level composition
- high-level layout assembly
- wiring data into components
- calling route hooks or utilities when needed

What should not go here:

- large blocks of UI markup that should be extracted into `_components`
- reusable helper logic that belongs in `_utils`
- type definitions that belong in `_types`
- static config that belongs in `_constants`

### `_components`

This folder contains route-only UI components.

What goes here:

- section components
- cards
- tables
- filters
- tab content
- form sections
- route-specific wrappers

File types that belong here:

- `.tsx` component files

Examples:

- `ResultsTable.tsx`
- `PageHeader.tsx`
- `FiltersPanel.tsx`

Rules:

- components in this folder should only support this route
- if a component is reused outside this route, move it to a shared location
- do not mix `_components` and `components` inside the same route

### `_utils`

This folder contains route-specific helper logic.

What goes here:

- formatters
- mappers
- sort helpers
- filter helpers
- transformation helpers
- route helper functions

File types that belong here:

- `.ts` utility files

Examples:

- `formatResults.ts`
- `buildTableRows.ts`
- `resolveDefaultTab.ts`

Rules:

- prefer pure functions
- do not place React components here
- do not place React hooks here

### `_hooks`

This folder contains route-specific React hooks.

What goes here:

- UI state hooks
- search param hooks
- filter state hooks
- table state hooks
- route interaction hooks

File types that belong here:

- `.ts`
- `.tsx` only if the hook truly requires JSX, which should be rare

Examples:

- `useResultsFilters.ts`
- `useSelectedTab.ts`
- `useWatchlistSort.ts`

Rules:

- hook filenames should start with `use`
- hooks should be specific to the route
- shared hooks should move out of the route folder

### `_types`

This folder contains route-specific types.

What goes here:

- TypeScript types
- interfaces
- route view models
- local payload shapes
- local prop shapes when they are large enough to separate

File types that belong here:

- `.ts` type files

Examples:

- `results.ts`
- `filters.ts`
- `table.ts`

Rules:

- only store types that are local to this route
- domain-wide types should live in shared type locations
- do not store runtime constants here

### `_constants`

This folder contains route-specific static values and configuration.

What goes here:

- tab definitions
- labels
- column definitions
- select options
- default values
- route config maps

File types that belong here:

- `.ts` constant/config files

Examples:

- `tabs.ts`
- `tableColumns.ts`
- `filterOptions.ts`

Rules:

- use this folder for fixed values, not computed helpers
- if logic is required, keep the logic in `_utils` and import constants into it

### `.docs`

This folder contains non-runtime route documentation.

Nothing in `.docs` should be required for the route to run.

What goes here:

- implementation notes
- handoff notes
- API request references
- API response references
- planning notes
- refactor notes

File types that belong here:

- `.md`
- example payload files when needed for documentation only

Rules:

- `.docs` is for humans, not runtime imports
- keep documentation structured and easy to scan
- avoid storing active app logic here

## `.docs` Subfolders

### `.docs/handoff`

Use this for communication intended for another person or team.

What goes here:

- FE handoff notes
- BE handoff notes
- QA handoff notes
- implementation summaries

Examples:

- `FE-search-behaviour-handoff.md`
- `QA-watchlist-testing-notes.md`

### `.docs/response`

Use this for documented response shapes and examples.

What goes here:

- sample API responses
- response notes
- field descriptions
- response contracts for the route

Examples:

- `search-response-example.md`
- `watchlist-response-notes.md`

### `.docs/request`

Use this for documented request shapes and examples.

What goes here:

- sample request payloads
- query param notes
- POST body examples
- input contract notes

Examples:

- `search-request-example.md`
- `filters-query-params.md`

## File Placement Guide

Use this quick rule when deciding where a file belongs:

- UI rendering file: `_components`
- helper function: `_utils`
- React hook: `_hooks`
- TypeScript type or interface: `_types`
- static config or labels: `_constants`
- human documentation: `.docs`

## Naming Rules

- use `_components`, not `components`
- use `_constants`, not `_contants`
- use clear file names based on purpose
- prefer `PascalCase.tsx` for components
- prefer `camelCase.ts` or descriptive lowercase names for utilities, hooks, constants, and types based on the existing route style

## Refactor Rules

- keep `page.tsx` thin
- extract large UI sections into `_components`
- move non-UI logic out of components when possible
- do not leave old files like `page-original.tsx` in the final route structure
- do not keep duplicate `V2` files as the long-term standard
- if a file is shared across routes, move it to a shared folder outside the route

## Refactor Goal

Every route should be easy to read, easy to navigate, and easy to maintain.

A developer should be able to open a route folder and immediately understand:

- where the UI lives
- where the logic lives
- where the hooks live
- where the types live
- where the constants live
- where the documentation lives
