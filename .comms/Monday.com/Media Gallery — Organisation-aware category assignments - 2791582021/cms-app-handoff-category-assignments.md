# CMS → Application handoff — category assignments (live)

> CMS ticket [`2791545383`](https://trentnixons-team-company.monday.com/boards/5029957868/pulses/2791545383) — Done  
> Application parent [`2791582021`](https://trentnixons-team-company.monday.com/boards/5029957869/pulses/2791582021)  
> Synced 19 Jul 2026 from CMS completion update + Application frontend handoff update

## Additive GET contract

```ts
{
  categoryAssignment: {
    type: "club-age" | "competition" | "grade";
    scope: "all" | "selected";
    targets: Array<string | number>;
  }
  categoryStatus: "valid" | "needs_reclassification";
  resolvedTargets: Array<{
    id: string | number;
    label: string;
    selectable: boolean;
  }>;
}
```

Existing Media Library fields remain. `targetSnapshots` is CMS-internal — never writable or exposed on `categoryAssignment`.

## Application data sources

- Current competition/grade options: existing TanStack state (season-hub, grade-ordering).
- Historical / missing labels: CMS `resolvedTargets`.
- `selectable: false` targets: display and remove only; cannot newly select.
- `categoryStatus: needs_reclassification`: keep item active; require valid replacement for current account mode.

## Account modes

| Configuration                        | Type          | Selection rules                                      |
| ------------------------------------ | ------------- | ---------------------------------------------------- |
| Club, split enabled                  | `club-age`    | All or exactly one of `junior`, `senior`, `masters`  |
| Club, split disabled                 | `club-age`    | All, `["junior"]`, or exactly `["senior","masters"]` |
| Association, `group_assets_by=false` | `competition` | Positive integer competition CMS IDs                 |
| Association, `group_assets_by=true`  | `grade`       | Positive integer grade CMS IDs                       |
| All scope                            | any           | `{ scope: "all", targets: [] }`                      |

## Writes

**POST** (multipart): optional `categoryAssignment` as JSON text, e.g. `{"type":"competition","scope":"selected","targets":[101,102]}`. Omission creates derived All assignment.

**PATCH** (flat JSON): when present, `categoryAssignment` is a complete replacement with `type`, `scope`, `targets` only. Omission leaves assignment unchanged.

Never send `targetSnapshots` or both `ageGroup` and `categoryAssignment`.

## Validation envelope

HTTP 400, `error.code = "VALIDATION_ERROR"`, field `categoryAssignment`:

- `CATEGORY_TYPE_MISMATCH`
- `TARGET_NOT_ACCESSIBLE`
- `SELECTED_TARGETS_REQUIRED`
- `ALL_TARGETS_MUST_BE_EMPTY`
- `INVALID_CLUB_AGE_KEY`
- `TOO_MANY_TARGETS`
- `MALFORMED_ASSIGNMENT`
- `INVALID_JSON` (multipart)

## CMS verification (external)

- 18 focused CMS tests passed
- Strapi build passed
- CMS repo handoff: `src/api/account/.comms/app-handoff-media-library-category-assignments.md`
