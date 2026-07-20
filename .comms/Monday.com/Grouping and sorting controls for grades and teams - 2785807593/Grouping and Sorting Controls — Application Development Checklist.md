# Grouping and Sorting Controls — Application Development Checklist

**Parent item:** [Grouping and sorting controls for grades and teams](https://trentnixons-team-company.monday.com/boards/5029957869/pulses/2785807593)

**Related CMS parent:** [Grade Sorting Application — Account-scoped CMS API](https://trentnixons-team-company.monday.com/boards/5029957868/pulses/2785844491)

> Use this checklist to deliver the authenticated Application experience for organisation-scoped Grade grouping and ordering. A task is complete only when implementation, tests, evidence, and documentation are complete.

## Application progress snapshot (2026-07-16)

Phases 07–09 are implemented in the Application repository. Evidence:

| Area                | Key paths                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| Types (contract v1) | `src/types/api/grade-ordering.ts`, `src/types/api/grade-ordering.fixtures.ts`                  |
| BFF GET/PUT         | `src/app/api/accounts/[accountId]/grade-ordering/route.ts` (+ 8 route tests)                   |
| Data layer          | `src/lib/api/services/account.api.ts`, `useAccountGradeOrdering`, `usePutAccountGradeOrdering` |
| Sort Order UI       | `src/app/(members)/o/[accountId]/sort-order/` (+ 4 draft util tests)                           |
| Unsaved leave guard | `src/lib/navigation/unsaved-changes-context.tsx`, `nav-main`, `nav-user`                       |
| CMS handoff         | [cms-handoff-grade-ordering.md](./cms-handoff-grade-ordering.md)                               |

**Remaining before release:** live CMS staging smoke (Club + Association), Phase 10 downstream audit, Phase 11 E2E/a11y, multi-org picker (if required), `sourceTeamIds` display, explicit `isCustomOrdered` UI affordance.

## Current Monday status

- [x] Product rules and ordering scope — Done

- [x] Organisation-scoped ordering data model — Done (Application DTOs + draft model)

- [x] Authenticated CMS read and bulk-save API — Done (Application BFF + hooks; pending live staging smoke)

- [x] Frontend grouping and ordering screen — Done (pending a11y/E2E evidence)

- [x] Save feedback, validation, and unsaved-change protection — Done (pending a11y announcements + 422 field mapping)

- [ ] Downstream consumers — Working on it

- [ ] Migration, backfill, and fallback strategy — Working on it (Application consumes CMS fallback; no client migration)

- [ ] End-to-end, accessibility, and regression coverage — Working on it

---

## 1. Confirm product rules and ordering scope

**Monday:** [Confirm product rules and ordering scope](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785807577)

- [x] Confirm ordering is scoped to an Account and selected organisation.

- [x] Confirm Club and Association use different grouping rules.

- [x] Confirm Club groups are Junior, Senior, Masters, and Other.

- [x] Confirm Association groups use Competition CMS identity.

- [x] Confirm duplicate Competition names remain separate.

- [x] Confirm clients do not directly own positions, group keys, or scope keys.

- [x] Confirm the Application uses the normalized CMS contract rather than rebuilding Grade scope from raw endpoints.

- [x] Confirm optimistic concurrency uses `expectedRevision`.

- [x] Confirm stale writes return `409` and require a refetch.

- [x] Confirm inactive or temporarily unavailable Grades retain dormant saved ordering.

- [x] Record all approved product decisions in feature documentation.

## 2. Design organisation-scoped ordering data model

**Monday:** [Design organisation-scoped ordering data model](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785782340)

- [x] Define frontend DTOs for Account, organisation, groups, and Grades.

- [x] Define Club and Association organisation selectors. _(v1: resolved from `useAccountOrganisationContext`; no multi-org picker yet)_

- [x] Define stable client keys using CMS-provided group and Grade identifiers.

- [x] Keep CMS `revision` in query state and mutation payloads.

- [x] Preserve `savedPosition`, `resolvedPosition`, and `isCustomOrdered` semantics.

- [x] Define normalized query-cache shape.

- [x] Define reorder intent without creating client-owned position fields.

- [x] Define full-replacement mutation payload.

- [x] Define TypeScript error-code union for the CMS contract.

- [x] Define stale-revision recovery state.

- [x] Define empty, loading, error, and no-access states.

- [x] Confirm DTOs match CMS contract version 1.

## 3. Implement authenticated CMS read and bulk-save API integration

**Monday:** [Implement authenticated CMS read and bulk-save API](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785782270)

- [x] Add authenticated BFF GET route for Grade ordering.

- [x] Add authenticated BFF PUT route for full replacement.

- [x] Forward the member JWT safely.

- [x] Validate Account and organisation inputs at the BFF boundary.

- [x] Forward CMS status codes and normalized errors.

- [x] Preserve `Cache-Control: private, no-store` behavior.

- [x] Prevent bearer tokens from appearing in logs.

- [x] Prevent CMS internal URLs from leaking into client errors.

- [x] Add TanStack Query hook for normalized GET.

- [x] Add mutation hook for bulk-save PUT.

- [x] Invalidate or replace query data after success.

- [x] Refetch immediately after revision conflict.

- [x] Handle feature-disabled responses cleanly. _(403 toast when `ENABLE_GRADE_ORDERING_PUT=false`)_

- [x] Add route and hook tests. _(BFF route tests + draft util tests; hook unit tests not yet added)_

## 4. Rebuild frontend grouping and ordering screen

**Monday:** [Rebuild frontend grouping and ordering screen](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785807604)

- [x] Replace legacy Team/Grade ordering UI with normalized CMS data. _(Application had no legacy caller; placeholder replaced)_

- [x] Add Account-aware organisation selection. _(v1: single linked org from organisation context)_

- [x] Render Club groups in canonical order.

- [x] Render Association groups by CMS-provided Competition order.

- [x] Display Grade names and relevant metadata clearly.

- [ ] Display source Team context for Club Grades where useful.

- [x] Support keyboard-accessible reordering.

- [x] Support pointer/touch reordering.

- [x] Prevent moving Grades into invalid groups.

- [x] Preserve duplicate Competition-name groups as distinct sections.

- [ ] Show fallback-ordered Grades without implying they were explicitly saved.

- [ ] Show custom-order state where useful.

- [x] Handle empty groups and accounts with no reachable Grades.

- [x] Avoid reconstructing group rules in multiple components.

- [x] Keep the screen responsive on desktop and mobile.

## 5. Add save feedback, validation, and unsaved-change protection

**Monday:** [Add save feedback, validation and unsaved-change protection](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785756852)

- [x] Track local dirty state after reorder operations.

- [x] Disable Save when no changes exist.

- [x] Prevent duplicate Grade IDs in the outgoing intent.

- [x] Prevent invalid cross-group moves.

- [x] Show saving progress.

- [x] Show success confirmation after committed save.

- [ ] Show actionable validation errors. _(generic mutation error only; no per-field `422` mapping yet)_

- [x] Show a dedicated stale-revision conflict message.

- [x] Refetch and restore server truth after `409`.

- [x] Warn before route navigation with unsaved changes.

- [x] Warn before closing or refreshing with unsaved changes.

- [x] Avoid false unsaved warnings after a successful save.

- [x] Preserve user context after recoverable errors.

- [x] Add retry behavior for temporary failures. _(load retry via `ErrorState`; save retry manual)_

- [ ] Ensure all feedback is announced to assistive technologies.

## 6. Update downstream consumers to honour saved ordering

**Monday:** [Update downstream consumers to honour saved ordering](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785807542)

- [ ] Identify every Application screen that displays Grades or Teams in an order.

- [ ] Identify every BFF or client transformation that currently sorts Grades locally.

- [ ] Remove conflicting alphabetical or legacy `sortOrder` assumptions.

- [ ] Use CMS-resolved ordering where the contract provides it.

- [ ] Confirm scheduler-generated fixture assets use the same resolved order.

- [ ] Confirm fixture, result, roster, ladder, and download workflows are unaffected or updated.

- [ ] Confirm Template Builder Grade selectors use the intended order.

- [ ] Confirm duplicate Competition names remain separate downstream.

- [ ] Confirm dormant Grades are not displayed.

- [ ] Confirm newly imported Grades appear through fallback ordering.

- [ ] Add regression tests around each affected consumer.

- [ ] Document consumers intentionally left unchanged.

## 7. Create migration, backfill, and fallback-order strategy

**Monday:** [Create migration, backfill and fallback-order strategy](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785619930)

- [x] Inventory current frontend and CMS legacy ordering data. _(documented in CMS handoff; Application had no legacy integration)_

- [ ] Confirm whether any legacy Team or Grade sort data must be migrated.

- [x] Define initial behavior when no ordering set exists. _(CMS returns `revision: 0` + fallback order)_

- [x] Confirm fallback order uses CMS-resolved behavior.

- [x] Confirm the Application does not create ordering records during GET.

- [ ] Define rollout behavior for existing Accounts.

- [ ] Define feature-flag behavior and rollback path.

- [ ] Define how newly imported Grades enter existing groups.

- [ ] Confirm dormant saved rows are preserved.

- [ ] Confirm recreated Grades are not silently relinked in v1.

- [ ] Produce staging migration evidence.

- [ ] Produce a rollback checklist.

- [ ] Document any one-off backfill command separately from runtime code.

## 8. Add end-to-end, accessibility, and regression coverage

**Monday:** [Add end-to-end, accessibility and regression coverage](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785807516)

- [ ] Test Club GET and screen rendering.

- [ ] Test Association GET and screen rendering.

- [ ] Test successful Club reorder and save.

- [ ] Test successful Association reorder and save.

- [ ] Test revision increment after save.

- [ ] Test stale revision conflict and refetch.

- [ ] Test invalid cross-group movement prevention.

- [ ] Test duplicate Competition names.

- [ ] Test a Grade reached through multiple Teams.

- [ ] Test fallback-ordered newly imported Grade.

- [ ] Test dormant Grade removal from the visible screen.

- [ ] Test unsaved-change navigation warning.

- [ ] Test keyboard-only reorder workflow.

- [ ] Test screen-reader status announcements.

- [ ] Test focus management after save and error.

- [ ] Test responsive layout.

- [x] Test BFF authentication failures. _(route tests: 401, 400)_

- [ ] Test CMS feature-disabled response.

- [ ] Test no sensitive token leakage in logs or errors.

- [ ] Run regression coverage for existing account settings flows.

---

## Supporting security and audit work

These related items support the same feature and should be included in release readiness even though they are not part of the original eight-item Application delivery sequence.

### CMS Grade ownership and legacy audit

**Monday:** [Audit CMS Grade ownership, sharing and legacy route](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785631652)

- [x] Confirm legacy ownership and sharing behavior.

- [x] Identify insecure or account-unsafe route behavior.

- [x] Record findings for the CMS implementation team.

### Disable insecure legacy endpoint

**Monday:** [Disable insecure legacy ordering endpoint](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785870171)

- [x] Confirm the legacy route returns non-mutating `410 Gone`. _(CMS deployed)_

- [x] Confirm no Application caller still uses the legacy route.

- [ ] Remove legacy frontend integrations and dead code. _(legacy caller is in separate Frontend repo)_

- [ ] Add regression coverage proving no mutation occurs.

### Transactional audit log and retention

**Monday:** [Implement transactional ordering audit log and retention](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785652774)

- [ ] Confirm every successful ordering write creates exactly one audit event.

- [ ] Confirm failed or stale writes create no audit event.

- [ ] Confirm audit and ordering changes commit atomically.

- [ ] Confirm 12-month retention cleanup is scheduled and tested.

- [x] Confirm the Application does not expose audit internals to members.

---

## Release acceptance

- [x] Product and grouping rules are approved.

- [x] Application DTOs match CMS contract version 1.

- [x] Authenticated BFF GET and PUT routes are complete.

- [x] Club and Association screens are complete. _(pending live staging verification)_

- [x] Reordering works with keyboard, pointer, and touch.

- [x] Save, error, conflict, and unsaved-change feedback is complete. _(pending a11y + 422 field mapping)_

- [ ] All downstream Grade-order consumers use the intended resolved order.

- [x] Legacy ordering integration is removed from the Application.

- [ ] Migration and fallback behavior are documented and tested.

- [ ] Club staging example passes.

- [ ] Association staging example passes.

- [ ] Successful PUT and `409` conflict examples pass.

- [ ] End-to-end fixture output reflects the saved order.

- [ ] Accessibility checks pass.

- [ ] Regression suite passes.

- [ ] Application and CMS teams sign off on the shared contract.

- [ ] Feature flag and rollback instructions are documented.
