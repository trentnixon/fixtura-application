# 04 — App product events (bundles and handoff)

**What to build:** Bundles and related App product interactions emit explicit catalog events with `surface: app`, including when a user opens the external Delivery Hub from the App. Hub-native events (`pack_viewed`, `asset_downloaded`, `pack_rerun`) remain out of scope for this repo.

**Blocked by:** 02 — Identity lifecycle

**Status:** ready-for-agent

- [ ] Bundles list and render-detail key interactions instrumented per event catalog (views, filters, navigation — as catalog defines).
- [ ] Click-through to external Delivery Hub emits an explicit App handoff event with `accountId` and render context (not Hub-native download events).
- [ ] Scheduler / rerun actions in bundles emit catalog events where defined for App surface.
- [ ] No sensitive data (tokens, delivery addresses, raw URLs with secrets) in event properties.
- [ ] Event catalog updated for any App-only product events added.
