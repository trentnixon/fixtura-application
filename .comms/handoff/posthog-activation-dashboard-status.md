# PostHog Activation & Product dashboard — status

**Date:** 2026-09-08 (updated after PostHog status sync)  
**Project:** `214725` (US)  
**Owner:** Product / PostHog ops

---

## PostHog coordination (2026-09-08)

PostHog acknowledged our handoff and will **not edit dashboard structure** unless we ask.

**Waiting on (Fixtura side before PostHog acts again):**

1. **`POSTHOG_API_KEY`** on CMS Heroku staging (then prod)
2. First **`account_created`** visible in Live Events

**Then ask PostHog to:** insert **`account_created`** as funnel step 2 between `form_submitted` and `$identify`, with `surface = api` filter; keep 14-day conversion window.

**We do manually:** event certification in [Data Management → Events](https://us.posthog.com/data-management/events) after first `api` events appear (~2 min per event — copy below).

**Joint Live Events pass:** schedule after CMS staging keys land. Prefer **CMS staging Heroku** over local Strapi for signal that matches deploy reality. App localhost `$pageview` is excluded from Activation funnel via `$host` filter; **`posthog-node` `api` events typically have no browser `$host`** — pollution risk for server events is wrong project/key, not localhost hostname.

---

## Dashboard

**[Activation & Product](https://us.posthog.com/dashboard/2074642)**

| Insight                              | URL                                                  | What it shows                                                                 |
| ------------------------------------ | ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| Registration → hub activation funnel | [PExjEz4b](https://us.posthog.com/insights/PExjEz4b) | 6-step cross-surface funnel, 14-day conversion window, 90-day lookback        |
| Hub return retention                 | [QyVOUKX0](https://us.posthog.com/insights/QyVOUKX0) | `hub_opened` → return `hub_opened`, daily (switch to weekly at 20+ hub users) |
| App engagement — user actions        | [2rsxrQhM](https://us.posthog.com/insights/2rsxrQhM) | Weekly `user_action` by `action`, production hosts only                       |
| Sign-ins vs new registrations        | [7ArdfBhd](https://us.posthog.com/insights/7ArdfBhd) | Returning/invited login vs new `form_submitted` (no prerequisite)             |

---

## Funnel steps (current schema)

| Step | Event / filter                            | Notes                                                    |
| ---- | ----------------------------------------- | -------------------------------------------------------- |
| 1    | `form_submitted`                          | `surface = marketing_site`, prod hosts                   |
| 2    | `$identify`                               | prod hosts — stitching depends on cross-subdomain cookie |
| 3    | `conversion` where `step = sign_in`       | `surface = marketing_site`                               |
| 4    | `onboarding_completed`                    | `surface = app` — live in members app                    |
| 5    | `conversion` where `name = trial_started` | `surface = app` — not top-level event name               |
| 6    | `hub_opened`                              | `surface = app`                                          |

**Pending funnel edit (when CMS keys are live):** insert `account_created` (`surface: api`) as step 2 between `form_submitted` and `$identify`. Optionally add `email_verified` earlier in a longer activation funnel — see CMS shipped handoff.

**CMS server events:** Code on Backend `master` (`e99743b`); **not in Live Events until** `POSTHOG_API_KEY` on staging/prod CMS. See `.comms/handoff/cms-handoff-posthog-server-events-shipped.md`.

**Filters:** `filterTestAccounts: true` at funnel level — activates when server `$internal_or_test_user` identify lands (ticket 07). No per-step edit needed.

---

## PostHog changes (2026-09-08)

- Step 4 label: removed “pending instrumentation” — `onboarding_completed` was already live.
- Step 5: fixed from event `trial_started` → `conversion` + `name = trial_started`.
- New insight: sign-ins vs new registrations — early signal shows invited/returning users (e.g. week of Aug 30: 7 sign-ins vs 2 registrations).

---

## What activates next (no dashboard edits required)

| When this lands                                                                                     | What moves                                                    |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `cross_subdomain_cookie: true` on **marketing + app** (app in `a962529`; deploy + marketing parity) | Funnel step 2 (`$identify`) starts converting                 |
| Strapi **`account_created`** (CMS `e99743b`; needs **`POSTHOG_API_KEY`** on CMS Heroku)             | Add as funnel step 2; events appear in Live                   |
| Prod **`NEXT_PUBLIC_FEATURE_ANALYTICS=true`**                                                       | App events (`$identify`, onboarding, trial, hub) fire         |
| First prod **`conversion`** with `name = trial_started`                                             | Funnel step 5 > 0                                             |
| Ticket 07 — internal Strapi ids + server identify                                                   | `filterTestAccounts` excludes QA/internal across all insights |
| contentv2 **`phDistinctId`** handoff                                                                | Hub retention cohort grows beyond early single-user baseline  |
| Marketing **`$opt_in` fix**                                                                         | Funnel volume trustworthy (hygiene handoff)                   |

---

## Early data notes (Sep 2026)

- Low volume — interpret percentages cautiously.
- Sign-ins exceed new registrations → direct login / invited users are real; use [7ArdfBhd](https://us.posthog.com/insights/7ArdfBhd) alongside the registration funnel.
- `onboarding_completed` and `trial_started` at 0% is volume or env flag, not missing instrumentation.

---

## Event certification (paste into Data Management)

After `account_created`, `email_verified`, and `first_pack_delivered` appear in Live Events: [Data Management → Events](https://us.posthog.com/data-management/events) → search each name → add description → mark **verified**.

### `account_created`

Fired server-side via posthog-node (Strapi AccountCreator only — not on idempotent reuse). Signals a net-new user account. Properties: `surface: "api"`, `$groups.organization`. Links to `form_submitted` via shared distinctId (Strapi user ID). Funnel step 2 in the Activation & Product funnel.

### `email_verified`

Fired server-side via posthog-node when a user confirms their email address. No org group attached (pre-account-scope). Properties: `surface: "api"`. Not a funnel step; used for lifecycle analysis and future workflow triggers.

### `first_pack_delivered`

Fired server-side via posthog-node when status = Complete && !Processing && downloads > 0 for the first time for an org. Signals delivery activation. Properties: `surface: "api"`, `$groups.organization`. Candidate for a future Delivery Health dashboard funnel step.

---

## Follow-up with PostHog

| When                                           | Message / ask                                                                                                                   |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Now**                                        | None — they are waiting on us                                                                                                   |
| **CMS keys + first `account_created` in Live** | “First `account_created` in Live — please add funnel step 2 (`surface: api`) between `form_submitted` and `$identify`.”         |
| **After joint QA passes**                      | Optional: “Ready for 15-min Live Events review” if you want a working session                                                   |
| **Internal ids published**                     | Optional heads-up: “Strapi internal ids populated — `filterTestAccounts` should start excluding QA”                             |
| **Later (explicit ask only)**                  | Acquisition dashboard; Delivery Health dashboard (`pack_viewed`, hub by org); hub retention weekly granularity at 20+ hub users |

**Not PostHog’s lane:** marketing `$opt_in` fix, app prod deploy, contentv2 hub handoff, CMS Heroku env vars.

---

## References

- Platform decisions: `.comms/handoff/posthog-round2-decisions.md`
- App event catalog: `.comms/handoff/analytics-app-events.md`
- Server events (CMS request): `.comms/API/handoff/posthog-server-events.md`
- **CMS shipped handoff:** `.comms/handoff/cms-handoff-posthog-server-events-shipped.md`
- Hygiene (marketing/contentv2): `.comms/handoff/posthog-hygiene-handoff.md`
- Hub handoff (contentv2): `.comms/handoff/posthog-hub-identify-handoff.md`
