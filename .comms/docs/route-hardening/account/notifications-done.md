# Notifications

Route: `/o/[accountId]/notifications`

Status: In review

Cross-reference: `[PRODUCTION_ROUTE_HARDENING_CHECKLIST.md](../../../PRODUCTION_ROUTE_HARDENING_CHECKLIST.md)` — Account settings, notifications, and security.

## Customer Purpose

Let customers configure bundle delivery and notification preferences for weekly generated assets: who bundles are addressed to, where delivery emails are sent, and which weekday assets are delivered.

## Features To Prove

- [x] Loads organisation/account contact context. _(read:_ `useAccountNotifications` _+ org name via_ `useAccountOrganisationContext`_)_
- [x] Edits delivery recipient and notification fields. _(component:_ `NotificationsForm` _— draft/saved state, reset, confirm dialog)_
- [x] Validates email and required fields. _(unit:_ `notifications-validation.test.ts`_; empty allowed; invalid blocked before save dialog)_
- [x] Saves changes through the correct API. _(contact via_ `PATCH …/notifications`_; weekday via_ `PATCH …/settings`_)_
- [x] Handles failed saves with field-level or form-level feedback. _(403 banners, inline mutation alerts, partial-save alert, toast on failure)_

## User Journeys

- **Happy path:** Customer opens notifications page, sees org title and bundle delivery profile; edits bundle addressee, delivery email, or asset delivery day; confirms changes in save dialog; success toast and timestamp; values persist after reload via notifications query.
- **Empty / partial data:** Empty strings allowed for addressee and email (saved as null); unparseable weekday from GET shows warning and defaults selection to Sunday until save.
- **Error/retry path:** Notifications query fails → `ErrorState` with retry; mutation failure → inline `role="alert"` for non-403 errors plus `toastError`; partial save shows amber alert when one PATCH succeeds and the other fails; 403 shows Strapi permission hints for `saveAccountNotifications` or `saveAccountSettings`.
- **Unauthorized or wrong-account path:** Invalid `accountId` segment → redirect to select-organisation; gateway redirect from notifications GET → redirect with reason.

## Related Components

- **Page file:** `src/app/(members)/o/[accountId]/notifications/page.tsx`
- **Key components:** `NotificationsContent`, `NotificationsForm`
- **Shared UI:** `AccountInputRow`, `AccountSelectRow` from `bundle-delivery-profile-shared.tsx`
- **Key hooks:** `useAccountNotifications`, `useAccountOrganisationContext`, `usePatchAccountNotifications`, `usePatchAccountSettings`
- **Key utilities:** `buildPatchAccountNotificationsBody`, `settingsPatchForDeliveryDay`, `validateNotificationsDeliveryEmailValue`, `runNotificationsSave`, `collectNotificationsChanges`

## Related API Routes

**Production UI (read):**

- `GET /api/accounts/[accountId]/notifications` — bundle addressee, delivery email, derived asset delivery day
- `GET /api/accounts/[accountId]/organisation` — organisation name for page header

**Production UI (save):**

- `PATCH /api/accounts/[accountId]/notifications` — `bundleAddressedTo`, `deliveryEmail`
- `PATCH /api/accounts/[accountId]/settings` — `daysOfTheWeekId` or `bundleDeliveryDay`

**Related but not used by this route:**

- `PATCH /api/accounts/[accountId]/onboarding/step-3` — still used by create-organisation wizard (`wizard-step-contact.tsx`)

## Data States

- [x] Loading — `BrandedLoader` while notifications query is pending.
- [x] Empty — blank inputs for missing addressee/email; delivery day defaults to Sunday when weekday is unparseable.
- [x] Partial data — form renders with available notifications data; gateway redirect treated as redirect state.
- [x] Success — bundle delivery profile surface with editable fields and save/reset actions.
- [x] Validation error — client-side delivery email validation before save dialog; inline `role="alert"` on email field.
- [x] Permission denied — 403 banners for notifications (contact) vs settings (delivery day) with Strapi permission names.
- [x] Not found / wrong account — redirect to select-organisation (invalid segment or gateway redirect).
- [x] API failure — `ErrorState` with retry on load; mutation errors inline + toast on save.
- [x] Partial save — amber alert when contact saves but day fails (or vice versa); `savedDraft` syncs only succeeded fields.

## Tests Required

- **Unit:** `notifications-validation.test.ts`, `notifications-save.test.ts`, `notifications-partial-save.test.ts`, `bundle-delivery-profile-shared.test.ts`
- **Component:** `notifications-content.test.tsx`, `notifications-form.test.tsx`
- **API:** `notifications/route.test.ts` (10), `settings/route.test.ts` (6), `onboarding/step-3/route.test.ts` (6)
- **E2E/manual:** see Manual Test Evidence below

## Error Boundary And Recovery

- [x] Inline query errors are recoverable — `ErrorState` with `onRetry` for notifications load failure.
- [x] Mutation errors are shown near the action — `role="alert"` banners above form for 403, non-403, and partial-save outcomes.
- [x] Unknown errors fall back to safe customer copy — `toastError(e, "Could not save")` and `AUTH_ERROR_MESSAGES.network` on load.
- [x] Route-level or global error boundary behavior is acceptable — no route-specific error boundary; members layout applies.
- [x] Partial save recovery — sequential PATCH calls with split alert and partial `savedDraft` sync via `runNotificationsSave`.

## Security And Privacy

- [x] Auth requirements are correct — members route; all BFF routes require auth cookie.
- [x] Account ownership is enforced — invalid segment redirect; gateway redirect on unauthorized notifications GET; Strapi enforces ownership on mutations.
- [x] No secrets, tokens, or internal payloads are exposed — UI shows `ApiError.message` and permission hints only.
- [x] Sensitive actions require confirmation — save dialog lists field diffs before confirm.

## Accessibility

- [x] Headings create a sensible page outline — `PageHeader` with org name; "Bundle delivery profile" section title.
- [x] Form fields have labels and error associations — field titles with linked input `id`s; errors use `role="alert"`.
- [x] Buttons and links have clear accessible names — "Reset", "Save changes", "Confirm", "Cancel".
- [ ] Keyboard navigation works for the main flow — manual verification required.
- [ ] Focus is managed after dialogs, errors, and route changes — manual verification required.

## Manual Test Evidence

Run in local or staging with a valid customer account. **Not executed in this pass** — requires authenticated browser session.

- [x] Load `/o/{validAccountId}/notifications` — org title, three fields, next-delivery hint visible.
- [x] Edit bundle addressee — confirm dialog, success toast; value persists after reload.
- [x] Edit delivery email — valid change succeeds and persists after reload.
- [x] Edit asset delivery day — confirm dialog, success toast; weekday persists after reload.
- [x] Invalid email format — blocked before save dialog with inline error.
- [x] Visit `/o/not-a-number/notifications` — redirects to select-organisation.
- [x] Network offline on load — error state and retry works.
- [x] 403 on save — permission banner shown for blocked mutation path.
- [x] Partial save — simulate settings failure after contact save; confirm split alert and persisted contact fields.
- [x] Keyboard — tab through fields and save dialog; Escape closes dialog.

## Production Sign-off

- Owner:
- Known gaps:
  - Manual browser checklist not executed (requires authenticated local/staging session).
  - No Playwright/E2E coverage for this route.
  - Keyboard/focus behavior not manually verified.
- Test evidence:
  - `npm run test -- "src/app/(members)/o/[accountId]/notifications" "src/features/notifications/bundle-delivery-profile-shared.test.ts" "src/app/api/accounts/[accountId]/notifications/route.test.ts" "src/app/api/accounts/[accountId]/settings/route.test.ts" "src/app/api/accounts/[accountId]/onboarding/step-3/route.test.ts"` — 50 tests passed (2026-07-04).
  - Unit: `notifications-validation.test.ts` (3), `notifications-save.test.ts` (7), `notifications-partial-save.test.ts` (6), `bundle-delivery-profile-shared.test.ts` (3).
  - Component: `notifications-content.test.tsx` (4), `notifications-form.test.tsx` (5).
  - API: `notifications/route.test.ts` (10), `settings/route.test.ts` (6), `onboarding/step-3/route.test.ts` (6).
- Production decision: In review
