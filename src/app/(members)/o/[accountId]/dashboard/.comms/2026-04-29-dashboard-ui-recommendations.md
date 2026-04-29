# Dashboard UI Research and Recommendations

Route reviewed: `/o/575/dashboard`

Source route: `src/app/(members)/o/[accountId]/dashboard/page.tsx`

## Current State

The dashboard route is currently a development visibility surface. It renders a page title, short explanatory copy, and `TempOrgDataDump`, which streams these existing account-scoped API payloads:

- Phase 1: `GET /api/account/me`
- Phase 2: `GET /api/accounts/:id/settings`
- Phase 3: `GET /api/accounts/:id/branding`
- Phase 4: `GET /api/accounts/:id/organisation`
- Phase 9: `GET /api/accounts/:id/analytics/overview`
- Legacy hub: `GET /api/account/organisation/:id`

The route sits behind `OrgAccessBoundary` via `src/app/(members)/o/[accountId]/layout.tsx`, so the placeholder dashboard can assume the scoped account is valid unless a hook returns a gateway redirect marker.

## Data Available Now

### Phase 1: Account Bootstrap

Type source: `AccountMeResponse`, `AccountMePayload`, `AccountSummary`

Useful display fields:

- `data.user.username`
- `data.user.email`
- `data.user.role.name`
- `data.accountId`
- `data.accounts[]`
- account row fields: `FirstName`, `LastName`, `DeliveryAddress`, `isActive`, `isSetup`, `hasCompletedOnboardingWizard`, `Sport`, `account_type`, `templateOptionId`
- `accountOrganisationDetails`: `Name`, `Sport`, `ParentLogo`, `href`, `PlayHQID`

Recommended UI:

- Use this mostly for a small "Signed in as" or "Account access" row, not as the main dashboard source.
- If multiple accounts are returned, show a compact access summary: current account plus count of available accounts.
- Avoid surfacing full `accounts[]` on the dashboard unless it becomes an account-switcher feature.

### Phase 2: Account Settings

Type source: `AccountSettingsResponse`, `AccountSettingsData`

Useful display fields:

- identity/contact: `FirstName`, `LastName`, `DeliveryAddress`
- lifecycle: `isActive`, `isSetup`, `isUpdating`, `hasCompletedStartSequence`
- permissions: `isRightsHolder`, `isPermissionGiven`
- preferences: `group_assets_by`, `include_junior_surnames`
- account details: `Sport`, `account_type`, `hasCustomTemplate`, `onboardingOrganisationName`

Recommended UI:

- "Account status" tile group: Active, Setup complete, Updating, Permission given.
- "Contact and delivery" detail list.
- "Content preferences" small setting rows for asset grouping and junior surnames.
- Use badges for booleans instead of raw `true` / `false`.

### Phase 3: Branding

Type source: `AccountBrandingResponse`, `AccountBrandingData`

Useful display fields:

- `template.name`
- `template.frontEndName`
- `template.category`
- `template.variation`
- `template.requiresMedia`
- `theme.name`
- `theme.theme`
- `theme.isPublic`
- `templateOptionId`
- `onboardingLogo`
- template media: `poster`, `video`, `gallery`

Recommended UI:

- "Branding snapshot" section with template, theme, and logo.
- If `theme.theme` exposes color tokens, show small swatches for known keys such as `primary`, `secondary`, `dark`, and `white`.
- Use the logo or template poster as a visual preview when available; otherwise use initials or a muted placeholder.
- Treat `template_option` as a future detail drawer or diagnostic summary. It is likely too dense for the first dashboard pass.

### Phase 4: Organisation Context

Type source: `AccountOrganisationContextResponse`, `AccountOrganisationContextData`

Useful display fields:

- `id`
- `account_type`
- `accountOrganisationDetails.Name`
- `accountOrganisationDetails.Sport`
- `accountOrganisationDetails.ParentLogo`
- `accountOrganisationDetails.href`
- `accountOrganisationDetails.PlayHQID`

Recommended UI:

- Make this the primary dashboard identity block.
- Show organisation name, sport, account type, and logo.
- Provide a simple external link row for `href` if present.
- For association-style accounts, show `PlayHQID` as compact metadata.

### Phase 9: Analytics Overview

Type source: `AccountAnalyticsOverviewResponse`

Useful display fields:

- `meta.from`, `meta.to`, `meta.timezone`, `meta.computedAt`, `meta.staleness`, `meta.totalRendersInRange`
- `data.rollup.totalRenders`
- `data.rollup.totalCompleteRenders`
- `data.rollup.totalProcessingRenders`
- `data.rollup.totalDownloads`
- `data.rollup.totalEmailsSent`
- `data.rollup.totalGameResults`
- `data.rollup.totalUpcomingGames`
- `data.rollup.totalGrades`
- `data.rollup.totalAiArticles`
- `data.metricsAsPercentageOfCost.percentageCompleteRenders`
- `data.metricsAsPercentageOfCost.valuePerRender`
- `data.metricsAsPercentageOfCost.averageCostPerDigitalAsset`
- `data.series[]`

Recommended UI:

- This should become the main "dashboard" data.
- Start with KPI tiles for renders, completed renders, downloads, emails sent, and AI articles.
- Add a small "date window" meta row using `meta.from` and `meta.to`.
- Add a simple trend placeholder for `series[]`. For the first pass, a compact table or sparkline-style bar list is enough.
- Avoid overcommitting to chart components until the business meaning of each KPI is validated.

### Legacy Hub

Type source: `OrganisationAccountDetailsResponse`, `OrganisationAccountDetailsData`

Useful display fields:

- `scheduler`
- `render_token`
- `theme`
- `renders`
- `rollup`
- `metricsOverTime`
- `metricsAsPercentageOfCost`
- `accountOrganisationDetails`

Recommended UI:

- Keep the legacy hub as a fallback/debug-only source.
- Do not build new dashboard UI primarily from this payload where phase-specific endpoints already exist.
- Never display `render_token.token`; the bundles dump already redacts it, but the dashboard dump currently uses plain `JSON.stringify` for the legacy payload.

## Kitchen Sink Patterns To Reuse

### Page Header

Reference: `src/app/sandbox/kitchen-sink/page-headers`

Use `PageHeader` from `@/components/ui/container` for the dashboard title and description. The `page.header.hero.stats` pattern maps well to a dashboard: title/description followed by a strip of KPI stats.

Recommended dashboard header:

- Title: organisation name if loaded, otherwise "Dashboard"
- Description: sport, account type, date range, or "Your Fixtura account overview"
- Child row: status badges for Active, Setup, Updating, and data freshness

### Containers

Reference: `src/app/sandbox/kitchen-sink/containers/page.tsx`

Best matches:

- `container.block.plain.default`: standard dashboard modules
- `container.block.subtle.default`: low-emphasis status/configuration modules
- `container.header.title-subtitle.default`: section headings above nearby content
- `container.group.divided.default`: contact/settings rows
- `container.group.summary-grid.default`: compact metric groups
- `container.strip.toolbar.default`: future date range/filter controls
- `container.callout.info.default`: temporary "data is loading/fallback" notes
- `container.state.empty.default`: no analytics/no renders states

Implementation note: prefer `SectionBlock` for page sections and `Surface` for inner metric tiles. Avoid nesting full cards inside full cards.

### Cards and Tiles

References:

- `src/app/sandbox/kitchen-sink/cards/grid-card-exploration.tsx`
- `src/app/(members)/o/[accountId]/season/_components/shared/summary-tile.tsx`
- `src/components/cards/MetricComparisonCard.tsx`

Best matches:

- `Surface` metric tiles for dashboard KPIs.
- `SummaryTile` style for simple numeric totals.
- `MetricComparisonCard` only where two related metrics need comparison, for example complete vs processing renders.
- `GridCard` is better for shortcuts or account/organisation selection, not for dense dashboard metrics.

Recommended KPI set:

- Total renders
- Completed renders
- Processing renders
- Downloads
- Emails sent
- AI articles

### Lists

Reference: `src/app/sandbox/kitchen-sink/lists/page.tsx`

Best matches:

- `list.stack.divided.basic`: organisation details, contact details, and account settings.
- `list.card-row.settings.basic`: boolean preference rows such as group assets and include junior surnames.
- `list.rich-row.avatar.meta`: user/account access summary.

Recommended list sections:

- Organisation details
- Account contact
- Content preferences
- Branding media assets

### Tables

Reference: `src/app/sandbox/kitchen-sink/tables/page.tsx`

Best matches:

- `table.standard.basic`: analytics `series[]` as daily rows.
- `table.dense.operations` style for future render history.
- `container.block.flush.default` shell for tables where the table provides row structure.

Recommended first table:

- "Activity by day"
- Columns: Date, Renders, Complete, Downloads, Emails, Game results, Upcoming games, Grades, AI articles

Keep this as a plain read-only table first. Search, filters, exports, and menus can wait.

## Proposed Dashboard Layout

### 1. Header: Organisation Overview

Data:

- Phase 4 organisation context
- Phase 2 account settings
- Phase 9 analytics meta

UI elements:

- Page title from `accountOrganisationDetails.Name`
- Subtitle with sport and account type
- Status badges: Active, Setup complete, Updating, Permission
- Freshness badge: `meta.computedAt` or `meta.staleness`

### 2. KPI Strip: Activity Snapshot

Data:

- Phase 9 rollup
- Phase 9 metrics percentage values

UI elements:

- 4 to 6 `Surface` metric tiles
- One comparison tile for complete vs processing renders
- Short date window label from `meta.from` and `meta.to`

Priority fields:

- `totalRenders`
- `totalCompleteRenders`
- `totalProcessingRenders`
- `totalDownloads`
- `totalEmailsSent`
- `totalAiArticles`

### 3. Main Two-Column Body

Left column:

- Activity by day table from `series[]`
- Empty state if no series or total renders is zero

Right column:

- Organisation details
- Account status
- Contact and delivery
- Content preferences

### 4. Branding Snapshot

Data:

- Phase 3 branding
- Phase 4 organisation details for fallback logo/name

UI elements:

- Template name and frontend name
- Theme name and public/custom badge
- Logo/poster preview if available
- Theme color swatches if token keys are usable
- Media count summary: poster, video, gallery count

### 5. Temporary Debug Section

Data:

- Existing JSON dumps

Recommendation:

- Move raw dumps below the UI under a collapsed "Developer payloads" section or behind a dev-only toggle.
- Keep dumps available during transition, but avoid letting the dashboard remain a JSON-first route.

## Suggested Component Breakdown

Keep the implementation local to the dashboard route at first:

- `dashboard-content.tsx`: client boundary that owns the hooks and derived view model.
- `dashboard-header.tsx`: organisation identity, status badges, freshness.
- `dashboard-kpi-strip.tsx`: analytics KPI tiles.
- `dashboard-activity-table.tsx`: `series[]` display.
- `dashboard-account-summary.tsx`: settings and contact details.
- `dashboard-branding-summary.tsx`: branding/template/theme preview.
- `dashboard-dev-payloads.tsx`: current dumps, optionally collapsed.

Reasoning:

- The phase hooks are client hooks, so the display layer will need a client component unless data fetching is moved server-side later.
- Small local components will make it easier to replace placeholders with production behavior without creating shared abstractions too early.

## Loading, Error, And Empty States

Use one section-level state per payload group, not one global page blocker.

- Header can render with Phase 4 fallback to Phase 1 account row.
- KPI strip can skeleton while Phase 9 loads.
- Account summary can skeleton while Phase 2 loads.
- Branding can show an empty placeholder if no template/theme/logo exists.
- Analytics table should show a calm empty state when `series.length === 0`.
- Gateway redirect markers should not be treated as fatal errors inside the dashboard because the access boundary should usually intercept them.

## Data Normalisation Notes

Create a small derived view model in the dashboard client component:

- `organisationName`: Phase 4 `accountOrganisationDetails.Name`, fallback Phase 1 current account name, fallback "Dashboard"
- `sport`: Phase 4 organisation sport, fallback settings `Sport`
- `logoUrl`: Phase 4 `ParentLogo`, fallback branding `onboardingLogo.url`
- `statusBadges`: from settings booleans
- `kpis`: from analytics rollup
- `activityRows`: from analytics `series`
- `brandingSummary`: from branding template/theme/media

This avoids scattering optional-chain logic across all UI components.

## Guardrails

- Do not surface raw token values from legacy hub or render-token payloads.
- Prefer phase-specific endpoints over the legacy hub for new UI.
- Keep placeholder copy short and operational. This is an app dashboard, not a marketing page.
- Use badges, tiles, and divided rows instead of raw booleans and JSON.
- Keep tables read-only until there is a clear action model.
- Avoid new shared dashboard abstractions until the first UI pass proves the shapes.

## Recommended First Implementation Pass

1. Replace the page body with a client `DashboardContent` component that fetches the same phase payloads.
2. Render a `PageHeader` based on organisation context and settings.
3. Add a KPI strip from analytics rollup.
4. Add a two-column body with activity table on the left and account/organisation details on the right.
5. Add a branding snapshot section.
6. Move `TempOrgDataDump` beneath a development-only details section.

This keeps the first pass simple while turning the current streamed JSON into a recognisable dashboard.
