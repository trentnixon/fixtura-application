# Epic 7 — Ticket 7.3 Recovery-path QA

**Purpose:** Verify every failure or blocked path exposes a **clear next action** (retry, delete, message, or support), per [`ONBOARDING_IMPLEMENTATION_BACKLOG.md`](./ONBOARDING_IMPLEMENTATION_BACKLOG.md) Epic 7.

**Acceptance criteria (backlog):** All failure paths produce a clear next action.

**Related:** [`EPIC_6_OPERATIONAL_VERIFICATION.md`](./EPIC_6_OPERATIONAL_VERIFICATION.md), [`EPIC_7_QA_SIGNOFF.md`](./EPIC_7_QA_SIGNOFF.md).

---

## Preconditions

- Same as broader Epic 7 QA (signed-in user, suitable test accounts).
- Delete / retry endpoints enabled in CMS for the environment under test.

---

## Checklist

Record **Pass / Fail** and short notes (e.g. copy text, missing CTA).

| Path                                              | Expected UX                                                                            | Dev | Staging | Prod | Notes |
| ------------------------------------------------- | -------------------------------------------------------------------------------------- | --- | ------- | ---- | ----- |
| Failed setup (wizard complete)                    | Preparation UI; **Retry setup** available; **no** delete on preparation screen         |     |         |      |       |
| Incomplete wizard                                 | **Delete unfinished account** (with confirm); blocked delete shows CMS-aligned message |     |         |      |       |
| Retry blocked (e.g. 409 / policy)                 | Inline error; user knows what to do next                                               |     |         |      |       |
| Delete blocked (403 `ACCOUNT_DELETE_NOT_ALLOWED`) | Message in dialog or inline; not silent failure                                        |     |         |      |       |
| Support-only / blocked setup                      | Banner or copy points to support; **no** blank dead-end                                |     |         |      |       |

---

## Automated coverage (reference)

- Retry / setup card: [`setup-status-card.test.tsx`](<../../src/app/(members)/create-organisation/_components/setup-status-card.test.tsx>)
- Delete / wizard gating: [`create-organisation-wizard.test.tsx`](<../../src/app/(members)/create-organisation/_components/create-organisation-wizard.test.tsx>), [`setup-client.test.tsx`](<../../src/app/(members)/create-organisation/setup/setup-client.test.tsx>)
- Delete BFF: [`route.test.ts`](../../src/app/api/accounts/[accountId]/route.test.ts)

Manual QA still required for end-to-end CMS alignment and copy in real browsers.

---

## Issues log

| #   | Path | Environment | Symptom | Ticket / fix |
| --- | ---- | ----------- | ------- | ------------ |
|     |      |             |         |              |
