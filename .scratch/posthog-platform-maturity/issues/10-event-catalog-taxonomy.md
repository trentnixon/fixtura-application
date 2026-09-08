# 10 — Event catalog taxonomy alignment

**What to build:** Update shared event catalog docs to reflect live PostHog schema: marketing `conversion.step` vs app `conversion.name`, hybrid Actions guidance, milestone list for certification.

**Blocked by:** None (can parallel ticket 05).

**Status:** ready-for-agent

**Owner:** Members app docs + marketing catalog sync

### Tasks

- [ ] Update `.comms/handoff/analytics-app-events.md` with taxonomy note (name on app conversions).
- [ ] Add section to `.comms/handoff/posthog-round2-decisions.md` or catalog cross-ref for marketing `step` values.
- [ ] List ~15 milestone events for PostHog certification (ticket 05).
- [ ] Note: full migration of app milestones to top-level event names is out of scope this phase — Actions bridge both patterns.

### Acceptance

- Catalog explicitly documents hybrid model; no claim that all conversions use `name` only.
- Marketing repo catalog updated on next sync PR (handoff lists delta for marketing team).
