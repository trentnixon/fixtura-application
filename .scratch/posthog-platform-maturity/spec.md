# Spec: PostHog platform maturity

Status: ready-for-agent

Related: `.comms/handoff/posthog-round2-decisions.md`, `.scratch/posthog-app-analytics/spec.md`, `.comms/handoff/analytics-app-events.md`, PostHog project `214725`

## Problem Statement

Fixtura’s members application and sibling surfaces (marketing site, Delivery Hub) emit explicit PostHog events into a shared project with sound engineering discipline: first-party ingest proxy, no PII in payloads, autocapture off on the members app, and an Analytics Surface on every event.

Product analytics in PostHog is still not trustworthy or actionable enough to run the business on. Live data shows hygiene bugs on marketing and Delivery Hub (`$opt_in` firing on every route change; autocapture on a localhost dev port; localhost and staging hosts mixed into the production project). Organization groups lack plan, sport, and billing context, so B2B segmentation and cohort targeting are weak. Cross-surface journeys break at Hub because Delivery Hub does not identify users. Server lifecycle milestones are missing. Dashboards and funnel Actions for activation and delivery are largely unbuilt. Session replay is disabled in the SDK. Until Phase 0 hygiene is fixed and identity enrichment ships, funnel numbers and dashboards PostHog builds will overstate or misattribute behaviour.

## Solution

Run a phased PostHog platform maturity program across Fixtura surfaces:

**Phase 0 — Data hygiene (blocker):** Fix `$opt_in` and autocapture bugs on marketing and contentv2; exclude localhost/staging from production insights; audit unintended domains; maintain internal-user id list for server-side flagging. Do not treat funnel metrics as authoritative until Phase 0 completes.

**Phase 1 — Segmentation (now):** Enrich organization group properties once per account-scoped session (name, plan, sport — never on person). Explicit `cross_subdomain_cookie` in init. PostHog Actions and three dashboards (Acquisition, Activation & Product, Delivery Health). Separate staging PostHog project within 30 days. PostHog builds Activation & Product dashboard in parallel.

**Phase 2 — Stitching and depth (30 days):** Hub distinct-id handoff from app to Delivery Hub; server-side lifecycle events and `$internal_or_test_user` via posthog-node; session replay at 20–30% sample with masking; certify milestone events in PostHog data management.

**Phase 3 — Growth tooling (60–90 days):** Feature flags for product UI, NPS by organization group, threshold alerts, Stripe warehouse when scale justifies.

Members app work stays within the existing client analytics module seam. Sentry remains sole error capture. Explicit events only. Shared project for production surfaces until staging split.

## User Stories

### Hygiene and trust

1. As a product analyst, I want `$opt_in` to fire only when a user grants Analytics Consent on marketing and Hub, so that opt-in counts are not inflated on every SPA navigation.
2. As a product analyst, I want autocapture disabled on every PostHog init across all Fixtura repos, so that only catalogued events enter the project.
3. As a product analyst, I want localhost and staging host events excluded from default insights, so that developer traffic does not corrupt conversion rates.
4. As a platform engineer, I want a dedicated PostHog project for staging within 30 days, so that production funnels reflect real users only.
5. As a product owner, I want unintended domains (e.g. regional marketing hosts) audited and either aligned or disconnected, so that project data has a known surface boundary.
6. As a product analyst, I want `$internal_or_test_user` set server-side for known team Strapi ids, so that project filters reliably exclude internal traffic.

### Identity and B2B segmentation

7. As a product analyst, I want plan, trial status, and sport on the organization group only, so that multi-org users do not have conflicting person properties.
8. As a product analyst, I want organization group properties refreshed on every org selection with name, plan, and sport, so that each event carries correct org context at event time.
9. As a product analyst, I want person properties limited to universal traits (signup surface, internal-user flag, role only when global), so that person-level cohorts remain meaningful.
10. As a product analyst, I want multi-org funnel steps attributed by `$groups.organization` per event, so that org A and org B journeys stay independent.
11. As a platform engineer, I want `resetGroups()` when leaving account scope and full `group()` with properties on org switch, so that events after switch are not attributed to the previous org.
12. As a platform engineer, I want `cross_subdomain_cookie` explicitly enabled in PostHog init, so that anonymous distinct_id persists across www, application, and contentv2.
13. As a platform engineer, I want `reset()` on logout before the next identify, so that shared-browser multi-account sessions do not merge incorrectly.

### Hub and cross-surface stitching

14. As a Delivery Hub engineer, I want the members app to append an opaque Strapi user id query param when opening external Hub links, so that Hub can identify without native auth.
15. As a Delivery Hub engineer, I want Hub to call identify on init when the param is present, strip it from the URL immediately, and never use alias for this flow, so that hub events attach to the same person as the app.
16. As a product analyst, I want cross-surface funnels spanning marketing_site, app, hub, and api surfaces with a 14-day conversion window, so that register-to-first-pack journeys are measurable.
17. As a QA engineer, I want a signed-off joint journey from marketing register through app login to Hub download on one PostHog person, so that stitching is verified end-to-end.

### Server-side lifecycle

18. As an API engineer, I want posthog-node to capture account_created, email_verified, and first_pack_delivered with Strapi user id as distinctId, so that server milestones appear in client funnels.
19. As an API engineer, I want server events to include organization group keys and surface api, so that lifecycle events roll up to org analytics.
20. As an API engineer, I want `$internal_or_test_user` set via posthog-node identify for a hardcoded internal id list, so that the flag cannot be spoofed from the client.

### Dashboards, funnels, and insights

21. As a product analyst, I want PostHog Actions for reusable milestone steps, so that dashboards do not duplicate fragile property filters.
22. As a product analyst, I want an Activation & Product dashboard with activation funnel, hub retention, and user_action trends by surface, so that weekly product health review has a single home.
23. As a product analyst, I want Acquisition and Delivery Health dashboards alongside existing marketing funnels, so that marketing and product metrics coexist without breaking brochure reporting.
24. As a product analyst, I want funnels to account for marketing conversion.step schema and app conversion.name schema via Actions, so that cross-surface steps match live data not stale catalog docs.
25. As a product analyst, I want retention on hub_opened at 7, 14, and 30 days, so that delivery stickiness is quantified.
26. As a product owner, I want threshold alerts when weekly trial_started drops materially, so that instrumentation breaks and real drops are caught early.

### Session replay and privacy

27. As a product owner, I want session replay enabled at 20–30% sample for onboarding and billing, so that qualitative UX insight complements funnels.
28. As a privacy-conscious club admin, I want all inputs masked and billing/profile regions blocked or text-masked via data attributes, so that recordings do not expose sensitive UI.
29. As a support engineer, I want replay network payload capture disabled, so that API bodies never appear in recordings.

### Members app instrumentation (existing + extend)

30. As a developer, I want all capture to flow through the client analytics module with property allowlists, so that surface tagging and PII blocks cannot be bypassed.
31. As a developer, I want sandbox and admin system paths excluded at capture time on the members app, so that dev routes never pollute production (already live; preserve).
32. As a platform engineer, I want NEXT_PUBLIC_FEATURE_ANALYTICS to remain the analytics master switch separate from PostHog feature flags, so that product experiments do not conflate with analytics enablement.
33. As a marketing stakeholder, I want the existing marketing brochure dashboard unchanged while product dashboards are added, so that prior work is preserved.

### Event taxonomy and catalog

34. As a product analyst, I want milestone moments as first-class event names or clearly named Actions (trial_started, onboarding_completed, first_pack_delivered), so that funnels are readable for the whole team.
35. As a product analyst, I want conversion.step retained for atomic auth/register steps on marketing and conversion.name for app login_success-style events until unified, so that live schemas are respected in Actions.
36. As a developer, I want the shared event catalog updated to reflect the hybrid taxonomy, so that agents and humans do not drift from PostHog reality.

### Later phase (60–90 days)

37. As a product owner, I want PostHog feature flags for product UI rollouts evaluated via always-init SDK with opt_out_capturing until consent on marketing, so that flags work without firing analytics prematurely.
38. As a product owner, I want NPS surveys targetable by organization group properties without person email, so that B2B feedback is structured once enrichment exists.
39. As a finance stakeholder, I want Stripe warehouse sync deferred until roughly fifty paying orgs, so that billing truth comes from explicit conversion events until then.
40. As a compliance stakeholder, I want privacy policy to disclose PostHog, US processing, and first-party ingest proxy, so that AU B2B logged-in analytics posture is documented (legal review out of band).

## Implementation Decisions

### Testing seam

Single primary seam: the **client analytics module** in the members application. All app-side changes — init options, enriched identify and group, hub URL handoff helper, replay configuration constants, property allowlists — expose through this module’s public API. Thin bridges (identity on session load, organization group on account scope, hub link construction) call the module only; they do not import the PostHog SDK directly.

Optional secondary seam: if hub external URLs are centralized in one builder, that builder may be the only caller of the handoff helper — still one analytics seam for PostHog behaviour.

Confirm with implementer whether handoff lives inline in bundles UI or in a dedicated hub-link builder before coding.

### Phase 0 — Cross-repo hygiene (not members app code)

- Marketing and contentv2: move `opt_in_capturing()` to Analytics Consent grant handler only; guard with `has_opted_in_capturing() === false`.
- All repos: grep every `posthog.init`; enforce `autocapture: false`.
- PostHog project: filter internal users on `$internal_or_test_user`; interim host exclusion for localhost and staging hostnames.
- Ops: resolve fixtura.co.nz and localhost:3004 source; document or disconnect.

Members app verified clean for autocapture and opt_in; no change required for those bugs.

### Person vs organization properties (PostHog round 2 locked)

- **Organization group:** name, plan (derived from billing status or tier slug), sport. Set on every `group('organization', accountId, props)` when entering or switching account scope. Omit member_count unless cheaply available from existing account bootstrap API.
- **Person:** signup_surface, `$internal_or_test_user` (server-set only), role only if identical across all org memberships for that user.
- Never set plan, trial_status, or sport on person.

Plan derivation uses existing account billing summary shape: billingStatus, accessStatus, currentPlan, trial block — map to a small enum or slug allowlist for PostHog (e.g. trial, active, lapsed).

### Organization group bridge behaviour

- On account-scoped route mount: load account row from session accounts list or account-scoped hooks; call group with properties once per accountId per session (ref-guard deduplication).
- On org switch: group with new accountId and fresh properties.
- On leave account scope or logout: resetGroups() (already pattern); reset() on logout.

### Init transport and cookies

- Keep Ingest Proxy as relative `/ingest`; ui_host US cluster.
- Add explicit `cross_subdomain_cookie: true`.
- Keep autocapture false, manual pageview, session recording disabled until Phase 2 product approval.

### Hub handoff contract

- App adds query param (convention: phDistinctId) with stringified Strapi user id to external Delivery Hub URLs opened from bundles download flow.
- Hub: on init, if param present → identify(userId) → strip param from history/replaceState.
- Do not use alias(). Do not pass email or tokens.
- Document contract in comms handoff for contentv2 team.

### Event taxonomy (live data vs catalog)

Hybrid model going forward:

| Pattern               | Use                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------- |
| conversion + step     | Marketing atomic auth/register (sign_in, register_success, …)                             |
| conversion + name     | App conversions today (login_success, trial_started, …) via captureConversion helper      |
| Dedicated event names | Target state for milestones; app already sends name property values that Actions can wrap |
| user_action + action  | Navigation and saves                                                                      |

PostHog Actions must cover both step and name filters where cross-surface funnels need them. Catalog doc update is a follow-on doc task, not blocking code.

Funnel conversion window: 14 days default for B2B signup server-to-client steps; 7 days minimum.

### Server-side (Strapi — coordinated, out of members app repo)

- posthog-node with POSTHOG_API_KEY server env only.
- capture lifecycle events with distinctId = Strapi user id, properties include surface api and $groups organization when known.
- identify server-side only for internal user flag and other trusted person properties.
- Hardcoded internal Strapi id list in backend config.

### Session replay (Phase 2, product gate)

When approved: disable_session_recording false; sample_rate 0.2–0.3; maskAllInputs true; blockSelector and maskTextSelector driven by shared constants; components mark sensitive regions with data-ph-block and data-ph-mask attributes on billing and profile UI.
Network payload capture off. Replay works without autocapture; heatmaps remain toolbar-based if needed.

### PostHog UI (ops)

- PostHog building Activation & Product dashboard now (funnel, retention, user_action trend) with filters excluding internal user, localhost, staging; do not use $opt_in as funnel step.
- Team certifies ~15 milestone events in data management.
- Cohorts and alerts after group enrichment live.

### Analytics gating

- Members app: NEXT_PUBLIC_FEATURE_ANALYTICS + key only; no consent gate in capture path per replication brief.
- Marketing: consent banner + opt_in pattern after Phase 0 fix.
- PostHog product feature flags: separate from analytics gate; marketing may use init + opt_out_capturing until consent for flag evaluation (Phase 3).

### Property allowlist

Person allowlist: signup_surface, role (optional), plus PostHog-reserved internal flag set server-side only on person (client must not set $internal_or_test_user).

Group allowlist: name, plan, sport (extend only via spec amendment).

Strip or reject unknown keys in module enrichment helpers; tests assert blocked PII keys remain blocked.

## Testing Decisions

Good tests assert **external behaviour** of the analytics module and bridges: which distinct id, group key, and property bags reach a mocked PostHog client; init option object includes cross_subdomain_cookie and replay settings when enabled; handoff helper appends param without dropping existing query string; allowlist rejects disallowed keys.

Do not assert SDK internals, network calls to Ingest Proxy, or PostHog UI dashboard configuration.

Modules under test: analytics module (identify/group with properties, init options, handoff URL helper, allowlist), identity bridge (identify when session user id available), account group bridge (group with properties when account context available).

Prior art: existing vitest suites beside analytics module with PostHog client mock and enabled-flag tests.

Manual QA: joint cross-surface journey; Live Events check for group properties on app events; replay spot-check masking on billing route; verify internal user excluded when server flag set.

## Out of Scope

- PostHog exception capture (Sentry authoritative).
- Enabling autocapture for product funnels.
- PostHog Workflows or email messaging without approved non-PII channel.
- Continuous organization property sync job from Strapi (session snapshot only).
- Stripe data warehouse until ~50 paying orgs.
- Full Delivery Hub implementation (handoff contract + comms only from members app).
- Marketing instrumentation rewrites beyond Phase 0 hygiene fixes (owned in marketing repo).
- Shared npm analytics package extraction.
- SDK-embedded surveys in Phase 1–2 (PostHog UI surveys in Phase 3).
- Legal sign-off on AU privacy posture (document only).
- Replacing NEXT_PUBLIC_FEATURE_ANALYTICS with PostHog flags for analytics gating.
- Migrating all app conversion.name events to top-level event names in this phase (Actions bridge gap instead).

## Further Notes

### Build order (members app repo)

1. cross_subdomain_cookie in init
2. group() with properties + allowlist + account bridge wiring
3. Hub URL handoff helper + bundles link integration
4. Session replay config (after product approval)
5. data-ph-* attributes on sensitive UI (with replay)

Parallel non-app: Phase 0 hygiene (marketing/contentv2), staging project, Strapi server events, PostHog dashboards.

### Confidence summary

| Area                                             | Confidence                                              |
| ------------------------------------------------ | ------------------------------------------------------- |
| Problem and PostHog architectural decisions      | High (~93%)                                             |
| Members app next builds (group, handoff, cookie) | High (~88%)                                             |
| Phase 0 hygiene fixes                            | Medium (~70%) — fix known, files in other repos         |
| Strapi server events                             | Medium (~76%) — contract clear, hook placement TBD      |
| Dashboard truth before opt_in fix                | Low (~65%) — treat PostHog build as draft until Phase 0 |

### Domain vocabulary

Use Analytics Surface (marketing_site | app | hub), Ingest Proxy, Analytics Consent per root CONTEXT.md.

### References

- Round 2 decisions and bug list: `.comms/handoff/posthog-round2-decisions.md`
- App event catalog: `.comms/handoff/analytics-app-events.md`
- Prior app analytics spec (instrumentation largely complete): `.scratch/posthog-app-analytics/spec.md`
- Marketing dashboard: Fixtura Marketing — Brochure Funnels (PostHog project 214725)

### Issue breakdown

| #   | Ticket                                                                    | Owner                     |
| --- | ------------------------------------------------------------------------- | ------------------------- |
| 01  | [hygiene-handoff](./issues/01-hygiene-handoff.md)                         | Marketing, contentv2, ops |
| 02  | [init-cross-subdomain-cookie](./issues/02-init-cross-subdomain-cookie.md) | Members app               |
| 03  | [org-group-enrichment](./issues/03-org-group-enrichment.md)               | Members app               |
| 04  | [hub-distinct-id-handoff](./issues/04-hub-distinct-id-handoff.md)         | App + contentv2           |
| 05  | [posthog-ops-dashboards](./issues/05-posthog-ops-dashboards.md)           | Product / PostHog         |
| 06  | [staging-project-split](./issues/06-staging-project-split.md)             | Platform                  |
| 07  | [api-server-events](./issues/07-api-server-events.md)                     | Strapi / API              |
| 08  | [session-replay](./issues/08-session-replay.md)                           | Members app               |
| 09  | [joint-qa-enablement](./issues/09-joint-qa-enablement.md)                 | QA                        |
| 10  | [event-catalog-taxonomy](./issues/10-event-catalog-taxonomy.md)           | Docs                      |
| 11  | [phase3-deferred](./issues/11-phase3-deferred.md)                         | Product (later)           |

**Recommended execution order:** 01 → 02 + 03 (parallel) → 04 → 05 + 06 + 10 (parallel) → 07 → 09 → 08 when approved → 11 later.
