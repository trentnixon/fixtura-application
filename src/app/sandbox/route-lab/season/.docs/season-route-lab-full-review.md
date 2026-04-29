# Season Route Lab Full Review

## Scope

This document reviews only the sandbox route tree at:

`src/app/sandbox/route-lab/season`

Its browser route base is:

`/sandbox/route-lab/season`

This route lab is a development sandbox for exercising the season-hub read model before the work is moved into production members routes.

The route currently focuses on one known account and known fixture path:

```ts
const ACCOUNT_ID = "575";
const COMPETITION_ID = "18031";
const GRADE_ID = "71337";
const FIXTURE_ID = "3571729";
```

These constants are sandbox fixtures. Production should replace them with route params, organisation/account scope, or user context.

## Document updates

- **2026-04-28 — Dynamic canonical grade (`grades/[gradeId]/page.tsx`)**: Rebuilt to match the competition-detail route-lab style. Custom `SeasonRouteLabFrame` header with five-step breadcrumb, **Back** + **Sync** (dual refetch: grade + fixtures). Titles and copy read from **`topLineData`** (`gradeName`, `gender`, `ageGroup`, `daysPlayed`) and **`competitionData`** (`competitionName`, `season`, `status`, `isActive`, `association`) when the API returns them, with fallbacks to older flat fields and `resolveCompetitionTitle`. Status **Badge** is hidden when status resolves to `Unknown status`. No separate grade-summary hero card. **Coverage summary** retains two metric `Surface` tiles (teams, fixtures). **Fixtures** uses the kitchen-sink **`table.grid.toolbar`** shell: search input, **Select** filters for team (home or away match), venue, date, and status (including “No status”), plus **Clear filters**; table header row **`bg-primary-950`** with light label text; columns **Date & round** (stacked: round above, readable `en-AU` date below), **Type**, **Home**, **Away**, **Venue**, **Status** (toned `Badge`: e.g. upcoming green, final/finished red, scheduled amber, cancelled red, default muted), **View Fixture** (`Button` outline `compact` + `Link`). Empty and no-match states inside the bordered grid. **Debug**: grade payload card and reversed fixtures list **below** user-facing content; endpoint scope unchanged. The fixed-ID page `grades/71337/page.tsx` is still the older minimal layout unless updated to match.

- **2026-04-28 — Dynamic canonical fixture (`grades/[gradeId]/fixtures/[fixtureId]/page.tsx`)**: Rebuilt as a **single-fixture detail** page (not a list), aligned with the grade route-lab header pattern. Custom `SeasonRouteLabFrame` **header**: six-step breadcrumb (Sandbox, Route lab, Season overview, competition, grade, current fixture), **`font-heading`** title from **`resolveFixtureHeadline`** (prefers `Home vs Away` when `fixture.teams` has named sides), optional status **Badge** (same lifecycle tones as the grade fixtures table), context line (round, human date, time, type), trailing **Back** (to grade lab) and **Sync** (refetches **both** fixture detail and grade fixtures list). Body uses **`grid gap-6`**, **`SectionDivider variant="labeled"`**, **`SectionBlock variant="inset"`**: **Match summary** card (`bg-primary-950` header, home vs away, optional score lines from `teams.*.scores`, competition and grade from `grade` when present), **Surface** tiles for round, date (prefers `fixture.dates.date`, else formatted ISO from `finalDaysPlay` / `dayOne`), type, venue; optional **PlayHQ scorecard** link from `matchDetails.urlToScoreCard`; **Grade context** block; **Teams** home/away cards when `teamsData` resolves (including **array** shape `[homeClub, awayClub]`); **Outputs** when `renderStatus` or `downloads` exist; **Context / meta** strip (`meta.generatedAt`, validation status, `context.admin`, **club** as array of names). **Debug**: full fixture payload card, inline pending/error for the sibling fixtures query, reversed grade-fixtures payload card **below** content; **`console.info` removed** (no browser console spam). **Payload normalization** lives in shared **`unwrapSeasonHubFixturePayload`** / **`extractFixtureRecord`** in `src/app/(members)/o/[accountId]/season/_components/_utils/season-fixture.ts`: peels `json`, `data`, `attributes`, supports **flattened** fixture DTOs (match fields on the same object as `teams` without a nested `fixture` key), and a one-level shallow scan for wrapped shapes; **`fixtureTeamSideLabel`** handles `teams.home` / `teams.away` as strings or `{ name }` objects; **`pickGameId`** accepts `gameId` / `gameID`. Fixed-ID fixture pages under `71337/fixtures/3571729` remain **minimal** (payload + frame) unless updated to match.

## Route Tree

Current file tree:

```text
src/app/sandbox/route-lab/season
+-- .docs
|   +-- competition-detail-style-implementation-handoff.md
|   +-- overview-card-grid-filters-implementation-guide.md
|   +-- season-route-lab-full-review.md
+-- 575
    +-- _components
    |   +-- season-route-lab-frame.tsx
    +-- overview
    |   +-- page.tsx
    +-- competitions
    |   +-- 18031
    |       +-- page.tsx
    |       +-- grades
    |           +-- 71337
    |           |   +-- page.tsx
    |           |   +-- fixtures
    |           |       +-- 3571729
    |           |           +-- page.tsx
    |           +-- [gradeId]
    |               +-- page.tsx
    |               +-- fixtures
    |                   +-- [fixtureId]
    |                       +-- page.tsx
    +-- grades
        +-- 71337
            +-- page.tsx
            +-- fixtures
                +-- 3571729
                    +-- page.tsx
```

## Browser Routes

| Sandbox route                                                                            | Page file                                                               | Purpose                                                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/sandbox/route-lab/season/575/overview`                                                 | `575/overview/page.tsx`                                                 | Overview/dashboard for account 575 season coverage. Fetches recon, stats, and competitions list.                                                                                                                                                                                                                     |
| `/sandbox/route-lab/season/575/competitions/18031`                                       | `575/competitions/18031/page.tsx`                                       | Fixed competition detail route. Fetches competition detail and grade list. UI aligned with overview (sections, cards, filters); custom header with breadcrumbs, meta-driven title/dates, trailing Back/Sync actions; grade search; debug payload below content.                                                      |
| `/sandbox/route-lab/season/575/competitions/18031/grades/71337`                          | `575/competitions/18031/grades/71337/page.tsx`                          | Fixed canonical grade detail route under competition context.                                                                                                                                                                                                                                                        |
| `/sandbox/route-lab/season/575/competitions/18031/grades/[gradeId]`                      | `575/competitions/18031/grades/[gradeId]/page.tsx`                      | Dynamic canonical grade under competition 18031: full lab UI (header driven by `topLineData` / `competitionData` when present, coverage tiles, fixtures **table** with toolbar filters, primary-950 table header, debug payloads last). Primary reference implementation for grade drill-down.                       |
| `/sandbox/route-lab/season/575/competitions/18031/grades/71337/fixtures/3571729`         | `575/competitions/18031/grades/71337/fixtures/3571729/page.tsx`         | Fixed canonical fixture detail route under competition and grade context.                                                                                                                                                                                                                                            |
| `/sandbox/route-lab/season/575/competitions/18031/grades/[gradeId]/fixtures/[fixtureId]` | `575/competitions/18031/grades/[gradeId]/fixtures/[fixtureId]/page.tsx` | Dynamic canonical fixture detail under competition 18031: grade-aligned header (six-step breadcrumb, Back/Sync), match summary card, detail tiles, grade context, teams/outputs/meta sections, debug payloads last; dual query (fixture + grade fixtures list). Uses shared `season-fixture` payload unwrap helpers. |
| `/sandbox/route-lab/season/575/grades/71337`                                             | `575/grades/71337/page.tsx`                                             | Fixed grade alias route. Omits competition context.                                                                                                                                                                                                                                                                  |
| `/sandbox/route-lab/season/575/grades/71337/fixtures/3571729`                            | `575/grades/71337/fixtures/3571729/page.tsx`                            | Fixed fixture alias route. Omits competition context.                                                                                                                                                                                                                                                                |

## Shared Frame And Debug Components

File:

`src/app/sandbox/route-lab/season/575/_components/season-route-lab-frame.tsx`

This is the local UI shell for every route in the season lab.

### `SeasonRouteLabFrame`

Responsibilities:

- Renders the page header unless a custom `header` prop is provided.
- Shows an optional `productionRoute`.
- Renders route page children.
- Renders a debugging section below the page content.
- Shows a development-only `FeedbackCardTinted` debug callout.
- Shows the endpoint strings that the route is exercising.
- Provides a debug refetch action via `onRefetch`.
- Displays fetch status with the `isFetching` prop.

Important production note:

This frame is intentionally lab-specific. Production should not copy the debug endpoint scope card or the `FeedbackCardTinted` debugging block into user-facing pages.

### `SeasonRouteLabStatus`

Responsibilities:

- Shows a spinner state when route data is pending.
- Shows a destructive/error card when route data fails.
- Returns `null` when neither pending nor error.

Production relevance:

The state pattern is useful, but the production UI should probably use app-level `ErrorState`, skeletons, or the production season components rather than this exact card.

### `SeasonRouteLabPayloadCard`

Responsibilities:

- Shows raw JSON payloads in a `pre`.
- Wrapped with a debug-only `FeedbackCardTinted`.

Production relevance:

Do not include this in production UI. It is useful only for validating API shape during development.

### `SeasonRouteLabLinkList`

Responsibilities:

- Wraps a list of navigation rows in a card.
- Displays an empty label if no children are present.

Potential issue:

The component uses `Boolean(children)` to decide whether it has rows. In React, an empty array can still be truthy, so an empty mapped list may render an empty `<ul>` instead of the empty label. Production should pass an explicit row count or render the empty state at the caller.

### `SeasonRouteLabRowLink`

Responsibilities:

- Renders a link row with title, subtitle, and a small `Open` button visual.
- Uses `Button asChild`, but the child is a `span`, not an anchor. This is inside an outer `Link`.

Potential issue:

The nested button-like visual inside a link is acceptable as a visual span, but it should remain non-interactive. Avoid nesting actual clickable controls inside production links.

## Data Layer Used By This Route

The season route lab uses the existing React Query season-hub hooks:

```ts
useSeasonHubRecon(accountId);
useSeasonHubStats(accountId);
useSeasonHubCompetitions(accountId, params);
useSeasonHubCompetition(accountId, competitionId);
useSeasonHubCompetitionGrades(accountId, competitionId);
useSeasonHubGrade(accountId, gradeId, options);
useSeasonHubGradeFixtures(accountId, gradeId, options);
useSeasonHubFixture(args, options);
```

These hooks live outside the route lab at:

`src/lib/api/hooks/season-hub`

They call:

`src/lib/api/services/season-hub.api.ts`

The service points at BFF routes under:

`/api/season-hub/:accountId`

### Fixture detail payload shape (client normalization)

The BFF returns Strapi JSON as-is. Fixture detail may arrive as `{ json: { fixture, grade, ... } }`, `{ data: { fixture, grade, ... } }`, a **flattened** `{ data: { id, teams, dates, ... } }` without a nested `fixture` key, or other single-key wrappers. The route lab and **`SeasonFixtureView`** rely on **`unwrapSeasonHubFixturePayload`** and **`extractFixtureRecord`** in:

`src/app/(members)/o/[accountId]/season/_components/_utils/season-fixture.ts`

to resolve a stable object for `fixture` (and siblings such as `grade`) before rendering. Production should keep this normalization beside the hook or tighten the BFF to one canonical shape.

## API Endpoints Exercised

Overview:

```text
GET /api/season-hub/575/recon
GET /api/season-hub/575/stats
GET /api/season-hub/575/competitions?page=1&pageSize=25
```

Competition:

```text
GET /api/season-hub/575/competitions/18031
GET /api/season-hub/575/competitions/18031/grades
```

Canonical grade:

```text
GET /api/season-hub/575/competitions/18031/grades/:gradeId
GET /api/season-hub/575/competitions/18031/grades/:gradeId/fixtures
```

Canonical fixture:

```text
GET /api/season-hub/575/competitions/18031/grades/:gradeId/fixtures/:fixtureId
GET /api/season-hub/575/competitions/18031/grades/:gradeId/fixtures
```

Grade alias:

```text
GET /api/season-hub/575/grades/71337
GET /api/season-hub/575/grades/71337/fixtures
```

Fixture alias:

```text
GET /api/season-hub/575/grades/71337/fixtures/3571729
```

## Canonical Versus Alias Routes

The route lab intentionally tests two route shapes.

Canonical shape:

```text
/season/:accountId/competitions/:competitionId/grades/:gradeId/fixtures/:fixtureId
```

Alias shape:

```text
/season/:accountId/grades/:gradeId/fixtures/:fixtureId
```

The canonical shape includes competition context. This is safer for drill-down navigation because the route is unambiguous and preserves the hierarchy:

```text
Season -> Competition -> Grade -> Fixture
```

The alias shape omits competition context. It is useful when a grade is globally resolvable within an account or when a simpler route is needed, but it may be less explicit if grade IDs are not enough context for product navigation.

Production recommendation:

Use canonical routes for primary drill-down flows. Keep alias routes only if product requirements need direct grade/fixture access without competition context.

## Page Review: Overview

File:

`src/app/sandbox/route-lab/season/575/overview/page.tsx`

### What It Does

The overview page is the season entry point for account 575. It fetches:

- Recon data for account scope and high-level counts.
- Stats data for summary counts.
- Competition list data for the tracked competition card grid.

It renders:

- Breadcrumbs back to Sandbox and Route lab.
- A page title and explanatory copy.
- A summary section with four metric tiles.
- A tracked competition section with search/status filtering.
- A card grid of competitions.
- A debug endpoint/refetch block from `SeasonRouteLabFrame`.

### Data Flow

The page calls:

```tsx
const recon = useSeasonHubRecon(ACCOUNT_ID);
const stats = useSeasonHubStats(ACCOUNT_ID);
const competitions = useSeasonHubCompetitions(ACCOUNT_ID, { page: 1, pageSize: 25 });
```

Pending state is combined:

```tsx
const isPending = recon.isPending || stats.isPending || competitions.isPending;
```

Error state is combined:

```tsx
const isError = recon.isError || stats.isError || competitions.isError;
const firstError = recon.error ?? stats.error ?? competitions.error;
```

Fetching state is combined for debug refetch status:

```tsx
const isFetching = recon.isFetching || stats.isFetching || competitions.isFetching;
```

### Sorting And Filters

Competition rows are sorted by name:

```tsx
[...(competitions.data?.data ?? [])].sort((a, b) =>
  (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" }),
);
```

Current local filters:

```tsx
const [searchQuery, setSearchQuery] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
```

Search matches:

- Competition name.
- Season label.
- Association name.
- Status label.

Status options are derived from returned rows.

This is a good local-filter start, but the separate guide in this folder recommends expanding it to season, association, and coverage filters before production if the grid remains card-based.

### Current UI Behavior

If there are no competitions at all:

```text
No competitions are currently being tracked for account 575.
```

If competitions exist but the filters remove all matches:

```text
No competitions match the current filters.
```

Cards show:

- Competition name.
- Season and association.
- Status badge.
- Counts for grades, teams, and fixtures.
- A row link to competition coverage.

### Important Production Concerns

The card footer link is hard-coded:

```tsx
href = "/sandbox/route-lab/season/575/competitions/18031";
```

This means every competition card currently opens competition `18031`, regardless of the actual `competition.id`. This is acceptable for a sandbox spike but must be fixed before production.

Production should use:

```tsx
href={`${accountScopedRoutes.season(accountId)}/competitions/${competition.id}`}
```

or equivalent route helper logic.

The page also contains mojibake characters, for example the garbled separator currently visible in strings that should render as a middle dot. These should be cleaned before production.

## Page Review: Competition Detail

File:

`src/app/sandbox/route-lab/season/575/competitions/18031/page.tsx`

Related implementation handoff:

`src/app/sandbox/route-lab/season/.docs/competition-detail-style-implementation-handoff.md`

### What It Does

This page tests the fixed competition route for competition 18031.

It fetches:

```tsx
const competition = useSeasonHubCompetition(ACCOUNT_ID, COMPETITION_ID, { enabled: true });
const grades = useSeasonHubCompetitionGrades(ACCOUNT_ID, COMPETITION_ID, { enabled: true });
```

It renders:

- A custom `SeasonRouteLabFrame` header: breadcrumbs (Sandbox, Route lab, Season overview, current page), then the `page.header.actions.trailing` layout from the kitchen sink (title and competition context on the left; **Back** to season overview and **Sync** to refetch both queries on the right).
- Page title and breadcrumb current item from competition payload via `extractCompetitionTitle` / `resolveCompetitionTitle` in `src/app/(members)/o/[accountId]/season/_components/_utils/season-competition.ts` (includes `meta.name` and other nested shapes), with fallback to `competition.name` on grade rows when needed.
- Header context from API **`meta`** and **`association`**: subtitle line `meta.season` and `association.name`; **Season dates** from `meta.timeframe.start` / `end` rendered in readable **en-AU** short date form (not raw `YYYY-MM-DD`); status **`Badge`** prefers `meta.isActive` when boolean, else active/non-active styling from status text.
- **Coverage summary**: labeled `SectionDivider` + inset `SectionBlock`, parent-style metric `Surface` tiles (grades, teams, fixtures) with icons.
- **Tracked grades**: labeled section, result count, **search** input (filters by name, gender, age group, status), parent-style grade `Card` grid (`bg-primary-950` headers, `Badge` for status, count tiles, `SeasonRouteLabRowLink` footers), empty and no-match copy.
- **Debug**: `SeasonRouteLabPayloadCard` for raw competition payload and the frame’s debug refetch scope (unchanged lab behavior).

Intentionally **not** on this page anymore: a separate “Competition summary” hero card, a “Competition details” tile section, and external PlayHQ links. Competition context lives in the header and coverage/grades sections.

Shared title helper note: `extractCompetitionTitle` also inspects `meta` so production `SeasonCompetitionDetail` and this lab stay consistent when the CMS nests the display name under `meta`.

### Style Status

This child route is **aligned** with the parent overview route’s visual system for headers (breadcrumbs + large title), labeled sections, inset blocks, metric surfaces, and competition-style grade cards. Hook usage, endpoint scope, combined pending/error state, and refetch behavior match the handoff constraints.

### Grade Normalization

The grades response is typed loosely as `Record<string, unknown>[]`, so this page manually maps each grade row into a safer local shape:

```tsx
{
  id: String(parsed.id ?? `unknown-${index}`),
  name: parsed.name ?? "Unnamed grade",
  gender: parsed.gender ?? "Unknown gender",
  ageGroup: parsed.ageGroup ?? "Unknown age group",
  teamCount: parsed.counts?.teams ?? 0,
  fixtureCount: parsed.counts?.fixtures ?? 0,
  status: parsed.competition?.status ?? competitionStatus,
  competitionName:
    typeof parsed.competition?.name === "string" && parsed.competition.name.trim().length > 0
      ? parsed.competition.name.trim()
      : undefined,
}
```

`competitionStatus` for the page and grade fallbacks prefers `meta.status` from the competition detail payload when present.

This is a useful production migration clue: the grade list DTO needs to be tightened before or during production transport.

### Aggregate Count Logic

The page computes counts from grade rows and falls back to competition detail counts:

```tsx
const statGradeCount = gradeCountFromRows || gradeCount;
const statTeamCount = teamCountFromRows || teamCount;
const statFixtureCount = fixtureCountFromRows || fixtureCount;
```

Potential issue:

Using `||` treats zero as "use fallback". That is okay when fallback is from a trusted summary, but it can hide a legitimate zero from row-level data. Production should decide which source is canonical and use nullish coalescing or explicit fallback rules.

### Navigation

Each grade summary card links to:

```text
/sandbox/route-lab/season/575/competitions/18031/grades/:gradeId
```

Production should generate this from account, competition, and grade route params.

## Page Review: Fixed Canonical Grade

File:

`src/app/sandbox/route-lab/season/575/competitions/18031/grades/71337/page.tsx`

### What It Does

This page tests fixed grade `71337` under fixed competition `18031`.

It fetches:

```tsx
const grade = useSeasonHubGrade(ACCOUNT_ID, GRADE_ID, {
  competitionId: COMPETITION_ID,
  enabled: true,
});

const fixtures = useSeasonHubGradeFixtures(ACCOUNT_ID, GRADE_ID, {
  competitionId: COMPETITION_ID,
  enabled: true,
});
```

It still renders a **minimal** lab layout: default frame header, raw grade payload, `SeasonRouteLabLinkList` of fixtures, reversed fixtures debug card. It does **not** yet mirror the dynamic `[gradeId]` page (breadcrumbs, table, filters). Prefer **`grades/[gradeId]/page.tsx`** for the current product-facing lab design; update this file or re-export when parity is needed.

### Production Route Hint

The page computes:

```tsx
productionRoute={`${accountScopedRoutes.season(ACCOUNT_ID)}/competitions/${COMPETITION_ID}/grades/${GRADE_ID}`}
```

This points to:

```text
/o/575/season/competitions/18031/grades/71337
```

That is likely the intended production equivalent.

## Page Review: Dynamic Canonical Grade

File:

`src/app/sandbox/route-lab/season/575/competitions/18031/grades/[gradeId]/page.tsx`

### What It Does

This page exercises **dynamic** grade IDs under fixed competition `18031` (e.g. `/grades/71340`). It is the **canonical** grade drill-down implementation in the lab.

**Routing and hooks**

```tsx
const params = useParams<{ gradeId: string }>();
const gradeId = String(params.gradeId ?? "");

const grade = useSeasonHubGrade(ACCOUNT_ID, gradeId, {
  competitionId: COMPETITION_ID,
  enabled: Boolean(gradeId),
});
const fixtures = useSeasonHubGradeFixtures(ACCOUNT_ID, gradeId, {
  competitionId: COMPETITION_ID,
  enabled: Boolean(gradeId),
});
```

Combined `isPending` / `isError` / `isFetching` and `onRefetch` refresh **both** queries. Endpoint scope strings remain the canonical grade + fixtures paths with `:gradeId` placeholders in the lab card.

**Header (custom `SeasonRouteLabFrame` `header`)**

- Breadcrumb: Sandbox → Route lab → Season overview → **competition** (link to `/competitions/18031`) → current grade.
- Competition crumb label: `competitionData.competitionName` when present, else `resolveCompetitionTitle(gradeRaw, "18031")`.
- Page / crumb title and `h1`: `topLineData.gradeName`, else root `name`, else `Grade ${gradeId}`.
- Context line: `competitionData.season` and `competitionData.association.name` (fallbacks: `meta`, root `association`).
- Second line when present: `topLineData` **gender**, **ageGroup**, **daysPlayed** (joined with `-`).
- Status **Badge**: `competitionData.status`; active styling prefers `competitionData.isActive` when boolean. Badge omitted when status is still the literal fallback `Unknown status`.
- Trailing **Back** (to competition lab) and **Sync** (refetch both).

**Main content (`grid gap-6`)**

1. **Coverage summary** — labeled `SectionDivider` + inset `SectionBlock`; two metric `Surface` tiles (Teams, Fixtures) using payload `counts` when present, else fixture list length for fixtures.
2. **Fixtures** — labeled section; intro line only (no long hero blurb). Inner shell matches kitchen-sink **`table.grid.toolbar`**: bordered card, muted toolbar band with search + “Showing _x_ of _y_”, then a responsive grid of **Select** filters (team, venue, date, status) and **Clear filters**. Fixture rows are a **Table** (not cards): header row `bg-primary-950` / `text-white/90`; body columns as implemented in code (stacked round + readable date, type, teams, venue, status badges, **View Fixture** button).
3. **Debug** — `SeasonRouteLabPayloadCard` for grade JSON, then reversed fixtures array for lab ordering checks.

**Filtering**

- Free-text search matches a concatenation of team names, round, date, status, type, venue, id (case-insensitive substring).
- Dropdowns restrict rows: team must appear as home **or** away; venue, date (raw string equality), and status (dedicated empty value for “No status”) must match.

**Production note**

Reversed fixtures payload and raw JSON cards are **lab-only**. Production should drop them and keep the table + filter pattern if useful.

### Debug Behavior

The reversed fixture payload is specifically for lab debugging:

```tsx
const fixturesReversed = [...fixtureRows].reverse();
```

Production should not ship this debug payload.

## Page Review: Fixed Grade Alias

File:

`src/app/sandbox/route-lab/season/575/grades/71337/page.tsx`

### What It Does

This page tests the grade alias route that omits competition context.

It fetches:

```tsx
const grade = useSeasonHubGrade(ACCOUNT_ID, GRADE_ID, { enabled: true });
const fixtures = useSeasonHubGradeFixtures(ACCOUNT_ID, GRADE_ID, { enabled: true });
```

Because no `competitionId` is passed, the hooks call alias API endpoints:

```text
GET /api/season-hub/575/grades/71337
GET /api/season-hub/575/grades/71337/fixtures
```

### Production Route Hint

The page computes:

```text
/o/575/season/grades/71337
```

This may be useful as a shortcut route, but canonical grade routes are safer as the primary navigation path.

## Page Review: Fixed Fixture Alias

File:

`src/app/sandbox/route-lab/season/575/grades/71337/fixtures/3571729/page.tsx`

### What It Does

This page tests fixture detail lookup through the alias route.

It fetches:

```tsx
const fixture = useSeasonHubFixture(
  { accountId: ACCOUNT_ID, gradeId: GRADE_ID, fixtureId: FIXTURE_ID },
  { enabled: true },
);
```

Because no `competitionId` is included, the hook calls:

```text
GET /api/season-hub/575/grades/71337/fixtures/3571729
```

It renders only the raw fixture payload and route debug blocks.

## Page Review: Fixed Canonical Fixture

File:

`src/app/sandbox/route-lab/season/575/competitions/18031/grades/71337/fixtures/3571729/page.tsx`

### What It Does

This page tests fixture detail lookup through the canonical route.

It fetches:

```tsx
const fixture = useSeasonHubFixture(
  {
    accountId: ACCOUNT_ID,
    competitionId: COMPETITION_ID,
    gradeId: GRADE_ID,
    fixtureId: FIXTURE_ID,
  },
  { enabled: true },
);
```

Because `competitionId` is included, the hook calls:

```text
GET /api/season-hub/575/competitions/18031/grades/71337/fixtures/3571729
```

It renders only the raw fixture payload and route debug blocks.

## Page Review: Dynamic Canonical Fixture

File:

`src/app/sandbox/route-lab/season/575/competitions/18031/grades/[gradeId]/fixtures/[fixtureId]/page.tsx`

### What It Does

This page is the **canonical** dynamic fixture drill-down under fixed competition `18031`. It is a **detail** view (one match), not a filtered list.

**Routing and hooks**

```tsx
const params = useParams<{ gradeId: string; fixtureId: string }>();
const gradeId = String(params.gradeId ?? "");
const fixtureId = String(params.fixtureId ?? "");

const fixture = useSeasonHubFixture(
  {
    accountId: ACCOUNT_ID,
    competitionId: COMPETITION_ID,
    gradeId,
    fixtureId,
  },
  { enabled: Boolean(gradeId && fixtureId) },
);
const gradeFixtures = useSeasonHubGradeFixtures(ACCOUNT_ID, gradeId, {
  competitionId: COMPETITION_ID,
  enabled: Boolean(gradeId),
});
```

Combined **`isFetching`** and frame **`onRefetch`** refresh **both** queries. Endpoint scope strings are unchanged (canonical fixture + grade fixtures list).

**Payload handling**

- Raw `fixture.data` is normalized with **`unwrapSeasonHubFixturePayload`** (see **Fixture detail payload shape** under Data Layer).
- **`extractFixtureRecord`** returns the inner `fixture` object when present, or the **flattened** match object when the API puts `teams`, `dates`, etc. on the same record as `id` / `gameID`.
- Team labels use **`fixtureTeamSideLabel`** (string or `{ name }`). Headline uses **`resolveFixtureHeadline`** (home vs away when both names exist).
- Dates: prefer **`fixture.dates.date`**, then format **`finalDaysPlay`** / **`dayOne`** / top-level `date`; header can include **`dates.time`**.

**Header (custom `SeasonRouteLabFrame` `header`)**

- Breadcrumb: Sandbox to Route lab to Season overview to **competition** (lab link) to **grade** (lab link) to current fixture (**`BreadcrumbPage`**).
- **`h1`**: resolved headline; optional inline status **Badge** when `fixture.status` is non-empty.
- Context line: round, date, time, type (ASCII `-` separators).
- Trailing **Back** (grade lab URL) and **Sync** (dual refetch, spinner while fetching).

**Main content (`grid gap-6`)**

1. **Match summary** — labeled section; **`Card`** with **`bg-primary-950`** header (home vs away, optional score lines from **`teams.*.scores`**, subtitle from **`grade.competition`** and **`grade.gradeName`** when available); body with status **Badge**, optional **PlayHQ** link from **`matchDetails.urlToScoreCard`**, short lab copy.
2. **Match details** — same inset block: parent-style icon **`Surface`** tiles for round, date, type, venue; optional **`gameId` / `gameID`** line.
3. **Grade context** — grade name, gender/age when present, association, **Back to grade** button.
4. **Teams** — when **`teamsData`** parses to home/away (objects or **array** of two club rows), two **`Card`** columns with **`bg-primary-950`** headers and player lists when present; else fallback **Surface** pointing at the debug payload.
5. **Outputs** — when **`renderStatus`** and/or **`downloads`** warrant it (e.g. render queue counts, download links).
6. **Context / meta** — optional strip: **`meta.generatedAt`**, validation **`status`**, **`context.admin`** timestamps, **`club`** names when **`club`** is an array.

**Debug (lab-only)**

- **`SeasonRouteLabPayloadCard`** with full **`fixture.data`** (raw envelope; useful to confirm Strapi shape).
- Inline pending/error for **`gradeFixtures`** when the list query fails or loads.
- Reversed **`gradeFixtures.data`** array in a second payload card (lab ordering check).
- **No** `console.info` for reversed rows (removed; on-screen card is sufficient).

### Status Handling Detail

Primary **`SeasonRouteLabStatus`** is driven only by the **fixture detail** query (`isPending` / `isError`). The **grade fixtures** query uses inline messaging next to the debug cards. Production should drop the secondary list unless sibling navigation or validation requires it.

### Style Status

This route is **aligned** with the dynamic grade lab route for breadcrumbs, header actions, labeled sections, inset blocks, primary-950 cards, and toned status badges. **Fixed** canonical/alias fixture pages may still be **minimal** until brought to parity.

## Production Transfer Map

The route lab currently points to intended production routes using:

`accountScopedRoutes.season(accountId)`

That helper produces:

```text
/o/:accountId/season
```

Recommended production route equivalents:

| Sandbox route                                                                                   | Production candidate                                                                       |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `/sandbox/route-lab/season/575/overview`                                                        | `/o/:accountId/season`                                                                     |
| `/sandbox/route-lab/season/575/competitions/:competitionId`                                     | `/o/:accountId/season/competitions/:competitionId`                                         |
| `/sandbox/route-lab/season/575/competitions/:competitionId/grades/:gradeId`                     | `/o/:accountId/season/competitions/:competitionId/grades/:gradeId`                         |
| `/sandbox/route-lab/season/575/competitions/:competitionId/grades/:gradeId/fixtures/:fixtureId` | `/o/:accountId/season/competitions/:competitionId/grades/:gradeId/fixtures/:fixtureId`     |
| `/sandbox/route-lab/season/575/grades/:gradeId`                                                 | `/o/:accountId/season/grades/:gradeId` if alias route remains required                     |
| `/sandbox/route-lab/season/575/grades/:gradeId/fixtures/:fixtureId`                             | `/o/:accountId/season/grades/:gradeId/fixtures/:fixtureId` if alias route remains required |

## What Is Reusable For Production

Reusable concepts:

- Season overview loads recon, stats, and competitions in parallel.
- Competition detail loads competition detail and grade list in parallel.
- The competition detail route (`575/competitions/18031/page.tsx`) matches the overview route’s section/card/header patterns; see `competition-detail-style-implementation-handoff.md` for the original spec and the Page Review section above for the current behavior.
- Grade detail loads grade detail and fixture list in parallel.
- Fixture detail loads fixture detail by canonical or alias route.
- React Query hooks already encapsulate canonical-versus-alias endpoint selection.
- `accountScopedRoutes.season(accountId)` already gives the production route base.
- The overview card grid can be adapted into production UI once hard-coded IDs are removed.
- Local filtering on the overview list is safe because the page currently fetches a bounded first page of competitions.

Reusable code with caution:

- The metric tiles and cards can inform production UI, but should be moved into production components rather than imported from the route lab.
- The competition detail layout (header actions, coverage tiles, grade cards, search) can inform the production competition-detail baseline after hard-coded IDs and debug blocks are removed.
- The grade normalization logic is useful as a temporary adapter, but proper DTO typing is better.
- **`unwrapSeasonHubFixturePayload` / `extractFixtureRecord`** in `season-fixture.ts` are useful until the BFF exposes a single fixture-detail shape; port or replace when the API contract is fixed.
- The loading/error composition pattern is useful, but production should use standard app states.

Not reusable as-is:

- `SeasonRouteLabFrame` debugging section.
- `SeasonRouteLabPayloadCard`.
- Hard-coded IDs.
- Hard-coded sandbox hrefs.
- Debug `console.info` (removed from dynamic canonical fixture; avoid reintroducing console noise in lab routes).
- Reversed fixture debug payloads.
- Mojibake copy such as garbled middle-dot, arrow, and ellipsis characters.

## Key Risks Before Production

1. Hard-coded navigation from overview cards currently always opens competition `18031`.
2. Account ID, competition ID, grade ID, and fixture ID are hard-coded in fixed route files.
3. Competition ID is still fixed to `18031` in dynamic grade and fixture canonical routes.
4. Some lab detail routes still show raw JSON only (e.g. fixed-ID fixture pages); the **dynamic canonical fixture** route now has structured UI plus debug cards.
5. Grade list DTO is currently loose (`Record<string, unknown>[]`) and manually parsed.
6. Some empty list handling depends on `Boolean(children)`, which is not reliable for empty arrays.
7. Debug UI and endpoint cards are rendered on every route through `SeasonRouteLabFrame`.
8. Mojibake text should be cleaned before transport.
9. No local tests exist for this route tree.
10. Overview pagination is fixed to `pageSize: 25`; production should decide whether to paginate, fetch all, or server-filter.
11. Competition detail styling is implemented in the route lab; production transport still requires removing debug UI, parameterized routes, and DTO hardening before calling it production-ready.

## Suggested Production Migration Steps

1. Create production dynamic route files under `src/app/(members)/o/[accountId]/season`.
2. Replace all route-lab constants with params from the production route segment.
3. Keep canonical routes as the primary user navigation path.
4. Decide whether alias routes are product requirements or only debugging conveniences.
5. Move user-facing overview/competition/grade/fixture UI into production components.
6. Keep React Query hooks and API service usage; do not duplicate API request code in pages.
7. Replace `SeasonRouteLabFrame` with production layout/shell components.
8. Remove raw payload cards and endpoint debug scope blocks.
9. Fix overview competition links to use each row's `competition.id`.
10. Port the implemented competition-detail patterns from the route lab into production components (do not depend on lab-only frames or debug cards).
11. Tighten TypeScript DTOs for competition detail and grade list responses.
12. Add empty/loading/error states using production UI patterns.
13. Clean mojibake copy.
14. Add tests for route param handling and query enablement.
15. Run lint and typecheck after the route move.

## Suggested Production Component Breakdown

Potential production component shape:

```text
season/
+-- _components
|   +-- season-overview.tsx
|   +-- season-summary-tiles.tsx
|   +-- season-competition-grid.tsx
|   +-- season-competition-card.tsx
|   +-- season-competition-detail.tsx
|   +-- season-grade-detail.tsx
|   +-- season-fixture-detail.tsx
|   +-- season-loading-states.tsx
+-- page.tsx
+-- competitions/[competitionId]/page.tsx
+-- competitions/[competitionId]/grades/[gradeId]/page.tsx
+-- competitions/[competitionId]/grades/[gradeId]/fixtures/[fixtureId]/page.tsx
```

Keep route files thin. They should parse params and render components. Components should own hook calls and user-facing rendering, or hook calls can be lifted into route-level client wrappers depending on the production app pattern.

## Verification Checklist For This Lab Route

Manual route checks:

1. Open `/sandbox/route-lab/season/575/overview`.
2. Confirm recon, stats, and competition list load.
3. Confirm overview search and status filter work.
4. Open a competition card and confirm it reaches `/sandbox/route-lab/season/575/competitions/18031`.
5. Confirm competition detail loads coverage tiles, grade search/cards, header Back/Sync, and formatted season dates when `meta` is present.
6. Open a grade card and confirm fixture links load.
7. Open the fixed canonical grade route.
8. Open the dynamic canonical grade route.
9. Open the fixed canonical fixture route.
10. Open the dynamic canonical fixture route; confirm match summary, tiles, grade context, teams or fallback, debug payloads, and dual-query Sync.
11. Open the alias grade route.
12. Open the alias fixture route.
13. Use the debug refetch action on at least one route.

Suggested commands:

```powershell
npx eslint 'src/app/sandbox/route-lab/season/575/overview/page.tsx'
npx eslint 'src/app/sandbox/route-lab/season/575/competitions/18031/page.tsx'
npx eslint 'src/app/sandbox/route-lab/season/575/competitions/18031/grades/[gradeId]/page.tsx'
npx eslint 'src/app/sandbox/route-lab/season/575/competitions/18031/grades/[gradeId]/fixtures/[fixtureId]/page.tsx'
npm run typecheck
```

## Bottom Line

This route lab is a good integration proving ground for the production season experience. The real value is the validated data flow through the season-hub hooks:

```text
recon -> stats -> competitions -> competition detail -> grades -> fixtures -> fixture detail
```

The lab also clarifies the route decision production needs to make:

```text
canonical competition-based drill-down as primary
alias grade/fixture routes as optional shortcuts
```

Before production transport, remove debug-only rendering, replace hard-coded IDs with route/account params, fix hard-coded links, tighten DTOs, and convert raw payload views into proper user-facing season UI.
