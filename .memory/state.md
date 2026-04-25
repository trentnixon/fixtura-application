# State

_Last updated: 2026-04-25 (episode — season-hub members integration + setup gate + zero-state coverage)._

## Current focus

- Stabilize members Season under `/o/[accountId]/season` on the new `season-hub` endpoint family.
- Enforce season access lock using `state.isSetup === true` and keep lock messaging polite/informational.
- Validate and refine empty-state UX for zero competitions, grades, teams, and fixtures.

## Next actions

- [ ] Manually verify season lock behavior for accounts with `isSetup=false` and `isSetup=true`.
- [ ] Manually validate season overview and drill-down pages (success, empty, and error states) against live data.
- [ ] Run broader repo checks (`lint` / `typecheck`) when convenient.
- [ ] Tighten loose season detail typings once stable payload samples are confirmed.

## Blockers / risks

- Some season detail contracts are intentionally loose pending stable upstream payloads.
- Environment-level Strapi permissions/data availability can change observed season endpoint behavior.
