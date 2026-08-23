# App analytics events (members application)

**Surface:** all events include `surface: app`  
**Project:** shared PostHog project `214725` (marketing + app + hub)  
**Consent:** `localStorage.fixtura_analytics_consent === "granted"`

## Lifecycle

| Event        | Properties                             | When                                     |
| ------------ | -------------------------------------- | ---------------------------------------- |
| `$pageview`  | `$current_url`                         | Route change (explicit, autocapture off) |
| `conversion` | `name: "login_success"`                | App sign-in succeeds                     |
| `identify`   | distinct id = backend user id (string) | Login + returning session                |
| `group`      | `organization` = route `accountId`     | Account-scoped routes `/o/[accountId]/*` |

## Onboarding (`/create-organisation`)

| Event                       | Properties                                            | When                                            |
| --------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| `onboarding_started`        | `accountId`                                           | User enters wizard steps (step ≥ 1)             |
| `onboarding_step_completed` | `accountId`, `step` (1–4), `step_key`                 | Wizard advances to next step                    |
| `onboarding_completed`      | `accountId`                                           | Wizard confirm succeeds                         |
| `onboarding_abandoned`      | `accountId`, `step`, `reason` (`back` \| `selection`) | User leaves wizard via back / back to selection |

## Bundles (App surface)

| Event         | Properties                                                                     | When                                                  |
| ------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| `user_action` | `action: "bundles_viewed"`, `accountId`                                        | Bundles screen ready                                  |
| `pack_viewed` | `accountId`, `renderId`                                                        | Render detail screen ready                            |
| `hub_opened`  | `accountId`, `renderId`, `groupingCategory`, `source: "app_bundles_downloads"` | User opens external Delivery Hub from downloads table |

## Out of scope (Hub repo, `surface: hub`)

- `asset_downloaded`
- `pack_rerun` (no App UI at time of implementation)

## Server (API / Strapi)

- `account_created`
- `email_verified`
- `first_pack_delivered`
