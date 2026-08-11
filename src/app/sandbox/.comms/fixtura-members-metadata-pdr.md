# Fixtura Members Area — Metadata & Favicon PDR

## Purpose

This document defines how metadata should be structured in the rebuilt **Fixtura Members Area** so page titles, descriptions, and icons are handled in a clean, reusable way.

The goal is to avoid hardcoding metadata inside every route file and instead create a small metadata system that is:

- reusable
- easy to maintain
- consistent across the app
- simple for future LLM/code generation workflows to follow

This also includes updating the app favicon so the Members Area uses the Fixtura brand icon from the `public` folder.

---

## Goals

We want to:

1. create a reusable metadata pattern for the app
2. keep metadata logic out of individual route files where possible
3. define a clear title pattern for all pages
4. support defaults, route-specific overrides, and future scaling
5. update favicon/app icons to Fixtura branding
6. keep implementation aligned with **Next.js App Router** conventions

---

## Problem We Are Solving

Right now, metadata can easily become fragmented if each route defines its own titles and descriptions manually.

That creates problems like:

- inconsistent page titles
- duplicate descriptions
- hard-to-maintain route metadata
- poor reuse across authenticated and public areas
- weak brand consistency
- harder future SEO/social sharing improvements

We want a central system that allows us to define metadata once and compose it per route.

---

## Desired Outcome

The Fixtura Members Area should have:

- a single metadata config source for global defaults
- a reusable helper for building page metadata
- consistent title formatting across the app
- support for layout-level metadata inheritance
- branded favicon and app icons loaded from `public`
- a structure that can easily expand later into Open Graph, Twitter cards, robots, canonical URLs, and environment-based metadata

---

# Recommended Approach

## 1) Create a central metadata config file

Create a reusable config file that stores application-level defaults.

Suggested file:

`src/config/metadata.ts`

This file should contain:

- app name
- app short name
- metadata base URL
- default title
- title template
- default description
- application name
- brand/company name
- default robots rules
- icon paths
- optional Open Graph defaults for later use

### Example responsibilities of this file

- define the Members Area brand naming convention
- store the base title template
- act as the single source of truth for metadata defaults
- reduce duplication everywhere else

---

## 2) Create a reusable metadata builder/helper

Create a helper function that generates metadata objects in a consistent shape.

Suggested file:

`src/lib/metadata/buildMetadata.ts`

This helper should:

- accept page-level overrides
- merge them with global defaults
- return a valid Next.js `Metadata` object
- support simple usage from layouts/pages
- keep route files lightweight

### The helper should support values like:

- `title`
- `description`
- `noIndex`
- `pathname`
- `image` (future)
- `section` or `area` (optional, if useful)

---

## 3) Use layout metadata for shared route groups

Because the app is being rebuilt with route groups, metadata should be applied at the correct level.

Suggested usage:

- root layout → app-wide defaults
- public layout → public/auth-related metadata defaults
- authenticated layout → members-area/private defaults
- individual pages → only override when needed

This keeps metadata inheritance clean and avoids repeating the same values.

---

## 4) Standardise title formatting

We should define one title pattern and use it everywhere.

### Recommended title pattern

For individual pages:

`[Page Name] | Fixtura Members`

Examples:

- Dashboard | Fixtura Members
- Sign In | Fixtura Members
- Organisations | Fixtura Members
- Create Organisation | Fixtura Members
- Account Settings | Fixtura Members

### Default/fallback title

`Fixtura Members`

This ensures:

- brand consistency
- simple browser tab labels
- predictable UX
- clean future SEO structure

---

## 5) Keep descriptions practical for now

For the Members Area, descriptions do not need to be heavily marketing-focused.

They should be:

- clear
- functional
- short
- specific to the page or route section

Example style:

- Access your Fixtura member dashboard, organisation settings, and competition tools.
- Sign in to access your Fixtura Members account.
- Create and manage organisations inside Fixtura Members.

---

## 6) Update favicon and icons from `public`

The Members Area should use the Fixtura icon instead of the default app icon.

This should be handled through Next.js metadata icon settings and assets stored in `public`.

### Expected asset location

Use existing or new brand assets in:

- `public/favicon.ico`
- `public/icon.png`
- `public/apple-icon.png`

If multiple icon sizes are available, include them.

### Requirement

All favicon/app icon references should point to Fixtura brand assets from the `public` folder.

Do not leave default framework icons in place.

---

# Proposed File Structure

```txt
src/
  app/
    layout.tsx
    (public)/
      layout.tsx
    (auth)/
      layout.tsx
  config/
    metadata.ts
  lib/
    metadata/
      buildMetadata.ts
public/
  favicon.ico
  icon.png
  apple-icon.png
```

---

# Implementation Plan

## Step 1 — Create metadata config

Create `src/config/metadata.ts`

This file should export:

- base metadata constants
- brand/app naming
- default descriptions
- icon definitions
- base URL if available from environment variables

### Suggested shape

```ts
export const appMetadata = {
  appName: "Fixtura Members",
  appTitle: "Fixtura Members",
  titleTemplate: "%s | Fixtura Members",
  description: "Access your Fixtura member dashboard, organisations, and account tools.",
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};
```

This does not need to be exact, but the pattern should be centralised and easy to reuse.

---

## Step 2 — Create metadata builder helper

Create `src/lib/metadata/buildMetadata.ts`

This helper should:

- import the global config
- build a `Metadata` object
- accept override options
- allow route-level flexibility without duplication

### Suggested helper direction

```ts
import type { Metadata } from "next";
import { appMetadata } from "@/config/metadata";

type BuildMetadataOptions = {
  title?: string;
  description?: string;
  noIndex?: boolean;
};

export function buildMetadata(options: BuildMetadataOptions = {}): Metadata {
  const { title, description, noIndex } = options;

  return {
    title: title || appMetadata.appTitle,
    description: description || appMetadata.description,
    metadataBase: new URL(appMetadata.baseUrl),
    icons: appMetadata.icons,
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}
```

This can be expanded later, but should stay simple for now.

---

## Step 3 — Apply defaults in root layout

In `src/app/layout.tsx`, define the root metadata using shared config/helper.

This should provide:

- application-wide defaults
- icon setup
- base description
- title template support

This becomes the core metadata layer for the app.

---

## Step 4 — Add route-group overrides where useful

In route-group layouts such as:

- `src/app/(public)/layout.tsx`
- `src/app/(auth)/layout.tsx`

use metadata only when a whole section should share messaging or behaviour.

Examples:

### Public group

- sign in
- help
- forgot password
- system status
- public onboarding entry

### Auth group

- dashboard
- organisations
- account
- settings
- internal members tools

These layouts can provide section-specific descriptions if useful, but should still rely on the shared metadata system.

---

## Step 5 — Use page-level metadata only for exceptions

Only define metadata in individual page files when a page truly needs its own title or description.

This keeps route files clean.

Example:

```ts
export const metadata = buildMetadata({
  title: "Sign In",
  description: "Sign in to access your Fixtura Members account.",
});
```

Avoid writing large inline metadata objects repeatedly.

---

## Step 6 — Replace favicon assets

Update the `public` folder with Fixtura favicon/icon files.

Required actions:

- remove old placeholder/default icon usage
- ensure Fixtura icon files exist in `public`
- reference those icons through shared metadata
- confirm favicon appears in browser tab
- confirm app icons work correctly where supported

---

# Metadata Rules

## Rule 1 — No duplicated metadata objects everywhere

Do not manually rewrite full metadata blocks in every page.

Use the shared helper.

## Rule 2 — One source of truth for branding

App name, description defaults, base URL, and icons should come from the metadata config file.

## Rule 3 — Keep titles consistent

Use the same title pattern throughout the app.

## Rule 4 — Keep route files lightweight

Pages should only define metadata when necessary.

## Rule 5 — Build for future scaling

The chosen system should make it easy to later add:

- Open Graph images
- Twitter metadata
- canonical URLs
- dynamic metadata
- environment-specific metadata
- robots control for private/public routes

---

# Favicon Requirements

## Minimum requirement

Use the Fixtura icon as the favicon for the Members Area.

## Preferred asset set

If available, include:

- `favicon.ico`
- `icon.png`
- `apple-icon.png`

## Behaviour

- browser tab should show Fixtura branding
- app should not expose generic/default framework branding
- icons should be managed through metadata, not random `<link>` tags unless absolutely required

---

# Notes for Cursor / LLM Implementation

## Keep the system simple first

Do not over-engineer this.

Phase 1 only needs:

- shared config
- shared builder
- root layout integration
- favicon update
- a couple of example page metadata usages

## Follow Next.js App Router patterns

Use native `Metadata` support from Next.js.

Do not build a custom SEO framework for this stage.

## Prefer reusable utilities over per-file metadata objects

This work is mainly about structure and maintainability.

## Assume future private/public growth

The Members Area will grow, so this metadata structure must support more routes later without becoming messy.

---

# Suggested Deliverables

Cursor should implement the following:

1. `src/config/metadata.ts`
2. `src/lib/metadata/buildMetadata.ts`
3. updated `src/app/layout.tsx` metadata integration
4. optional metadata cleanup in route-group layouts
5. Fixtura favicon/icon assets wired from `public`
6. example usage on a few key pages:
   - Sign In
   - Dashboard
   - Organisations
   - Account Settings

---

# Acceptance Criteria

The task is complete when:

- metadata defaults are centralised
- a reusable metadata helper exists
- titles follow one consistent convention
- favicon uses Fixtura branding from `public`
- layouts/pages use the shared approach instead of repeating metadata inline
- implementation is clean and easy to extend

---

# Optional Phase 2 Enhancements

These are not required now, but the structure should support them later:

- Open Graph metadata defaults
- social sharing images
- canonical URL generation
- route-aware dynamic metadata
- noindex for private/authenticated sections
- environment-aware metadata base handling
- per-organisation dynamic titles in the future

---

# Final Instruction for Cursor

Implement a **simple, reusable metadata system** for the Fixtura Members Area using **Next.js App Router metadata conventions**.

Do not scatter metadata across every file.

Centralise defaults, create a reusable helper, apply it through layouts/pages where needed, and update the favicon so the Members Area uses the Fixtura brand icon from the `public` folder.
