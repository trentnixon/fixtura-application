# Settings

Route: `/o/[accountId]/settings`

Status: In review

Cross-reference: `[PRODUCTION_ROUTE_HARDENING_CHECKLIST.md](../../../PRODUCTION_ROUTE_HARDENING_CHECKLIST.md)` — Account settings, notifications, and security.

## Customer Purpose

Let customers configure organisation preferences and scheduling behavior: bundle delivery day, competition grouping (associations), junior surname display, and seniors/masters split (clubs).

## Features To Prove

- [x] Loads current settings. _(read:_ `useAccountSettings` _+ scheduler via_ `useAccountScheduler` _for delivery day resolution)_
- [x] Builds minimal patch payloads. _(unit:_ `build-partial-patch.test.ts` _—_ `buildPartialPatch` _sends only changed fields, filtered by club vs association)_
- [x] Shows unsaved changes and save confirmation where needed. _(component:_ `account-settings-preferences.test.tsx` _— reset, save dialog, change hints)_
- [x] Handles scheduler/preference validation. _(unit:_ `save-error-details.test.ts` _—_ `EMPTY_UPDATE`_,_ `SCHEDULER_MISSING` _; UI warning when weekday unparseable from CMS)_
- [x] Refetches or updates cache after save. _(`usePatchAccountSettings` invalidates settings, me, and scheduler queries)_

## User Journeys

- **Happy path:** Customer opens settings page, sees org title and preference surface; edits delivery day, grouping, or toggles; confirms changes in save dialog; success toast; values persist after reload via settings + scheduler queries.
- **Empty / partial data:** Unparseable weekday from GET shows warning and defaults selection to Sunday until save; scheduler GET supplements settings embedding for delivery day.
- **Error/retry path:** Settings query fails → `ErrorState` with retry; mutation failure → inline `role="alert"` for non-403 errors; 403 shows Strapi permission hint for `saveAccountSettings`; structured codes (`EMPTY_UPDATE`, `SCHEDULER_MISSING`) show extra detail.
- **Unauthorized or wrong-account path:** Invalid `accountId` segment → redirect to select-organisation; gateway redirect from settings GET → redirect with reason.

## Related Components

- **Page file:** `src/app/(members)/o/[accountId]/settings/page.tsx`
- **Key components:** `AccountSettingsContent`, `AccountSettingsPreferences`, `SaveSettingsDialog`, `SettingsToggleRow`, `SettingsSelectRow`
- **Key hooks:** `useAccountSettings`, `useAccountScheduler`, `usePatchAccountSettings`, `useAccountSettingsPreferencesState`
- **Key utilities:** `settingsDraftFromPayload`, `buildPartialPatch`, `equalDraft`, `pickDaysOfWeekRelation`, `extraDetailForSaveError`

## Related API Routes

**Production UI (read):**

- `GET /api/accounts/[accountId]/settings` — preferences, account type, embedded scheduler when present
- `GET /api/accounts/[accountId]/scheduler` — authoritative `days_of_the_week` for delivery day when populated

**Production UI (save):**

- `PATCH /api/accounts/[accountId]/settings` — partial body: `includeJuniorSurnames`, `competitionsGroupedBy`, `splitSeniorsAndMasters`, `daysOfTheWeekId`, `bundleDeliveryDay`

**Related but not owned by this route:**

- `/o/[accountId]/notifications` also PATCHes settings for asset delivery day; contact fields use `PATCH …/notifications`

## Data States

- [x] Loading — `BrandedLoader` while settings query is pending.
- [x] Empty — delivery day defaults to Sunday when weekday unparseable; boolean prefs default from payload.
- [x] Partial data — form renders with available settings; scheduler supplements delivery day; gateway redirect treated as redirect state.
- [x] Success — organisation settings surface with editable fields and save/reset actions.
- [x] Validation error — no free-text validation; client blocks save when no diff (`buildPartialPatch` returns null); Strapi returns structured errors on invalid persist.
- [x] Permission denied — 403 banner with `saveAccountSettings` permission name; controls disabled when forbidden.
- [x] Not found / wrong account — redirect to select-organisation (invalid segment or gateway redirect).
- [x] API failure — `ErrorState` with retry on load; mutation errors inline on save.
- [x] Partial save — not applicable (single PATCH endpoint for all preference fields on this route).

## Tests Required

- [x] **Unit:** `build-partial-patch.test.ts`, `settings-draft-from-payload.test.ts`, `save-error-details.test.ts`
- [x] **Component:** `account-settings-content.test.tsx`, `account-settings-preferences.test.tsx`
- [x] **API:** `settings/route.test.ts` (10), `scheduler/route.test.ts` (4)
- [ ] **E2E/manual:** see Manual Test Evidence below (browser sign-off pending)

## Error Boundary And Recovery

- [x] Inline query errors are recoverable — `ErrorState` with `onRetry` for settings load failure.
- [x] Mutation errors are shown near the action — `role="alert"` banners above form for 403 and non-403 outcomes.
- [x] Unknown errors fall back to safe customer copy — `ApiError.message` on save; `AUTH_ERROR_MESSAGES.network` on load.
- [x] Route-level or global error boundary behavior is acceptable — no route-specific error boundary; members layout applies.

## Security And Privacy

- [x] Auth requirements are correct — members route; all BFF routes require auth cookie.
- [x] Account ownership is enforced — invalid segment redirect; gateway redirect on unauthorized settings GET; Strapi enforces ownership on mutations.
- [x] No secrets, tokens, or internal payloads are exposed — UI shows `ApiError.message` and permission hints only.
- [x] Sensitive actions require confirmation — save dialog lists field diffs before confirm.

## Accessibility

- [x] Headings create a sensible page outline — `PageHeader` with org name; "Organisation settings" section title.
- [x] Form fields have labels and error associations — toggle rows with linked `id`s; select rows with titles; errors use `role="alert"`.
- [x] Buttons and links have clear accessible names — "Reset", "Save settings", "Confirm save", "Cancel".
- [ ] Keyboard navigation works for the main flow — manual verification required.
- [ ] Focus is managed after dialogs, errors, and route changes — manual verification required.

## Manual Test Evidence

Run in local or staging with a valid customer account. **Not executed in this pass** — requires authenticated browser session.

- [ ] Load `/o/{validAccountId}/settings` — org title, delivery day, club/association-specific fields visible.
- [ ] Edit bundle delivery day — confirm dialog, success toast; weekday persists after reload.
- [ ] Edit include junior surnames toggle — confirm dialog, success toast; value persists after reload.
- [ ] Edit competitions grouped by (association) — confirm dialog, success toast; value persists after reload.
- [ ] Edit split seniors and masters (club) — confirm dialog, success toast; value persists after reload.
- [ ] Reset discards unsaved changes without API call.
- [ ] Visit `/o/not-a-number/settings` — redirects to select-organisation.
- [ ] Network offline on load — error state and retry works.
- [ ] 403 on save — permission banner shown.
- [ ] Keyboard — tab through fields and save dialog; Escape closes dialog.

## Production Sign-off

- Owner:
- Known gaps:
  - Manual browser checklist not executed (requires authenticated local/staging session).
  - No Playwright/E2E coverage for this route.
  - Keyboard/focus behavior not manually verified.
  - Delivery day also editable on `/o/[accountId]/notifications` — coordinate manual checks across both routes.
- Test evidence:
  - `npm run test -- "src/app/(members)/o/[accountId]/settings" "src/app/api/accounts/[accountId]/settings/route.test.ts" "src/app/api/accounts/[accountId]/scheduler/route.test.ts"` — 47 tests passed (2026-07-04).
  - Unit: `build-partial-patch.test.ts` (8), `settings-draft-from-payload.test.ts` (8), `save-error-details.test.ts` (5).
  - Component: `account-settings-content.test.tsx` (4), `account-settings-preferences.test.tsx` (8).
  - API: `settings/route.test.ts` (10), `scheduler/route.test.ts` (4).
- Production decision: In review — automated proof complete; move to **Ready** after authenticated browser sign-off.
