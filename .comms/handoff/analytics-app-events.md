# App analytics events (members application)

**Surface:** all events include `surface: app`  
**Project:** shared PostHog project `214725` (marketing + app + hub)  
**Consent:** `localStorage.fixtura_analytics_consent === "granted"`  
**Excluded paths:** `/sandbox/**`, `/admin/system/**` (no capture)

## Lifecycle

| Event        | Properties                             | When                                     | Status |
| ------------ | -------------------------------------- | ---------------------------------------- | ------ |
| `$pageview`  | `$current_url`                         | Route change (explicit, autocapture off) | Live   |
| `conversion` | `name: "login_success"`                | App sign-in succeeds                     | Live   |
| `conversion` | `name: "login_failed"`, `reason_code`  | App sign-in fails                        | Live   |
| `identify`   | distinct id = backend user id (string) | Login + returning session                | Live   |
| `group`      | `organization` = route `accountId`     | Account-scoped routes `/o/[accountId]/*` | Live   |

`reason_code`: `invalid_credentials` | `network` | `unavailable` | `unknown` — never email/password.

## Gateway

| Event         | Properties                                                                                        | When                                   | Status |
| ------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------- | ------ |
| `user_action` | `action: "organisation_selected"`, `accountId`, `entry_route`, `display_state`, `gateway_reason?` | User opens an org from select-org      | Live   |
| `user_action` | `action: "organisation_selection_failed"`, `accountId?`                                           | Onboarding state fetch fails on select | Live   |
| `user_action` | `action: "onboarding_setup_viewed"`, `accountId`                                                  | Setup recovery page shown              | Live   |
| `user_action` | `action: "onboarding_setup_retry"`, `accountId`, `source?`                                        | User retries failed setup              | Live   |
| `conversion`  | `name: "onboarding_setup_ready"`, `accountId`                                                     | Background setup reaches ready         | Live   |

`entry_route`: `dashboard` | `wizard`. `gateway_reason` from select-org URL when present. `source`: `select_org_details` when retry from org details panel.

## Onboarding (`/create-organisation`)

| Event                       | Properties                                            | When                                            | Status |
| --------------------------- | ----------------------------------------------------- | ----------------------------------------------- | ------ |
| `onboarding_started`        | `accountId`                                           | User enters wizard steps (step ≥ 1)             | Live   |
| `onboarding_step_completed` | `accountId`, `step` (1–4), `step_key`                 | Wizard advances to next step                    | Live   |
| `onboarding_completed`      | `accountId`                                           | Wizard confirm succeeds                         | Live   |
| `onboarding_abandoned`      | `accountId`, `step`, `reason` (`back` \| `selection`) | User leaves wizard via back / back to selection | Live   |
| `user_action`               | `action: "onboarding_bootstrap_started"`, `accountId` | First account created from wizard get-started   | Live   |
| `user_action`               | `action: "onboarding_account_deleted"`, `accountId`   | Unfinished onboarding account deleted           | Live   |

**Activation milestone (product):** `onboarding_setup_ready` = org ready for configuration; downstream success = `pack_viewed` or server `first_pack_delivered`.

## Auth recovery

| Event            | Properties                                                  | When                                      | Status |
| ---------------- | ----------------------------------------------------------- | ----------------------------------------- | ------ |
| `form_submitted` | `name: "forgot_password"`, `result` (`success` \| `failed`) | Forgot-password submit                    | Live   |
| `conversion`     | `name: "password_reset_success"`                            | Reset-password form succeeds              | Live   |
| `conversion`     | `name: "password_reset_failed"`                             | Reset-password form fails                 | Live   |
| `user_action`    | `action: "account_password_changed"`, `accountId`           | Account security password change succeeds | Live   |

## Activation configuration

| Event         | Properties                                                                            | When                             | Status |
| ------------- | ------------------------------------------------------------------------------------- | -------------------------------- | ------ |
| `user_action` | `action: "settings_saved"`, `accountId`, `fields_changed[]`                           | Org settings save succeeds       | Live   |
| `user_action` | `action: "notifications_saved"`, `accountId`, `fields_changed[]`                      | Notifications save succeeds      | Live   |
| `user_action` | `action: "branding_saved"`, `accountId`, `fields_changed[]`                           | Branding workspace save succeeds | Live   |
| `user_action` | `action: "brand_logo_updated"`, `accountId`, `action: upload \| clear`                | Logo upload or clear             | Live   |
| `user_action` | `action: "template_builder_saved"`, `accountId`                                       | Template builder save succeeds   | Live   |
| `user_action` | `action: "template_builder_viewed"`, `accountId`                                      | Template builder editor ready    | Live   |
| `user_action` | `action: "club_logo_updated"`, `accountId`, `club_id`, `change_kind: upload \| clear` | Club logo upload or clear        | Live   |
| `user_action` | `action: "club_logos_viewed"`, `accountId`                                            | Club logos screen ready          | Live   |
| `user_action` | `action: "grade_order_saved"`, `accountId`                                            | Custom grade order saved         | Live   |
| `user_action` | `action: "grade_order_cleared"`, `accountId`                                          | Custom grade order cleared       | Live   |
| `user_action` | `action: "account_profile_updated"`, `accountId`                                      | Account profile name updated     | Live   |
| `user_action` | `action: "account_login_email_updated"`, `accountId`                                  | Login email updated              | Live   |

`fields_changed` = changed field keys only, never values.

## Media gallery

| Event         | Properties                                                                      | When                          | Status |
| ------------- | ------------------------------------------------------------------------------- | ----------------------------- | ------ |
| `user_action` | `action: "media_gallery_viewed"`, `accountId`                                   | Media gallery screen ready    | Live   |
| `user_action` | `action: "media_uploaded"`, `accountId`, `asset_types_count`, `has_focal_point` | Background upload succeeds    | Live   |
| `user_action` | `action: "media_updated"`, `accountId`, `media_id`, `fields_changed[]`          | Background edit save succeeds | Live   |
| `user_action` | `action: "media_deleted"`, `accountId`, `media_id`                              | Background delete succeeds    | Live   |

## Sponsors

| Event         | Properties                                             | When                             | Status |
| ------------- | ------------------------------------------------------ | -------------------------------- | ------ |
| `conversion`  | `name: "sponsor_created"`, `accountId`, `has_logo`     | New sponsor saved                | Live   |
| `user_action` | `action: "manage_sponsors_viewed"`, `accountId`        | Manage sponsors workspace ready  | Live   |
| `user_action` | `action: "sponsor_updated"`, `accountId`               | Sponsor edit save succeeds       | Live   |
| `user_action` | `action: "sponsor_archived"`, `accountId`              | Sponsor archived from editor     | Live   |
| `user_action` | `action: "sponsor_restored"`, `accountId`              | Archived sponsor restored        | Live   |
| `user_action` | `action: "sponsor_deleted"`, `accountId`               | Sponsor permanently deleted      | Live   |
| `user_action` | `action: "sponsor_position_assigned"`, `accountId`     | Position slot assigned           | Live   |
| `user_action` | `action: "sponsor_position_cleared"`, `accountId`      | Position slot cleared            | Live   |
| `user_action` | `action: "sponsor_positions_cleared_all"`, `accountId` | All position assignments cleared | Live   |
| `user_action` | `action: "sponsor_entity_assigned"`, `accountId`       | Entity target assigned           | Live   |
| `user_action` | `action: "sponsor_entity_cleared"`, `accountId`        | Entity target cleared            | Live   |
| `user_action` | `action: "sponsor_entities_cleared_all"`, `accountId`  | All entity assignments cleared   | Live   |

## Vision / season

| Event         | Properties                                                                  | When                           | Status |
| ------------- | --------------------------------------------------------------------------- | ------------------------------ | ------ |
| `user_action` | `action: "vision_viewed"`, `accountId`                                      | Season overview ready          | Live   |
| `user_action` | `action: "vision_sync_triggered"`, `accountId`, `scope: org \| competition` | Org or competition sync queued | Live   |
| `user_action` | `action: "vision_fixture_scrape_triggered"`, `accountId`, `fixtureId`       | Fixture result scrape queued   | Live   |

## Dashboard

| Event         | Properties                                                      | When                          | Status |
| ------------- | --------------------------------------------------------------- | ----------------------------- | ------ |
| `user_action` | `action: "dashboard_viewed"`, `accountId`                       | Dashboard model ready         | Live   |
| `user_action` | `action: "dashboard_route_clicked"`, `accountId`, `destination` | Route card / CTA link clicked | Live   |

`destination`: `billing` | `sponsors` | `vision` | `brand_logo` | `branding` | `bundles` | `template_builder`

## Billing

| Event         | Properties                                                                                 | When                                        | Status |
| ------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------- | ------ |
| `conversion`  | `name: "trial_started"`, `accountId`                                                       | Free trial confirmed                        | Live   |
| `conversion`  | `name: "trial_start_failed"`, `accountId`, `reason_code`                                   | Trial start fails                           | Live   |
| `conversion`  | `name: "subscription_checkout_started"`, `accountId`, `tier_id`, `payment_path`, `source?` | Stripe checkout redirect                    | Live   |
| `conversion`  | `name: "billing_checkout_return"`, `accountId`, `result`, `session_id_present`             | Return from Stripe to billing overview      | Live   |
| `conversion`  | `name: "invoice_requested"`, `accountId`, `source?`                                        | Invoice request submitted                   | Live   |
| `conversion`  | `name: "invoice_request_withdrawn"`, `accountId`                                           | Invoice request withdrawn                   | Live   |
| `conversion`  | `name: "checkout_failed"`, `accountId`, `reason_code`                                      | Checkout / invoice / wizard payment failure | Live   |
| `user_action` | `action: "subscription_wizard_step_viewed"`, `accountId`, `step`                           | Create subscription wizard step shown       | Live   |
| `user_action` | `action: "billing_history_viewed"`, `accountId`                                            | Billing history screen ready                | Live   |
| `user_action` | `action: "billing_checkout_resumed"`, `accountId`                                          | Pending checkout resumed                    | Live   |
| `user_action` | `action: "billing_pending_order_discarded"`, `accountId`                                   | Pending order discarded                     | Live   |

`payment_path`: `card` | `invoice`. `result`: `success` | `cancelled`. `source`: `billing_overview` | `plan_checkout`. No Stripe URLs or session id values.

## Bundles (App surface)

| Event         | Properties                                                                                         | When                                                  | Status |
| ------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------ |
| `user_action` | `action: "bundles_viewed"`, `accountId`                                                            | Bundles screen ready                                  | Live   |
| `user_action` | `action: "bundles_render_opened"`, `accountId`, `renderId`, `source`                               | Navigate list → detail                                | Live   |
| `user_action` | `action: "bundles_filter_applied"`, `accountId`, `sort_column`, `sort_direction`, `has_date_range` | Sort or date filter change                            | Live   |
| `user_action` | `action: "delivery_settings_link_clicked"`, `accountId`, `source`                                  | Scheduler strip → settings                            | Live   |
| `pack_viewed` | `accountId`, `renderId`                                                                            | Render detail screen ready                            | Live   |
| `hub_opened`  | `accountId`, `renderId`, `groupingCategory`, `source: "app_bundles_downloads"`                     | User opens external Delivery Hub from downloads table | Live   |

## Out of scope (Hub repo, `surface: hub`)

- `asset_downloaded`
- `pack_rerun` (no App UI at time of implementation)

## Server (API / Strapi)

- `account_created`
- `email_verified`
- `first_pack_delivered`

## Privacy

Never send: email, password, names, Stripe checkout URLs, session ids (boolean `session_id_present` only), form field values, or tokens.
