# Remotion Vendor Update Guide

This application vendors the preview build from `trentnixon/fixtura-remotion-version2` instead of installing `@fixtura/remotion-assets` directly.

## Files Updated

- `../preview.mjs`
- `../preview.d.ts`
- `../README.md` when the source commit changes
- `../../../../package.json` and `../../../../package-lock.json` when the build introduces new external dependencies

## Update Process

1. In the Remotion source repository, check out the intended commit.
2. Install its dependencies and run the package build that produces:
   - `dist/preview.mjs`
   - `dist/preview.d.ts`
3. Copy those two generated files over `../preview.mjs` and `../preview.d.ts`.
4. Update the imported commit recorded in `../README.md`.

## Check External Dependencies

The preview build does not contain every Remotion package it uses. Imports from `remotion` and `@remotion/*` remain external and must resolve from this application's `node_modules`.

After replacing the build, list its Remotion imports:

```powershell
Select-String -Path "src/vendor/fixtura-remotion-assets/preview.mjs" -Pattern 'from "(remotion|@remotion/)'
```

Compare the imported packages with `package.json`. The currently required Remotion packages are:

- `remotion`
- `@remotion/fonts`
- `@remotion/layout-utils`
- `@remotion/noise`
- `@remotion/player`
- `@remotion/transitions`

If the build introduces another package, install it using the exact version shared by the existing Remotion suite:

```powershell
npm install @remotion/example-package@4.0.314 --save-exact
```

Do not mix Remotion versions. Update all Remotion packages together when intentionally upgrading the suite.

## Verification

Run these checks from the application root:

```powershell
npm run typecheck
npm run build
```

Then start or restart the development server:

```powershell
npm run dev
```

Manually open an account dashboard and verify:

- The dashboard compiles without module-resolution errors.
- Asset preview thumbnails render.
- Carousel navigation works.
- Text, fonts, transitions, noise effects, and branding render as expected.
- The browser console has no Remotion runtime errors.

## Common Failure

`Module not found: Can't resolve '@remotion/...'` means the refreshed preview build added an external package that is missing from this application's dependencies. Install the missing package at the same exact version as the rest of the Remotion suite, restart the development server, and rerun the verification steps.
