# 09 — Bundles list depth (Phase C partial)

**What to build:** Extend bundles instrumentation beyond list/detail views — navigation, filters, and scheduler → settings handoff.

**Blocked by:** 04 — App product events (core shipped; this completes issue 04 leftovers)

**Status:** ready-for-agent

**Related:** `phase-2-plan.md` (Q7 — bundles only from Phase C)

## Events

| Event                                          | Properties                                                     | Trigger                                   |
| ---------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------- |
| `user_action` `bundles_render_opened`          | `accountId`, `renderId`, `source: 'list_row'`                  | User navigates from render list to detail |
| `user_action` `bundles_filter_applied`         | `accountId`, `sort_column`, `sort_direction`, `has_date_range` | Sort column toggle or date range set      |
| `user_action` `delivery_settings_link_clicked` | `accountId`, `source: 'bundles_scheduler_strip'`               | Scheduler strip CTA to settings           |

## Tasks

### Phase 1: Render navigation

- [ ] Identify row click handler in `bundles-render-list-panel.tsx` (or parent) — capture before navigation with `renderId`

### Phase 2: Filters

- [ ] `use-bundles-render-list-panel.ts` — on `toggleSort` and `setDateRange`, capture `bundles_filter_applied`
- [ ] Debounce not required — one event per user action is acceptable; avoid firing on initial mount

### Phase 3: Scheduler strip

- [ ] `bundles-scheduler-strip.tsx` — capture on settings link click

### Phase 4: Catalog & tests

- [ ] Update `.comms/handoff/analytics-app-events.md`
- [ ] Mark issue 04 leftovers complete in scratch notes when done

## Constraints

- Do not duplicate `pack_viewed` (fires on detail mount) — `bundles_render_opened` is list-origin navigation only
- No render payload or download URLs in properties

## Completion criteria

- Open render from list → both `bundles_render_opened` and `pack_viewed` on detail
- Change sort → `bundles_filter_applied` with new column/direction
