# Branding Route Lab Research

Date: 2026-04-29

## Request

Start the `/o/575/branding` work in `/sandbox/route-lab` first. Add a Branding route-lab entry, bring together the existing color picker, containers, sections, headers, titles, and page primitives, then build the page from primitives in the lab before promoting anything to the production members route.

This document records the current repo shape, useful existing pieces, risks, and recommended first implementation slice.

## Current Route Shape

- Production route exists at `src/app/(members)/o/[accountId]/branding/page.tsx`.
- The production page currently renders a simple title and `BrandingApiDump`.
- `BrandingApiDump` calls `useAccountBranding(accountId)` and displays `GET /api/accounts/:id/branding` JSON in a temporary development dump.
- Account-scoped URL helpers already include `accountScopedRoutes.branding(accountId)`, so `/o/575/branding` is a supported production URL.
- The app sidebar already has a scoped "Branding" item using `IconPalette`.
- Route lab is mounted at `src/app/sandbox/route-lab` with `SandboxRouteLabSidebar`.
- Route-lab navigation is centralized in `src/lib/dev-sandbox-nav.ts` under `ROUTE_LAB_NAV_SECTIONS`.

## Existing Lab Pattern

Route lab screens should use:

- `RouteLabPage` from `src/components/dev/RouteLabPage.tsx`.
- `contentPreset="full"` for app pages like dashboard/settings.
- Scenario controls through `stateOptions`, `modeOptions`, and `getScenario`.
- Production route strings via `accountScopedRoutes`.
- The App (scoped) nav group in `ROUTE_LAB_NAV_SECTIONS`.

Recommended prototype URL:

```txt
/sandbox/route-lab/app/branding
```

Recommended production route label:

```txt
/o/575/branding
```

The route-lab sidebar should get a Branding nav item under the existing "App (scoped)" section, likely between Dashboard and Settings or adjacent to the app sidebar order. Since the production app sidebar order is Dashboard, Bundles, Branding, Templates, Media Gallery, Sponsors, Billing, Season, a small route-lab set can be Dashboard, Branding, Season, Settings.

## Branding Data Shape

The current type contract lives in `src/types/api/account.ts`.

`AccountBrandingData` contains:

- `id`
- `template`
- `theme`
- `template_option`
- `templateOptionId`
- `onboardingLogo`

`AccountBrandingTemplate` contains display and media fields such as:

- `name`
- `frontEndName`
- `requiresMedia`
- `variation`
- `category`
- `templateVariation`
- `divideFixturesBy`
- `poster`
- `video`
- `gallery`

`AccountBrandingTheme` contains:

- `id`
- `name`
- `theme`
- optional `isPublic`

The route-lab prototype should use fixtures first, not live API calls. Keep live API behavior in production or a later data-lab bridge.

## Existing Color Picker Pieces

The color picker prototype lives at:

```txt
src/app/sandbox/interaction-lab/color-picker
```

Reusable components already exist in `src/components/brand-color`:

- `BrandColorField`
- `BrandColorPopoverPanel`
- `BrandColorPreviewCard`
- `FixturaAssetColorPreview`
- `PersistentFieldFeedback`
- `BrandColorObjectDialog`

Existing validation utilities are in `src/lib/brand-color`:

- `tryNormalizeHex`
- `colorsAreTooSimilar`
- `bothColorsVeryLight`
- `bothColorsVeryDark`
- `isWeakWhiteOnBrandContrast`
- `isWeakDarkOnBrandContrast`

The interaction lab defaults are:

```txt
primary: #79001F
secondary: #FDBC2C
dark: #111
white: #FFF
```

The branding route should reuse these components instead of recreating picker behavior.

## Theme Parsing Utilities

`src/lib/branding/theme-colours-from-account.ts` already provides:

- `themeColoursFromAccountBrandingTheme(theme)`
- `themeColoursForReviewStep(accountTheme, catalogueRows)`
- defaults for missing or invalid theme JSON

This is important because Strapi theme JSON may use multiple key variants:

- `primary`
- `PrimaryColour`
- `primaryColour`
- `Primary`
- `primary_color`
- corresponding secondary variants

Recommendation: route-lab fixtures should include at least one clean modern payload and one legacy-key payload, so the prototype tests the normalization path visually.

## Existing Primitive References

Useful primitives and reference pages:

- `PageHeader`, `Section`, `Surface` from `src/components/ui/container.tsx`
- `SectionBlock`, `SectionDivider`, `SectionLabel` from `src/components/ui/section.tsx`
- Page header reference: `src/app/sandbox/kitchen-sink/page-headers/page.tsx`
- Containers reference: `src/app/sandbox/kitchen-sink/containers/page.tsx`
- Sections reference: `src/app/sandbox/kitchen-sink/sections-and-dividers/page.tsx`

Current primitive caveat:

- `Surface` uses `rounded-2xl`, while the latest design guidance prefers 8px radius or existing system defaults. The color-picker lab already uses this `Surface`, so it is safe to reuse for consistency in the first prototype, but the branding page should prefer `SectionBlock`/bordered layout for production-like composition.

## Recommended Page Composition

Build `/sandbox/route-lab/app/branding` as a full-width route-lab page with a two-column working layout on desktop and single column on mobile.

Top route-lab wrapper:

- `RouteLabPage`
- title: `Branding`
- productionRoute: `accountScopedRoutes.branding("575")`
- description: "Organisation branding workspace for theme colors, template preview, and saved CMS selections."
- `stateOptions`: `["ready", "loading", "error", "empty", "legacy-theme"]`
- optional `modeOptions`: `["view", "edit"]`

Main sections:

1. Page header / summary
   - Use page header pattern, not a marketing hero.
   - Show account fixture name, template name, and theme name.

2. Brand colors
   - Use two `BrandColorField` components for primary and secondary.
   - Reuse duplicate, similarity, light/dark, and contrast warnings from the interaction lab.
   - Keep the fields client-side and fixture-backed in lab.

3. Preview rail
   - Use `FixturaAssetColorPreview`.
   - Pass `onboardingLogo?.url` when fixture has a logo.
   - Add compact metadata below the preview: normalized theme object, template variation, and media requirement status.

4. Template selection summary
   - Use `SectionBlock` and container/header patterns.
   - Start read-only in the first slice.
   - Display template category, variation, divideFixturesBy, poster/video/gallery availability.

5. CMS payload/debug panel
   - Keep a collapsible or quiet JSON panel in the lab, similar in spirit to `BrandingApiDump`.
   - Do not lead with JSON in the main route UI.

## Fixture Recommendation

Add fixture data under:

```txt
src/features/route-lab/fixtures/branding.ts
```

Suggested fixtures:

- `LAB_BRANDING_READY`: complete template, clean `theme.theme.primary` and `theme.theme.secondary`, optional logo.
- `LAB_BRANDING_EMPTY`: no template, no theme, no template option.
- `LAB_BRANDING_LEGACY_THEME`: valid colors using legacy keys such as `PrimaryColour` and `SecondaryColour`.
- `LAB_BRANDING_MEDIA_REQUIRED`: template has `requiresMedia: true` but missing poster/video/gallery.

This keeps route-lab independent from API availability while still matching `AccountBrandingData`.

## Implementation Sequence

1. Add `src/features/route-lab/fixtures/branding.ts`.
2. Add `src/app/sandbox/route-lab/app/branding/page.tsx`.
3. Add Branding to `ROUTE_LAB_NAV_SECTIONS` under "App (scoped)".
4. Extract a small client component for editable color state, likely:

```txt
src/app/sandbox/route-lab/app/branding/_components/branding-lab-workspace.tsx
```

5. Reuse color-picker validation logic directly for the first slice. Extract shared helpers only after duplication becomes uncomfortable.
6. Later, promote stable route UI into production under `src/app/(members)/o/[accountId]/branding`, replacing the API dump with API-backed data.

## Open Decisions

- Should production branding be editable immediately, or should the first production step be read-only preview plus "edit" affordances?
- Should the branding route eventually save colors through onboarding Step 2 APIs, or will there be dedicated account branding update endpoints?
- Should template and template option editing live on Branding, Templates, or a split flow?
- Should logo upload/crop be included in the first branding route, or linked out to the existing upload/image-crop lab until the route is stable?

## Recommendation

Start with a route-lab prototype that is fixture-backed, full-width, and composed from existing primitives. Put the color editor and asset preview in the first screen because that is the clearest branding workflow. Keep template and media details read-only at first so the page establishes layout, data normalization, and preview behavior before expanding into save/update flows.

The first useful target is:

```txt
/sandbox/route-lab/app/branding?state=ready&mode=edit
```

That should prove the route-lab nav item, page wrapper, color picker integration, section/header/container primitives, and normalized branding payload display without touching production behavior yet.
