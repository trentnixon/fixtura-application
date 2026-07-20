# Developer Handoff — Media Gallery organisation-aware category assignments

> Monday parent [`2791582021`](https://trentnixons-team-company.monday.com/boards/5029957869/pulses/2791582021) | Board `5029957869` — Fixtura Application | Synced 19 July 2026

Organisation type and account settings determine whether Media Gallery images are classified by club age, association competition, or association grade. This replaces the fixed `ageGroup: Seniors | Juniors | Both` model with canonical `categoryAssignment`.

## Source authority

1. [Monday parent 2791582021](https://trentnixons-team-company.monday.com/boards/5029957869/pulses/2791582021)
2. [01 — Delivery guide](https://trentnixons-team-company.monday.com/docs/5030034001) (attached to parent)
3. [02 — CMS handoff](https://trentnixons-team-company.monday.com/docs/5030034060)
4. [03 — Application handoff](https://trentnixons-team-company.monday.com/docs/5030034061)
5. Local copies in this folder
6. Existing account-scoped Media Library code and plural `assetTypes` work

If older `ageGroup` handoffs conflict, the approved category contract wins. Asset Types behaviour is unchanged.

## Phases

| Phase   | Owner     | Summary                                                             |
| ------- | --------- | ------------------------------------------------------------------- |
| P01     | App + CMS | Contract review and local handoff sync                              |
| P02–P05 | CMS       | Storage, legacy, validation, DTOs — see `cms-dependency-handoff.md` |
| P06     | App       | Category config from TanStack state                                 |
| P07     | App       | Upload/edit assignment UI                                           |
| P08     | App       | Filters, grouping, coverage, recategorisation                       |
| P09     | App + CMS | Verification and sign-off                                           |

## Locked rules

- Client submits `{ type, scope, targets }` only — never `targetSnapshots` or labels
- `scope: "all"` requires empty `targets`
- Club keys are lowercase; association targets are numeric CMS IDs
- No new catalogue endpoint; reuse season-hub / grade-ordering TanStack state
- Edit PATCH omits `categoryAssignment` unless the user changed category
- Renderer, scheduler, Creator are out of scope

## Related completed work

- [Media Library — Account-scoped CMS mutation API](https://trentnixons-team-company.monday.com/boards/5029957868/pulses/2787952849)
- [Media Gallery — Multi-asset-type assignments](../Media%20Gallery%20—%20support%20plural%20assetTypes%20and%20multiple%20assignments%20-%202789028497/README.md)
