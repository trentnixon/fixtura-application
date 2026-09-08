# CMS → App handoff: PostHog server lifecycle events shipped

**Date:** 2026-09-08  
**From:** Fixtura Backend (CMS)  
**To:** Fixtura member app (`application`)  
**Ticket:** TKT-POSTHOG-001  
**Commit:** `e99743b` (Backend `master`)  
**Related (app):**

- Original request: `application/.comms/API/handoff/posthog-server-events.md`
- Event catalog: `application/.comms/handoff/analytics-app-events.md`
- Platform decisions: `application/.comms/handoff/posthog-round2-decisions.md`
- Internal user ids (still TBD): `application/.comms/handoff/posthog-hygiene-handoff.md`

---

## TL;DR

CMS now emits **three server lifecycle events** into PostHog project **`214725`** with **`surface: "api"`**. No app code changes required to _receive_ events — they appear on the same person id the app already uses (`String(strapiUserId)`) and the same **`organization`** group as `group('organization', accountId)`.

**Not live in PostHog until:** `POSTHOG_API_KEY` (+ optional `POSTHOG_HOST`) are set on **staging/prod CMS** Heroku. Local CMS defaults to no-op.

**Still pending jointly:** staging Live Events QA (checklist below). Internal `$internal_or_test_user` identify is wired but **id list is empty** until hygiene handoff is filled.

---

## What CMS shipped

| Event                  | When CMS fires                                                                                 | `distinctId`         | `$groups.organization`               |
| ---------------------- | ---------------------------------------------------------------------------------------------- | -------------------- | ------------------------------------ |
| `account_created`      | New account row created (account creator only; **not** idempotent `POST /account/first` reuse) | Owner Strapi user id | `accountId`                          |
| `email_verified`       | User `confirmed` goes false → true (Strapi email confirmation)                                 | Strapi user id       | **None** (account may not exist yet) |
| `first_pack_delivered` | First render per account with `Complete && !Processing && downloads > 0`                       | Owner Strapi user id | `accountId`                          |

### Event properties (all captures)

```json
{
  "surface": "api",
  "accountId": "123"
}
```

`accountId` is **omitted** on `email_verified` only.

### Identity rules (unchanged from round-2 — confirm app still aligned)

- Person = **Strapi user id** (string), same as app `identify` after login.
- Multi-account users: one person, **per-event** org group — org A and org B funnels are independent.
- App must **not** set `$internal_or_test_user` from browser SDK; CMS sets it server-side when user id is in the internal list (list empty until Trent publishes ids).

### What CMS does **not** emit

- Raw `POST /api/accounts` CRUD creates
- Idempotent `POST /account/first` **200** (reuse)
- Second+ eligible renders (`first_pack_delivered` is once per account, query-based v1)
- Any PII (email, names, tokens, Stripe URLs)

---

## App sync checklist

Use this to align dashboards, Actions, and milestone certification in `analytics-app-events.md`:

- [ ] Treat **`api`** as fourth surface alongside `marketing_site`, `app`, `hub` in filters/breakdowns.
- [ ] Funnel order: register → **`email_verified`** (no group) → **`account_created`** (with group) → app onboarding milestones → **`first_pack_delivered`** / `pack_viewed`.
- [ ] Do **not** duplicate these milestones as client `conversion` events — server owns them.
- [ ] Dashboards: keep filtering `$internal_or_test_user != true` once CMS id list is populated (interim: host filters per hygiene handoff).
- [ ] After CMS staging keys are set, spot-check Live Events together (see QA table).

**No BFF or route changes required** — this is server-side capture only.

---

## Deploy / ops (CMS-owned; app should know)

| Item                                                | Status                            |
| --------------------------------------------------- | --------------------------------- |
| Code on Backend `master`                            | Done (`e99743b`)                  |
| `POSTHOG_API_KEY` on staging CMS                    | **Ops — not done in this commit** |
| `POSTHOG_HOST` (default `https://us.i.posthog.com`) | Optional                          |
| Staging Live Events QA                              | **Pending**                       |

---

## Joint QA (staging, project 214725)

Run after CMS staging has keys:

| Step                                      | Expected in Live                          |
| ----------------------------------------- | ----------------------------------------- |
| Confirm email (new user)                  | `email_verified`, no `$groups`            |
| `POST /account/first` → **201**           | `account_created`, `$groups.organization` |
| Same user `POST /account/first` → **200** | No second `account_created`               |
| First completed render with downloads     | One `first_pack_delivered`                |
| Second completed render with downloads    | No duplicate                              |
| Inspect properties                        | `surface: api`, no PII                    |

CMS checklist file: `Backend/.comms/posthog/.research/2026-09-08-staging-live-events-acceptance.md`

---

## Open items for app / platform

1. **Internal Strapi user id list** — still TBD in `posthog-hygiene-handoff.md`; CMS will populate `internalUserIds` when you publish it.
2. **Milestone Actions in PostHog UI** — certify server events in data management (~15 milestones list in `analytics-app-events.md`) once Live QA passes.
3. **Duplicate `first_pack_delivered`** — rare race accepted v1; tell CMS if Live shows real dupes.

---

## Questions

Reply on this handoff or tag Backend — especially if app funnel definitions assumed different `first_pack_delivered` timing than _render complete with downloads_ (not `EmailSent`, not `pack_viewed`).
