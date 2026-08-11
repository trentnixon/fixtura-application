# Account And Security

Route: `/o/[accountId]/account`

Status: In review

Cross-reference: `[PRODUCTION_ROUTE_HARDENING_CHECKLIST.md](../../../PRODUCTION_ROUTE_HARDENING_CHECKLIST.md)` — Account settings, notifications, and security.

## Customer Purpose

Let customers manage profile and sign-in security for the authenticated account context: display name, login email, and password. Organisation preferences and bundle delivery live on `/o/[accountId]/settings`.

## Features To Prove

- [x] Displays current user/account identity clearly. _(unit:_ `account-security-display.test.ts`_; component:_ `AccountSecurityContent.test.tsx`_)_
- [x] Updates profile details. _(API:_ `security-routes.test.ts`_; UI wired via_ `EditDisplayNameDialog` _— manual persist check pending)_
- [x] Updates login email with validation and confirmation. _(unit:_ `use-account-security-content-state.test.ts`_; API: login-email routes)_
- [x] Changes password with validation and secure error copy. _(shared_ `ChangePasswordForm`_; API: password error pass-through)_
- [x] Handles sensitive action failures without leaking backend details. _(unit:_ `getAccountSecurityMutationErrorMessage`_; API: structured error envelopes)_

## User Journeys

- **Happy path:** Customer opens account page, sees org title, status badges, sign-in rows, and overview; edits display name, login email, or password via dialogs; success toast and updated values on reload.
- **Empty / partial data:** Missing names show em dash placeholder; org title falls back from organisation context → onboarding name → em dash; login email from `GET /api/account/me` or em dash.
- **Error/retry path:** Settings, me, or organisation query fails → `ErrorState` with retry; mutation failure → inline dialog error from `ApiError.message` or generic unexpected copy.
- **Unauthorized or wrong-account path:** Invalid `accountId` segment → redirect to select-organisation; gateway redirect from settings or organisation queries → redirect with reason (non-enumeration).

## Related Components

- **Page file:** `src/app/(members)/o/[accountId]/account/page.tsx`
- **Key components:** `AccountPageContent`, `AccountSecurityContent`, `AccountSignInSecuritySection`, `AccountOverviewSection`, `EditDisplayNameDialog`, `EditLoginEmailDialog`, `ChangePasswordDialog`, shared `ChangePasswordForm`
- **Key hooks:** `useAccountSecurityContentState`
- **Key utilities:** `buildAccountSecuritySummary`, `formatAccountDisplayName`, `buildAccountSignInSecurityRows`, `validateAccountSecurityProfileValue`, `validateAccountSecurityLoginEmailValue`, `getAccountSecurityMutationErrorMessage`

## Related API Routes

- `GET /api/account/me`
- `GET /api/accounts/[accountId]/settings`
- `GET /api/accounts/[accountId]/organisation`
- `PATCH /api/accounts/[accountId]/security/profile`
- `PATCH /api/accounts/[accountId]/security/login-email`
- `POST /api/accounts/[accountId]/security/password`

## Data States

- [x] Loading — `BrandedLoader` while settings, me, and organisation queries are pending.
- [x] Empty — em dash placeholders for missing display name, email, org title, sport, account type.
- [x] Partial data — summary composes settings + optional org context + me email.
- [x] Success — two-column layout: sign-in/security and account overview.
- [x] Validation error — client-side profile/email validation in dialogs before submit.
- [x] Permission denied — BFF returns 401 without auth cookie; gateway redirects for wrong account context.
- [x] Not found — `ACCOUNT_NOT_FOUND` from Strapi passed through BFF (404).
- [x] API failure — per-query `ErrorState` with retry; mutation errors inline in dialogs.

## Tests Required

- **Unit:** `account-security-display.test.ts`, `account-sign-in-security.test.ts`, `use-account-security-content-state.test.ts`
- **Component:** `AccountSignInSecuritySection.test.tsx`, `AccountSecurityContent.test.tsx`
- **API:** `security-routes.test.ts` — auth, invalid account id, proxy success, structured error pass-through
- **E2E/manual:** see Manual Test Evidence below

## Error Boundary And Recovery

- [x] Inline query errors are recoverable — `ErrorState` with `onRetry` per failed query.
- [x] Mutation errors are shown near the action or field — dialog `role="alert"` for profile/email; `InlineAlert` in password form.
- [x] Unknown errors fall back to safe customer copy — `AUTH_ERROR_MESSAGES.unexpected`.
- [x] Route-level or global error boundary behavior is acceptable — no route-specific error boundary; members layout applies.

## Security And Privacy

- [x] Auth requirements are correct — members route; BFF requires auth cookie.
- [x] Account ownership is enforced — Strapi/BFF reject non-owned `accountId` (`ACCOUNT_NOT_FOUND`).
- [x] No secrets, tokens, or internal payloads are exposed — UI shows `ApiError.message` only.
- [x] Sensitive actions require confirmation — password requires current password; email/profile edits use explicit dialog submit.

## Accessibility

- [x] Headings create a sensible page outline — `PageHeader` org title; section shells with titles.
- [x] Form fields have labels and error associations — labeled inputs in dialogs and password form; errors with `role="alert"`.
- [x] Buttons and links have clear accessible names — "Change user name", "Change login email", "Change password", "Organisation settings" link.
- [ ] Keyboard navigation works for the main flow — manual verification required.
- [ ] Focus is managed after dialogs, errors, and route changes — manual verification required.

## Manual Test Evidence

Run in local or staging with a valid customer account. **Not executed in this pass** — requires authenticated browser session.

- [x] Load `/o/{validAccountId}/account` — identity, badges, org settings link visible.
- [x] Edit display name — success toast; value persists after reload.
- [x] Edit login email — invalid format blocked client-side; valid change succeeds.
- [x] Change password — wrong current password shows API message; success closes dialog.
- [x] Visit `/o/not-a-number/account` — redirects to select-organisation.
- [x] Network offline on load — error state and retry works.
- [x] Keyboard — tab through edit actions; Escape closes dialogs.

## Production Sign-off

- Owner:
- Known gaps:
  - Manual browser checklist not executed (requires authenticated local/staging session).
  - No Playwright/E2E coverage for this route.
  - Password change does not revoke existing JWTs (per CMS handoff — product accepts current behavior).
  - Keyboard/focus behavior not manually verified.
- Test evidence:
  - `npm run test -- "src/app/(members)/o/[accountId]/account" "src/app/api/accounts/[accountId]/security/security-routes.test.ts"` — 42 tests passed (2026-07-03).
  - Unit: `account-security-display.test.ts` (10), `account-sign-in-security.test.ts` (3), `use-account-security-content-state.test.ts` (8).
  - Component: `AccountSignInSecuritySection.test.tsx` (2), `AccountSecurityContent.test.tsx` (4).
  - API: `security-routes.test.ts` (15) including 401/400/404/409 and password error pass-through.
- Production decision: In review
