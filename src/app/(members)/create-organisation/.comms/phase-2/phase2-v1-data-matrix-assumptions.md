# Phase 2 v1 — data matrix assumptions (CMS)

**Date:** 2026-04-07  
**Purpose:** Record implementation assumptions for [Phase 2 lookups + W1](./cms-request-phase2-lookups-and-w1.md) until product publishes a formal shared matrix.

## Locked for v1

| Item                     | Assumption                                                                                                                                                                                                                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **L1 Sport**             | Options match the `account.Sport` enumeration (fixed set). No “Other” / free-text sport in v1.                                                                                                                                                                                           |
| **L2 Organisation type** | Simple **GET list** (no search query param). Source: published `account-type` rows, sorted by `id` ascending. Backend treats **`account_type.id === 1`** as **club** (see [`cms-phase2-backend-signoff.md`](./cms-phase2-backend-signoff.md)); app uses the same id for the club picker. |
| **L3**                   | **None** in v1; no additional Step 1 picklist endpoints until the matrix adds them.                                                                                                                                                                                                      |
| **W1 Organisation name** | Persisted as optional string `onboardingOrganisationName` on `api::account.account` for display before club/association links exist.                                                                                                                                                     |
| **W1 Permission**        | Persisted booleans `isRightsHolder` and `isPermissionGiven` (existing account fields).                                                                                                                                                                                                   |
| **W1 ↔ A1**              | User calls `POST /api/account/first` first, then `PATCH …/onboarding/step-1` for that `accountId` (update-only).                                                                                                                                                                         |

## Still open (product / later revision)

- L2 search (`?q=`) if the account-type catalog grows.
- L1 “Other” + free text or CMS-managed sport list.
- Additional L3 endpoints when the data matrix is delivered.
- Dedicated async job enqueue on permission (v1: document-only; may add when S1/setup pipeline is wired).
