# Phase 03: Organisation Selection

## Goal

Render and navigate every owned organisation explicitly, including incomplete and nameless accounts, without implying a default account.

## Required behavior

- Render every object in `/api/account/me.data.accounts[]`.
- Use each row's `id` for navigation and actions.
- Show **Continue setup** when `onboardingWizardCompletedAt === null`.
- Resolve a usable display name from `onboardingOrganisationName`, then `accountOrganisationDetails`.
- Show **Unfinished organisation** only when neither source supplies a usable name.
- Keep blank, unfinished, inactive, and resumable accounts visible.
- Do not use `isActive`, `isSetup`, list order, or compatibility `data.accountId` as selected/default state.
- Keep **Create organisation** available when existing accounts are ongoing; CMS will create or reuse the permitted blank account.

## Tasks

- Replace singular-account rendering and first-item truncation.
- Introduce a tested name-resolution helper if this logic is shared or non-trivial.
- Make card/button links carry the exact row id.
- Ensure unfinished cards navigate to explicit resume intent.
- Ensure completed/operational cards navigate to an explicit `/o/:accountId/...` destination.
- Remove default badges, auto-open logic, or visual preference inferred from response order unless separately product-defined.
- Preserve accessible loading, empty, error, and retry states.

## Edge cases

- No accounts.
- Two or more accounts.
- Whitespace-only onboarding name.
- Organisation details present but without a usable name.
- `isActive === false` with finished onboarding.
- `isSetup === true` while other lifecycle fields differ.
- An unfinished account alongside multiple ongoing accounts.

## Tests

- Renders two or more account cards.
- Does not truncate or automatically select the first account.
- Shows **Unfinished organisation** for a nameless account.
- Uses naming precedence correctly.
- Shows **Continue setup** only from `onboardingWizardCompletedAt`.
- Navigates each card with that card's explicit id.
- Does not depend on compatibility `data.accountId` when null or absent.

## Acceptance criteria

- All returned accounts remain visible and actionable.
- Every navigation derives its account id from the selected row.
- Presentation logic does not reproduce the CMS blank or deletion rules.
- Existing selection tests are updated rather than left asserting singular behavior.

## Handoff to Phase 04

Record the exact resume URL produced for unfinished accounts and the create URL/action used by the selection page.

---

## Phase 03 completion handoff — 2026-07-13

### Outcome

**Phase complete**

Organisation selection presents every `data.accounts[]` row with guide-correct naming and Continue setup CTAs; gateway sidebar chrome no longer implies a default org.

### Acceptance criteria

| Criterion                                                     | Status                                                                                       |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| All returned accounts remain visible and actionable           | Pass — multi-account render tests; create card retained                                      |
| Every navigation derives its account id from the selected row | Pass — click 101 → resume `?accountId=101`; click 202 → `/o/202/dashboard`                   |
| Presentation does not reproduce CMS blank or deletion rules   | Pass — Continue setup from `onboardingWizardCompletedAt` only; no delete eligibility changes |
| Existing selection tests updated for multi-account behavior   | Pass — expanded `select-organisation-content.test.tsx`                                       |

### Findings and implementation

- Singular/default assumptions addressed: `Account ${id}` title fallback removed; Continue setup CTA added; gateway bootstrap org hard-ignored.
- Files changed:
  - `src/lib/account/organisation-display-name.ts` (+ test)
  - `src/lib/onboarding/select-org-card-tone.ts` (+ test) — `isSelectOrgContinueSetup`; tone prefers `onboardingWizardCompletedAt`
  - `src/app/(members)/select-organisation/select-organisation-content.tsx` (+ test)
  - `src/components/navigation/app-sidebar/_utils/build-sidebar-user.ts` (+ test)
  - `src/components/navigation/app-sidebar/_hooks/use-app-sidebar-user.ts`
  - Docs: this file; `01-audit-ledger.md` §1; phase index README

### Phase 04 starting inputs

- **Resume URL** (unfinished wizard after select): `` `${ROUTES.createOrganisation}?accountId=${encodeURIComponent(id)}` ``  
  Example: `/create-organisation?accountId=101`
- **Create action** (selection page): `ROUTES.createOrganisation` with **no** account id (`CreateOrganisationGridCard` → `/create-organisation`). Blank obtain via `POST /api/account/first` remains Phase 04.

### Deferred risks

| Risk                                                                                                | Owner phase                  |
| --------------------------------------------------------------------------------------------------- | ---------------------------- |
| Dashboard naming precedence still org-details-then-onboarding (diverges from selection guide order) | note / product; not Phase 03 |
| Create busy / Retry-After UI                                                                        | 04                           |
| Client-inferred delete eligibility                                                                  | 05                           |
| OrgAccessBoundary / nested 404                                                                      | 06                           |
| Picker UI key isolation                                                                             | 07                           |

### Verification

```powershell
npx vitest run src/lib/account/organisation-display-name.test.ts src/lib/onboarding/select-org-card-tone.test.ts "src/app/(members)/select-organisation/select-organisation-content.test.tsx" src/components/navigation/app-sidebar/_utils/build-sidebar-user.test.ts
```

- Focused vitest: **4 files, 32 tests passed**.

### Working-tree notes

Unrelated dirty files (dashboard branding, `button.tsx`, save-branding dialog, older onboarding docs, Phase 02 API/BFF files) were preserved and not edited for Phase 03 presentation work beyond the files listed above.

### Next phase

**Phase 04: Create and explicit resume** — obtain blank via `/api/account/first` (200 reuse / 201 create), busy/retry UX from `ApiError.retryAfterSeconds`, keep explicit resume query `accountId`.
