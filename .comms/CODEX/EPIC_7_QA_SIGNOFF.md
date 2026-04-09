# Epic 7 — QA sign-off

**Purpose:** Single place to record Pass / Fail / Blocked for Epic 7: QA and verification per [`ONBOARDING_IMPLEMENTATION_BACKLOG.md`](./ONBOARDING_IMPLEMENTATION_BACKLOG.md).

**Definition of Done (backlog summary):** Lifecycle before navigation; dashboard only when `isSetup === true`; preparation UI; retry; delete path; deep-link bypass closed; centralized resolver; tests + QA evidence.

---

## Metadata

| Field                | Value                |
| -------------------- | -------------------- |
| Last updated         | YYYY-MM-DD           |
| Environments covered | Dev / Staging / Prod |
| Sign-off owner       |                      |

---

## Ticket 7.1 — Frontend route-flow QA

**Checklist:** [`EPIC_7_TICKET_7_1_FRONTEND_ROUTE_QA.md`](./EPIC_7_TICKET_7_1_FRONTEND_ROUTE_QA.md)

| Criterion                                                      | Pass / Fail / N/A | Notes |
| -------------------------------------------------------------- | ----------------- | ----- |
| Account selection routing matches lifecycle                    |                   |       |
| Deep link to `/o/:id/...` cannot bypass gating when unfinished |                   |       |
| Wizard resume behaves correctly                                |                   |       |
| Preparation → dashboard transition                             |                   |       |

**7.1 overall:** Pass / Fail / Blocked — **\*\***\_\_\_**\*\***

---

## Ticket 7.2 — CMS lifecycle-state QA

**Checklist:** [`EPIC_7_TICKET_7_2_CMS_LIFECYCLE_QA.md`](./EPIC_7_TICKET_7_2_CMS_LIFECYCLE_QA.md)

| Criterion                                                                              | Pass / Fail / N/A | Notes |
| -------------------------------------------------------------------------------------- | ----------------- | ----- |
| Transitions after confirm / running / success / failure / retry align worker + payload |                   |       |

**7.2 overall:** Pass / Fail / Blocked — **\*\***\_\_\_**\*\***

---

## Ticket 7.3 — Recovery-path QA

**Checklist:** [`EPIC_7_TICKET_7_3_RECOVERY_QA.md`](./EPIC_7_TICKET_7_3_RECOVERY_QA.md)

| Criterion                                           | Pass / Fail / N/A | Notes |
| --------------------------------------------------- | ----------------- | ----- |
| Retry, delete, blocked paths show clear next action |                   |       |

**7.3 overall:** Pass / Fail / Blocked — **\*\***\_\_\_**\*\***

---

## Definition of Done cross-check

| #   | Item                                                      | Pass / Fail / N/A |
| --- | --------------------------------------------------------- | ----------------- |
| 1   | Account selection resolves lifecycle before navigation    |                   |
| 2   | Dashboard access blocked unless `isSetup === true`        |                   |
| 3   | Completed-but-unready accounts see preparation UI         |                   |
| 4   | Failed setup shows retry                                  |                   |
| 5   | Unfinished account delete exists (or explicitly deferred) |                   |
| 6   | Deep-link bypass closed                                   |                   |
| 7   | Lifecycle route logic centralized                         |                   |
| 8   | Key branches covered by tests and QA                      |                   |

---

## Epic 7 final status

**Epic 7 complete:** Yes / No — Date: **\*\***\_\_\_**\*\***

**Open follow-ups:**

-
