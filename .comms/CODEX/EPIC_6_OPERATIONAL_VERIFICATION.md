# Epic 6 — Operational verification checklist (CMS)

Run in **development**, then **staging**, then **production** after deploy.

## Preconditions

- Strapi Admin → **Authenticated** → **Account**: enable **`deleteUnfinishedAccount`** (and existing onboarding scopes as per [`cms-work-onboarding-lifecycle-v1.md`](./cms-work-onboarding-lifecycle-v1.md)).

## Scenarios

1. **Confirm onboarding** — wizard completes; setup enters queued/running as documented.
2. **Setup succeeds** — `isSetup === true`; dashboard-ready rule unchanged.
3. **Setup fails** — failure fields stable; **`POST .../retry-setup`** allowed; **`DELETE .../accounts/:accountId`** returns **403** `ACCOUNT_DELETE_NOT_ALLOWED` (wizard already complete).
4. **Retry succeeds** — setup re-queues; lifecycle fields reset as implemented.
5. **Delete — eligible** — account with **incomplete wizard** (`hasCompletedOnboardingWizard === false`, `isSetup === false`): **`DELETE`** returns **200**; user can **`POST /account/first`** again (or equivalent) and get a new account.
6. **Delete — ineligible** — wizard complete or `isSetup === true`: **403** + `ACCOUNT_DELETE_NOT_ALLOWED`.
7. **Delete — not owned** — **404** + `ACCOUNT_NOT_FOUND` (different user’s id).
8. **Invalid `:accountId`** — **403** + `ACCOUNT_DELETE_NOT_ALLOWED` (per contract).

## Outcomes

- `isSetup === true` remains the only “ready for main app” state.
- Retry and delete semantics match [`EPIC_6_RECOVERY_POLICY.md`](./EPIC_6_RECOVERY_POLICY.md).
