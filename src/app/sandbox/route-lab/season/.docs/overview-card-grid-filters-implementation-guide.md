# Overview Card Grid Filters Implementation Guide

## Goal

Add local filters to the card grid on:

`/sandbox/route-lab/season/575/overview`

Target file:

`src/app/sandbox/route-lab/season/575/overview/page.tsx`

The page already fetches competitions with:

```tsx
const competitions = useSeasonHubCompetitions(ACCOUNT_ID, { page: 1, pageSize: 25 });
```

Filtering should be client-side only. Do not change API hooks, route definitions, or BFF endpoints for this task.

## Existing Data Shape

Each card is rendered from `SeasonHubCompetitionListItem` fields:

```ts
competition.id;
competition.name;
competition.season;
competition.status;
competition.association.name;
competition.counts.grades;
competition.counts.teams;
competition.counts.fixtures;
```

Use these fields for search and filters.

## Component Library Choices

Use existing UI components from the component library:

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
```

Do not introduce a new filter component unless the page becomes too large. A local toolbar in `page.tsx` is preferred for this pass.

The repo also has `SearchableCombobox`, but it is better suited to long option lists. For this route-lab grid, `Input` plus `Select` controls are simpler and consistent with the current page.

## Recommended Filters

Add these filters above the card grid, inside the existing `SectionBlock` for "Tracked Competitions":

1. Search input
2. Status select
3. Season select
4. Association select
5. Coverage select

Suggested state:

```tsx
const [searchQuery, setSearchQuery] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
const [seasonFilter, setSeasonFilter] = useState("all");
const [associationFilter, setAssociationFilter] = useState("all");
const [coverageFilter, setCoverageFilter] = useState("all");
```

Suggested coverage values:

```ts
"all";
"has-fixtures";
"no-fixtures";
"has-grades";
"no-grades";
```

## Derive Options Locally

Use `useMemo` to derive unique options from `sortedCompetitionRows`.

Normalize missing labels so selects stay stable:

```tsx
const seasonLabel = competition.season ?? "No season";
const associationLabel = competition.association.name ?? "Association";
const statusLabel = competition.status ?? "Unknown";
```

Option lists should be alphabetized with `localeCompare` and base sensitivity.

## Filtering Logic

Create `filteredCompetitionRows` with `useMemo`.

Search should match across:

```ts
competition.name;
competition.season;
competition.association.name;
competition.status;
```

Recommended search normalization:

```tsx
const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
```

A row matches search when any searchable field includes `normalizedSearch`.

For select filters:

```tsx
statusFilter === "all" || statusLabel === statusFilter;
seasonFilter === "all" || seasonLabel === seasonFilter;
associationFilter === "all" || associationLabel === associationFilter;
```

Coverage filter logic:

```tsx
switch (coverageFilter) {
  case "has-fixtures":
    return competition.counts.fixtures > 0;
  case "no-fixtures":
    return competition.counts.fixtures === 0;
  case "has-grades":
    return competition.counts.grades > 0;
  case "no-grades":
    return competition.counts.grades === 0;
  default:
    return true;
}
```

Apply search, select filters, and coverage together with `&&`.

## UI Placement

Keep the existing heading copy, then render a filter toolbar before the empty/grid branch.

Suggested structure:

```tsx
<div className="grid gap-3 rounded-2xl border bg-white/60 p-4 shadow-xs lg:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(150px,auto))]">
  <Input ... />
  <Select ... />
  <Select ... />
  <Select ... />
  <Select ... />
</div>
```

Use responsive behavior that works on mobile. It is fine if all controls stack at small widths.

Add a small result count line:

```tsx
Showing {filteredCompetitionRows.length} of {sortedCompetitionRows.length} competitions
```

Only show the clear button when any filter is active:

```tsx
const hasActiveFilters =
  searchQuery.trim().length > 0 ||
  statusFilter !== "all" ||
  seasonFilter !== "all" ||
  associationFilter !== "all" ||
  coverageFilter !== "all";
```

Clear should reset all filter state to defaults.

## Empty States

Preserve the existing empty state for no competitions tracked:

```tsx
sortedCompetitionRows.length === 0;
```

Add a filtered empty state when data exists but no row matches:

```tsx
sortedCompetitionRows.length > 0 && filteredCompetitionRows.length === 0;
```

Suggested copy:

```text
No competitions match the current filters.
```

Include a clear filters button in the filtered empty state.

## Card Rendering Change

Change the grid mapping from:

```tsx
{sortedCompetitionRows.map((competition) => {
```

to:

```tsx
{filteredCompetitionRows.map((competition) => {
```

Do not change the card visual design unless needed for spacing.

## Important Existing Issue

This file currently contains mojibake in a few text strings, for example `Â·`.

Do not do a broad text cleanup as part of this task unless explicitly requested. Keep this change focused on filters.

## Verification

Run lint on the changed file:

```powershell
npx eslint 'src/app/sandbox/route-lab/season/575/overview/page.tsx'
```

Run typecheck if practical:

```powershell
npm run typecheck
```

Manual checks:

1. Open `/sandbox/route-lab/season/575/overview`.
2. Search by part of a competition name.
3. Search by association name.
4. Filter by status.
5. Filter by season.
6. Filter by association.
7. Filter by coverage.
8. Combine search plus at least one select filter.
9. Clear filters.
10. Confirm card links still work.

## Acceptance Criteria

The implementation is complete when:

1. The grid can be searched by name, season, association, and status.
2. The grid can be filtered by status, season, association, and coverage.
3. Filter options are derived from the returned competition rows.
4. Empty states distinguish no tracked competitions from no matching filter results.
5. The clear filters action resets all filter state.
6. Existing card visuals and links are preserved.
7. The changed file passes lint.
