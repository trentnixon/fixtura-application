# Historical cricket demo — regeneration, validation and sync

## Purpose

`public/dummyAssetData/Cricket/*.json` are public Remotion preview fixtures for `/o/[accountId]/template-builder`. They must not contain local clubs, community players, sponsors, production account IDs or customer media.

## Policy

- Historical tournament names, participants, venues, dates and professional players are factual (manifest `kind: historical`).
- Displayed standings, innings, bowling figures and scorecards are fictional, generated under `syntheticGeneration` rules.
- Grade/competition display labels intentionally omit “Demo Recreation” suffixes; prompts still disclose fictional/archive preview wording.

## Source of truth

| Asset                   | Path                                                          |
| ----------------------- | ------------------------------------------------------------- |
| Manifest                | `public/dummyAssetData/cricket-historical-demo-manifest.json` |
| Datasets                | `public/dummyAssetData/Cricket/`                              |
| Flags                   | `public/dummyAssetData/flags/`                                |
| Composition map         | `src/components/remotion/_constants/remotion-datasets.ts`     |
| Generators / validators | `src/features/remotion-asset-preview/cricket-demo-manifest/`  |

The Remotion preview bundle copy (`preview.mjs` / `preview.d.ts`) does **not** sync cricket JSON or flags.

## Regeneration commands

```bash
npx tsx scripts/write-cricket-ladder-demo.ts
npx tsx scripts/write-cricket-upcoming-demo.ts
npx tsx scripts/write-cricket-top5-batters-demo.ts
npx tsx scripts/write-cricket-top5-bowlers-demo.ts
npx tsx scripts/write-cricket-batting-performances-demo.ts
npx tsx scripts/write-cricket-bowling-performances-demo.ts
npx tsx scripts/write-cricket-results-demo.ts
npx tsx scripts/write-cricket-roster-demo.ts
npx tsx scripts/write-cricket-weekend-results-demo.ts
npx tsx scripts/write-cricket-team-of-the-week-demo.ts
```

## Validation commands

```bash
npx vitest run src/features/remotion-asset-preview/cricket-demo-manifest
```

Coverage includes:

- Manifest Zod + referential integrity
- Per-dataset generators
- Composition contract (counts/frames/timings/mapping)
- Privacy residual-data scan
- Local `/dummyAssetData` path + 17 flag file checks
- Cricket-stat helper failure cases (SR, overs/economy, ladder identity)

## Attribution

- ISO national flags: MIT [flag-icons](https://github.com/lipis/flag-icons) — see `public/dummyAssetData/flags/ATTRIBUTION.md`
- West Indies: Commons pre-1999 board/team flag — see `WEST-INDIES-FLAG.md`

## Preview QA procedure

1. Open template-builder Remotion preview for an organisation account.
2. For each composition in `remotion-datasets.ts`, load the mapped dataset.
3. Confirm fetch succeeds, duration is positive, and preserved frame targets are within duration.
4. Visually spot-check intro + mid + outro: flags, long names, ladder lengths, roster XI, scorecards, Team of the Week roles.
5. Confirm no old club logos/sponsors flash and prompts/metadata retain fictional disclosure.

Checklist: `preview-qa-checklist.md`
