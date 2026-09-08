# 05 — PostHog ops: Actions, dashboards, cohorts

**What to build:** PostHog UI configuration for product analytics — Actions for milestone steps (support both `conversion.step` marketing and `conversion.name` app), three dashboards, milestone event certification, cohorts after group enrichment.

**Blocked by:** Ticket 01 recommended before trusting funnel numbers; ticket 03 for org-filtered cohorts.

**Status:** ready-for-agent

**Owner:** Product / ops (PostHog UI); PostHog may build Activation & Product in parallel

### Tasks

- [ ] Certify ~15 milestone events in PostHog data management (descriptions + verified).
- [ ] Create Actions for: sign_in (conversion.step), login_success (conversion.name), trial_started, onboarding_completed, onboarding_setup_ready, hub_opened, etc.
- [ ] **Activation & Product dashboard:** funnel (register → identify → sign_in → activation → hub_opened), hub_opened retention 7/14/30d, user_action by action × surface.
- [ ] **Acquisition dashboard:** www pageviews, cta_clicked, register funnel, UTM (do not break existing Brochure Funnels dashboard).
- [ ] **Delivery Health dashboard:** pack_viewed, asset_viewed, hub_opened by org (when volume allows).
- [ ] Default insight filters: exclude internal user, localhost, staging host; never use `$opt_in` as funnel step.
- [ ] Funnel conversion window: 14 days for B2B signup flows.

### Acceptance

- Dashboard URLs documented in `.comms/handoff/` or spec Further Notes.
- Actions reusable across dashboards without duplicating raw property filters.
