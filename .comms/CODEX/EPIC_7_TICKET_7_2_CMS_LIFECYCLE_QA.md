# Epic 7 — Ticket 7.2 CMS lifecycle-state QA

**Purpose:** Verify Strapi worker state and published lifecycle payloads stay aligned after each transition. Run in **development**, then **staging**, then **production** after relevant deploys.

**Related:** [`EPIC_6_OPERATIONAL_VERIFICATION.md`](./EPIC_6_OPERATIONAL_VERIFICATION.md) (recovery/delete), [`ONBOARDING_IMPLEMENTATION_BACKLOG.md`](./ONBOARDING_IMPLEMENTATION_BACKLOG.md) Epic 7.

**Acceptance criteria (backlog):** Worker state and lifecycle payload remain aligned.

---

## Preconditions

- Authenticated test user with permission to complete onboarding for a throwaway account (or dedicated QA account).
- BFF routes to Strapi available (`GET /api/accounts/:accountId/onboarding/onboarding-state`, `GET .../onboarding/setup-status`, etc.) as documented in onboarding handoffs.
- Optional: Strapi Admin visibility into account row / worker job state for cross-check.

---

## What to record (each row)

For each step, note **environment**, **timestamp**, and either:

- **Pass** — fields match expectations; or
- **Fail** — describe drift (e.g. `isSetup` true while worker still running) and link ticket.

---

## Transition matrix

### 1. After W4 confirm (wizard complete)

| Check                                          | Expected                                                              |
| ---------------------------------------------- | --------------------------------------------------------------------- |
| `hasCompletedOnboardingWizard` / wizard status | Wizard completed per CMS contract                                     |
| Setup pipeline                                 | Queued or running (`initialSetupStatus` / related fields per handoff) |
| `isSetup`                                      | `false` until worker finishes                                         |

**Payload sources:** `GET .../onboarding/onboarding-state` (and `setup-status` if polling).

---

### 2. Setup running

| Check                                | Expected                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------ |
| `onboarding-state` vs `setup-status` | Phases/status strings coherent (no contradictory terminal + in-progress) |
| `isSetup`                            | `false`                                                                  |

---

### 3. Setup success

| Check       | Expected                                                                           |
| ----------- | ---------------------------------------------------------------------------------- |
| `isSetup`   | `true`                                                                             |
| App routing | User can reach `/o/:accountId/dashboard` (and `resolveAccountEntry` → `dashboard`) |

---

### 4. Setup failure

| Check          | Expected                                                      |
| -------------- | ------------------------------------------------------------- |
| Failure fields | Stable error / phase fields per contract                      |
| Retry          | `POST .../onboarding/retry-setup` allowed when policy says so |

---

### 5. After retry

| Check            | Expected                                                               |
| ---------------- | ---------------------------------------------------------------------- |
| Lifecycle fields | Re-queue / reset behaviour matches CMS docs (no stale “success” flags) |
| Contradictions   | None (e.g. failed + `isSetup` true)                                    |

---

## Sign-off

| Transition    | Dev | Staging | Prod | Notes |
| ------------- | --- | ------- | ---- | ----- |
| W4 confirm    |     |         |      |       |
| Setup running |     |         |      |       |
| Setup success |     |         |      |       |
| Setup failure |     |         |      |       |
| Retry         |     |         |      |       |

**Owner:** CMS / backend. **App team:** Re-run app-only checks if payload shape changes.
