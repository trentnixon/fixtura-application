# Onboarding Structure Review: `create-organisation/setup` Redirect

## Purpose

Review the current onboarding route structure around:

- `/create-organisation`
- `/create-organisation/setup?accountId=...`
- `/o/[accountId]/dashboard`

and document:

- why the current setup redirect exists
- what is currently causing it
- why it no longer matches the updated product rule
- what should change next

---

## Updated Product Rule

The updated intended behavior is:

- if `hasCompletedOnboardingWizard === true`, the user may enter the dashboard
- `isSetup === false` is **not** a dashboard blocker
- `isSetup` now represents background data sync progress
- background sync should continue after dashboard entry
- sync progress should become a **notification / status signal**, not a hard routing gate

This means the current setup route should no longer be treated as a mandatory holding page after wizard completion.

---

## Current Structure

## 1. Lifecycle resolver

The shared lifecycle routing logic currently lives in:

- [`src/lib/onboarding/resolve-account-entry.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/onboarding/resolve-account-entry.ts)

Current behavior:

- `isSetup === true` -> `dashboard`
- wizard complete + `isSetup === false` -> `preparation` or `preparationFailed`
- wizard incomplete -> `wizard`

This is the root reason the app sends completed-but-not-setup accounts to:

- `/create-organisation/setup?accountId=...`

### Current issue

This resolver still reflects the older product rule:

- wizard completion is not enough
- setup completion is required before dashboard

That rule is now outdated.

---

## 2. Wizard post-confirm redirect

The post-finish behavior lives in:

- [`src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx>)

### Current behavior

After the user confirms onboarding:

1. the app refetches `onboarding-state`
2. it resolves route intent using the shared lifecycle helper
3. it redirects using `accountEntryPath(...)`

Because the resolver still treats `isSetup` as the dashboard gate, the wizard sends users to:

- `/create-organisation/setup?accountId=...`

when:

- `hasCompletedOnboardingWizard === true`
- `isSetup === false`

### Finding

The wizard is not independently wrong. It is faithfully applying the shared lifecycle rule.

The structural issue is the rule itself.

---

## 3. Scoped app boundary

Scoped app access is currently gated in:

- [`src/components/auth/org-access-boundary.tsx`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/components/auth/org-access-boundary.tsx)

### Current behavior

After validating org access, it loads `onboarding-state` and only allows the scoped app when:

- `resolveAccountEntry(...) === "dashboard"`

Since the resolver currently requires `isSetup === true`, the boundary continues to treat completed-but-syncing accounts as unfinished and redirects them away from `/o/[accountId]/...`.

### Finding

This means the outdated readiness rule is enforced in two places:

- post-confirm routing
- scoped route entry

Even if the wizard redirect were changed alone, the scoped app boundary would still block dashboard access.

---

## 4. Setup/preparation page

The setup route lives in:

- [`src/app/(members)/create-organisation/setup/setup-client.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/setup/setup-client.tsx>)

### Current purpose

This page was designed as a holding screen for:

- wizard complete
- setup still running
- dashboard not yet allowed

It:

- loads `onboarding-state`
- loads `setup-status`
- polls
- redirects to dashboard when the resolver says dashboard is allowed

### Finding

This structure only makes sense if setup completion is a hard blocker.

Under the new product rule, this page should no longer be the default destination after wizard completion.

It may still be useful as:

- a fallback diagnostic screen
- a manual recovery route
- a support/debugging route

but not as the primary post-confirm flow.

---

## Summary Of Findings

## What is causing the redirect today

The redirect to:

- `/create-organisation/setup?accountId=480`

is currently caused by the shared lifecycle resolver in:

- [`resolve-account-entry.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/onboarding/resolve-account-entry.ts)

That resolver still assumes:

- dashboard requires `isSetup === true`

This flows into:

- wizard completion redirect
- select-organisation route resolution
- scoped route gating
- setup page behavior

---

## Why it is now incorrect

It is now incorrect because the product rule has changed:

- `hasCompletedOnboardingWizard === true` should be enough for dashboard access
- `isSetup === false` should be treated as background sync status, not routing failure

That means the current structure is over-blocking users.

---

## Recommended Structural Change

## 1. Redefine dashboard eligibility

The route rule should change from:

- dashboard only when `isSetup === true`

to:

- dashboard when `hasCompletedOnboardingWizard === true`
- dashboard also when `isSetup === true`

Practical rule:

- if wizard complete -> dashboard allowed
- if wizard incomplete -> stay in onboarding

`isSetup` should become informational, not blocking.

---

## 2. Update shared resolver

Primary file to change:

- [`src/lib/onboarding/resolve-account-entry.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/onboarding/resolve-account-entry.ts)

### Suggested new logic

1. if wizard incomplete -> `wizard`
2. if wizard complete -> `dashboard`
3. background sync state remains available separately for UI display

This keeps the route system simple and aligned with the new product rule.

---

## 3. Update wizard post-confirm flow

File:

- [`src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx>)

### Recommended behavior

After confirm:

- refetch `onboarding-state`
- if wizard complete -> go directly to dashboard
- do not route to setup page as the default

This is likely a very small change once the shared resolver is corrected.

---

## 4. Update scoped route gating

File:

- [`src/components/auth/org-access-boundary.tsx`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/components/auth/org-access-boundary.tsx)

### Recommended behavior

Allow scoped routes when:

- account is valid and owned
- wizard is complete

Only redirect back to onboarding when:

- wizard is incomplete

This preserves route protection while removing the unnecessary setup blocker.

---

## 5. Reposition the setup page

File:

- [`src/app/(members)/create-organisation/setup/setup-client.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/setup/setup-client.tsx>)

### Recommendation

Do one of the following:

1. demote it to a support/debug route
2. keep it as an optional manual status page
3. remove it entirely if the top-bar sync notification fully replaces its purpose

### Best current recommendation

Keep it temporarily as a fallback/internal route until the top-bar notification exists and is trusted.

Do not use it as the normal post-confirm destination.

---

## 6. Move sync status into the app shell / top bar

This is the structural replacement for the current setup gate.

### Candidate location

- [`src/components/site-header.tsx`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/components/site-header.tsx)

### Recommended behavior

When inside a scoped account route:

- poll `setup-status` or `onboarding-state`
- if wizard complete and `isSetup === false`, show:
  - syncing / preparing status
  - optional progress or lightweight message
- if sync fails, show a clear banner/alert or top-bar status

### Why this is better

It matches the new product rule:

- user is allowed into the product
- background sync remains visible
- sync progress does not block normal account access

---

## 7. Update tests

Once the routing rule changes, the following tests should be updated:

- [`src/lib/onboarding/resolve-account-entry.test.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/onboarding/resolve-account-entry.test.ts)
- [`src/lib/onboarding/epic1-lifecycle-gate.test.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/onboarding/epic1-lifecycle-gate.test.ts)
- [`src/app/(members)/create-organisation/_components/create-organisation-wizard.test.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/create-organisation-wizard.test.tsx>)
- [`src/components/auth/org-access-boundary.test.tsx`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/components/auth/org-access-boundary.test.tsx)
- [`src/app/(members)/create-organisation/setup/setup-client.test.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/setup/setup-client.test.tsx>)

### New expectations

- completed wizard + `isSetup === false` -> dashboard allowed
- setup page is not the normal destination after confirm
- top-bar sync indicator handles the ongoing background status instead

---

## Recommended Implementation Order

1. Change shared resolver to treat wizard completion as dashboard-eligible
2. Update wizard post-confirm redirect
3. Update `OrgAccessBoundary` to stop blocking completed-wizard accounts
4. Keep setup page as fallback only
5. Add top-bar sync notification in the site header or shared app shell
6. Update route and recovery tests

---

## Final Recommendation

The current setup redirect structure was reasonable under the old rule, but it no longer matches the intended product behavior.

The right direction now is:

```text
wizard complete
-> dashboard allowed
-> background sync continues
-> sync progress shown as notification, not hard redirect
```

That means `/create-organisation/setup?accountId=...` should stop being the default post-confirm route and should become optional or secondary.

---

## Related Files

- [`src/lib/onboarding/resolve-account-entry.ts`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/lib/onboarding/resolve-account-entry.ts)
- [`src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx>)
- [`src/components/auth/org-access-boundary.tsx`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/components/auth/org-access-boundary.tsx)
- [`src/app/(members)/create-organisation/setup/setup-client.tsx`](</D:/htdoc/Fixtura/Fixtura.com.au/application/src/app/(members)/create-organisation/setup/setup-client.tsx>)
- [`src/components/site-header.tsx`](/D:/htdoc/Fixtura/Fixtura.com.au/application/src/components/site-header.tsx)
