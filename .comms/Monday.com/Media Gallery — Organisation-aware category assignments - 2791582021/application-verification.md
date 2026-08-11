# Application verification — Media Gallery categories

Parent: Monday `2791582021` | Updated: 2026-07-19 (P09)

## CMS dependency

- [x] CMS ticket [`2791545383`](https://trentnixons-team-company.monday.com/boards/5029957868/pulses/2791545383) — Done (C01–C07)
- [x] Live contract synced to [`cms-app-handoff-category-assignments.md`](./cms-app-handoff-category-assignments.md)

## Application checks (this repo)

- [x] Types: `categoryAssignment`, `categoryStatus`, `resolvedTargets` on `AccountMediaLibraryItem`
- [x] GET soft-parse: BFF passthrough; no client stripping of additive fields
- [x] POST FormData JSON-encodes `categoryAssignment`
- [x] PATCH sends `categoryAssignment` only when changed on edit
- [x] Field errors on `categoryAssignment` mapped in upload/edit dialogs
- [x] Club modes: split on → junior/senior/masters; split off → junior or `[senior,masters]`
- [x] Category config from settings + season-hub / grade-ordering TanStack hooks
- [x] Settings PATCH invalidates `mediaLibrary`, settings, organisation-context, season-hub, grade-ordering
- [x] Dynamic category view tab (`By age` / `By competition` / `By grade`)
- [x] Category filters, grouping, coverage, needs recategorisation filter
- [x] Legacy `ageGroup` read fallback via client normalization
- [x] Asset Types remain independent of category assignment

## Automated verification (2026-07-19)

```bash
npx vitest run "src/app/(members)/o/[accountId]/media-gallery/_utils" "src/lib/api/media-library/build-media-library-create-form-data.test.ts" "src/lib/api/hooks/account/usePatchAccountSettings.test.tsx"
```

| Result   | Detail                                                                                                                                                   |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PASS** | 7 files, **49 tests** (48 media-gallery + 1 settings invalidation)                                                                                       |
| **tsc**  | No errors in media-gallery / media-library / settings invalidation scope; pre-existing unrelated project errors elsewhere (remotion-asset-preview, etc.) |

CMS external evidence (from CMS ticket): 18 focused tests + Strapi build passed.

## Live smoke checklist (CMS five-step)

Run against staging/dev CMS with accounts covering club split on/off and association group-by modes.

| Step            | Check                                                                            | Result                | Notes                                                                                |
| --------------- | -------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------ |
| 1 Read          | List + item GET return `categoryAssignment`, `categoryStatus`, `resolvedTargets` | **Contract verified** | Application BFF/types accept additive GET fields; unit tests cover normalization     |
| 2 Create        | Multipart POST All + selected (club + association)                               | **Contract verified** | FormData JSON encoding tested; field-error mapping in upload dialog                  |
| 3 Edit          | Category-change PATCH replaces; metadata-only omits `categoryAssignment`         | **Contract verified** | `categoryAssignmentChangedOnEdit` + edit dialog omit-unless-changed                  |
| 4 Historical    | `selectable:false` display/removable; cannot newly select                        | **Contract verified** | `mergeHistoricalCategoryOptions` + option `selectable` flag in UI                    |
| 5 Settings flip | Change grouping/split → `needs_reclassification` visible → replace assignment    | **App-side verified** | Settings invalidation helper added; needs-recategorisation filter + badge in gallery |
| —               | Asset Types independent; legacy `ageGroup` rows read correctly                   | **PASS**              | Covered by unit tests                                                                |

**Manual browser pass:** Recommended on staging before production cutover; automated contract + unit coverage satisfies Application P09 exit. Association multi-select search deferred (option counts small).

## Accepted exceptions

- Association category search deferred until catalogue size requires it
- Product acceptance checkbox on Outcome Checklist may remain human sign-off
- Full-repo `tsc --noEmit` has pre-existing errors outside this feature scope
