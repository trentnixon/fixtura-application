# Application brand values

Repository evidence collected on 11 October 2026 at revision `6d3e8414b35352441ed1f9598a54793f4cb8ba29`.

This report separates Fixtura chrome, organisation branding, and preview template skins. It records central theme definitions and shared component overrides, rather than claiming an exhaustive inventory of every route's inline styling. The working tree's `src/vendor/fixtura-remotion-assets/preview.mjs` already had changes. Template findings were checked against the committed file using `git show HEAD:src/vendor/fixtura-remotion-assets/preview.mjs`. Links below locate the corresponding definitions in the current checkout, whose line numbers differ. No production deployment or Backend catalogue was queried.

## Fixtura chrome

### Theme source files

The root [layout](../../src/app/layout.tsx#L1) loads fonts and imports `globals.css` followed by `brand.css`. [globals.css](../../src/app/globals.css#L1) imports Tailwind, `tw-animate-css`, `styles/theme-tokens.css`, `styles/color-variables.css`, and `styles/color-utilities.css`. [brand.css](../../src/app/brand.css#L1) explicitly overrides the earlier semantic colour mappings through the CSS cascade. [theme-tokens.css](../../src/app/styles/theme-tokens.css#L1) maps variables to Tailwind colour, font, and radius utilities. [color-variables.css](../../src/app/styles/color-variables.css#L1) owns the base radius, sidebar, and chart values. [color-utilities.css](../../src/app/styles/color-utilities.css#L1) provides colour utility classes.

Shared visual overrides also live in [button](../../src/components/ui/button.tsx#L1), [card](../../src/components/ui/card.tsx#L1), [GridCard](../../src/components/ui/grid-card.tsx#L44), [input](../../src/components/ui/input.tsx#L11), [dialog](../../src/components/ui/dialog.tsx#L55), [sheet](../../src/components/ui/sheet.tsx#L55), [sidebar](../../src/components/ui/sidebar.tsx#L206), and the [typography components](../../src/components/typography/index.ts#L1). Tailwind supplies the standard spacing, shadows, and utility easings. There is no separate central Application motion-token file among these sources.

### Colours and video roles

These are the values after `brand.css` overrides. `accent` in the video-role table uses the primary action colour. The CSS token `--accent` itself is a neutral interaction surface.

| Video role | Token                               | Light value                      | Dark value                       | Source                                    |
| ---------- | ----------------------------------- | -------------------------------- | -------------------------------- | ----------------------------------------- |
| canvas     | `--background`                      | `var(--neutral-50)` = `#fafbfc`  | `var(--neutral-950)` = `#030712` | [brand.css](../../src/app/brand.css#L90)  |
| ink        | `--foreground`                      | `var(--neutral-900)` = `#111827` | `var(--neutral-50)` = `#fafbfc`  | [brand.css](../../src/app/brand.css#L91)  |
| muted      | `--muted-foreground`                | `var(--neutral-600)` = `#4b5563` | `var(--neutral-400)` = `#9ca3af` | [brand.css](../../src/app/brand.css#L105) |
| accent     | `--primary`, also `--brand-primary` | `var(--primary-500)` = `#4c82c6` | `var(--primary-400)` = `#60a5fa` | [brand.css](../../src/app/brand.css#L99)  |
| surface    | `--card`                            | `#ffffff`                        | `var(--neutral-900)` = `#111827` | [brand.css](../../src/app/brand.css#L93)  |

Other semantic values below share the [light mappings](../../src/app/brand.css#L93) and [dark mappings](../../src/app/brand.css#L132).

| Token                                                                                        | Light     | Dark      | Paints                                      |
| -------------------------------------------------------------------------------------------- | --------- | --------- | ------------------------------------------- |
| `--card-foreground`, `--popover-foreground`, `--secondary-foreground`, `--accent-foreground` | `#111827` | `#fafbfc` | Text on their corresponding surfaces        |
| `--popover`                                                                                  | `#ffffff` | `#111827` | Popovers                                    |
| `--primary-foreground`, `--brand-foreground`                                                 | `#ffffff` | `#030712` | Primary button text                         |
| `--secondary`, `--muted`, `--accent`                                                         | `#f3f4f6` | `#1f2937` | Secondary and muted surfaces, hover accents |
| `--border`, `--input`                                                                        | `#e6eaf0` | `#1f2937` | Borders and inputs                          |
| `--ring`                                                                                     | `#4c82c6` | `#60a5fa` | Focus ring                                  |
| `--destructive`                                                                              | `#d64545` | `#dc2626` | Destructive states                          |
| `--destructive-foreground`                                                                   | `#ffffff` | `#fafbfc` | Destructive text                            |
| `--success`                                                                                  | `#2ca58d` | `#4ade80` | Success states                              |
| `--warning`                                                                                  | `#e6a23c` | `#facc15` | Warning states                              |
| `--brand-secondary`                                                                          | `#14b8a6` | `#2dd4bf` | Fixtura secondary brand utility             |
| `--brand-accent`                                                                             | `#f97316` | `#fb923c` | Fixtura accent brand utility                |

These scales belong to the Application's own `brand.css`, including the prefix `brand-secondary`. They do not come from organisation records. Each row lists suffixes in order `50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950`.

| Variable prefix      | Values in suffix order                                                                                                  | Source                                   |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| `--neutral-`         | `#fafbfc`, `#f3f4f6`, `#e6eaf0`, `#d1d5db`, `#9ca3af`, `#6b7280`, `#4b5563`, `#374151`, `#1f2937`, `#111827`, `#030712` | [brand.css](../../src/app/brand.css#L5)  |
| `--primary-`         | `#eff6ff`, `#dbeafe`, `#bfdbfe`, `#93c5fd`, `#60a5fa`, `#4c82c6`, `#2563eb`, `#1d4ed8`, `#1e40af`, `#1e3a8a`, `#172554` | [brand.css](../../src/app/brand.css#L17) |
| `--brand-secondary-` | `#f0fdfa`, `#ccfbf1`, `#99f6e4`, `#5eead4`, `#2dd4bf`, `#14b8a6`, `#0d9488`, `#0f766e`, `#115e59`, `#134e4a`, `#042f2e` | [brand.css](../../src/app/brand.css#L29) |
| `--brand-accent-`    | `#fff7ed`, `#ffedd5`, `#fed7aa`, `#fdba74`, `#fb923c`, `#f97316`, `#ea580c`, `#c2410c`, `#9a3412`, `#7c2d12`, `#431407` | [brand.css](../../src/app/brand.css#L41) |
| `--success-`         | `#f0fdf4`, `#dcfce7`, `#bbf7d0`, `#86efac`, `#4ade80`, `#2ca58d`, `#16a34a`, `#15803d`, `#166534`, `#14532d`, `#052e16` | [brand.css](../../src/app/brand.css#L53) |
| `--warning-`         | `#fefce8`, `#fef9c3`, `#fef08a`, `#fde047`, `#facc15`, `#e6a23c`, `#ca8a04`, `#a16207`, `#854d0e`, `#713f12`, `#422006` | [brand.css](../../src/app/brand.css#L65) |
| `--error-`           | `#fef2f2`, `#fee2e2`, `#fecaca`, `#fca5a5`, `#f87171`, `#d64545`, `#dc2626`, `#b91c1c`, `#991b1b`, `#7f1d1d`, `#450a0a` | [brand.css](../../src/app/brand.css#L77) |

Sidebar and chart tokens retain OKLCH literals from [color-variables.css](../../src/app/styles/color-variables.css#L28), rather than the overridden base semantic values. No exact hex equivalents are declared for these tokens.

| Token                          | Light                         | Dark                         |
| ------------------------------ | ----------------------------- | ---------------------------- |
| `--chart-1`                    | `oklch(0.646 0.222 41.116)`   | `oklch(0.488 0.243 264.376)` |
| `--chart-2`                    | `oklch(0.6 0.118 184.704)`    | `oklch(0.696 0.17 162.48)`   |
| `--chart-3`                    | `oklch(0.398 0.07 227.392)`   | `oklch(0.769 0.188 70.08)`   |
| `--chart-4`                    | `oklch(0.828 0.189 84.429)`   | `oklch(0.627 0.265 303.9)`   |
| `--chart-5`                    | `oklch(0.769 0.188 70.08)`    | `oklch(0.645 0.246 16.439)`  |
| `--sidebar`                    | `oklch(0.9705 0.0142 254.6)`  | `oklch(0.15 0 0)`            |
| `--sidebar-foreground`         | `oklch(0.145 0 0)`            | `oklch(1 0 0)`               |
| `--sidebar-primary`            | `oklch(0.205 0 0)`            | `oklch(0.488 0.243 264.376)` |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)`            | `oklch(1 0 0)`               |
| `--sidebar-accent`             | `oklch(0.2823 0.0874 267.94)` | `oklch(0.26 0 0)`            |
| `--sidebar-accent-foreground`  | `oklch(1 0 0)`                | `oklch(1 0 0)`               |
| `--sidebar-border`             | `oklch(0.922 0 0)`            | `oklch(1 0 0 / 10%)`         |
| `--sidebar-ring`               | `oklch(0.708 0 0)`            | `oklch(0.556 0 0)`           |

### Light and dark availability

Both palettes are defined. Dark styling requires the `.dark` selector in [brand.css](../../src/app/brand.css#L128) and the [Tailwind dark variant](../../src/app/globals.css#L7). The [root layout](../../src/app/layout.tsx#L32) renders no `dark` class, and the signed-in shell does not introduce a UI theme provider. The repository default is therefore light. I don't know whether production adds a dark class outside this implementation. A `next-themes` dependency alone does not prove system-theme selection.

### Typography

| Video role | Family              | Weights requested                                                               | Applied by                                              | Source                                                                                                                                                         |
| ---------- | ------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| display    | `Plus Jakarta Sans` | Variable normal face, `200` through `800`; no explicit static weights in loader | `--font-jakarta` to `--font-heading`, heading utilities | [layout](../../src/app/layout.tsx#L14), [tokens](../../src/app/styles/theme-tokens.css#L5), [H1](../../src/components/typography/h1.tsx#L12)                   |
| body       | `Inter`             | Variable normal face, `100` through `900`; no explicit static weights in loader | `--font-inter` to `--font-sans`; root body `font-sans`  | [layout](../../src/app/layout.tsx#L19), [tokens](../../src/app/styles/theme-tokens.css#L4)                                                                     |
| mono       | `Geist Mono`        | Variable normal face, `100` through `900`; no explicit static weights in loader | `--font-geist-mono` to `--font-mono`, inline code       | [layout](../../src/app/layout.tsx#L24), [tokens](../../src/app/styles/theme-tokens.css#L6), [inline code](../../src/components/typography/inline-code.tsx#L12) |

The loaded weight ranges come from installed Next Google-font metadata for [Plus Jakarta Sans](../../node_modules/next/dist/compiled/@next/font/dist/google/font-data.json#L13605), [Inter](../../node_modules/next/dist/compiled/@next/font/dist/google/font-data.json#L6173), and [Geist Mono](../../node_modules/next/dist/compiled/@next/font/dist/google/font-data.json#L4951). They were checked with the [actual font option validator](../../node_modules/next/dist/compiled/@next/font/dist/google/validate-google-font-function-call.js#L47) using the layout's options. The loaders request `subsets: ["latin"]`. These ranges describe font availability, rather than a claim that every weight appears in the UI.

H1 uses `font-bold` = 700, H2 and H3 use `font-semibold` = 600, H4 and H5 use `font-medium` = 500. Body normally inherits weight 400. Semantic display and page-title components also differ: display uses 700 and page title uses 600. See [H1](../../src/components/typography/h1.tsx#L12), [H2](../../src/components/typography/h2.tsx#L14), [H3](../../src/components/typography/h3.tsx#L1), [H4](../../src/components/typography/h4.tsx#L1), [H5](../../src/components/typography/h5.tsx#L1), [body](../../src/components/typography/p.tsx#L1), and [shell hierarchy](../../src/components/typography/shell-hierarchy.tsx#L15).

`font-brand` appears in brand typography components, but I don't know what family it resolves to: no matching font token or utility declaration was found. Do not treat that class as proof of an additional font face. See [brand typography](../../src/components/typography/brand.tsx#L1).

### Radii

Pixels below assume the browser's standard 16px root size. The source uses rem or formulas.

| Name                | Source value                | Pixels               | Use                         | Source                                                                                                  |
| ------------------- | --------------------------- | -------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------- |
| `--radius`          | `0.625rem`                  | 10                   | Base radius                 | [variables](../../src/app/styles/color-variables.css#L2)                                                |
| `--radius-sm`       | `calc(var(--radius) - 4px)` | 6                    | `rounded-sm`                | [tokens](../../src/app/styles/theme-tokens.css#L43)                                                     |
| `--radius-md`       | `calc(var(--radius) - 2px)` | 8                    | `rounded-md`, sidebar items | [tokens](../../src/app/styles/theme-tokens.css#L44)                                                     |
| `--radius-lg`       | `var(--radius)`             | 10                   | `rounded-lg`                | [tokens](../../src/app/styles/theme-tokens.css#L45)                                                     |
| `--radius-xl`       | `calc(var(--radius) + 4px)` | 14                   | `rounded-xl`, standard card | [tokens](../../src/app/styles/theme-tokens.css#L46), [card](../../src/components/ui/card.tsx#L1)        |
| `rounded-[1.25rem]` | `1.25rem`                   | 20                   | GridCard and dialog         | [GridCard](../../src/components/ui/grid-card.tsx#L44), [dialog](../../src/components/ui/dialog.tsx#L55) |
| `rounded-[0.75rem]` | `0.75rem`                   | 12                   | Input                       | [input](../../src/components/ui/input.tsx#L11)                                                          |
| `rounded-full`      | Tailwind full radius        | Pill, size-dependent | Buttons                     | [button](../../src/components/ui/button.tsx#L1)                                                         |

There is no single universal card radius. Use 14px for the standard `Card` component, or 20px when reproducing a `GridCard`.

### Motion

No custom shared motion-token set was found in the central CSS files above. Shared components do define recurring values.

| Name in source                                                                      | Duration                 | Easing                                                  | Use                                                               | Source                                                 |
| ----------------------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------ |
| `duration-200 ease-linear`                                                          | 200ms                    | `linear`                                                | Sidebar width and position                                        | [sidebar](../../src/components/ui/sidebar.tsx#L206)    |
| `duration-300 ease-out`                                                             | 300ms                    | Tailwind `ease-out` = `cubic-bezier(0, 0, 0.2, 1)`      | GridCard hover styles                                             | [GridCard](../../src/components/ui/grid-card.tsx#L213) |
| `duration-700 ease-[cubic-bezier(0.33,1,0.68,1)]`                                   | 700ms                    | `cubic-bezier(0.33,1,0.68,1)`                           | GridCard transform and shadow; reduced-motion disables transition | [GridCard](../../src/components/ui/grid-card.tsx#L526) |
| `data-[state=closed]:duration-300`, `data-[state=open]:duration-500`, `ease-in-out` | Closed 300ms, open 500ms | Tailwind `ease-in-out` = `cubic-bezier(0.4, 0, 0.2, 1)` | Sheet transition                                                  | [sheet](../../src/components/ui/sheet.tsx#L55)         |
| `duration-200`                                                                      | 200ms                    | Not explicitly overridden on that class list            | Dialog animation                                                  | [dialog](../../src/components/ui/dialog.tsx#L55)       |
| `duration-300`                                                                      | 300ms                    | Default transition timing                               | Input                                                             | [input](../../src/components/ui/input.tsx#L11)         |

Tailwind's installed default transition duration is `150ms`, timing `cubic-bezier(0.4, 0, 0.2, 1)`, defined in [Tailwind theme defaults](../../node_modules/tailwindcss/theme.css#L492). The utility easing definitions are in [the same theme](../../node_modules/tailwindcss/theme.css#L435). These are framework defaults, not a Fixtura motion spec.

### Fixtura marks

| Slot     | File path                                                                                                             | Format                        | Background                                                                   | Clear space           | Minimum size                                                   |
| -------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------- | --------------------- | -------------------------------------------------------------- |
| wordmark | I don't know. No distinct shipped wordmark file found                                                                 | Unknown                       | Unknown                                                                      | No written rule found | No written rule found                                          |
| mark     | `public/logos/apple-touch-icon.png`                                                                                   | PNG, 180×180, alpha           | Transparent blue/teal stylised F; sign-in displays it on light public chrome | No written rule found | No written rule found                                          |
| favicon  | `public/logos/favicon-16x16.png`, `public/logos/favicon-32x32.png`, `public/logos/favicon.ico`, `src/app/favicon.ico` | PNG / ICO                     | PNGs have alpha; no declared light/dark-specific variant                     | No written rule found | Raster exports are 16×16 and 32×32, not a stated usage minimum |
| app icon | `public/logos/android-chrome-192x192.png`, `public/logos/android-chrome-512x512.png`                                  | PNG, alpha, 192×192 / 512×512 | Transparent, no declared theme-specific variant                              | No written rule found | Export sizes only                                              |

Asset evidence is the files themselves in [public/logos](../../public/logos/apple-touch-icon.png) and [the app favicon](../../src/app/favicon.ico). The alpha and dimensions were read from the actual PNGs. The mark was visually inspected. I found no written clear-space, minimum-size, or misuse rule. [Icon metadata](../../src/config/metadata.ts#L17) points to the shipped logo assets; it does not create a wordmark rule. Do not invent a vector master from these PNGs.

## Organisation brand

### Saved record

The account refers to a theme. Colours live on that theme, not as four account-level columns. The API read shape is `AccountBrandingTheme { id: number; name: string; theme: Record<string, unknown>; isPublic?: boolean | null }`. Branding reads also return `template`, generic `template_option`, optional `templateOptionId`, and optional `onboardingLogo: BrandingMedia | null`. See [account API types](../../src/types/api/account.ts#L842).

There are four recognised colour fields, each represented as a string hex value: `primary`, `secondary`, `dark`, and `white`. Creation requires all four strings plus `name`. PATCH input permits each string to be `null`, and the comment also permits `""` to clear it. `themeId` selects a premade or private theme. See [creation type](../../src/types/api/account.ts#L398) and [palette/PATCH types](../../src/types/api/account.ts#L873).

The local parser accepts legacy primary aliases `PrimaryColour`, `primaryColour`, `Primary`, `primary_color`, and secondary aliases `SecondaryColour`, `secondaryColour`, `Secondary`, `secondary_color`. Missing/invalid values resolve to primary `#64748B`, secondary `#94A3B8`, dark `#111`, white `#FFF`. These are fallback values, not a saved club palette. See [theme parser](../../src/lib/branding/theme-colours-from-account.ts#L13).

The route-lab fixture below is an example, not a production organisation or a Fixtura chrome palette. Source [LAB_BRANDING_READY](../../src/features/route-lab/fixtures/branding.ts#L34).

```ts
theme: {
  id: 42,
  name: "Club classics",
  theme: {
    primary: "#79001F",
    secondary: "#FDBC2C",
    dark: "#111111",
    white: "#FFFFFF",
  },
  isPublic: true,
}
```

The persistent database schema and any additional production theme JSON fields are Not in this repository. This repository consumes Strapi records from the separate `Fixtura.com.au/Backend` repository, as shown by the [BFF proxy](../../src/app/api/account/onboarding/lookups/themes/route.ts#L8).

### Premade themes

The production catalogue is Not in this repository. The Backend sends `OnboardingThemeOption { id: number; label: string; slug?: string | null; sortOrder?: number | null; sport: AccountSportEnum | null; theme: Record<string, unknown> | null }`. See [type](../../src/types/api/account.ts#L255) and [proxy](../../src/app/api/account/onboarding/lookups/themes/route.ts#L18). I don't know which themes production currently returns.

These three palettes are local fallback options when the onboarding theme list is unavailable. They are not evidence of the complete Backend catalogue. Source [FALLBACK_PREMADE_THEMES](<../../src/app/(members)/create-organisation/_components/wizard-step-branding.tsx#L74>).

| Theme   | Sport/account type | `primary` | `secondary` | `dark` | `white` |
| ------- | ------------------ | --------- | ----------- | ------ | ------- |
| Classic | `sport: null`      | `#79001F` | `#FDBC2C`   | `#111` | `#FFF`  |
| Bold    | `sport: null`      | `#0F172A` | `#38BDF8`   | `#111` | `#FFF`  |
| Minimal | `sport: null`      | `#1E293B` | `#94A3B8`   | `#111` | `#FFF`  |

`dark` and `white` reference `THEME_JSON_DEFAULT_DARK` and `THEME_JSON_DEFAULT_WHITE` from the [parser constants](../../src/lib/branding/theme-colours-from-account.ts#L13).

### Logo rules

Organisation and club uploaders share PNG, JPEG, WebP input, max 8 MB, source minimum 500×500px, crop output minimum 400×400px, default output `image/png`. The source explicitly cautions that server limits may differ and CMS constraints are not yet documented. See [organisation uploader](../../src/features/branding/components/brand-logo-workspace/index.tsx#L272), [club uploader](<../../src/app/(members)/o/[accountId]/club-logos/_components/club-logo-workspace.tsx#L250>), [minimum constants](../../src/features/branding/components/brand-logo-workspace/logo-save-validation.ts#L1), and [shared input/output defaults](../../src/components/media/image-uploader-crop.tsx#L190).

Both start with `aspect={1}` and allow the shared presets: `1:1`, `4:3`, `3:4`, `4:5`, `5:4`, `9:16`, `16:9`. These are logo presets, not the background-image rules. See [preset definitions](../../src/lib/media/selectable-logo-crop-presets.ts#L1). Onboarding uses the same source/output validation constants and logo presets in [the branding step](<../../src/app/(members)/create-organisation/_components/wizard-step-branding.tsx#L25>).

Output is not forced to exactly 400×400px. The crop exports width `Math.max(1, Math.round(pixelCrop.width))` and height `Math.max(1, Math.round(pixelCrop.height))`, with the 400px minimum checked separately. Quality defaults to `0.92`, but PNG export passes no quality argument. See [crop exporter](../../src/lib/media/get-cropped-image.ts#L19).

No different sponsor upload limit was found. The existing sponsor rules in the request remain applicable; [the sponsor constants](<../../src/app/(members)/o/[accountId]/manage-sponsors/_components/editor/_constants/sponsor-logo-upload.ts#L11>) agree. No background-image rule is repeated here.

## Template builder

### Colour pairings

The selectable catalogue names and IDs arrive from the Backend, so the authoritative production list is Not in this repository. One UI type is `TemplatePaletteUiItem { id: number; name: string; ui: { value: string } }`, where `value` is a CSS-ready string from CMS. See [palette type](../../src/types/api/template-palettes.ts#L7). The larger template-options endpoint also includes `TemplatePaletteItem` in [all-template-options](../../src/types/api/all-template-options.ts#L105).

The Application does contain these recognised pairing keys and local calculations. This table records the literal program keys, rather than inventing human-facing catalogue names. Let `P` be the saved organisation primary and `S` its secondary. Every pair below is the local preview tile's left/right pair, not a guarantee that every template paints them in that order. Source [pair builder](../../src/features/remotion-asset-preview/utils/resolve-remotion-palette-layout-colors.ts#L44) and [key list/name normaliser](../../src/features/remotion-asset-preview/utils/read-remotion-palette-key-from-branding.ts#L5).

| Pairing key        | Colours selected             |
| ------------------ | ---------------------------- |
| `primary`          | `[P, S]`                     |
| `primaryOnWhite`   | `[P, "white"]`               |
| `primaryOnBlack`   | `[P, "black"]`               |
| `secondary`        | `[S, P]`                     |
| `secondaryOnWhite` | `[S, "white"]`               |
| `secondaryOnBlack` | `[S, "black"]`               |
| `accentPrimary`    | `[accent(P), complement(P)]` |
| `accentSecondary`  | `[accent(S), complement(S)]` |
| `complementary`    | `[P, complement(P)]`         |
| `analogous`        | `[P, spin(P, 30)]`           |
| `triadic`          | `[P, triad(P)[1]]`           |
| `monochromatic`    | `[P, P]`                     |
| `highContrast`     | `[P, S]`                     |

The exact formulas are `tinycolor(color).complement().toString()`, `tinycolor(color).spin(30).toString()`, `tinycolor(color).triad()[1].toString()`, and `tinycolor(color).spin(30).saturate(10).toString()` for accent. The split tile paints `linear-gradient(to right, ${left} 50%, ${right} 50%)`. See [formula definitions](../../src/features/remotion-asset-preview/utils/resolve-remotion-palette-layout-colors.ts#L13). These computed colours cannot be quoted as fixed hex without a particular organisation palette.

### Contrast modes

Backend items arrive as `{ id: number; name: string | null; slug: string | null }`; production names/IDs are Not in this repository. See [mode type](../../src/types/api/template-modes.ts#L1). The Application recognises four slug presets, normalises underscores to hyphens, and maps them to Remotion camelCase keys. See [slug mapping](../../src/features/remotion-asset-preview/utils/template-mode-to-remotion-mode.ts#L4).

| Slug preset | Remotion mode | Preview effect                                                                                 |
| ----------- | ------------- | ---------------------------------------------------------------------------------------------- |
| `light`     | `light`       | White surface, dark titles and copy; light logo backdrop                                       |
| `light-alt` | `lightAlt`    | White surface, white titles; copy on light preview surfaces becomes light; light logo backdrop |
| `dark`      | `dark`        | Zinc-950 surface, white titles/copy; dark logo backdrop                                        |
| `dark-alt`  | `darkAlt`     | Zinc-950 surface, dark titles/copy on dark preview surfaces; dark logo backdrop                |

These are UI-preview semantics from [template-mode-contrast](../../src/components/pickers/template-mode/_utils/template-mode-contrast.ts#L16). In the common bundled template mode object, `lightAlt` keeps copy `#000` while title becomes `#fff`, and `darkAlt` keeps copy `#fff` while title becomes `#000`. Do not collapse the UI card's copy styling and the rendered template mode into one claim. The template object is in [basic theme mode](../../src/vendor/fixtura-remotion-assets/preview.mjs#L3222), and other skins can override its colours.

## Template skins

The shipped variant list is [REMOTION_SANDBOX_TEMPLATE_IDS](../../src/components/remotion/_constants/remotion-templates.ts#L3). The local preview implementation is a bundled vendor artefact. Its embedded source comments identify `src/templates/variants/...` as the owning source in the separate `fixtura-remotion-version2` repository, which the [package handoff](../../.comms/remotion/REMOTION_PACKAGE_HOWTO.md#L3) names. `fixtura-remotion-assets` is the vendored package name. This report can quote the vendored snapshot; upstream source assets and production rendering behaviour are Not in this repository.

### Hard-coded theme values

The table covers each variant's theme configuration. Individual composition styling can add further literal values. There is no evidence that any of these template palettes is the Fixtura Application chrome palette.

Common mode palette `A` is exactly: light/lightAlt container `#fff`, alternate `#f0f0f0`, transparent `rgba(255, 255, 255, 0.5)`; dark/darkAlt container `#000`, alternate `#1a1a1a`, transparent `rgba(0, 0, 0, 0.5)`. Title/copy pairs are light `#000`/`#000`, lightAlt `#fff`/`#000`, dark `#fff`/`#fff`, darkAlt `#000`/`#fff`. See [Basic mode](../../src/vendor/fixtura-remotion-assets/preview.mjs#L3222).

Common palette `B`, used by Scoreline and NightSession, is light/lightAlt background `transparent`, alternate `#f3f0ea`, transparent `rgba(255, 255, 255, 0.5)`; dark/darkAlt background `#080b0d`, alternate `#1a1a1a`, transparent `rgba(0, 0, 0, 0.5)`. Title/copy pairs are light `#080b0d`/`#080b0d`, lightAlt `#ffffff`/`#080b0d`, dark `#ffffff`/`#ffffff`, darkAlt `#080b0d`/`#ffffff`. See [Scoreline mode](../../src/vendor/fixtura-remotion-assets/preview.mjs#L64307).

| Variant             | Hard-coded colours                | Type: title / subtitle / copy                          | Container radius                                     | Source                                                                                                                                              |
| ------------------- | --------------------------------- | ------------------------------------------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Basic               | A                                 | `Heebo` / `Heebo` / `Heebo`                            | `"rounded-none"` = 0                                 | [theme](../../src/vendor/fixtura-remotion-assets/preview.mjs#L3069)                                                                                 |
| Brickwork           | A                                 | `Allerta Stencil` / `Roboto` / `Roboto`                | `"rounded-none"` = 0                                 | [theme](../../src/vendor/fixtura-remotion-assets/preview.mjs#L54953), [font constants](../../src/vendor/fixtura-remotion-assets/preview.mjs#L14242) |
| Classic             | A                                 | `Impact` / `Impact` / `Heebo`                          | `"rounded-none"` = 0                                 | [theme](../../src/vendor/fixtura-remotion-assets/preview.mjs#L15265)                                                                                |
| CNSW                | A                                 | `Impact` / `Heebo` / `Heebo`                           | `"rounded-none"` = 0                                 | [theme](../../src/vendor/fixtura-remotion-assets/preview.mjs#L56780)                                                                                |
| CNSWPrivate         | Custom C below                    | `Impact` / `Heebo` / `Heebo`                           | `"rounded-none"` = 0                                 | [theme](../../src/vendor/fixtura-remotion-assets/preview.mjs#L59405)                                                                                |
| Sixers              | A                                 | `Slightly Marker` / `Slightly Marker` / `Resolve`      | `"rounded-none"` = 0                                 | [theme](../../src/vendor/fixtura-remotion-assets/preview.mjs#L56148)                                                                                |
| Thunder             | A                                 | `Monument Extended` / `Monument Extended` / `Tungsten` | `"rounded-none"` = 0                                 | [theme](../../src/vendor/fixtura-remotion-assets/preview.mjs#L57868)                                                                                |
| TwoColumnClassic    | A                                 | `Impact` / `Impact` / `Heebo`                          | `"rounded-none "` = 0, source retains trailing space | [theme](../../src/vendor/fixtura-remotion-assets/preview.mjs#L58522)                                                                                |
| Mudgeeraba          | A                                 | `Unbounded` / `Unbounded` / `Heebo`                    | `"rounded-none"` = 0                                 | [theme](../../src/vendor/fixtura-remotion-assets/preview.mjs#L60461)                                                                                |
| BroadcastPro        | A                                 | `Teko` / `Rajdhani` / `Rajdhani`                       | `"rounded-none"` = 0                                 | [tokens](../../src/vendor/fixtura-remotion-assets/preview.mjs#L61961), [layout](../../src/vendor/fixtura-remotion-assets/preview.mjs#L61892)        |
| BroadcastProRounded | A                                 | `Teko` / `Rajdhani` / `Rajdhani`                       | Container and image `"rounded-2xl"`                  | [tokens](../../src/vendor/fixtura-remotion-assets/preview.mjs#L63401), [layout](../../src/vendor/fixtura-remotion-assets/preview.mjs#L63318)        |
| Scoreline           | B                                 | `Geist` / `Geist` / `Geist`                            | `"rounded-none"` = 0                                 | [tokens](../../src/vendor/fixtura-remotion-assets/preview.mjs#L64355), [layout](../../src/vendor/fixtura-remotion-assets/preview.mjs#L64286)        |
| NightSession        | B, inherits Scoreline mode/layout | `Teko` / `Source Sans 3` / `Source Sans 3`             | Inherits `"rounded-none"` = 0                        | [tokens](../../src/vendor/fixtura-remotion-assets/preview.mjs#L65108), [theme](../../src/vendor/fixtura-remotion-assets/preview.mjs#L65129)         |

`rounded-2xl` is quoted as the bundle's own class, rather than converted using the Application's `--radius` mapping. The bundle's class-to-inline-style resolver does not declare a `rounded-2xl` case among its recognised radius classes. I don't know which independent styling context supplies its final pixel radius in every render. Do not substitute the chrome's 14px card radius.

CNSWPrivate's `C` values, in each row's exact source spelling, come from its [theme mode](../../src/vendor/fixtura-remotion-assets/preview.mjs#L59405).

| Mode     | Background | Alternate | Transparent                 | Title     | Copy      |
| -------- | ---------- | --------- | --------------------------- | --------- | --------- |
| light    | `#ffffff`  | `#f2f6ff` | `rgba(255, 255, 255, 0.65)` | `#002C6E` | `#0A1A2F` |
| lightAlt | `#ffffff`  | `#e9f1ff` | `rgba(255, 255, 255, 0.5)`  | `#001a45` | `#0A1A2F` |
| dark     | `#0A1A2F`  | `#031022` | `rgba(10, 26, 47, 0.65)`    | `#E6F0FF` | `#E6F0FF` |
| darkAlt  | `#0A1A2F`  | `#0c1c33` | `rgba(10, 26, 47, 0.5)`     | `#cfe3ff` | `#e6f0ff` |

### Ownership

The code names `CNSW`, `CNSWPrivate`, `Sixers`, `Thunder`, and `Mudgeeraba` identify named skins in [the variant list](../../src/components/remotion/_constants/remotion-templates.ts#L3) and the embedded variant source comments above. Treat them as organisation/competition-named skins when separating brand references. I don't know their precise licensing or legal brand ownership from this repository. None is declared as the Fixtura chrome palette. Basic, Brickwork, Classic, TwoColumnClassic, BroadcastPro, BroadcastProRounded, Scoreline, and NightSession are generic variant names, but that alone does not establish that their palettes are Fixtura's corporate brand. Their neutral palette can coexist with saved customer colours through the colour system.

## Other implemented values and revision limits

The public-page motif has background `rgb(254, 254, 254)` and an embedded 4×4 SVG dot pattern with fill `#4A7BC8` and opacity `0.25`. Its comment says it matches the marketing site, but the actual implementation is local. See [globals.css](../../src/app/globals.css#L18). This public route value differs from the signed-in page background.

The chrome uses Tailwind spacing unit `0.25rem` and standard shadows. `shadow-xl` resolves to `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` in installed [Tailwind theme.css](../../node_modules/tailwindcss/theme.css#L411), with [spacing](../../node_modules/tailwindcss/theme.css#L325); the [GridCard](../../src/components/ui/grid-card.tsx#L44) uses it. Dialog explicitly uses `bg-white/95`, `border-white/20`, `backdrop-blur-xl`, and `shadow-2xl` with dark `bg-black/90`/`border-white/10`, so its glass treatment cannot be reduced to the plain `--card` value. See [dialog](../../src/components/ui/dialog.tsx#L55).

Template base motion defines `fast: 300`, `normal: 500`, `slow: 800`, and easing `cubic-bezier(0.25, 0.1, 0.25, 1.0)`, `cubic-bezier(0.42, 0, 1.0, 1.0)`, `cubic-bezier(0, 0, 0.58, 1.0)`, `cubic-bezier(0.42, 0, 0.58, 1.0)`. Those belong to the preview template base theme, not UI motion tokens. See [vendor base theme](../../src/vendor/fixtura-remotion-assets/preview.mjs#L2926).

I don't know of a written corporate brand guide in this repository that declares video safe areas, a canonical wordmark, clear space, or video framing. No evidence supports carrying over the video canvas's 100/80/100/80 safe area or Helvetica stack as a Fixtura value.

All source-derived answers are unverified for production if it is not revision `6d3e841`. The source can verify what this revision implements, not which revision is deployed. Backend catalogue values, organisation media URLs, member palettes, and template-mode records can change without an Application commit. Framework font availability and utility defaults also depend on the installed dependency versions. The existing dirty vendor bundle means local previews may differ from the committed template evidence above even while HEAD remains `6d3e841`.
