# Remotion Package How-To

This guide explains how to turn `fixtura-remotion-version2` into a controlled package that this application can import for asset previews.

It is written for the current setup:

- App repo: `D:\htdoc\Fixtura\Fixtura.com.au\application`
- Remotion repo: `D:\htdoc\Fixtura\Creators\RemotionV2`
- GitHub repo: `https://github.com/trentnixon/fixtura-remotion-version2`
- Deployment target: Vercel

## Goal

Use the Remotion repo as the source of truth for preview assets without copy/pasting files into this app.

The package should:

- expose only the files we explicitly allow
- avoid importing Remotion Studio boot files into Next.js
- install cleanly on Vercel
- allow versioned updates from GitHub

## Recommended Approach

Keep the Remotion project in its own GitHub repo, but make it behave like a package.

That means:

1. Add a small package export layer in the Remotion repo.
2. Build that export layer into `dist/`.
3. Expose only approved entrypoints using `package.json` `exports`.
4. Install the package in this app from GitHub using a tag.

## High-Level Structure

Do not expose the whole Remotion source tree directly.

Instead, add a package layer like this in the Remotion repo:

```text
fixtura-remotion-version2/
  src/
    index.ts                 <- Remotion Studio entry, keep as-is
    Root.tsx
    package/
      index.ts               <- public package root
      preview.ts             <- public preview exports
      cricket.ts             <- optional focused export
      netball.ts             <- optional focused export
  dist/                      <- built package output
  package.json
```

## Important Rule

The app should never import from internal paths like:

```ts
@fixtura/remotion-assets/src/compositions/...
```

Only allow imports like:

```ts
@fixtura/remotion-assets
@fixtura/remotion-assets/preview
@fixtura/remotion-assets/styles.css
@fixtura/remotion-assets/cricket
```

That is controlled by the `exports` field in `package.json`.

## Step 1: Add Public Entry Files In The Remotion Repo

Inside `fixtura-remotion-version2`, create a new folder:

```text
src/package/
```

### Example `src/package/index.ts`

This should export only the safe public API.

```ts
export { ProductionRoot } from "../ProductionRoot";
export { DevelopmentRoot } from "../DevelopmentRoot";
```

If that is too broad, make this file even smaller.

### Example `src/package/preview.ts`

Use this file to export only the preview components/compositions that the app is allowed to use.

**Important:** `@remotion/player` needs a **scene-level** component (the same kind of component you pass to `<Composition component={...} />`), not a Studio/root file that only registers `<Composition>` nodes. In this repo, `src/ProductionRoot.tsx` wraps a `<Composition>` and is intended for the Remotion root / CLI pipeline. For the app, export a **dedicated preview** that renders the template (or a thin wrapper) with typed props / `inputProps`. See [Step 8](#step-8-use-remotionplayer-in-the-app).

```ts
// Example: re-export a scene component built for Player + inputProps (path is illustrative)
export { CricketTemplatePreview } from "./CricketTemplatePreview";
```

Put `CricketTemplatePreview.tsx` beside `preview.ts` under `src/package/`, or import from a composition/template module you control. If you use a subfolder barrel (for example `src/package/preview/index.ts`) instead of `preview.ts`, add that path to the `tsup` entry list in Step 3.

### Example `src/package/cricket.ts`

If you want tighter control, split exports by domain:

```ts
export { default as CricketCompositions } from "../compositions/cricket";
```

Only export concrete things the app actually needs.

Do not export:

- `src/index.ts`
- `registerRoot(...)`
- Studio-only dev helpers
- experimental internal utilities unless needed by the app

## Step 2: Add A Package Build Tool

In the Remotion repo, install `tsup`:

```bash
npm install --save-dev tsup
```

`tsup` will compile the package entry files into `dist/`.

## Step 3: Update The Remotion `package.json`

Change the Remotion repo `package.json` so it behaves like a consumable package.

Use something along these lines:

```json
{
  "name": "@fixtura/remotion-assets",
  "version": "0.1.0",
  "private": false,
  "files": ["dist"],
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./preview": {
      "types": "./dist/preview.d.ts",
      "import": "./dist/preview.js",
      "require": "./dist/preview.cjs"
    },
    "./cricket": {
      "types": "./dist/cricket.d.ts",
      "import": "./dist/cricket.js",
      "require": "./dist/cricket.cjs"
    }
  },
  "peerDependencies": {
    "react": "^19",
    "react-dom": "^19",
    "remotion": "^4.0.314",
    "@remotion/player": "^4.0.314"
  },
  "scripts": {
    "dev": "remotion studio",
    "build": "remotion bundle",
    "build:package": "tsup src/package/index.ts src/package/preview.ts src/package/cricket.ts --format esm,cjs --dts --clean"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/trentnixon/fixtura-remotion-version2.git"
  }
}
```

Use **the same Remotion minor/patch** in peers as this repo (see its `package.json`) unless you intentionally support a wider range. Narrow peers reduce “works on my machine” drift between the app and the package.

**Optional:** add `"bugs"` and `"homepage"` pointing at the GitHub repo if you want better tooling hints; not required for GitHub installs.

If you use **Strategy B** ([Ship `dist` for GitHub installs](#ship-dist-for-github-installs)), add `"prepare": "npm run build:package"` and ensure `tsup` is available when consumers install (see that section). If you use **Strategy A** (commit `dist/`), omit `prepare` or keep it only for local dev convenience.

The Remotion repo root may declare `"sideEffects": ["*.css"]` — that affects tree-shaking when the app bundles the package; it does not automatically inject CSS into Next.js. See [CSS, `sideEffects`, and static assets](#css-sideeffects-and-static-assets).

## Why `exports` Matters

This is the main protection layer.

If a file is not listed in `exports`, consumers are not supposed to import it.

That gives you a controlled public API and stops this app from becoming tightly coupled to the internal structure of the Remotion repo.

## Step 4: Build The Package

In the Remotion repo:

```bash
npm run build:package
```

That should create files like:

```text
dist/
  index.js
  index.cjs
  index.d.ts
  preview.js
  preview.cjs
  preview.d.ts
  cricket.js
  cricket.cjs
  cricket.d.ts
```

## Ship `dist` for GitHub installs

`npm install github:org/repo#v0.1.0` **does not** run your local `build:package` unless something in the installed package triggers it. Consumers only get what is in the tree npm extracts (respecting `"files"`). You must choose **one** strategy:

| Strategy                        | What you do                                                                                                                                                                                                                                      | Pros                                                 | Cons                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| **A. Commit `dist/`**           | Run `build:package`, commit `dist/`, tag. Omit `prepare`, or make `prepare` a no-op for consumers.                                                                                                                                               | Simplest for apps and Vercel; no install-time build. | Built artifacts in git; remember to rebuild before tagging.                                          |
| **B. `prepare` builds `dist/`** | Add `"prepare": "npm run build:package"` and ensure **`tsup` is a `dependency`** (not only `devDependency`) if installs must compile without devDeps, **or** rely on npm including devDependencies when installing from git (behavior can vary). | No committed `dist/`.                                | Heavier/slower installs; must verify CI and Vercel actually run `prepare` and have `tsup` available. |

**Recommendation:** Start with **Strategy A** (commit `dist/` for release tags) until you have a reason not to. Add `dist/` to `.gitignore` only if you commit exclusively via Strategy B and have verified install builds.

After either strategy, verify locally:

```bash
rm -rf node_modules/@fixtura
npm install github:trentnixon/fixtura-remotion-version2#v0.1.0
# Then confirm node_modules/@fixtura/remotion-assets/dist exists and resolves via exports
```

## Step 5: Commit And Tag The Remotion Repo

Commit the new package files and config in the Remotion repo.

Then create a tag:

```bash
git add .
git commit -m "Add package exports for app previews"
git tag v0.1.0
git push origin main
git push origin v0.1.0
```

Use tags so the app and Vercel install a fixed version instead of drifting with `main`.

## Step 6: Install It In This App

In this app, install the Remotion repo directly from GitHub.

If the GitHub repo is public:

```bash
npm install github:trentnixon/fixtura-remotion-version2#v0.1.0
```

If you want the dependency name to stay explicit in `package.json`, set it like this:

```json
{
  "dependencies": {
    "@fixtura/remotion-assets": "github:trentnixon/fixtura-remotion-version2#v0.1.0"
  }
}
```

Then run:

```bash
npm install
```

## Step 7: Import Only Approved Entrypoints

In this app, import only from the public entrypoints you defined.

Example:

```ts
import { CricketTemplatePreview } from "@fixtura/remotion-assets/preview";
```

Use the real names you export from `src/package/preview.ts`. Do not import from internal paths.

Bad:

```ts
import { something } from "@fixtura/remotion-assets/src/core/utils/foo";
```

Good:

```ts
import { something } from "@fixtura/remotion-assets/cricket";
```

## Step 8: Use `@remotion/player` In The App

The app should use Remotion as a player, not as Studio.

### Player `component` = scene component, not Composition root

`<Player component={...} />` must receive the **React component that draws the frames** — the same role as the `component` prop on `<Composition />`. It should **not** be:

- `src/index.ts` or anything that calls `registerRoot`
- A component whose only job is to return `<Composition id="..." component={Scene} />` (that pattern is for the **Remotion root** in Studio/CLI, not for `Player`)

In this codebase, `ProductionRoot` registers a dynamic `<Composition />` for renders. For in-app previews, add a **small preview export** that renders the **template component** (from `templateRegistry` or your composition) with `data` (and any other props) supplied via **`inputProps`** on `Player`, matching what `defaultProps` / your scene expects.

Typical usage:

```tsx
import "@fixtura/remotion-assets/styles.css";
import { Player } from "@remotion/player";
import { CricketTemplatePreview } from "@fixtura/remotion-assets/preview";

export function AssetPreview() {
  return (
    <Player
      component={CricketTemplatePreview}
      durationInFrames={150}
      compositionWidth={1080}
      compositionHeight={1350}
      fps={30}
      inputProps={{ data: sampleFixturaDataset }}
      controls
    />
  );
}
```

Replace `CricketTemplatePreview` and `sampleFixturaDataset` with your real preview component and dataset shape. `durationInFrames`, width, and height should match the composition you are previewing.

**Do not** pass `ProductionRoot` to `Player` unless you have verified Remotion supports that pattern for your version; prefer an export that **is** the scene component.

## Step 9: Make Sure Vercel Can Build It

This approach works on Vercel because:

- the dependency comes from GitHub
- the version is pinned with a tag
- the package has an explicit API
- the app is not depending on a local Windows path

If the GitHub repo is private, Vercel will need GitHub access or package auth.

If the repo is public, no special token is usually needed.

## CSS, `sideEffects`, and static assets

The consumable package should list `"files": ["dist"]` (or equivalent) so only built output is published. That **does not** include `public/` images, fonts, or loose CSS files unless you also list them under `"files"` or ship them inside `dist/` (e.g. imported assets bundled by the build).

**CSS**

- The package build emits `dist/preview.css` and exports it as `@fixtura/remotion-assets/styles.css`. Import it once in the app (for example the preview layout or shell): `import "@fixtura/remotion-assets/styles.css";` so Tailwind utility classes from templates apply in the consuming app.
- Root `package.json` may include `"sideEffects": ["*.css"]` so bundlers do not drop CSS imports. The app still needs a **real import** of that CSS somewhere in the client tree if styles are not inlined.

**Fonts, images, video**

- Paths like `/public/...` resolve in Remotion Studio relative to that project; in the app they resolve relative to **the Next app’s** public folder unless you use absolute URLs. Prefer **stable URLs** (CDN, same-origin app routes, or packaged assets explicitly included in `"files"`) for anything previews rely on.

**Rule of thumb:** If a preview works in Studio but not in the app, check **CSS not imported**, **asset 404s**, and **`inputProps` / props** before debugging Remotion itself.

## Recommended Public API Strategy

Start small.

Only export the minimum set of things the app needs for previews.

Suggested first entrypoints:

- `@fixtura/remotion-assets/preview`
- `@fixtura/remotion-assets/cricket`
- `@fixtura/remotion-assets/netball`

Avoid exporting the whole codebase at first.

You can widen the API later if needed.

## Suggested Export Rules For This Project

Given the current repo shape, keep these categories separate:

- compositions
- templates
- preview wrappers
- types

Avoid exposing these directly unless required:

- internal utilities in `src/core/utils`
- Studio boot code in `src/index.ts`
- environment branching logic unless needed by the app

## Versioning Workflow

When you update preview assets:

1. Make the changes in `fixtura-remotion-version2`.
2. Run `npm run build:package`.
3. If you use **Strategy A** ([Ship `dist` for GitHub installs](#ship-dist-for-github-installs)), commit the updated `dist/` together with source changes before tagging.
4. Commit and tag a new version, for example `v0.1.1`.
5. Update this app dependency to the new tag.
6. Run `npm install`.

That gives you controlled rollouts and reproducible Vercel builds.

## Common Mistakes

### Mistake 1: Installing From A Local Path

This may work on your machine:

```json
"@fixtura/remotion-assets": "file:../RemotionV2"
```

But it is not suitable for Vercel because that path does not exist in the deploy environment.

### Mistake 2: Importing Internal Files

If the app imports internal source files directly, the package boundary is meaningless and refactors become risky.

Use `exports` and stay disciplined about public entrypoints.

### Mistake 3: Exporting Studio Boot Files

This file is for Remotion Studio:

```ts
src / index.ts;
```

It currently calls:

```ts
registerRoot(...)
```

That is not a good package entry for the app.

### Mistake 4: Depending On `main`

Avoid:

```json
"github:trentnixon/fixtura-remotion-version2#main"
```

Use tags instead:

```json
"github:trentnixon/fixtura-remotion-version2#v0.1.0"
```

### Mistake 5: Passing a Composition root to `Player`

`@remotion/player` expects the **scene** component (what draws frames). Passing a component that only exists to register `<Composition />` (for example the role of `ProductionRoot` in this repo) is usually wrong. Export a **preview-oriented scene component** and pass that to `component={...}`. See [Step 8](#step-8-use-remotionplayer-in-the-app).

### Mistake 6: No `dist/` at install time

Tagging without a committed `dist/` and without a working `prepare` (Strategy B) leaves the app with missing `dist/` and broken imports. See [Ship `dist` for GitHub installs](#ship-dist-for-github-installs).

## Notes About Dependencies

Your current app and Remotion repo do not have identical dependency versions.

One notable risk is `zod`:

- app uses `zod` v4
- Remotion repo uses `zod` v3

That is manageable if Zod stays internal to the package, but it can cause problems if both apps expect to share the same schemas or runtime types directly.

Keep the initial public API narrow to avoid dragging version conflicts into the app.

## Minimum First Version

If you want the smallest possible first step, do this:

1. Add `src/package/preview.ts` to the Remotion repo.
2. Add `tsup`.
3. Add a narrow `exports` map with only `./preview`.
4. Build `dist`.
5. Tag `v0.1.0`.
6. Install that tag in this app.

That proves the flow before you expose more entrypoints.

## Next Step After This Guide

Once you are ready, the implementation sequence should be:

1. Update the Remotion repo package API.
2. Build and tag the Remotion repo.
3. Install it into this app.
4. Add `@remotion/player` to this app.
5. Build one preview component end-to-end.

## Useful Checklist

- [ ] Create `src/package/` in the Remotion repo
- [ ] Add narrow public entry files (scene-level previews for `Player`, not Studio boot)
- [ ] Install `tsup`
- [ ] Update `package.json` with `name`, `exports`, `peerDependencies`, `build:package`, optional `repository`
- [ ] Run `npm run build:package`
- [ ] Choose **Strategy A** (commit `dist/`) or **Strategy B** (`prepare` + install-time build); verify `dist/` exists after a clean `npm install` from the tag
- [ ] Commit and tag the Remotion repo
- [ ] Install the GitHub tag into this app
- [ ] Use only approved import paths
- [ ] Render previews with `@remotion/player` using a **scene** component; align `inputProps` and dimensions
- [ ] Confirm CSS/fonts/assets load in the Next app (not only in Studio)
- [ ] Verify Vercel build
