Vendored Fixtura Remotion preview bundle.

Source:

- Repository: `trentnixon/fixtura-remotion-version2`
- Package name: `@fixtura/remotion-assets`
- Imported from commit: `f83e621e3d26e03aba07e74c7b467a09418abccd`

Files kept here:

- `preview.mjs`
- `preview.d.ts`

Why this is vendored:

- The GitHub package install path and patching flow were unstable in this app.
- The integration surface is small and only used by the sandbox preview route.

If this bundle needs refreshing:

1. Pull the built `dist/preview.mjs` and `dist/preview.d.ts` from the source repo at the intended commit.
2. Replace the files in this folder.
3. Run `npm run typecheck`.
