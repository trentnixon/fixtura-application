# Folder Overview

Organisation bundles route: render history, delivery context, and links to externally hosted asset bundles (not delivered in Members).

## Files

- `page.tsx`: Index route entry; renders bundles list screen.
- `[renderId]/page.tsx`: Per-render detail route entry.
- `_components/bundles-screen.tsx`: Client shell for index; active-run banner, render list, delivery schedule.
- `_components/bundles-active-run-banner.tsx`: Success banner when a bundle run is queued or rendering.
- `_components/bundles-scheduler-strip.tsx`: Delivery schedule strip with run status metric.
- `_components/bundles-delivery-schedule-section.tsx`: Compact delivery summary line, inline run-status pill, change-day action.
- `_components/bundles-scheduler-run-status-pill.tsx`: Run status pill (Idle / Queued / Rendering).
- `_components/bundles-screen-header.tsx`: Breadcrumb page header + Asset Hub CTA.
- `_components/bundles-render-list-panel.tsx`: Phase 7 render table (`SectionBlock`, `table.grid.*`, season table header).
- `_components/bundles-render-status-pill.tsx`: Status pill for render rows.
- `_components/bundles-render-detail-screen.tsx`: Phase 8 detail shell.
- `_components/bundles-render-detail-header.tsx`: Detail page header + back link.
- `_components/bundles-render-detail-summary.tsx`: Detail summary metrics card.
- `_components/bundles-render-downloads-panel.tsx`: External asset links table.
- `_consts/render-detail.ts`: Detail route copy.
- `_hooks/use-bundles-screen.ts`: Segment validation, scheduler bootstrap, gateway redirects.
- `_hooks/use-bundles-render-detail-screen.ts`: Detail route segment validation + render detail fetch.
- `_hooks/index.ts`: Re-exports route hooks.
- `_consts/index.ts`: User-facing strings.
- `_types/index.ts`: Screen props and view discriminant types.
- `_utils/`: Screen view helpers and error message resolution.

## Child Modules

- `.comms/`
- `.docs/`
- `_components/`
- `_hooks/`
- `_utils/`

## Relations

- Parent: `src/app/(members)/o/[accountId]/`
- Route URL helpers: `src/lib/config/account-routes.ts`
- Sidebar: `src/components/navigation/app-sidebar/_constants/sidebar-nav.ts`
- Dashboard KPI link: `src/app/(members)/o/[accountId]/dashboard/_components/dashboard-kpi-strip.tsx`
- **UI reference:** `src/app/(members)/o/[accountId]/season/` — `SectionBlock`, `Surface`, breadcrumbs, `table.grid.*` with `bg-primary-950` headers
- **Phase 5 scheduler:** [`.comms/data-fetching/handoff/done/handoff-phase-05-accounts-scheduler.md`](../../../../../../../.comms/data-fetching/handoff/done/) (if present) or account-admin-api-contract §12
- **Phase 6 render-token:** [`.comms/data-fetching/handoff/done/handoff-phase-06-accounts-render-token.md`](../../../../../../../.comms/data-fetching/handoff/done/handoff-phase-06-accounts-render-token.md)
- **Phase 7 renders list:** [`.comms/data-fetching/handoff/done/handoff-phase-07-renders-list.md`](../../../../../../../.comms/data-fetching/handoff/done/handoff-phase-07-renders-list.md)
- **Phase 8 render detail:** [`.comms/data-fetching/handoff/done/handoff-phase-08-accounts-render-detail.md`](../../../../../../../.comms/data-fetching/handoff/done/handoff-phase-08-accounts-render-detail.md)
