# Folder Overview

Canonical historical/synthetic-rules reference for sanitising Remotion cricket example datasets.

## Files

- `../cricket-historical-demo-manifest.json`: Deterministic reviewable manifest (nations, flags, tournaments, stages, venues, fixtures, player pools, synthetic generation rules, dataset bindings).
- `readMe.md`: This folder contract.
- `SOURCES.md`: Authoritative source list and retrieval notes.
- `synthetic-stat-policy.md`: Separation of historical facts from later fictional statistics.
- `REGENERATION-AND-VALIDATION.md`: Generator commands, validation suite, copy/sync warning, attribution links.
- `preview-qa-checklist.md`: All-composition Remotion preview QA checklist.
- `WEST-INDIES-FLAG.md`: West Indies flag exception provenance.

## Child Modules

- None.

## Relations

- Parent: `public/dummyAssetData/`
- Consumed by: later JSON rewrite subitems; validated by `src/features/remotion-asset-preview/cricket-demo-manifest/`
- Key dependencies: Monday implementation brief doc `5030149263`; composition map `src/components/remotion/_constants/remotion-datasets.ts`; flag SVGs in `public/dummyAssetData/flags/` (see `flags/ATTRIBUTION.md` and `WEST-INDIES-FLAG.md`)
