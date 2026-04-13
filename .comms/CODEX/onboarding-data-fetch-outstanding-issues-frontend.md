# Onboarding Data Fetch - outstanding issues for Frontend

**Date:** 2026-04-09  
**Audience:** Frontend / app team  
**Status:** Follow-up handoff after CMS early-trigger implementation

---

## 1. Purpose

This document captures the frontend work needed to fully support early onboarding data fetch now that CMS can start background processing before wizard completion.

This is not a frontend bug list. Most core changes were backend/CMS. The frontend work is about consuming the updated lifecycle semantics correctly and presenting them clearly.

---

## 2. What changed in backend behavior

The CMS can now start onboarding data fetch during onboarding step 1, before wizard confirmation.

That means the app can now see accounts where:

- wizard is still in progress
- `isUpdating === true`
- setup/fetch lifecycle has already started

This is the main behavior shift the frontend must account for.

---

## 3. What the frontend should assume

### Current contract

The setup-status payload already includes:

- `isUpdating`
- `initialSetupStatus`
- `initialDataFetchStatus`

However, while the wizard is incomplete, it may still return:

- `phase: "wizard"`

and may not expose:

- `progress.syncing`

in the same way it does after wizard completion.

### Practical implication

Frontend should not assume:

- `phase: "wizard"` means no backend work is happening

Instead, frontend should treat:

- `isUpdating === true`

as the strongest current signal that background onboarding work has started.

---

## 4. Outstanding frontend tasks

## Task 1 - support in-wizard background sync state

### Problem

The user can now be mid-wizard while backend data-fetch is already running.

### Required frontend behavior

If onboarding status payload shows:

- `isUpdating === true`

the UI should be able to communicate something like:

- setup in progress
- syncing organisation data
- background setup running

even if:

- `phase === "wizard"`

### Recommendation

Do not gate syncing UI only on:

- `phase === "preparation"`

Use `isUpdating` and lifecycle statuses directly.

### CMS update (2026-04-09)

`GET .../onboarding/setup-status` now sets `progress: { syncing: true }` when `phase === "wizard"` and `isUpdating === true`, matching the preparation-phase shape. Clients may still treat `isUpdating` as authoritative.

---

## Task 2 - avoid assuming confirm is the start of processing

### Problem

Historically, frontend could assume onboarding processing began after confirm.

That is no longer reliable.

### Required frontend behavior

Review any UI or client logic that assumes:

- fetch starts only after wizard completion
- polling starts only after confirm
- syncing banners only appear after confirm

### Recommendation

Where appropriate, begin showing background sync state as soon as backend lifecycle indicates it.

---

## Task 3 - polling logic should respect lifecycle fields, not only phase labels

### Problem

If frontend relies mainly on coarse phase labels, it may miss the actual background state during wizard.

### Required frontend behavior

Polling and UI branching should consider:

- `isUpdating`
- `initialSetupStatus`
- `initialDataFetchStatus`
- final readiness state

and not rely only on:

- `phase`

### Recommendation

Use field-based logic first, phase labels second.

---

## Task 4 - align UI copy with early-trigger behavior

### Problem

If current copy implies:

- "we start setup after you finish onboarding"

that messaging is now outdated.

### Required frontend behavior

Review onboarding copy, status screens, and banners for wording that assumes backend work starts only at confirm.

### Suggested messaging direction

- setup may begin as soon as organisation details are provided
- you can continue onboarding while we prepare your account

---

## Task 5 - decide which endpoint is authoritative for onboarding progress

### Problem

There is still a semantics gap between:

- setup-status
- fuller onboarding lifecycle/onboarding-state payload

especially during wizard-phase syncing.

### Required frontend decision

Choose one of these approaches:

Option A:

- continue using setup-status and treat `isUpdating` as authoritative during wizard

Option B:

- use onboarding-state/lifecycle payload where richer progress detail is needed

### Recommendation

For now, Option A is likely enough if the UI only needs to know:

- background work has started
- account is still not ready

If the UI needs finer-grained progress or error states, use the fuller lifecycle payload.

---

## 5. Known dependency on CMS decisions

Frontend still depends on CMS confirming these items:

- whether `isPermissionGiven` is part of the trigger gate
- whether wizard-phase syncing will get explicit DTO support
- what final worker-driven success/failure contract looks like

Until those are finalised, frontend should code defensively around the current fields rather than overfitting to assumptions.

---

## 6. Recommended frontend completion order

1. Audit onboarding UI for assumptions that sync starts only after confirm
2. Use `isUpdating` as the main in-wizard syncing signal
3. Update polling/state handling to rely on lifecycle fields, not phase alone
4. Review copy and messaging
5. Decide whether setup-status is sufficient or whether onboarding-state should be used for richer views

---

## 7. Acceptance criteria for frontend closure

- the app can show background syncing while the wizard is still in progress
- the app does not assume confirm is the first processing trigger
- polling/state handling uses lifecycle fields safely
- UI messaging matches early-trigger onboarding behavior
- frontend endpoint choice for progress tracking is explicit and documented

---

## 8. Summary

There is no major standalone frontend bug here. The frontend task is to consume the new backend behavior correctly.

The key rule is simple:

- `isUpdating` can now be true before wizard completion, and the UI should handle that as an expected state
