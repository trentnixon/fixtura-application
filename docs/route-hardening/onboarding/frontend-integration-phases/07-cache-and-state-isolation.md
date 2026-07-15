# Phase 07: Cache and State Isolation

## Goal

Prevent account switching from exposing, rendering, invalidating, or mutating data belonging to another account.

## Required invariant

Every account-scoped key includes the explicit account id:

```text
[domain, accountId, ...resourceParts]
```

The shared account list remains user-scoped and is invalidated only when membership-visible account data changes.

## Required domains

- onboarding state and setup status;
- billing, orders, checkout, subscriptions, and invoices;
- branding, themes, templates, and settings;
- fixtures, grades, tracking, and scheduler;
- renders, assets, media, sponsors, and analytics;
- mutations, optimistic updates, draft forms, and persisted stores.

## Tasks

- Inventory query, mutation, invalidation, subscription, and prefetch keys.
- Add `accountId` to every account-scoped key and helper signature.
- Update all callers atomically so old and new key shapes cannot coexist unnoticed.
- Scope optimistic updates and rollback snapshots by account.
- Cancel or ignore stale requests when route id changes.
- Prevent previous-account placeholder or initial data from rendering under the new route.
- Reset account-specific forms and drafts where appropriate.
- Namespace persisted local/session storage by account or remove unsafe persistence.
- Invalidate the affected account plus the shared account list only where contractually necessary.
- Verify deletion clears the deleted id without evicting other accounts.

## High-risk scenarios

- Rapid A-to-B-to-A switching with slow A requests.
- Billing or checkout opened after switching accounts.
- Scheduler polling continuing for the previous id.
- Upload/branding optimistic mutation while navigation occurs.
- Wizard drafts for two unfinished accounts.
- A global store retaining the last account's entity data.

## Tests

- Two account ids produce distinct keys for each required domain.
- Slow previous-account responses cannot overwrite the current view.
- Optimistic update and rollback affect only their account.
- Switching accounts resets or restores the correct scoped form state.
- Invalidation targets the correct id.
- Deletion clears only the deleted account.
- Billing, scheduler, onboarding, and at least one asset/branding domain have explicit two-account isolation tests.

## Acceptance criteria

- No audited account-scoped cache key omits account id.
- Account switching cannot display prior-account data.
- Mutations and optimistic state cannot cross account boundaries.
- Cache helper APIs make omission of account id difficult or impossible.

## Handoff to Phase 08

Provide a cache-key ledger showing each domain, old shape, final shape, invalidation behavior, and isolation test coverage.

---

## Phase 07 completion handoff — 2026-07-13

### Outcome

**Phase complete** (updated after OI-03 / OI-04)

UI picker selection keys are namespaced by `accountId`; billing create remounts with `key={accountId}`; OrgAccessBoundary cancels in-flight queries for other accounts on switch; confirmed deletion removes all exact-id account / season-hub / UI-picker cache plus manage-sponsors session state; deferred-promise race tests prove slow A responses cannot publish after switch to B.

### Acceptance criteria

| Criterion                                                      | Status                                                                                                                       |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| No audited account-scoped cache key omits account id           | Pass — UI pickers now factories; server keys already scoped; catalogs remain global by design                                |
| Account switching cannot display prior-account data            | Pass — picker namespace + billing remount + cancel other-account in-flight + deferred A→B race tests                         |
| Mutations and optimistic state cannot cross account boundaries | Pass — picker `setQueryData` uses account-scoped keys; audited server mutations have no `onMutate` optimistic rollback (N/A) |
| Cache helper APIs make omission of account id difficult        | Pass — TypeScript requires `accountId` on picker selection/list hooks; delete uses exact-id slot helper                      |

### Findings and implementation

- Files changed (high level):
  - `src/lib/api/query/query-keys.ts` — `ui.*PickerSelectedId` factories + `PICKER_SANDBOX_ACCOUNT_SCOPE`
  - `src/lib/api/query/cancel-other-account-queries.ts` (+ test)
  - `src/lib/api/query/is-exact-account-scoped-query-key.ts` (+ test) — exact-id delete cleanup
  - `src/lib/api/query/account-switch-race.isolation.test.ts` — deferred slow A→B + scheduler cancel
  - `src/lib/api/query/query-keys.isolation.test.ts`
  - `useDeleteUnfinishedAccount` — full exact-id cache + persisted cleanup
  - All `src/components/pickers/**` selection/list hooks + UI components + member/sandbox call sites
  - `org-access-boundary.tsx` — cancel on `accountId` change
  - Billing create page `key={accountId}`; prefill two-id test
  - Docs: this file; `01-audit-ledger.md`; phase index README; `OUTSTANDING-ITEMS.md`

### Phase 08 cache-key ledger

| Domain                                                 | Final key shape                                                    | Invalidation / cancel / delete                                            | Isolation test                            |
| ------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------------- | ----------------------------------------- |
| `account.me` / `auth.me`                               | User-scoped `["account","me"]` / `["auth","me"]`                   | Invalidate on membership-visible changes / delete                         | N/A (user-scoped)                         |
| Onboarding / setup / org context / settings / branding | `["account", …, accountId]`                                        | Delete removes via exact-id predicate; switch cancels other ids in-flight | Yes (keys + delete dual-id)               |
| Billing family                                         | `billing` / `billingOrders` / tiers / invoice-requests + accountId | Switch cancel; delete exact-id remove                                     | Yes (keys + prefill + delete seed)        |
| Scheduler / renders / analytics / media / sponsors     | accountId in key                                                   | Switch cancel + race cancel; delete exact-id remove                       | Yes (keys + race + delete)                |
| Season hub                                             | `["season-hub", …, accountId, …]`                                  | Switch cancel; delete exact-id remove                                     | Yes (keys + delete)                       |
| UI pickers                                             | `["ui","pickers",…,"selectedId", accountId]`                       | Delete clears deleted id only                                             | Yes (asset picker + delete seed)          |
| Shared catalogs                                        | Global `assets.listForSelection`, `template*.ui`                   | Shared published catalogs preserved on delete                             | Yes (delete seed)                         |
| Persisted sponsors draft                               | `manage-sponsors:{accountId}:local-sponsors`                       | Cleared on confirmed delete                                               | Yes (`clearDeletedAccountPersistedState`) |

### Verification

```powershell
npx vitest run src/lib/api/query/query-keys.isolation.test.ts src/lib/api/query/cancel-other-account-queries.test.ts src/lib/api/query/is-exact-account-scoped-query-key.test.ts src/lib/api/query/account-switch-race.isolation.test.ts src/components/pickers/assets-list-for-selection/_hooks/use-asset-picker-selection.isolation.test.tsx "src/app/(members)/o/[accountId]/billing/_utils/invoice-request/billingInvoiceRequestPrefill.test.ts" src/lib/api/hooks/account/useDeleteUnfinishedAccount.test.tsx src/components/auth/org-access-boundary.test.tsx src/lib/config/gateway-reasons.test.ts
```

- Focused vitest (post OI-03/04): **9 files, 37 tests passed** (includes exact-id cleanup + race suite).

### Working-tree notes

Unrelated dirty files outside Phase 07 (dashboard branding visuals, `button.tsx`, older onboarding docs, Phases 02–06 work) were preserved where not required for this phase.

### Next phase

**Phase 08: Automated verification** — expand multi-account matrix; fixture cleanup (`accounts[0]` in wizard fixtures); reconcile isolation coverage across domains.
