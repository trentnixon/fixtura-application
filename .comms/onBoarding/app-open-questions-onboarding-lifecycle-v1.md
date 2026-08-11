# Open questions — Onboarding lifecycle v1 (for CMS / product)

**Audience:** CMS (Strapi), backend workers, product  
**From:** Fixtura App (members / BFF) — planning review  
**Related contract:** [app-handoff-onboarding-lifecycle-v1-integration.md](./app-handoff-onboarding-lifecycle-v1-integration.md)  
**Date:** 2026-04-08

This document collects **follow-up questions** raised while aligning the members app with the lifecycle v1 handoff. Answers will unblock routing, polling, terminal-state handling, and deploy checklists.

---

## 1. API availability and environments

1. **Is `GET /api/accounts/:accountId/onboarding/onboarding-state` deployed** in each environment we integrate against (dev / staging / prod), or is there a target date?
2. **Is `POST /api/accounts/:accountId/onboarding/retry-setup` deployed** alongside it, with the documented error shapes (`404 ACCOUNT_NOT_FOUND`, `409 RETRY_NOT_ALLOWED`)?
3. Confirm **`GET .../onboarding/setup-status`** in v1 returns the **extended fields** described in the handoff §7.2 (`initialSetupStatus`, `initialDataFetchStatus`, `isSetup`, `isUpdating`) in addition to `phase` / `status` — or note if any field is delayed to a later CMS release.

---

## 2. Setup-status terminal vocabulary (compatibility)

Earlier app work (Phase 6 S1/S2) documented terminal **`status` values** including `ready`, **`blocked`**, and **`abandoned`**, with polling until those terminals.

The lifecycle v1 handoff describes **`status: "failed"`** (and `errorCode` such as `SETUP_FAILED`) as the failure terminal for polling stop conditions.

**Questions:**

4. Will Strapi **standardise on `failed`** for the poll `status` field going forward, or will **`blocked` / `abandoned`** still appear for some cases?
5. Should the app treat **all of** `{ ready, failed, blocked, abandoned }` as **stop polling** (union), or only **`ready` + `failed`** per v1?
6. If both `initialSetupStatus` and `initialDataFetchStatus` can be `failed`, which drives **`setup-status.status`** and **`errorCode`** — is there a single canonical rule documented in CMS?

---

## 3. Permissions (Authenticated role)

The handoff lists new Account actions:

7. Confirm **`getOnboardingState`** and **`retryOnboardingSetup`** are enabled for the **Authenticated** role in each environment where we test, and whether any **deploy ordering** is required (e.g. enable permissions before shipping app code that calls the routes).

---

## 4. Behavioural semantics (workers + edge cases)

8. **Ordering:** Can `initialDataFetchStatus` reach **`completed`** before `initialSetupStatus`, or should the UI always treat **`initialSetupStatus`** as the headline until product says otherwise?
9. **Transient errors:** If workers retry internally, will the app ever see **`running` → `failed` → `queued`** without user action, or is **`POST retry-setup`** the only path out of `failed`?
10. **`isSetup` vs enums:** Confirm the **`isSetup`** boolean remains the **headline** “account ready” until product changes it, as stated in the handoff — and whether there are **known windows** where `isSetup` disagrees with the enum fields during migration/backfill.

---

## 5. Product / UX (cross-team)

These affect **where** the app shows “setup in progress” vs main app; **not** blocking API typing but blocking a single UX contract.

11. **After successful `POST .../confirm`**, should users be kept on a **gateway-only** flow until setup completes, or may they enter **`/o/[accountId]/…`** (e.g. dashboard) with a **blocking** preparation state?
12. **Dashboard / route gating:** Should **middleware or layout** hard-block access to **`/o/[accountId]/dashboard`** (and siblings) until `isSetup === true`, or is **soft gating** (banner + limited actions) acceptable for v1?
13. **Resume:** For users who **refresh or return later**, should **`GET onboarding-state`** alone drive **both** wizard step (`onboardingCurrentStep` 1–4) **and** “wizard complete + setup running” without re-entering wizard steps — matching the handoff §8.1?

---

## 6. Mapping: Get Started vs canonical step index

The handoff maps **`onboardingCurrentStep` 0** = not started, **1–4** = wizard steps.

The members app has a **Get Started** screen (sport selection + optional `POST /api/account/first`) **before** Step 1 Organisation.

14. After first account exists, does the backend expect **`onboardingCurrentStep === 1`** when the user is on our **organisation** step, with **Get Started** being a client-only prelude — or should **`not_started`** / step **`0`** include “sport chosen but not yet on W1”? (Clarifies hydration and deep links.)

---

## 7. References on your side

15. If **`answers.md`** in the handoff folder is the **product** source of truth for headline copy and which fields are primary vs secondary, please confirm **path** and whether it is **frozen for v1** so the app can mirror messaging without drift.

---

## 8. Polling intervals and backoff

The handoff §9 recommends **10–15 s** initially and **30–60 s** backoff after a few minutes; the members app currently polls **`setup-status`** on a **fixed shorter** interval (see Phase 6 S1/S2 notes).

16. Is the **10–15 s / backoff** guidance **normative for v1**, or should we keep a **faster** poll until CMS confirms load/cost?
17. Should **`GET onboarding-state`** be polled at the **same cadence** as **`setup-status`**, or is **`onboarding-state`** intended to be **on entry + invalidations** only (with **`setup-status`** as the sole high-frequency poll)?

---

## 9. Error envelopes and retry UX

18. For **`POST .../retry-setup`**, confirm **`409 RETRY_NOT_ALLOWED`** uses the same **`{ error: { code, message } }`** shape as other account routes (and whether **`code`** is exactly `RETRY_NOT_ALLOWED`).
19. For **`POST .../onboarding/restart`**, the handoff documents **`403`** with **`ONBOARDING_RESTART_BLOCKED`** — confirm this remains stable so the app can log/support without treating it as an unexpected 5xx.

---

## 10. Cache / invalidation (BFF + client)

20. After **`POST .../confirm`** or **`POST .../retry-setup`**, should clients assume **`GET onboarding-state`** and **`GET setup-status`** are **immediately consistent**, or is a **short delay** possible before new `queued` / `running` states appear? (Affects whether we need a **refetch delay** or **optimistic** UI.)

---

## App-side context (for your awareness, not questions)

- The members app **does not yet** implement **`GET .../onboarding/onboarding-state`** or **`POST .../retry-setup`** in the BFF/client layer; **`GET .../setup-status`** exists with parsing that may need extending for the new enum fields.
- **Post-confirm navigation** today may **not** match the handoff’s “setup in progress until `isSetup`”; that will be aligned once UX (§5 above) and APIs are confirmed.
- **Polling interval** in the app may differ from the handoff’s 10–15s recommendation; see §8 above.

---

## Document control

| Action                                        | Owner         |
| --------------------------------------------- | ------------- |
| Answer inline or reply in thread              | CMS / product |
| App updates implementation plan after answers | FE            |

When this file is **fully answered**, the app team can close the gap list and implement the BFF routes, hooks, resume rules, and gating per the integration guide.

---

## CMS / backend answers (from implementation)

Use this section for **answers grounded in this repo**. Items marked **TBD (ops/product)** still need an owner outside the code.

### §1 API availability (Q1–Q3)

| Q                                   | CMS / backend answer                                                                                                                                                                                                                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1. Deploy**                       | **TBD (ops/release).** Routes are registered in [`custom-account.js`](../../routes/custom-account.js) (`getOnboardingState`, `retryOnboardingSetup`). Deploy date per environment is **not** encoded in the repo.                                                                                             |
| **2. retry-setup**                  | Same as Q1. Implemented in [`account.js`](../../controllers/account.js) (`retryOnboardingSetup`) and [`retryOnboardingSetup/index.js`](../../controllers/services/retryOnboardingSetup/index.js). Error shapes below (Q18).                                                                                   |
| **3. setup-status extended fields** | **Yes in v1.** [`getOnboardingSetupStatusPayload/index.js`](../../controllers/services/getOnboardingSetupStatusPayload/index.js) selects and returns `initialSetupStatus`, `initialDataFetchStatus`, `isSetup`, `isUpdating` in addition to `phase`, `status`, `requiresUserAction`, `errorCode`, `progress`. |

### §2 Terminal vocabulary (Q4–Q6)

| Q                                       | CMS / backend answer                                                                                                                                                                                                                                                                   |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **4. blocked / abandoned**              | **Not emitted in v1** for this endpoint. Comment in [`getOnboardingSetupStatusPayload/index.js`](../../controllers/services/getOnboardingSetupStatusPayload/index.js): extend when product defines. Current `status` values returned are **`in_progress`**, **`ready`**, **`failed`**. |
| **5. Stop polling**                     | **v1:** stop on **`status === "ready"`** or **`status === "failed"`** (and `phase === "complete"` when ready). Do **not** rely on `blocked` / `abandoned` from this CMS version unless a future release adds them.                                                                     |
| **6. Which failure drives poll status** | **Canonical rule in code:** `setupFailed = (initialSetupStatus === "failed") \|\| (initialDataFetchStatus === "failed")` → then `status: "failed"`, `errorCode: "SETUP_FAILED"`, `requiresUserAction: true`. Either enum failing surfaces the same poll terminal.                      |

### §3 Permissions (Q7)

| Q     | CMS / backend answer                                                                                                                                                                                                                                          |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **7** | **TBD (ops).** Strapi must grant **Authenticated** → Account → `getOnboardingState`, `retryOnboardingSetup`, `restartOnboarding` per environment. **Recommend** enabling permissions **before** or **with** app release that calls these routes to avoid 403. |

### §4 Behavioural semantics (Q8–Q10)

| Q                                          | CMS / backend answer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **8. Ordering**                            | Product decision: [answers.md](./answers.md) — **`initialSetupStatus`** is the headline for setup; fetch is subordinate. **v1 product rule:** if `initialDataFetchStatus === "failed"`, treat setup as failed for poll (`getOnboardingSetupStatusPayload`). UI may still show fetch as secondary detail.                                                                                                                                                                                                                                  |
| **9. Transient running → failed → queued** | **TBD (workers).** This repo does not guarantee worker-driven transitions. **`POST retry-setup`** is implemented as the **user-initiated** path from `failed` back to `queued`. Internal worker retries without user action are **not** specified here.                                                                                                                                                                                                                                                                                   |
| **10. isSetup vs enums**                   | **Yes — headline readiness** in the handoff remains **`isSetup`** + **`setup-status.status === "ready"`** for “enter main app.” [`src/index.js`](../../../../index.js) `afterUpdate` on account aligns enums when **`isSetup`** becomes `true` (skips if already `failed`). **Migration/backfill:** one-off [`scripts/backfill-onboarding-lifecycle-v1.js`](../../../../../../scripts/backfill-onboarding-lifecycle-v1.js); brief windows of skew are possible until backfill runs per environment — **TBD (ops)** to confirm completion. |

### §5 Product / UX (Q11–Q13)

| Q         | CMS / backend answer                                                                                                                |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **11–13** | **TBD (product).** Not API-encodable; backend exposes state via `onboarding-state` and `setup-status` as documented in the handoff. |

### §6 Get Started vs step index (Q14)

| Q      | CMS / backend answer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **14** | **`POST /api/account/first`** ([`createFirstAccount`](../../controllers/account.js)) creates the account with optional `sport` / `hasCompletedStartSequence`; it **does not** set `onboardingCurrentStep` or `onboardingWizardStatus`. **Default:** treat **Get Started as client-only prelude** until the first onboarding step PATCH; backend maps **organisation** (W1) to **`onboardingCurrentStep === 1`** when persisted. **TBD (product)** if sport-only pre-W1 should be represented as step `0` vs `1` in analytics. |

### §7 answers.md (Q15)

| Q      | CMS / backend answer                                                                                                                                                                                                                               |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **15** | **Path:** [`answers.md`](./answers.md) (`src/api/account/.comms/onboarding/answers.md`). It is the **v1 product decision log** for this feature unless superseded by an explicit newer doc. **Frozen** is a **product** call, not enforced in git. |

### §8 Polling (Q16–Q17)

| Q      | CMS / backend answer                                                                                                                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **16** | Handoff **§9** intervals are **recommendation**, not enforced by the API. **Normative** cadence = **product + load/cost**; CMS does not rate-limit app polling in code.                          |
| **17** | **Aligned with handoff:** **`onboarding-state`** = bootstrap + invalidations / terminal refresh; **`setup-status`** = default **high-frequency** poll after confirm. Not a server-enforced rule. |

### §9 Error envelopes (Q18–Q19)

| Q      | CMS / backend answer                                                                                                                                                                                                                                                                         |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **18** | **Yes.** Same envelope: `{ error: { code, message } }`. Codes: **`ACCOUNT_NOT_FOUND`** (404), **`RETRY_NOT_ALLOWED`** (409). See [`retryOnboardingSetup`](../../controllers/services/retryOnboardingSetup/index.js) and [`account.js`](../../controllers/account.js) `retryOnboardingSetup`. |
| **19** | **Stable in v1:** `403` with `code: "ONBOARDING_RESTART_BLOCKED"` and fixed `message` in [`restartOnboarding`](../../controllers/account.js). **Intentional** change would be a release note if the message or code changes.                                                                 |

### §10 Consistency (Q20)

| Q      | CMS / backend answer                                                                                                                                                                                                                                                                                                                        |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **20** | **No distributed consistency guarantee** in the API contract. After **`POST confirm`** or **`POST retry-setup`**, the client should **refetch** `onboarding-state` and/or `setup-status`. A **short delay** before polling is **optional** (TBD empirically); prefer **refetch after mutation success** over assuming immediate visibility. |

---

## Changelog

| Date       | Change                                              |
| ---------- | --------------------------------------------------- |
| 2026-04-08 | Initial document + CMS answers from implementation. |
