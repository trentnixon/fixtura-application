# Folder Overview

Portable Remotion still preview: sport-gated example cricket JSON, account branding merged into dataset, thumbnail carousel (one slide per `frames[]` entry).

## Files

- [`index.ts`](../index.ts): Public API exports only.
- [`types.ts`](../types.ts): Hook input/output types.
- [`hooks/use-remotion-asset-preview.ts`](../hooks/use-remotion-asset-preview.ts): Fetch, merge, frame targets.
- [`components/asset-preview-carousel.tsx`](../components/asset-preview-carousel.tsx): Default `CardCarouselPanel` UI.
- [`components/remotion-thumbnail-still.tsx`](../components/remotion-thumbnail-still.tsx): Single Remotion `Thumbnail`.
- [`utils/`](../utils/): Sport gate, example path, merge, frame targets, template mode slug/slug→mode.

## Child Modules

- [`cricket-demo-manifest/`](../cricket-demo-manifest/): Canonical historical cricket demo manifest loader, Zod schema and tests (source JSON under `public/dummyAssetData/`).

## Relations

- Parent: [`src/features/`](../../)
- Consumed by: Members dashboard overview carousel (adapter only).
- Key dependencies: `@/components/carousel`, `@/components/remotion/*`, `@/vendor/fixtura-remotion-assets/preview`, account branding types.
