# PostHog App analytics — Phase 2 plan

**Status:** agreed (2026-08-23)  
**Project:** PostHog `214725` (shared)  
**Prior work:** Phase 1 shipped in commit `e780c99` (foundation, identity, onboarding, bundles core)

## Locked decisions

| #   | Decision             | Choice                                                                                                   |
| --- | -------------------- | -------------------------------------------------------------------------------------------------------- |
| Q1  | North star           | **Balanced** — Phase A+B first (activation + revenue), defer Vision/sponsors/media                       |
| Q2  | Activation milestone | **Primary:** `onboarding_setup_ready` · **Success:** first `pack_viewed` / server `first_pack_delivered` |
| Q3  | Event taxonomy       | **Funnel steps** = named events (`organisation_selected`, …) · **Saves/nav** = `user_action` + `action`  |
| Q4  | Billing depth        | **Full funnel** — trial, checkout started, return, invoice                                               |
| Q5  | Org selection        | Include **`gateway_reason`** when present on select-org                                                  |
| Q6  | Dev traffic          | **Exclude** `/sandbox/**` and `/admin/system/**` from all capture                                        |
| Q7  | Phase C scope        | **Bundles depth only** now; Vision/sponsors/media deferred to ticket 10                                  |
| Q8  | Group properties     | **Events only** — no PostHog group property sync in this phase                                           |

## Implementation order

1. **11 — Hygiene** (sandbox guard) — ship first or in parallel; prevents pollution during QA
2. **06 — Gateway & auth** — org selection, setup recovery, login_failed
3. **07 — Activation saves** — settings, notifications, branding, logo, template
4. **08 — Billing funnel** — trial, checkout, returns, invoice
5. **09 — Bundles depth** — filters, render opened, delivery settings link
6. **10 — Engagement (deferred)** — Vision, sponsors, media, account security

## Event property schemas

All events include `surface: app` (injected by module). Never include email, password, names, Stripe URLs, or tokens.

### Auth

| Event        | Type           | Properties                                                                      |
| ------------ | -------------- | ------------------------------------------------------------------------------- |
| `conversion` | `login_failed` | `reason_code`: `invalid_credentials` \| `network` \| `unavailable` \| `unknown` |

### Gateway

| Event         | Type                            | Properties                                                                              |
| ------------- | ------------------------------- | --------------------------------------------------------------------------------------- |
| `user_action` | `organisation_selected`         | `accountId`, `entry_route`: `dashboard` \| `wizard`, `display_state`, `gateway_reason?` |
| `user_action` | `organisation_selection_failed` | `accountId?`                                                                            |
| `user_action` | `onboarding_setup_viewed`       | `accountId`                                                                             |
| `user_action` | `onboarding_setup_retry`        | `accountId`                                                                             |
| `conversion`  | `onboarding_setup_ready`        | `accountId`                                                                             |

`display_state` values: from `select-org-display-state` view model (`active`, `needs-attention`, `incomplete`, etc. — use existing enum/string from VM).

`gateway_reason`: from `parseSelectOrgGatewayReason(searchParams)` when on `/select-organisation`.

### Activation saves

| Event         | Type                     | Properties                                 |
| ------------- | ------------------------ | ------------------------------------------ |
| `user_action` | `settings_saved`         | `accountId`, `fields_changed`: string[]    |
| `user_action` | `notifications_saved`    | `accountId`, `fields_changed`: string[]    |
| `user_action` | `branding_saved`         | `accountId`, `fields_changed`: string[]    |
| `user_action` | `brand_logo_updated`     | `accountId`, `action`: `upload` \| `clear` |
| `user_action` | `template_builder_saved` | `accountId`                                |

`fields_changed` examples: `delivery_weekday`, `include_junior_surnames`, `template_mode`, `palette` — keys only, no values.

### Billing

| Event        | Type                            | Properties                                                                     |
| ------------ | ------------------------------- | ------------------------------------------------------------------------------ |
| `conversion` | `trial_started`                 | `accountId`                                                                    |
| `conversion` | `subscription_checkout_started` | `accountId`, `tier_id`, `payment_path`: `card` \| `invoice`                    |
| `conversion` | `billing_checkout_return`       | `accountId`, `result`: `success` \| `cancelled`, `session_id_present`: boolean |
| `conversion` | `invoice_requested`             | `accountId`                                                                    |

### Bundles (extend Phase 1)

| Event         | Type                             | Properties                                                              |
| ------------- | -------------------------------- | ----------------------------------------------------------------------- |
| `user_action` | `bundles_render_opened`          | `accountId`, `renderId`, `source`: `list_row`                           |
| `user_action` | `bundles_filter_applied`         | `accountId`, `sort_column`, `sort_direction`, `has_date_range`: boolean |
| `user_action` | `delivery_settings_link_clicked` | `accountId`, `source`: `bundles_scheduler_strip`                        |

## File touch map

### Ticket 06 — Gateway & auth

| File                                                                      | Change                                                                                  |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `src/components/auth/login-form.tsx`                                      | `captureConversion('login_failed', { reason_code })` in catch                           |
| `src/app/(members)/select-organisation/select-organisation-content.tsx`   | `organisation_selected` / `organisation_selection_failed` in `handleSelectOrganisation` |
| `src/app/(members)/create-organisation/setup/setup-client.tsx`            | `onboarding_setup_viewed` on mount when holding recovery                                |
| `src/app/(members)/create-organisation/_components/setup-status-card.tsx` | `onboarding_setup_retry` on retry; `onboarding_setup_ready` when status → ready         |
| `src/lib/analytics/analytics.test.ts`                                     | Tests for new helpers if any                                                            |

### Ticket 07 — Activation saves

| File                                                                                        | Change                                                      |
| ------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `src/app/(members)/o/[accountId]/settings/_hooks/use-account-settings-preferences-state.ts` | `settings_saved` on successful `mutateAsync`                |
| `src/app/(members)/o/[accountId]/notifications/_components/notifications-form.tsx`          | `notifications_saved` after patch success                   |
| `src/features/branding/components/branding-workspace/_hooks/use-branding-workspace.ts`      | `branding_saved` with `fields_changed` from patch body keys |
| `src/features/branding/components/brand-logo-workspace/index.tsx`                           | `brand_logo_updated` upload/clear                           |
| `src/app/(members)/o/[accountId]/template-builder/template-builder-content.tsx`             | `template_builder_saved` on save success                    |

### Ticket 08 — Billing

| File                                                                                     | Change                                                                                        |
| ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `src/app/(members)/o/[accountId]/billing/_hooks/useBillingTrialStart.ts`                 | `trial_started` in `confirmStartTrial` success                                                |
| `src/app/(members)/o/[accountId]/billing/create/create-subscription-wizard.tsx`          | `subscription_checkout_started` before Stripe redirect; `invoice_requested` on invoice submit |
| `src/app/(members)/o/[accountId]/billing/overview/_hooks/useBillingOverviewLifecycle.ts` | `billing_checkout_return` when `readBillingCheckoutReturnOutcome` fires                       |

### Ticket 09 — Bundles depth

| File                                                                                | Change                                                                             |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/app/(members)/o/[accountId]/bundles/_hooks/use-bundles-render-list-panel.ts`   | `bundles_filter_applied` on sort toggle / date range change (debounce or on apply) |
| `src/app/(members)/o/[accountId]/bundles/_components/bundles-render-list-panel.tsx` | `bundles_render_opened` on row navigation                                          |
| `src/app/(members)/o/[accountId]/bundles/_components/bundles-scheduler-strip.tsx`   | `delivery_settings_link_clicked`                                                   |

### Ticket 11 — Hygiene

| File                                     | Change                                                               |
| ---------------------------------------- | -------------------------------------------------------------------- |
| `src/lib/analytics/analytics.ts`         | `shouldCaptureForPath(path)` — false for `/sandbox`, `/admin/system` |
| `src/lib/analytics/analytics.test.ts`    | Unit tests for path guard                                            |
| `.comms/handoff/analytics-app-events.md` | Full catalog                                                         |
| `.comms/handoff/analytics-handoff.md`    | Phase 2 status pointer                                               |

## Funnels to build in PostHog (after enablement)

1. **Activation:** `login_success` → `organisation_selected` → `onboarding_completed` → `onboarding_setup_ready` → `settings_saved` \| `branding_saved`
2. **Revenue:** `trial_started` \| `subscription_checkout_started` → `billing_checkout_return` (success)
3. **Delivery:** `bundles_viewed` → `pack_viewed` → `hub_opened`

## Out of scope (unchanged)

- `surface: hub` events (Delivery Hub repo)
- Server events (`account_created`, `email_verified`, `first_pack_delivered`)
- PostHog group property sync
- Vision / sponsors / media (ticket 10 — backlog)

## Verification

- Unit tests beside analytics module and one integration test per ticket where save handlers already have tests
- Enable locally: `NEXT_PUBLIC_FEATURE_ANALYTICS=true` + consent
- PostHog MCP: confirm events with `surface: app` and expected properties after smoke journey
