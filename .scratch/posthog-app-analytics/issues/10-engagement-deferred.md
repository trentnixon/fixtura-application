# 10 — Engagement analytics (deferred backlog)

**What to build:** Vision/season, sponsors, media gallery, and account security events — **not in Phase 2 implementation push**.

**Blocked by:** Tickets 06–09 complete (baseline funnels stable)

**Status:** Completed

**Related:** `phase-2-plan.md` (Q1, Q7 — deferred)

## Rationale

Activation and revenue funnels (06–09) must be measurable first. Engagement events add volume and dashboard complexity without unblocking the primary question: _why do users fail to activate or pay?_

## Proposed events (when picked up)

### Vision / season

- `user_action` `vision_sync_triggered` — `{ accountId, scope: 'org' | 'competition' }`
- `user_action` `vision_competition_opened` — `{ accountId, competitionId }`
- `user_action` `vision_fixture_scrape_triggered` — `{ accountId, fixtureId }`

### Sponsors

- `conversion` `sponsor_created` — `{ accountId }`
- `user_action` `sponsor_position_assigned` — `{ accountId }`
- `user_action` `sponsor_entity_assigned` — `{ accountId }`

### Media gallery

- `user_action` `media_uploaded` — `{ accountId }`
- `user_action` `media_deleted` — `{ accountId }`

### Account security

- `user_action` `account_profile_updated` — `{ accountId }`
- `user_action` `account_password_changed` — `{ accountId }`

### Auth recovery

- `form_submitted` — `{ name: 'forgot_password' }` on forgot-password submit

## Entry points (reference)

| Area            | Primary file                                       |
| --------------- | -------------------------------------------------- |
| Season overview | `src/app/(members)/o/[accountId]/season/`          |
| Sponsors        | `src/app/(members)/o/[accountId]/manage-sponsors/` |
| Media gallery   | `src/app/(members)/o/[accountId]/media-gallery/`   |
| Account         | `src/app/(members)/o/[accountId]/account/`         |
| Forgot password | `src/app/(public)/forgot-password/`                |

## Completion Summary

Engagement analytics implemented across vision/season, sponsors, media gallery, account security, auth recovery, dashboard route cards, and billing extras. Event catalog updated in `.comms/handoff/analytics-app-events.md` (all Live).
