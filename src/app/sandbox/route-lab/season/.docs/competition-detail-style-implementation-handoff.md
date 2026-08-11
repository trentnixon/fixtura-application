# Competition Detail Style Implementation Handoff

## Goal

Update this child route so it visually matches the parent season overview route:

`/sandbox/route-lab/season/575/competitions/18031`

Target file:

`src/app/sandbox/route-lab/season/575/competitions/18031/page.tsx`

Reference parent route:

`src/app/sandbox/route-lab/season/575/overview/page.tsx`

This is a style and structure update. Do not change the season-hub API hooks or endpoint behavior for this task.

## Current Situation

The parent overview page has been designed up into a stronger route-lab style:

- Custom breadcrumb header passed into `SeasonRouteLabFrame` via the `header` prop.
- Large `font-heading` title at `text-3xl sm:text-4xl`.
- `SectionDivider variant="labeled"` between major content blocks.
- `SectionBlock variant="inset" spacing="sm"` for grouped content.
- Summary metric surfaces with consistent `Surface` styling.
- Competition cards with `bg-primary-950` headers, white text, status badges, count tiles, and row-link footers.
- Local list controls and result/empty-state copy.

The child competition detail route is still simpler:

- Uses default `SeasonRouteLabFrame` header instead of the custom breadcrumb header.
- Uses a plain `Surface` for competition intro.
- Uses simple count tiles outside a labeled section.
- Grade cards do not match the parent card visual language.
- Status is a plain green pill instead of the parent `Badge` pattern.
- There is a commented-out grade link block that should be removed during cleanup.
- Debug payload and debug endpoint blocks are still expected because this is route lab.

## Keep Existing Data Behavior

Keep these hooks:

```tsx
const competition = useSeasonHubCompetition(ACCOUNT_ID, COMPETITION_ID, { enabled: true });
const grades = useSeasonHubCompetitionGrades(ACCOUNT_ID, COMPETITION_ID, { enabled: true });
```

Keep combined state:

```tsx
const isPending = competition.isPending || grades.isPending;
const isFetching = competition.isFetching || grades.isFetching;
const isError = competition.isError || grades.isError;
const firstError = competition.error ?? grades.error;
```

Keep endpoint scope:

```tsx
endpoints={[
  "GET /api/season-hub/575/competitions/18031",
  "GET /api/season-hub/575/competitions/18031/grades",
]}
```

Keep the existing debug payload card for now:

```tsx
<SeasonRouteLabPayloadCard
  title="Debugging: competition payload"
  payload={competitionData ?? null}
/>
```

## Imports To Add Or Adjust

The child route should import the same styling primitives as the parent where useful.

Recommended imports:

```tsx
import { Calendar, Layers, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardAction, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Surface } from "@/components/ui/container";
import { SectionBlock, SectionDivider } from "@/components/ui/section";
import { ROUTES } from "@/lib/config/routes";
import { cn } from "@/lib/utils";
```

Remove unused imports after the implementation.

## Header Requirements

Replace the default `SeasonRouteLabFrame` header with a custom `header` prop, matching the parent route structure.

Recommended header structure:

```tsx
header={
  <header className="border-border border-b pb-6">
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={ROUTES.sandbox}>Sandbox</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={ROUTES.routeLab}>Route lab</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/sandbox/route-lab/season/575/overview">Season overview</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Competition 18031</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
          Competition coverage
        </h1>
        <p className="text-muted-foreground max-w-3xl text-sm">
          Review the tracked grade, team, and fixture coverage for this competition before
          drilling into individual grades.
        </p>
      </div>
    </div>
  </header>
}
```

Use ASCII punctuation in new copy. Do not add more mojibake.

## Page Layout Requirements

Inside the loaded state, switch from:

```tsx
<div className="space-y-6">
```

to the parent pattern:

```tsx
<div className="grid gap-6">
```

Use this section order:

1. Competition summary
2. Coverage summary
3. Tracked grades
4. Debug payload

Recommended structure:

```tsx
<div className="grid gap-6">
  <SectionDivider variant="labeled" label="Competition summary" />
  <SectionBlock variant="inset" spacing="sm">...</SectionBlock>

  <SectionDivider variant="labeled" label="Coverage summary" />
  <SectionBlock variant="inset" spacing="sm">...</SectionBlock>

  <SectionDivider variant="labeled" label="Tracked grades" />
  <SectionBlock variant="inset" spacing="sm">...</SectionBlock>

  <SeasonRouteLabPayloadCard ... />
</div>
```

## Competition Summary Section

Replace the plain intro `Surface` with an inset section containing a parent-style summary card.

The summary should show:

- Competition name.
- Season.
- Association.
- Status badge.

Recommended status logic:

```tsx
const isActive = /\bactive\b/i.test(competitionStatus);
```

Recommended UI:

```tsx
<SectionBlock variant="inset" spacing="sm">
  <Card className="gap-0 overflow-hidden p-0">
    <CardHeader className="bg-primary-950 border-b border-white/15 pt-6 pb-6 text-white">
      <CardAction>
        <ShieldCheck className="size-5 text-white" aria-hidden />
      </CardAction>
      <p className="text-xl leading-none font-semibold text-white">
        {competitionData?.name ?? "Competition"}
      </p>
      <p className="text-sm text-white/80">
        {seasonLabel} - {associationName}
      </p>
    </CardHeader>
    <CardContent className="space-y-5 py-6">
      <div className="flex justify-end">
        <Badge
          className={cn(
            "border-transparent text-white hover:opacity-90",
            isActive ? "bg-success-600" : "bg-error-600",
          )}
        >
          {competitionStatus}
        </Badge>
      </div>
      <p className="text-muted-foreground text-sm">
        This competition is the current drill-down scope for grade, team, and fixture coverage.
      </p>
    </CardContent>
  </Card>
</SectionBlock>
```

If the one-card summary feels too heavy, a `Surface` is acceptable, but it should still sit inside `SectionBlock variant="inset"` and should use the same title/body/status badge rhythm as the parent.

## Coverage Summary Section

Move the three summary count tiles into a labeled `Coverage summary` section.

Use the parent overview tile style:

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
  <Surface className="flex min-h-16 items-center gap-3 py-3 shadow-none">
    <span className="text-2xl leading-none font-bold tabular-nums">{statGradeCount}</span>
    <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
      Grades
    </span>
  </Surface>
  ...
</div>
```

Use these labels and icons where helpful:

- `Grades` with `Layers`.
- `Teams` with `Users`.
- `Fixtures` with `Calendar`.

The parent overview currently uses icons inside card count tiles, not the top summary tiles. For this child route, either approach is acceptable, but keep spacing and typography aligned with the parent.

## Tracked Grades Section

Replace the existing `div className="space-y-4"` grade section with `SectionBlock variant="inset" spacing="sm"`.

Header copy should mirror the parent section style:

```tsx
<div>
  <p className="text-sm font-semibold">Tracked grades</p>
  <p className="text-muted-foreground mt-1 text-xs">
    Open a grade to confirm teams, fixtures, and fixture-level drill-downs for this competition.
  </p>
</div>
```

Add a result count line like the parent:

```tsx
<div className="flex justify-end">
  <p className="text-muted-foreground text-xs">Showing {gradeRows.length} grades</p>
</div>
```

Empty state:

```tsx
{gradeRows.length === 0 ? (
  <div>
    <p className="text-muted-foreground text-sm">
      No grades returned for this competition.
    </p>
  </div>
) : (...)}
```

## Grade Card Visual Requirements

Grade cards should look like the parent competition cards.

Use:

```tsx
<Card key={`summary-${grade.id}`} className="overflow-hidden gap-0 p-0">
```

Use parent-style header:

```tsx
<CardHeader className="bg-primary-950 border-b border-white/15 pt-6 pb-6 text-white">
  <CardAction>
    <ShieldCheck className="size-5 text-white" aria-hidden />
  </CardAction>
  <p className="text-xl leading-none font-semibold text-white">{grade.name}</p>
  <p className="text-sm text-white/80">
    Grade #{grade.id} - {grade.gender} - {grade.ageGroup}
  </p>
</CardHeader>
```

Use a `Badge` for grade status:

```tsx
const gradeIsActive = /\bactive\b/i.test(String(grade.status));
```

```tsx
<Badge
  className={cn(
    "border-transparent text-white hover:opacity-90",
    gradeIsActive ? "bg-success-600" : "bg-error-600",
  )}
>
  {grade.status}
</Badge>
```

Use parent-style count tiles:

```tsx
<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
  {(
    [
      [grade.teamCount, "Teams", Users],
      [grade.fixtureCount, "Fixtures", Calendar],
      [grade.status, "Status", ShieldCheck],
    ] as Array<[string | number, string, LucideIcon]>
  ).map(([value, label, Icon]) => (
    <Surface
      key={`${grade.id}-${label}`}
      className="bg-primary/5 ring-primary/10 flex min-h-16 items-center justify-between gap-4 py-3 shadow-none ring-1"
    >
      <div className="flex min-w-0 items-baseline gap-3">
        <span className="text-primary text-2xl leading-none font-bold tabular-nums">{value}</span>
        <span className="text-muted-foreground truncate text-sm font-semibold tracking-tight uppercase">
          {label}
        </span>
      </div>
      <Icon className="text-primary size-4 shrink-0" aria-hidden />
    </Surface>
  ))}
</div>
```

Note: `grade.status` can be long text. If the status tile looks cramped, keep the status as only a badge and use the three tiles for `Teams`, `Fixtures`, and another useful value only if available. It is acceptable to show only two count tiles plus the status badge.

Use parent-style footer:

```tsx
<CardFooter className="flex w-full min-w-0 flex-col items-stretch gap-0 border-t pt-6 pb-6">
  <SeasonRouteLabRowLink
    href={`/sandbox/route-lab/season/575/competitions/18031/grades/${grade.id}`}
    title="Open grade"
    subtitle={`Continue route for ${grade.name}.`}
  />
</CardFooter>
```

## Remove Commented Code

Remove the large commented-out `Grade links` `Surface` block. It is no longer useful for the redesigned page and makes the route harder to transport to production later.

## Copy And Encoding

The current page has mojibake separators such as the garbled middle dot in:

```tsx
{seasonLabel} ... {associationName} ... {competitionStatus}
```

New or touched copy should use ASCII separators:

```tsx
{
  seasonLabel;
}
-{ associationName } - { competitionStatus };
```

Do not perform a repo-wide encoding cleanup in this task. Keep changes local to the competition page.

## Optional Enhancements

These are optional. Do them only if the implementation remains tidy:

1. Sort `gradeRows` by grade name using `localeCompare`.
2. Add local search by grade name, gender, age group, and status using the parent route's `Input` pattern.
3. Add a status filter if there are multiple grade statuses.

If adding filters, keep them inside the `Tracked grades` `SectionBlock`, following the parent overview filter layout.

For this handoff, the required scope is style alignment. Filters are optional.

## Acceptance Criteria

The update is complete when:

1. The child route uses a custom breadcrumb header matching the parent route style.
2. The loaded page uses `grid gap-6`, labeled `SectionDivider`s, and inset `SectionBlock`s.
3. Competition summary appears as a styled summary block/card, not a loose plain surface.
4. Coverage metrics visually match the parent route's metric surfaces.
5. Grade cards visually match the parent competition card style.
6. Grade status uses `Badge` with active/non-active coloring.
7. The large commented-out grade links block is removed.
8. Existing API hooks, endpoint debug scope, and refetch behavior are preserved.
9. The debug payload card remains below user-facing content.
10. New copy avoids mojibake and uses ASCII punctuation.
11. The route passes lint.

## Verification

Run:

```powershell
npx eslint 'src/app/sandbox/route-lab/season/575/competitions/18031/page.tsx'
```

If practical, also run:

```powershell
npm run typecheck
```

Manual checks:

1. Open `/sandbox/route-lab/season/575/competitions/18031`.
2. Confirm breadcrumbs render and link back to sandbox, route lab, and season overview.
3. Confirm pending and error states still render through `SeasonRouteLabStatus`.
4. Confirm competition summary, coverage summary, tracked grades, and debug payload appear in that order.
5. Confirm grade cards use the parent route's card styling.
6. Confirm each grade footer link opens `/sandbox/route-lab/season/575/competitions/18031/grades/:gradeId`.
7. Confirm the debug refetch block still refetches both competition and grades queries.
