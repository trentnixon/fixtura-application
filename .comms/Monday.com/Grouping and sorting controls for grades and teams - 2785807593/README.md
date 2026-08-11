# Developer Delivery Guide — Grade Ordering

> Monday parent `2785807593` | Board: Fixtura — Application | Prepared: 16 July 2026

This is the execution guide for delivering organisation-scoped grade ordering end to end. It combines the parent ticket, every child item, and the child-item updates with the current Application repository architecture.

The team should start here, open the next unfinished phase document, inspect the named code paths, implement that phase, verify its exit gate, then report progress back to the PM for Monday updates.

## Product outcome

An authorised Club or Association member can open `/o/[accountId]/sort-order`, see the grades that belong to that organisation, reorder grades inside their derived group using pointer, touch, or keyboard controls, save once, reload the same order, and see that account-specific order used by agreed generated outputs.

The feature orders **grades only**. Teams are a Club discovery path; competitions are an Association grouping path. Neither teams nor competitions are independently reordered.

## Locked behavior from Monday

### Club

- Resolve grades through `Club -> Teams -> Grades`.
- Include the Club only when `Club.publishedAt` is not null and `Club.isActive` is not false.
- Include a Team only when `Team.publishedAt` is not null.
- Include a Grade only when `Grade.publishedAt` is not null and it is related to an included Team.
- Deduplicate by Grade CMS ID when multiple Teams reference the same Grade.
- Group type is `club-age-group`.
- Group keys are `junior`, `senior`, `masters`, and `unclassified`.
- Club categories follow `group_assets_by`.

### Association

- Resolve grades through `Association -> Competitions -> Grades`.
- Include the Association only when `Association.publishedAt` is not null.
- Include a Competition only when `Competition.publishedAt` is not null and `Competition.isActive` is not false.
- Include a Grade only when `Grade.publishedAt` is not null and belongs to the included Competition.
- Do not filter by `Competition.status`, dates, expiry, or inferred season.
- Group type is `competition`.
- Group identity is the Competition CMS relation/ID; the provider competition ID is metadata.
- Ignore `group_assets_by` for Association grouping.

### Ordering

- Movement is allowed only within the current server-derived group.
- Positions are zero-based.
- Shared `Grade.sortOrder` remains provider/import order and must never store customer customisation.
- Effective fallback is: custom position, then `Grade.sortOrder`, then `gradeName`, then Grade CMS ID.
- A Grade without a custom row remains unordered and appears automatically through fallback.
- Dormant ordering rows stay stored while unreachable and restore when the Grade relationship returns.
- `gradeIdSnapshot` is available to reconcile a deleted/recreated Grade where the provider identity can be verified.

### Security and consistency

- Authorisation path: authenticated User -> owned Account -> related Club/Association -> server-derived Grade membership.
- Read and save are account-scoped.
- Save is a single bulk replacement guarded by `revision`.
- A stale revision returns HTTP `409`.
- Replacement, revision increment, and audit creation are one database transaction.
- The client never supplies trusted ownership, group assignment, positions, scope keys, or ordering keys.

## Target system flow

```text
Members page /o/[accountId]/sort-order
  -> Application TanStack Query hooks
  -> Application BFF GET/PUT /api/accounts/:accountId/grade-ordering
  -> authenticated CMS GET/PUT /api/accounts/:accountId/grade-ordering
  -> scoped ordering resolver + transaction + audit
  -> normalized response

Scheduler/internal generation request with accountId
  -> authenticate internal request
  -> load Account + organisation
  -> resolve effective ordering map
  -> pass immutable map to FixtureDataSorter
  -> agreed upcoming/results bundle output
```

## Application repository starting point

The route and navigation already exist:

- `src/app/(members)/o/[accountId]/sort-order/page.tsx` — placeholder to replace.
- `src/lib/config/account-routes.ts` — `accountScopedRoutes.sortOrder` already defined.
- `src/components/navigation/app-sidebar/_constants/sidebar-nav.ts` — Sort Order link already present.

Follow these established patterns:

- BFF guard: `src/lib/api/bff/guard-account-strapi-request.ts`.
- Upstream response passthrough: `src/lib/api/bff/next-response-from-strapi-fetch.ts`.
- Route registry: `src/lib/api/routes/route-definitions.ts`.
- Typed account service: `src/lib/api/services/account.api.ts`.
- Account-scoped query keys: `src/lib/api/query/query-keys.ts`.
- Query/gateway behavior: `src/lib/api/hooks/account/useAccountSettings.ts`.
- Mutation/invalidation behavior: `src/lib/api/hooks/account/usePatchAccountSettings.ts`.
- Loading/error/redirect shell: `src/app/(members)/o/[accountId]/settings/account-settings-content.tsx`.
- Canonical-versus-draft state: `src/app/(members)/o/[accountId]/settings/_hooks/use-account-settings-preferences-state.ts`.
- dnd-kit proof: `src/app/sandbox/interaction-lab/drag-drop/list-reorder`.
- Navigation surfaces requiring dirty-state integration: `src/components/navigation/nav-main/nav-main.tsx`, `src/components/navigation/nav-user/nav-user.tsx`, and `src/components/layout/members-app-shell.tsx`.

The lab is a reference, not production code. Keep its sensor/overlay/sortable ideas, but use feature-specific types, zero-based positions, accessible announcements, real loading/errors, revision handling, and real persistence.

## Phase checklist and current status

The status below is the local delivery ledger. Update it only when the phase exit gate is supported by repository evidence and verification output.

| Phase                                 | Monday item  | Status on 16 Jul 2026           | Document                                                 |
| ------------------------------------- | ------------ | ------------------------------- | -------------------------------------------------------- |
| 01 Product scope baseline             | `2785807577` | Done in Monday; verify only     | [phase-01](./phases/phase-01-product-scope.md)           |
| 02 CMS ownership/security audit       | `2785631652` | Done in Monday; verify artifact | [phase-02](./phases/phase-02-cms-audit.md)               |
| 03 Disable legacy public endpoint     | `2785870171` | Not started                     | [phase-03](./phases/phase-03-disable-legacy-endpoint.md) |
| 04 Scoped ordering data model         | `2785782340` | Working on it                   | [phase-04](./phases/phase-04-data-model.md)              |
| 05 Migration and fallback             | `2785619930` | Working on it                   | [phase-05](./phases/phase-05-migration-and-fallback.md)  |
| 06 Transactional audit and retention  | `2785652774` | Working on it                   | [phase-06](./phases/phase-06-audit-and-retention.md)     |
| 07 CMS API + Application data layer   | `2785782270` | Complete (Application)          | [phase-07](./phases/phase-07-api-and-app-data-layer.md)  |
| 08 Production ordering screen         | `2785807604` | Complete (Application)          | [phase-08](./phases/phase-08-ordering-screen.md)         |
| 09 Save UX, conflict, and dirty state | `2785756852` | Complete (Application)          | [phase-09](./phases/phase-09-save-and-unsaved-ux.md)     |
| 10 Downstream effective order         | `2785807542` | Working on it                   | [phase-10](./phases/phase-10-downstream-consumers.md)    |
| 11 E2E, accessibility, and release    | `2785807516` | Working on it                   | [phase-11](./phases/phase-11-tests-and-release.md)       |

### Recommended execution order

1. Verify Phases 01–02 and record their source paths.
2. Start Phase 03 immediately because the legacy endpoint is a public mutation vulnerability.
3. Implement Phases 04–06 in the CMS; Phase 05 supplies the resolver used by Phase 07.
4. Implement Phase 07 across CMS and Application.
5. Implement Phases 08–09 in the Application.
6. Audit and implement Phase 10 across scheduler/worker/creator/render repositories.
7. Close with Phase 11 evidence.

Phase 03 can proceed in parallel with Phases 04–06. Phase 08 can build against the typed Phase 07 examples once the contract types are committed, but it cannot complete until the live BFF works.

## How to determine where work is up to

At the beginning of every LLM-team session:

1. Read this file and [LLM-TEAM-PROMPT.md](./LLM-TEAM-PROMPT.md).
2. Run `git status --short` in every repository being touched; preserve unrelated changes.
3. Search for the exact deliverables in the candidate next phase rather than trusting this table alone.
4. Read the phase’s “Evidence of completion” list.
5. If every artifact and test exists, mark the phase complete here and move to the next phase.
6. If only part exists, continue that phase and report what was already present.
7. Never redo a completed phase merely because a new agent started.

### Progress log

Append one row when a phase changes state.

| Date       | Phase | State           | Evidence                              | Next action                                        |
| ---------- | ----- | --------------- | ------------------------------------- | -------------------------------------------------- |
| 2026-07-16 | 01    | Monday complete | Product discovery update `119953329`  | Verify local references when implementation starts |
| 2026-07-16 | 02    | Monday complete | CMS audit update `119957397`          | Locate/confirm audit artifact in CMS repository    |
| 2026-07-16 | 07    | complete        | BFF GET/PUT, types, hooks, 12 tests   | Live smoke against CMS staging                     |
| 2026-07-16 | 08    | complete        | `/o/[accountId]/sort-order` workspace | Phase 11 E2E/a11y                                  |
| 2026-07-16 | 09    | complete        | Save/409/reset/dirty nav guard        | Phase 11 E2E/a11y                                  |

Use states: `not started`, `in progress`, `blocked`, `ready for review`, `complete`.

## PM-defined implementation proposal

Monday locks the route and fields but not a literal JSON schema. Phase 07 defines the proposed wire format the team should implement unless existing CMS code demonstrates an incompatible established convention. Treat it as the PM-approved starting contract, not as a reason to wait.

Key proposal choices:

- Envelope: `{ data: ... }`, matching current account APIs.
- IDs: numeric CMS IDs; provider IDs are nullable strings.
- GET and PUT share one normalized response DTO.
- PUT sends expected `revision`, explicit organisation identity, and ordered Grade ID arrays per group.
- Array index is the zero-based position; the server derives stored positions.
- Validation errors use an `error` envelope with stable `code`, `message`, and item-addressable `details.issues`.
- A `409` returns the current revision and normalized current data so the UI can offer a safe reload without a second race-prone request.

## Definition of done

- The legacy public POST no longer mutates and is removed after observation.
- Scoped ordering schemas and portable unique constraints exist on SQLite and PostgreSQL.
- GET returns correct Club/Association groups and deterministic effective order.
- PUT authorises, validates, replaces custom rows, audits, and increments revision atomically.
- The Application BFF, types, service, query key, query hook, and mutation hook are implemented and tested.
- The placeholder screen is replaced by accessible independent sortable groups.
- Save, retry, `409`, validation, reset, and unsaved-navigation flows work without losing the draft.
- Provider imports may change `Grade.sortOrder` without altering custom rows.
- Scheduler callers cannot inject an ordering map; `FixtureDataSorter` receives an immutable resolved map.
- At least one agreed upcoming/results bundle visibly changes after a custom order save.
- Phase 11 verification passes and the team returns a Monday-ready progress report.

## Decisions to confirm while implementing

These are narrow adapter decisions, not reasons to stop the project:

- Which exact CMS Grade field(s) map to `junior`, `senior`, `masters`, or `unclassified`; implement the mapping in one CMS resolver and document it in Phase 04.
- The exact `group_assets_by` mapping for Club category selection; cover both Boolean values in tests.
- Which verified provider ID enables safe deleted/recreated Grade reconciliation through `gradeIdSnapshot`.
- Named owner and start date for the 14-day legacy observation window.
- Final confirmed consumer list after the Phase 10 repository audit; the minimum acceptance target is an upcoming/results asset bundle.

If repository evidence resolves one of these, record the decision in the relevant phase and proceed. Escalate only if two plausible choices produce materially different customer behavior.
