# Development Roadmap — Season Route

## Current Focus

- Validate dynamic org sync trigger behavior across association and club accounts.
- Confirm queued sync outcomes in season UI after strict org-type endpoint mapping.
- Exercise competition detail **Refresh grades** against CMS after deploy; confirm hub lists update after queue processing.
- Exercise grade page **Refresh teams** against CMS after deploy; confirm competition-wide team lookup queue and hub reads after processing.

## Completed

- TKT-2026-001: Added frontend integration path for association single-scrape trigger via app BFF route.
- TKT-2026-004: Added club single-scrape route plumbing via app BFF route and reusable client hook.
- TKT-2026-006: Implemented org-aware sync orchestration hook with strict Association/Club endpoint routing and trigger-only confirm flow.
- Competition grades single-scrape: BFF `POST /api/competition/trigger-grades-comps-single-scrape`, `useTriggerGradesCompsSingleScrape`, and competition detail UI (handoff: `.comms/API/handoff/frontend-trigger-grades-comps-single-integration.md`).
- Competition teams lookup (all grades): BFF `POST /api/competition/trigger-grades-lookup-teams-single-scrape`, `useTriggerGradesLookupTeamsSingleScrape`, and grade view **Refresh teams** UI (handoff: `.comms/API/handoff/frontend-trigger-grades-lookup-teams-single-integration.md`).

## To Do (easy → hard)

1. [ ] Validate live CMS payload alignment for associationId source in recon scope (P1)
   - (see TKT-2026-002 in `Tickets.md`)

2. [ ] Add route-level tests for BFF trigger endpoint (P2)
   - (see TKT-2026-003 in `Tickets.md`)

3. [ ] Add route-level tests for club trigger BFF endpoint (P3)
   - (see TKT-2026-007 in `Tickets.md`)

## Blocked / Waiting

- None.

## Recommendations

- Keep org endpoint routing centralized in one hook to avoid per-page divergence in club/association behavior.
- For grades queue behaviour and error messages, treat `.comms/API/handoff/frontend-trigger-grades-comps-single-integration.md` as the contract with CMS.
- For teams lookup queue behaviour (competition-scoped, all grades), treat `.comms/API/handoff/frontend-trigger-grades-lookup-teams-single-integration.md` as the contract with CMS.
