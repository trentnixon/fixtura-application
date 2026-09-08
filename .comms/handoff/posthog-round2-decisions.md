# PostHog round 2 — bugs, locked decisions, action items

**Date:** 2026-09-08  
**Project:** `214725` (US)  
**Audience:** Marketing (www), Members app (this repo), Delivery Hub (contentv2), API/Strapi  
**Source:** PostHog capability review follow-up

---

## 🚨 Fix first (data hygiene bugs)

These inflate event volume and corrupt funnels. **Members app (`application` repo) is not the source** — verified: `autocapture: false`, no `opt_in_capturing()` calls. Fix lives in **marketing** and **contentv2** (and any dev on custom ports).

| #   | Finding                                                                               | Owner                                                             | Action                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **`$autocapture` from `localhost:3004`** — autocapture not fully off on one dev build | Find service on port 3004 (likely marketing or secondary dev app) | Set `autocapture: false` in PostHog init; grep all repos for `posthog.init`                                                                 |
| 2   | **`$opt_in` fires on every SPA route change** (www + contentv2)                       | Marketing + contentv2                                             | Move `posthog.opt_in_capturing()` to **consent grant handler only**; guard with `posthog.has_opted_in_capturing() === false` before calling |
| 3   | **Multiple localhost ports in prod project** (3000, 3002, 3004, 3005, 8080, 8081)     | All surfaces                                                      | Separate staging PostHog project within 30 days; interim: project filter `$host` not matching localhost / staging                           |
| 4   | **`www.fixtura.co.nz` sending events**                                                | Marketing / ops                                                   | Confirm intentional surface → same standards + document; else audit deployment and rotate key if leaked                                     |

### `$opt_in` fix pattern (marketing / contentv2)

```javascript
// WRONG — in router / pageview handler
posthog.opt_in_capturing();

// RIGHT — only when user clicks Accept on banner
if (!posthog.has_opted_in_capturing()) {
  posthog.opt_in_capturing();
}
```

### Staging project migration (recommended within 30 days)

1. Create new PostHog project under Fixtura org.
2. `NEXT_PUBLIC_POSTHOG_KEY` → production only.
3. `NEXT_PUBLIC_POSTHOG_KEY_STAGING` → staging Vercel + local dev (optional).
4. Until then: project-level filter exclude `$host` ∈ `localhost`, `staging.fixtura.com.au`.

---

## Locked decisions (implementation)

### Identity & B2B

| Topic                           | Decision                                                                                                                                 |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **plan / trial_status / sport** | **Organization group only** — never on person (multi-org conflict)                                                                       |
| **Person properties**           | Universal only: `signup_surface`, `$internal_or_test_user`, role if truly global                                                         |
| **Multi-org funnels**           | Attribute by `$groups.organization` **per event** — org A and org B journeys are independent                                             |
| **Org switch**                  | `group('organization', newAccountId, { name, plan, sport, ... })` every time with properties; `resetGroups()` when leaving account scope |

### Hub handoff

| Topic            | Decision                                                                                                                                           |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Query param**  | `?phDistinctId=<strapiUserId>` acceptable — opaque id, not PII; **strip from URL immediately** after read                                          |
| **New tab**      | `identify(strapiUserId)` on Hub init if param present; cross-subdomain cookie usually enough; param **non-optional** for incognito/first Hub visit |
| **Do not use**   | `alias()` for this flow                                                                                                                            |
| **Upgrade path** | postMessage or signed short-lived token when Hub handles sensitive content                                                                         |

### Hygiene

| Topic                        | Decision                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| **`$internal_or_test_user`** | **Server-only** via `posthog-node` identify + hardcoded Strapi id list in Strapi config |
| **`/sandbox/**` exclusion**  | **Keep SDK exclusion** (members app already does)                                       |
| **Staging**                  | Separate project preferred over host filtering alone                                    |

### Event taxonomy (schema drift correction)

PostHog live data: **`conversion` uses `step`, not `name`** for most events today (sign_in, register__, password_reset__).

| Pattern                   | Use for                                                                                                                 |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `conversion` + **`step`** | Atomic steps within a flow (auth, registration)                                                                         |
| **Dedicated event names** | Milestones: `trial_started`, `onboarding_completed`, `first_pack_delivered` — migrate off `conversion` where applicable |
| `conversion` + **`name`** | Marketing CTA events only (e.g. pricing CTA)                                                                            |

**Action:** Align `.comms/handoff/analytics-app-events.md` and marketing catalog with this hybrid; certify ~15 milestones in PostHog data management (~20 min).

### Funnels

| Topic                       | Decision                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------ |
| **Server → client window**  | **14 days** default for B2B signup (account_created → login_success); minimum 7 days |
| **Cross-surface funnels**   | No extra config — same `distinctId` across `marketing_site`, `app`, `hub`, `api`     |
| **Per-step surface filter** | Optional per funnel step                                                             |

### Session replay

| Topic                      | Decision                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Without autocapture**    | Full DOM replay works; heatmaps need toolbar or autocapture                                             |
| **Masking**                | `blockSelector` for billing tables; `maskTextSelector` + `data-ph-block` / `data-ph-mask` on components |
| **Cost at 20% sample**     | ~4–6 recordings/day at current traffic — negligible                                                     |
| **Flags + analytics gate** | Option A: always init SDK, `opt_out_capturing()` until consent, flags always work                       |

### Cost

| Topic             | Decision                                                            |
| ----------------- | ------------------------------------------------------------------- |
| **`$web_vitals`** | Keep (~88 events/30d)                                               |
| **Duplication**   | Only inflation is `$opt_in` bug — fix before trusting funnel counts |

### Compliance (AU B2B — not legal advice)

Logged-in members analytics without separate banner is defensible if disclosed in privacy policy, no PII captured, not tracking children. Document PostHog + US processing + first-party proxy in policy.

---

## Members app (`application` repo) — already aligned

- `autocapture: false` in `posthog-client.ts`
- No `opt_in_capturing()` in capture path
- `/sandbox/**` SDK exclusion
- `resetGroups()` on leave account scope

**Implemented in members app (2026-09-08):**

- Org group properties on `group()` (name, plan, sport)
- Hub URL: append `phDistinctId` — handoff to contentv2: `.comms/handoff/posthog-hub-identify-handoff.md`
- `cross_subdomain_cookie: true` in init options

**Still to implement / other repos:**

- `$internal_or_test_user` via Strapi server identify (wired; **id list empty**) — `.comms/handoff/cms-handoff-posthog-server-events-shipped.md`
- Session replay config when approved
- Staging key split (env/deployment) — see `env.example` + ticket 06
- Marketing/contentv2 `$opt_in` fix — `.comms/handoff/posthog-hygiene-handoff.md`

---

## PostHog Activation & Product dashboard

**Status:** Live and updated 2026-09-08. See **`.comms/handoff/posthog-activation-dashboard-status.md`** for insight URLs, funnel schema, and activation checklist.

Dashboard: [2074642](https://us.posthog.com/dashboard/2074642)

### Before trusting funnel counts

- [ ] List of internal Strapi user IDs for `$internal_or_test_user: true`
- [ ] Fix `$opt_in` bug on www/contentv2
- [ ] Deploy app `cross_subdomain_cookie` + confirm marketing parity
- [ ] Ship Strapi `account_created` (insert as funnel step 2 when live)

---

## Open for PostHog (if round 3 needed)

- Pull full `user_action.action` value list from live data during working session
- Confirm `fixtura.co.nz` deployment owner
- Identify which repo/process uses port 3004
