# Epic 7 — Ticket 7.1 Frontend route-flow QA

**Purpose:** Manual verification that real browser navigation matches [`resolveAccountEntry`](../../src/lib/onboarding/resolve-account-entry.ts) / [`accountEntryFromOnboardingState`](../../src/lib/onboarding/resolve-account-entry.ts) and [`OrgAccessBoundary`](../../src/components/auth/org-access-boundary.tsx) behaviour.

**Acceptance criteria (backlog):** No unfinished account can bypass lifecycle gating.

**Related:** [`EPIC_7_QA_SIGNOFF.md`](./EPIC_7_QA_SIGNOFF.md), [`ONBOARDING_IMPLEMENTATION_BACKLOG.md`](./ONBOARDING_IMPLEMENTATION_BACKLOG.md).

---

## Preconditions

- Signed-in test user.
- At least one account per scenario (incomplete wizard, preparation, dashboard-ready), or ability to create/reset accounts in the target environment.

---

## Matrix (record Pass / Fail / N/A per environment)

**Environments:** Dev | Staging | Prod (as applicable)

### 1. Account selection routing

**Steps**

1. Open `/select-organisation`.
2. For each test account row, open the account (primary CTA / row navigation as implemented).

**Expected**

- Destination matches lifecycle: wizard → `/create-organisation?accountId=…`, preparation → `/create-organisation/setup?accountId=…`, ready → `/o/{accountId}/dashboard` (or equivalent per [`accountEntryFromOnboardingState`](../../src/lib/onboarding/resolve-account-entry.ts)).

**Result:** **\*\***\_\_\_**\*\***

---

### 2. Deep link to scoped route while unfinished

**Steps**

1. Use an account with `isSetup === false` (wizard incomplete **or** preparation).
2. While signed in, navigate directly to `/o/{accountId}/dashboard` (or another gated child under `/o/[accountId]/` protected by [`OrgAccessBoundary`](../../src/components/auth/org-access-boundary.tsx)).

**Expected**

- No persistent dashboard shell for that account; redirect to wizard or preparation URL.
- No access to privileged org content until lifecycle allows.

**Result:** **\*\***\_\_\_**\*\***

---

### 3. Wizard resume

**Steps**

1. Open `/create-organisation?accountId={id}` for an incomplete wizard account.
2. Confirm step indicator / content matches server state (resume).

**Expected**

- User remains in onboarding until wizard complete + setup rules satisfied; no dashboard without `isSetup === true`.

**Result:** **\*\***\_\_\_**\*\***

---

### 4. Preparation → dashboard transition

**Steps**

1. Use an account in preparation (wizard complete, setup not finished or in progress).
2. Wait for setup success (or use environment where success is achievable).
3. Confirm redirect to dashboard and that `/o/{accountId}/…` routes load.

**Expected**

- After `isSetup === true`, user reaches dashboard and scoped routes work.

**Result:** **\*\***\_\_\_**\*\***

---

## Issues log

| #   | Scenario | Environment | Symptom | Ticket / fix |
| --- | -------- | ----------- | ------- | ------------ |
|     |          |             |         |              |
