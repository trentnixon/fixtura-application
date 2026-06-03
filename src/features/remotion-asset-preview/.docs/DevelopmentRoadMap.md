# Current Focus

- v1: Cricket-only example ladder JSON with branding overlay on dashboard.
- Public API stable for reuse (`useRemotionAssetPreview`, `AssetPreviewCarousel`).

## Completed

- Cricket sport gate from `sport` string (not account id).
- Example loader: `/dummyAssetData/Cricket/Cricket_Ladder.json`.
- Branding merge: template, theme colours, logo, template variation mode.
- Carousel: all `frames[]` from dataset (preview lab parity).

## To Do (easy → hard)

1. Multi-sport example paths and JSON shape normalisers (AFL, Netball, …).
2. Optional `maxFrames` cap for heavy dashboards.
3. Refactor interaction-lab Remotion sandbox to consume this feature.
4. Lazy-load Remotion bundle where perf matters.

## Blocked / Waiting

- None.

## Recommendations

- Add integration test against minimal `FixturaDataset` fixture for hook if flakiness appears.
