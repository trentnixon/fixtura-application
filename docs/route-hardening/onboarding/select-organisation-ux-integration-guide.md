# Select Organisation UX Integration Guide

**Prepared:** 2026-07-14  
**Route:** `/select-organisation`  
**Status:** Product decisions resolved; Phases 1-3 approved to proceed  
**Audience:** Fixtura frontend implementation, product, design, and QA  
**Related contract:** [`12-frontend-integration-guide.md`](./12-frontend-integration-guide.md)  
**Related completed phase:** [`frontend-integration-phases/03-organisation-selection.md`](./frontend-integration-phases/03-organisation-selection.md)

## Purpose

This guide turns the `/select-organisation` UI review into an implementation-ready integration plan. It focuses on six agreed improvements:

1. Promote the last-used organisation into a **Continue where you left off** panel.
2. Move **Create organisation** to the end of the organisation collection.
3. Replace small status-dot rows with richer, accessible status badges.
4. Add grid and list presentation modes.
5. Replace coarse loading feedback with page and per-organisation skeleton states.
6. Introduce a deliberate mobile experience rather than shrinking the desktop grid.

It also defines appropriate use of helpers, tooltips, dialogs, drawers, and several optional selector-specific features.

## Product outcome

The page should feel like a workspace picker rather than a collection of similarly weighted tiles. A returning user should be able to resume their usual organisation immediately, while a user with many organisations should be able to search, filter, compare, and understand each workspace before opening it.

The redesign must not turn this route into a second dashboard. Information shown here should help the user choose, resume, or understand an organisation.

## Non-negotiable multi-account contract

The existing multi-account rules remain authoritative:

- Render every row in `/api/account/me.data.accounts[]`.
- Use the selected row's explicit `id` for every action and destination.
- Do not infer a selected or default organisation from array order, `data.accountId`, `isActive`, or `isSetup`.
- Keep unfinished, inactive, updating, and unavailable-status accounts visible.
- Use `onboardingWizardCompletedAt === null` for **Continue setup** presentation.
- Do not reproduce CMS blank-account or deletion-eligibility rules in this page.
- Treat last-used, pinned, recent, sort, and view state as presentation preferences only.
- Do not automatically open the last-used or only organisation.

## Current implementation baseline

The current route already provides:

- all-account rendering from `accounts[]`;
- explicit account-id navigation;
- responsive organisation cards;
- organisation naming fallbacks;
- organisation logo and theme accents;
- search and sort controls when more than five organisations exist;
- summary counts;
- last-selected account storage;
- lifecycle requests per account;
- empty, error, gateway-reason, and no-search-result states; and
- a route-lab page plus component tests.

The integration should extend this behavior rather than replace the account-selection contract.

## Target information architecture

### Desktop

```text
Select organisation                                      [How this works]
Choose a workspace to continue. You can switch later.

+-----------------------------------------------------------------------+
| [Logo] Continue where you left off                                    |
|        North Districts Cricket                                        |
|        Cricket  [Active]  Last opened yesterday                       |
|                                    [View details] [Open organisation]  |
+-----------------------------------------------------------------------+

[Search organisations.................................................]
[All 12] [Needs setup 2] [Active 9] [Inactive 1]
[Sort: Recently used]                               [Grid] [List] [Refresh]

[Organisation] [Organisation] [Organisation] [Organisation]
[Organisation] [Organisation] [Organisation] [Add organisation]

Can't see an organisation you expected? [Learn about access] [Refresh]
```

### Mobile

```text
Select organisation                              [?]
Choose a workspace to continue.

[Continue where you left off]
[Search organisations.........................]
[All 12] [Setup 2] [Active 9] [Inactive 1]  ->
[Sort]                                      [List/Grid]

[Logo] Organisation name                         [Open]
       Cricket [Active]

[Logo] Organisation name                     [Continue]
       AFL [Setup required]

[+ Add another organisation]
[Missing an organisation?]
```

## State and presentation model

### Organisation display state

Introduce a selector-specific view model so cards and list rows do not each derive lifecycle copy independently.

```ts
type SelectOrganisationDisplayState =
  | "status-loading"
  | "active"
  | "setup-required"
  | "preparing"
  | "updating"
  | "needs-attention"
  | "inactive"
  | "status-unavailable";

type SelectOrganisationItemViewModel = {
  accountId: string;
  name: string;
  sport?: string;
  logo?: string;
  brandColors?: { primary: string; secondary: string };
  displayState: SelectOrganisationDisplayState;
  statusLabel: string;
  statusDescription: string;
  primaryActionLabel: string;
  isNew: boolean;
  isLastUsed: boolean;
  lastOpenedAt?: string;
  onboardingStep?: { current: number; total: number };
};
```

Keep this model in a pure helper and cover every state transition with unit tests.

### Approved status precedence

Use the most actionable state when multiple lifecycle flags coexist:

1. Lifecycle query has not resolved: **Status loading**.
2. Lifecycle query failed or could not be parsed: **Status unavailable**.
3. `initialSetupStatus === "failed"` or `initialDataFetchStatus === "failed"`: **Needs attention**.
4. Onboarding wizard is incomplete: **Setup required**.
5. Wizard is complete and `isSetup !== true`: **Preparing workspace**. Queued, running, and post-wizard `not_started` pipeline states remain Preparing until setup is ready or fails.
6. `isSetup === true && isUpdating === true`: **Updating**.
7. `isActive === false`: **Inactive**.
8. `isSetup === true && isActive === true`: **Active**.
9. Any otherwise valid but unrecognised combination: **Preparing workspace**, with the raw combination logged to observability rather than rendered.

The `failed` enum is the terminal-failure signal. A non-null failure-reason string without a matching `failed` enum does not independently create **Needs attention**. This mapping must live in one pure helper rather than being duplicated in JSX.

### Status presentation

| Display state        | Badge               | Tone        | Primary action    |
| -------------------- | ------------------- | ----------- | ----------------- |
| `status-loading`     | skeleton            | neutral     | Open organisation |
| `active`             | Active              | success     | Open organisation |
| `setup-required`     | Setup required      | warning     | Continue setup    |
| `preparing`          | Preparing workspace | info        | Open organisation |
| `updating`           | Updating            | info        | Open organisation |
| `needs-attention`    | Needs attention     | destructive | Review issue      |
| `inactive`           | Inactive            | neutral     | View organisation |
| `status-unavailable` | Status unavailable  | neutral     | Open organisation |

Do not use red for normal onboarding work. Reserve destructive styling for a real failed state.

## Feature 1: Continue where you left off

### Required behavior

- Replace the small **Return to {organisation}** button with a featured horizontal panel.
- Render the panel only when the stored account id still exists in `accounts[]`.
- Keep the same organisation in the main collection.
- Derive its action through the same `handleSelectOrganisation(accountId)` path as other organisation actions.
- Change the action copy based on the display state, for example **Continue setup** or **Open organisation**.
- Use brand colours as a border, icon, or restrained background accent with contrast-safe fallbacks.
- Do not render the panel in simulator scenarios unless the simulator explicitly supplies a last-used state.

### Last-used persistence

The current storage records only an account id. Extend it with a versioned record scoped to the backend member user id from `/api/account/me.data.user.id`:

```ts
type LastSelectedOrganisationRecordV2 = {
  version: 2;
  accountId: string;
  openedAt: string;
};
```

Migration behavior:

- Continue reading the existing id-only key.
- Treat an id-only value as a valid last-used organisation without a timestamp.
- Write the V2 record after the next successful selection.
- Never use this record as ownership evidence; verify the id against the latest `accounts[]` response.
- Keep V2 local to the current browser/device for the MVP; cross-device synchronisation requires a future preference API.

### Responsive behavior

- Desktop: horizontal featured panel with actions aligned right.
- Mobile: stacked card with a full-width primary action.
- Long organisation names may wrap to two lines.
- The featured panel must not obscure gateway warnings or selection errors.

## Feature 2: Create organisation at the end

### Existing-account behavior

Render organisation results first and the create action last:

```tsx
{
  displayRows.map(renderOrganisation);
}
<CreateOrganisationGridCard />;
```

The create card is not part of the organisation sort order and must remain last for every sort mode.

Recommended copy:

- Title: **Add another organisation**
- Description/helper: **Create a separate workspace for another club or association.**
- Action: **Create organisation**

Recommended visual treatment:

- dashed border;
- neutral surface;
- plus icon;
- less visual weight than existing organisation cards; and
- identical footprint to the current view mode's organisation items.

### Search and filtering behavior

- Keep the create action visible after filtered results.
- Do not count it in `Showing X of Y organisations`.
- In the no-match state, render one create action only; avoid a duplicate inline link plus create tile.

### Empty-account behavior

When `accounts[]` is empty, render one purpose-built empty-state panel and do not also render the create tile.

Approved empty-state copy:

- Title: **Create your first organisation**
- Body: **An organisation is a Fixtura workspace for a club or association. Add its sport, branding, and organisation details now. If you leave before finishing, you can return and continue setup later.**
- Supporting text: **After setup, Fixtura will prepare the workspace and import available organisation data.**
- Primary action: **Create organisation**

## Feature 3: Accessible status badges and helpers

### Badge requirements

- Use visible text and an icon where helpful.
- Do not communicate state by colour alone.
- Maintain WCAG AA contrast for text, icon, border, and focus indicators.
- Keep badges concise in the card/list surface.
- Use one primary status badge. Secondary information belongs in details or supporting text.

### Status helpers

Each status has a short, reusable description:

| Badge               | Helper text                                                                                           |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| Active              | This organisation is ready to use.                                                                    |
| Setup required      | Finish organisation setup before all features become available.                                       |
| Preparing workspace | Fixtura is setting up this organisation and importing its data. You can open it while this continues. |
| Updating            | Fixtura is refreshing this organisation's data. Existing features remain available.                   |
| Needs attention     | Workspace preparation did not complete and needs review.                                              |
| Inactive            | This workspace is currently inactive and some features may be unavailable.                            |
| Status unavailable  | Fixtura could not load the latest workspace status.                                                   |

### Tooltip use

Tooltips may explain a status information icon on pointer and keyboard focus. They must not be the only way to access required information because hover is unavailable on touch devices.

On mobile, selecting the status information action should open a small popover or the organisation details drawer.

## Feature 4: Grid and list views

### View modes

Add a single-select `ToggleGroup` using values `grid` and `list`.

- The toggle must have visible selected state.
- Icon-only buttons require `aria-label` and tooltips.
- Persist the user's choice in user-scoped local storage.
- Treat the preference as presentation only.

### Default mode

- Small screens: list.
- Desktop with five or fewer organisations: grid.
- Desktop with more than five organisations: grid unless a stored preference exists.

Do not switch modes automatically after the user makes an explicit choice.

### Grid item content

- logo or initials;
- organisation name;
- sport;
- primary status badge;
- optional **New** badge;
- visible primary action copy; and
- separate **Details** action.

### List item content

Desktop list columns:

- organisation;
- sport;
- status;
- last opened when available; and
- primary action.

Mobile list rows:

- logo/initials;
- organisation name;
- sport;
- primary status badge; and
- explicit primary action.

### Interaction structure

The current organisation tile is itself a `<button>`. Adding nested detail or status buttons would create invalid nested interactive elements. Refactor the surface to one of these patterns:

1. A non-interactive card container with separate **Open** and **Details** buttons; or
2. A stretched primary link plus sibling detail action with carefully managed stacking and focus order.

Prefer the first pattern for predictable accessibility and mobile behavior.

## Feature 5: Loading and transition feedback

### Initial page loading

Replace the full-page branded loader for account bootstrap with a selector-shaped skeleton:

- heading and description skeleton;
- optional featured-panel skeleton;
- search/control skeleton;
- four to six card skeletons on desktop; and
- four list-row skeletons on mobile.

The layout dimensions should closely match the loaded state to reduce cumulative layout shift.

### Lifecycle loading

After `/api/account/me` resolves:

- render each organisation's name, logo, sport, and theme immediately;
- render a compact status badge skeleton while its onboarding state is pending;
- do not assign a semantic warning or success tone until the state is known;
- show **Status unavailable** with retry when a lifecycle query fails; and
- avoid replacing the entire page because one organisation status failed.

The primary organisation action remains enabled during `status-loading` and `status-unavailable`. Selection already fetches the latest onboarding state before resolving the entry route, so the status badge may be unknown without making the account unopenable.

### Selection loading

When an organisation is selected:

- change only that item's action to **Opening...** with a spinner;
- set `aria-busy="true"` on that item;
- disable or set `aria-disabled` on competing actions while the route is being resolved;
- announce **Opening {organisation name}** through an `aria-live="polite"` region;
- preserve the item dimensions; and
- on failure, restore focus to the selected item and expose **Try again**.

Do not display raw API exception text. Map failures to user-safe copy and keep diagnostic detail in observability tooling.

## Feature 6: Mobile-specific integration

### Layout rules

- Default to compact list rows below the `sm` breakpoint.
- Keep search full width.
- Render status filters in a horizontal scroll area without hiding keyboard focus.
- Stack sort and view controls without causing horizontal overflow.
- Keep **Add another organisation** as the final full-width row.
- Use at least 44 by 44 CSS-pixel targets for interactive controls.
- Keep long names and translated labels from colliding with actions.

### Sticky controls

A sticky search/filter area is useful for long portfolios, but it must:

- sit below the application header;
- use an opaque or blurred surface with a visible divider;
- not cover gateway alerts or focused content;
- avoid sticky behavior for short collections; and
- be tested with mobile browser zoom and the virtual keyboard.

Implement sticky controls only when the collection contains more than eight organisations.

### Dialog versus drawer

- Desktop and tablet: organisation details use `Dialog`.
- Mobile: organisation details use `Drawer`.
- Both surfaces render the same semantic content component.
- Opening and closing must restore focus to the originating **Details** action.

## Helper and disclosure strategy

### Decision table

| Need                                     | Component                                           | Reason                                             |
| ---------------------------------------- | --------------------------------------------------- | -------------------------------------------------- |
| Explain an icon-only control             | Tooltip                                             | Short, non-essential label reinforcement           |
| Explain a status briefly                 | Tooltip on desktop; popover/details drawer on touch | Status stays visible; explanation is supplementary |
| Explain the page and organisation access | Dialog                                              | Multi-paragraph help and links                     |
| Show organisation metadata and progress  | Dialog or drawer                                    | Structured detail without navigating away          |
| Show an actionable error                 | Inline alert                                        | Must remain visible and discoverable               |
| Confirm a destructive action             | Alert dialog                                        | Not currently part of this page redesign           |
| Show search/sort filters                 | Inline controls                                     | Core interaction must not be hidden                |

### Page-level help dialog

Trigger treatment: show an information icon plus the visible text **How organisation access works** on desktop. Use the same icon as an icon-only button on mobile with `aria-label="How organisation access works"`; its tooltip is supplementary and the button opens the full help dialog.

Suggested content:

- what an organisation workspace is;
- why a user may see more than one organisation;
- what Active, Setup required, Preparing, and Inactive mean;
- how to switch organisations later;
- the difference between creating an organisation and requesting access; and
- where to get help when an expected organisation is missing.

### Organisation details dialog/drawer

Use only data already present in the lightweight account and onboarding payloads. Do not fetch the full organisation dashboard aggregate merely to populate the selector.

Suggested content:

- logo, display name, and sport;
- account status and explanation;
- onboarding progress, such as **Step 2 of 4**;
- initial setup/data preparation state;
- last lifecycle activity when available;
- PlayHQ id when present;
- created date;
- **Rights holder: Yes/No** and **Permission to use content: Confirmed/Not confirmed** when the corresponding value is non-null;
- theme colour preview; and
- primary open, continue, retry, or progress action.

For **Needs attention**, the primary **Review issue** action opens this details surface. It shows reviewed failure copy and **Retry setup** when the existing `retry-setup` action is permitted. For **Preparing workspace**, opening the organisation remains available; progress is supplementary information, not a routing gate.

Failure reasons from CMS must be mapped to safe user copy before display. Do not expose stack traces, internal queue names, or unreviewed CMS error text.

### Missing-organisation helper

Add a quiet helper after the organisation collection:

> Can't see an organisation you expected?

Actions:

- **Refresh organisations**;
- **Learn about access**; and
- **Contact support**, routed to `ROUTES.support` (`/support`).

A future **Request access** feature requires a product and backend contract and is out of scope for the first implementation.

## Optional selector features

These features are welcome but should follow the core integration.

### Status filter chips

Add filters derived from the existing portfolio summary:

- All;
- Needs setup;
- Active; and
- Inactive.

Filters compose with search and sort. Counts always describe the complete owned-account list, not the current search result.

### Recently used sort

Add **Recently used** only after timestamps are stored. Accounts without timestamps sort after known recent accounts and then by name.

### Pinned organisations

Allow users to pin organisations locally. Pins affect presentation order only and never imply selected/default state. A server-synced preference requires a separate API contract.

### Recent organisations

Track up to three recently opened organisation ids and timestamps. This may replace or supplement the single featured panel for large portfolios.

### Keyboard search shortcut

When search is rendered, `/` may focus it if focus is not already in an editable control. Show the shortcut only on keyboard-capable layouts and provide a normal visible search control for everyone.

### Manual refresh

Add a refresh action that refetches `/api/account/me` and lifecycle queries. While refreshing, preserve the current content and show a non-blocking progress indicator.

## Search, filters, sort, and preference state

### Recommended state shape

```ts
type SelectOrganisationWorkspaceState = {
  query: string;
  statusFilter: "all" | "setup-required" | "active" | "inactive";
  sortMode: "recent" | "name-asc" | "name-desc" | "newest-first" | "setup-first";
  viewMode: "grid" | "list";
};
```

### Persistence

- Persist view and sort preference in backend-member-user-scoped local storage.
- Keep query and status filter in component state for the MVP; do not add selector URL parameters yet.
- Do not put last-used, pinned, or ownership data in query parameters.
- Validate all stored values and fall back safely when values are stale or malformed.

### Search fields

The first release should search:

- resolved display name;
- sport;
- the exact `accountOrganisationDetails.PlayHQID` value when present.

Do not search the internal account id or arbitrary nested payload values. PlayHQ id may be searchable and may appear in organisation details, but it does not appear on every collection card/list row.

## Component integration plan

Suggested decomposition:

```text
select-organisation/
  select-organisation-content.tsx          orchestration and navigation
  _components/
    select-org-header.tsx                  title, intro, page help
    select-org-resume-panel.tsx            last-used feature
    select-org-controls.tsx                search, filters, sort, view, refresh
    select-org-collection.tsx              grid/list selection
    select-org-grid-item.tsx               grid presentation
    select-org-list-item.tsx               list presentation
    select-org-status-badge.tsx            status and helper trigger
    select-org-details.tsx                 shared dialog/drawer content
    select-org-details-dialog.tsx          responsive disclosure shell
    select-org-empty-state.tsx             no-account experience
    select-org-missing-help.tsx             access/refresh helper
    select-org-loading-skeleton.tsx         route-shaped loading state
  _hooks/
    use-select-org-preferences.ts           validated user-scoped preferences
  _utils/
    build-select-org-item-view-model.ts     pure display mapping
    filter-and-sort-select-org-items.ts     collection behavior
```

The exact split may be reduced during implementation, but `select-organisation-content.tsx` should not accumulate every presentation and disclosure concern.

### Shared UI primitives already available

- `Badge`
- `Tooltip`
- `Dialog`
- `Drawer`
- `Popover`
- `Skeleton`
- `ToggleGroup`
- `ScrollArea`

Reuse these primitives rather than introducing another overlay or toggle system.

## Data and API impact

### No backend changes required for the core release

The current `/api/account/me` and per-account onboarding-state payloads are sufficient for:

- names, logos, sport, and brand colours;
- active, setup, updating, and onboarding states;
- onboarding step and lifecycle timestamps;
- rights-holder/permission context;
- PlayHQ identifier; and
- created date.

### Potential future backend work

The following features need separate contracts if they must sync across devices:

- pinned organisations;
- recent organisation history;
- preferred view and sort settings;
- organisation access requests; and
- richer membership roles per organisation.

Do not overload `/api/account/me` with dashboard metrics or other heavy account details for this redesign.

## Accessibility requirements

- Every organisation has a unique, descriptive primary action name.
- Details actions identify their organisation, for example **View North Districts details**.
- Grid/list toggles expose role, selected state, and accessible labels.
- Tooltips open on focus as well as hover.
- Essential status meaning is visible without a tooltip.
- Status is not communicated by colour alone.
- Loading and route transitions are announced through a polite live region.
- Errors receive focus or are associated with the failed action.
- Dialogs and drawers have a title, description, close action, focus trap, and focus restoration.
- Reduced-motion preferences disable non-essential card movement and shimmer-like effects.
- At 200% zoom, controls remain usable without two-dimensional page scrolling.
- Mobile targets meet a 44 by 44 CSS-pixel minimum.

## Performance requirements

- Keep `/api/account/me` as the first content dependency.
- Continue lifecycle queries in parallel with account-id-scoped query keys.
- Do not block names/logos on lifecycle completion.
- Avoid fetching full organisation aggregates for details disclosure.
- Lazy-load dialog/drawer content code when practical, but do not delay basic accessible labels.
- Preserve stable item keys and dimensions across status changes.
- Test with at least 50 organisations for filtering, sorting, rendering, and focus behavior.

Virtualisation is not required initially. Reassess it if real portfolios regularly exceed approximately 100 organisations.

## Analytics and product signals

Analytics are optional and must not include sensitive organisation metadata. Useful events include:

- selector view rendered with organisation count bucket;
- resume-panel action used;
- grid/list mode changed;
- status filter selected;
- search used, without recording the query text;
- organisation details opened;
- create organisation selected; and
- status retry selected.

Do not send organisation names, PlayHQ ids, search text, raw error messages, or account payloads.

## Implementation phases

### Phase 1: Hierarchy and status foundation

- Add the pure item view model and status precedence.
- Add accessible status badges and helper copy.
- Add the featured last-used panel.
- Move create organisation to the end.
- Replace the empty-account tile with a richer empty state.
- Preserve existing navigation and multi-account behavior.

### Phase 2: Collection presentation and mobile

- Add grid/list presentation modes.
- Add validated, user-scoped view preference.
- Add mobile list rows.
- Refactor organisation surfaces to support separate primary and details actions.
- Add responsive controls and optional long-list sticky behavior.

### Phase 3: Feedback and disclosure

- Add initial page and per-status skeletons.
- Add explicit selection progress and retry behavior.
- Add page-level help dialog.
- Add organisation details dialog/drawer.
- Add missing-organisation helper and manual refresh.

### Phase 4: Portfolio productivity

- Add status filter chips.
- Add recently used sorting from timestamps collected by the V2 last-used record.
- Consider pins and recent-history presentation.
- Add keyboard search shortcut if validated with users.

Each phase should ship with updated route-lab scenarios and automated tests. Do not defer accessibility or mobile verification to the final phase.

## File impact map

Expected primary files:

- `src/app/(members)/select-organisation/select-organisation-content.tsx`
- `src/app/(members)/select-organisation/select-organisation-content.test.tsx`
- `src/app/(members)/select-organisation/page.tsx`
- `src/app/sandbox/route-lab/org/select-organisation/page.tsx`
- `src/components/ui/grid-card.tsx`
- `src/lib/account/last-selected-organisation.ts`
- `src/lib/account/last-selected-organisation.test.ts`
- `src/lib/account/select-organisation-workspace.ts`
- `src/lib/account/select-organisation-workspace.test.ts`
- `src/lib/onboarding/select-org-card-tone.ts`
- `src/types/api/account.ts`

Likely new files should live under the route-local `_components`, `_hooks`, and `_utils` folders proposed above.

Avoid broad changes to shared `GridCard` unless the new interaction model is genuinely useful to other routes. Route-specific grid and list items may be safer than adding selector-only behavior to a general component.

## Route-lab scenarios

Expand the route lab to cover:

- loading skeleton;
- no accounts;
- one active account;
- multiple mixed-state accounts;
- last-used account;
- setup required;
- preparing workspace;
- updating;
- initial setup failure;
- inactive;
- lifecycle status unavailable;
- selection pending;
- selection failure;
- filtered no results;
- long names and missing logos;
- high-contrast and difficult brand colours;
- 25-plus organisations; and
- mobile list and desktop grid modes.

Simulator fixtures must remain deterministic and must not call production account endpoints.

## Automated test plan

### Pure helpers

- Maps every lifecycle combination to the documented display-state precedence.
- Builds safe helper text and action labels.
- Filters by name, sport, and approved identifiers.
- Sorts recent, setup-first, newest, and alphabetic modes deterministically.
- Validates and migrates stored preferences.
- Rejects stored account ids not present in the latest account list.

### Component behavior

- Featured panel appears only for a valid last-used account.
- Featured action uses the exact account id and existing entry resolver.
- Last-used organisation remains in the main collection.
- Create organisation is the final collection item for every sort/filter mode.
- Create action is not included in result counts.
- Badges expose visible and accessible status meaning.
- Details dialog/drawer opens for the correct account and restores focus.
- Grid/list preference persists and does not change ownership or navigation.
- Mobile list mode exposes complete action labels.
- Lifecycle query failure affects only the relevant organisation.
- Selection pending announces progress and prevents duplicate selection.
- Selection failure exposes retry and returns focus.
- No raw internal error message is rendered.

### Accessibility

- No nested interactive elements.
- No duplicate accessible action names where organisation context is required.
- Tooltip triggers work with keyboard focus.
- Dialog/drawer title and description are announced.
- Toggle group exposes the selected view.
- Status remains understandable without colour or hover.

### Verification commands

At minimum:

```powershell
npx vitest run "src/app/(members)/select-organisation/select-organisation-content.test.tsx" src/lib/account/select-organisation-workspace.test.ts src/lib/account/last-selected-organisation.test.ts src/lib/onboarding/select-org-card-tone.test.ts
npx eslint "src/app/(members)/select-organisation/**/*.tsx" src/lib/account/select-organisation-workspace.ts src/lib/account/last-selected-organisation.ts
npm run typecheck
```

Add focused commands for every new helper and component test file.

## Manual verification matrix

Verify at these representative widths:

- 320px mobile;
- 390px mobile;
- 768px tablet;
- 1024px desktop; and
- 1440px wide desktop.

For each width, verify:

- zero, one, five, six, and 25 organisations;
- keyboard-only navigation;
- touch interaction where applicable;
- 200% zoom;
- reduced motion;
- light and dark themes;
- long organisation names;
- missing/broken logos;
- difficult brand colour combinations;
- opening, retry, and gateway-warning states; and
- dialog/drawer focus restoration.

## Acceptance criteria

The integration is complete when:

- A valid last-used organisation is promoted without becoming an inferred default.
- Every owned account remains visible and actionable in the main collection.
- Create organisation is last when accounts exist and primary when none exist.
- Statuses use visible, accessible labels with documented precedence.
- Grid and list views work at supported breakpoints and preserve explicit account-id navigation.
- Mobile uses a deliberate list-first layout with accessible controls.
- Initial, lifecycle, and selection loading states provide contextual feedback without unnecessary page replacement.
- Tooltips contain supplementary information only.
- Page help and organisation details are keyboard- and touch-accessible.
- No invalid nested interactions are introduced.
- Lifecycle failures are isolated per account and expose safe retry behavior.
- Search, sort, filter, and result counts exclude the create action.
- Light and dark themes pass contrast and interaction-state verification.
- Automated, route-lab, responsive, and accessibility verification pass.

## Risks and mitigations

| Risk                                                 | Mitigation                                                        |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| Selector becomes too dashboard-like                  | Limit content to choice, state, progress, and access context      |
| Arbitrary brand colours reduce contrast              | Use validated accents and fall back to design-system tokens       |
| Multiple lifecycle flags produce inconsistent badges | Centralise documented status precedence in a pure helper          |
| Details buttons create nested interactions           | Refactor the card into a container with sibling actions           |
| Local preferences imply ownership or default state   | Validate against `accounts[]`; keep preferences presentation-only |
| Many parallel lifecycle requests cause visual churn  | Render account identity immediately and isolate status skeletons  |
| Sticky mobile controls obscure content               | Enable only for long lists and test header/keyboard offsets       |
| Raw CMS failures expose internal detail              | Map errors to reviewed user-safe messages                         |

## Resolved frontend product decisions

The following decisions answer the frontend team's implementation questions. Phases 1-3 may proceed without further product clarification unless implementation evidence contradicts the documented payload contract.

### Product behavior

1. **Inactive organisations remain openable.** Completed onboarding continues to the normal account dashboard; do not add a dedicated inactive route. Show the Inactive badge and explanation before entry, and let account-scoped access handling govern unavailable features.
2. **Approved copy:** Preparing workspace — **Fixtura is setting up this organisation and importing its data. You can open it while this continues.** Updating — **Fixtura is refreshing this organisation's data. Existing features remain available.**
3. **Expose initial setup retry on this page inside organisation details.** The collection item shows **Needs attention** and **Review issue**; the dialog/drawer owns reviewed failure copy and **Retry setup**. Do not place a destructive retry control directly on every card/list row.
4. **Safe rights fields:** show `isRightsHolder` as **Rights holder: Yes/No** and `isPermissionGiven` as **Permission to use content: Confirmed/Not confirmed** only when each value is non-null. Keep them in details, not the collection surface. Do not show contact names, delivery details, or infer legal approval from any other field.
5. **Contact support uses `/support`.** Use `ROUTES.support`; do not use a direct `mailto:` from this page.
6. **Keep the current more-than-five search threshold for the MVP.** Portfolios with one to five organisations do not show search. Search appears at six or more.
7. **Status filters follow the layout redesign.** They are Phase 4 and are not part of the MVP.
8. **Recent and pinned preferences are local-only initially.** Design storage records so a future API can sync them, but do not add backend work to the MVP.

### Status and lifecycle

9. **The approved precedence is the mapping in Approved status precedence above.** It replaces the earlier provisional order and aligns with the current onboarding-state contract.
10. **Terminal failure means exactly** `initialSetupStatus === "failed"` or `initialDataFetchStatus === "failed"`. Failure-reason strings provide diagnostics only and do not independently change the state. A setup-status payload with top-level `status === "failed"` is also terminal when that endpoint is used in the details surface.
11. **Preparing versus Updating is payload-driven:** Preparing requires completed onboarding with `isSetup !== true`; queued, running, or post-wizard `not_started` initial pipelines support this state. Updating requires an already set-up workspace (`isSetup === true`) with `isUpdating === true`. This prevents initial workspace preparation from being described as a routine refresh.
12. **View progress and Review issue open the organisation details dialog/drawer.** The details surface then offers the correct action: Continue setup for an unfinished wizard, Retry setup for a retryable terminal pipeline failure, or Open organisation for a non-blocking preparation/update state. Do not create another progress route.
13. **Open remains enabled during `status-loading`.** Card identity comes from `/account/me`, and selection fetches onboarding state before resolving the entry route. Use a status skeleton while keeping **Open organisation** enabled. Apply the same behavior to `status-unavailable`; a separate status retry may appear in details.

### Empty state and creation

14. **Approved empty-state copy** is the copy in Empty-account behavior above: **Create your first organisation**; explain that it is a Fixtura workspace for a club or association, setup can be resumed, and Fixtura prepares/imports available data after setup.
15. **Create-card copy is approved:** title **Add another organisation**, helper **Create a separate workspace for another club or association.**, action **Create organisation**.
16. **An empty portfolio renders the rich empty panel only.** Do not duplicate it with a create tile.

### Resume panel and last-used state

17. **Featured-panel primary CTA labels:**

| Display state        | CTA               | Behavior                                     |
| -------------------- | ----------------- | -------------------------------------------- |
| `status-loading`     | Open organisation | Fetch lifecycle and resolve entry            |
| `active`             | Open organisation | Enter dashboard                              |
| `setup-required`     | Continue setup    | Enter explicit account wizard                |
| `preparing`          | Open organisation | Enter dashboard; preparation is non-blocking |
| `updating`           | Open organisation | Enter dashboard                              |
| `needs-attention`    | Review issue      | Open details with retry/support actions      |
| `inactive`           | View organisation | Enter dashboard                              |
| `status-unavailable` | Open organisation | Refetch lifecycle and resolve entry          |

18. **View details appears on both the featured panel and main collection.** When the featured primary action is already **Review issue**, omit the duplicate View details action because both would open the same surface.
19. **Silently hide the featured panel when its stored id is absent from `accounts[]`.** Do not imply that a deleted, transferred, or inaccessible organisation still exists. The page-level missing-organisation helper remains available.
20. **Scope V2 last-used storage to `/api/account/me.data.user.id` and the current browser/device.** This follows the existing `fixtura:last-selected-organisation:{userId}` convention. Do not key it by account id, response order, or an unverified client identity. Cross-device state is future API work.

### Collection and controls

21. **Desktop defaults are confirmed:** grid at five or fewer organisations; grid at six or more unless a stored view preference exists. Mobile defaults to list. Never override an explicit stored choice based on count.
22. **Sticky controls threshold is confirmed at more than eight organisations.** Sticky behavior is mobile-first and must still pass header-offset, focus, zoom, and virtual-keyboard checks.
23. **Persist view and sort only in the MVP.** Query is ephemeral. Status filters are Phase 4; when introduced, keep the selected filter session-local initially rather than persisting it across visits.
24. **No URL parameters for query or filters in the MVP.** Reconsider only if a real shareable/restorable selector use case emerges.
25. **Approved searchable fields are resolved display name, sport, and exact PlayHQ id.** PlayHQ id may be displayed in details. Do not search or expose the internal account id or arbitrary payload identifiers.
26. **The future Needs setup filter includes** `setup-required`, `preparing`, and `needs-attention`. It does not include `updating`; updating is an already set-up workspace. Keep a separate Inactive filter.

### Details and help

27. **Organisation details V1 fields are:** logo/initials, resolved name, sport, primary status and approved explanation, onboarding step when the wizard is incomplete, human-readable initial setup/data-fetch state, `onboardingLastActivityAt` when present, PlayHQ id when present, account `createdAt`, non-null rights-holder/permission fields using the approved copy, theme swatches, and the state-appropriate primary action. Do not show internal account id, raw failure reasons, queue names, member contact data, or delivery address.
28. **Help trigger uses icon plus visible text on desktop and icon-only on mobile.** Desktop copy is **How organisation access works**. The mobile button uses the same icon with that full accessible label and opens the same dialog.
29. **Include Contact support in V1** and route it to `ROUTES.support`. If that route is ever removed, omit the action rather than substituting a placeholder.

### Optional Phase 4 scope

30. **Status filters are out of the first release** and remain Phase 4.
31. **Recently used sort is out of the first release.** The V2 timestamp may begin collecting during the MVP, but sorting ships only after enough real timestamp data exists and Phase 4 is approved.
32. **Pins are out of the first release.**
33. **Recent-history strip is out of the first release.** Use one featured last-used panel; do not show a three-item recent strip alongside it.
34. **The `/` keyboard shortcut is out of the first release.** Search remains fully usable without shortcuts.
35. **Manual refresh is in the MVP as Phase 3.** It refetches `/api/account/me` and lifecycle queries without clearing visible content, and is exposed through the missing-organisation/helper area or controls.

### Scope and delivery

36. **The recommended first slice is the agreed MVP:** view model, badges, featured resume panel, create-at-end and rich empty state, grid/list plus mobile layout, skeletons and selection feedback, help dialog, organisation details dialog/drawer, failure retry in details, missing-organisation helper, and manual refresh.
37. **All Phase 4 items are explicitly out of the MVP** unless this resolved list specifically moves them into Phases 1-3. Timestamp collection for last-used V2 is infrastructure for the resume panel, not approval for Recent sort/history UI.
38. **The redesign must support both light and dark themes.** All surfaces, brand accents, focus states, skeletons, tooltips, dialogs, drawers, and status tones must pass contrast checks in both themes.

## Recommended first implementation slice

The smallest coherent release is:

1. Introduce the selector item view model and accessible status badge.
2. Add the last-used resume panel.
3. Move the create card to the end and improve the empty state.
4. Add mobile list items and the grid/list toggle.
5. Add contextual status skeletons and selection progress.
6. Add the page help dialog and organisation details dialog/drawer.
7. Add failure retry in details, the missing-organisation helper, and non-blocking manual refresh.

This slice delivers the agreed redesign while preserving all existing multi-account, routing, cache, and onboarding behavior.
