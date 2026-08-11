# Local Feature Testing Checklist

Use this checklist before staging or production testing. Test with a real local CMS/API connection and at least two user accounts where possible.

## How to record results

- `[x]` Pass
- `[ ]` Not tested
- Add `FAIL:` and a short note when the result is wrong.
- Record the browser, viewport, account ID/type, and test date for each run.

## Current automated baseline (2026-08-03)

- [x] TypeScript: `npm run typecheck` passes.
- [x] Automated tests: 282 files, 1,956 passed, 2 skipped.
- [x] Application source lint: `npx eslint src` passes.
- [x] Full lint: `npm run lint` fails because the untracked generated root file `preview.mjs` has 98 errors.
- [x] Prowritten in the restricted environment; an unrestricted rerun did not complete and needs a clean terminal rerun.duction build: compilation completed once, but the build failed when `.next/trace` could not be
- [x] Test warnings reviewed: nested button markup in a tooltip test, forwarded Radix props in mocks, unavailable jsdom canvas, and a missing `preview.mjs.map` source map.

## Test data needed

- [ ] User with no organisations.
- [ ] User with one completed club account.
- [ ] User with one completed association account.
- [ ] User with two or more organisations.
- [ ] Unfinished onboarding account.
- [ ] Account whose setup is processing, complete, and failed/retryable.
- [ ] Account with season data, grades, teams, fixtures, and scores.
- [ ] Account with no season data.
- [ ] Account with active, archived, assigned, and unassigned sponsors.
- [ ] Account with media, generated bundles, and downloadable assets.
- [ ] Billing states: trial available, trial active, paid, payment pending, invoice pending, expired/cancelled.

## 1. Public pages and authentication

- [ ] Open `/`; sign-in form renders with no console error.
- [ ] Submit valid credentials; user reaches organisation selection or the correct account route.
- [ ] Submit invalid credentials; a safe, useful error appears and the password is not exposed.
- [ ] Submit repeatedly; spam/rate-limit feedback is understandable and retry timing works.
- [ ] Open a protected `/o/{accountId}/...` URL while signed out; user is sent to sign-in and returns safely after login.
- [ ] Use forgot password with a valid email; confirmation does not reveal whether the email exists.
- [ ] Open the reset link and set a valid new password; old password fails and new password succeeds.
- [ ] Test invalid, expired, and reused reset links.
- [ ] Verify `/check-email`, `/auth-error`, and `/session-expired` have correct actions back to sign-in.
- [ ] Log out; protected pages and APIs are inaccessible afterward, including via Back/refresh.
- [ ] Confirm redirect/return URLs cannot send the user to an external site.
- [ ] Verify Help and Support contact details are real and all links work.
- [ ] Verify Maintenance copy is production-ready.

Known gaps to resolve or explicitly accept:

- [ ] Home page “System Pulse” and “Direct Help” both currently link to `/help`.
- [ ] Help “Knowledge Base” and “Live Chat” currently use `#` links.
- [ ] Help phone number is currently `+61000000000`.
- [ ] Maintenance page currently displays “Placeholder for maintenance page”.
- [ ] Decide whether the public `/components` route is allowed in production.

## 2. Organisation selection and onboarding

- [ ] Zero-account user is routed into create-organisation onboarding.
- [ ] One-account and multi-account users see the correct organisation cards.
- [ ] Search and sorting work; clearing search restores every organisation.
- [ ] Selecting a card opens that exact account and does not leak the previously selected account's data.
- [ ] Unfinished organisations show Continue setup and resume the correct step.
- [ ] Create a second organisation; the original organisation remains unchanged and selectable.
- [ ] Back, refresh, and direct URL navigation preserve safe onboarding state.
- [ ] Complete the Cricket onboarding flow: sport, organisation, branding, contact/review, confirmation.
- [ ] Club and association lookups load, filter, select, and persist correctly.
- [ ] Upload or select a logo; crop validation, cancel, retry, and persistence all work.
- [ ] Select a premade theme and create/edit a custom colour theme; preview and saved result match.
- [ ] Confirm setup-processing status does not incorrectly block a completed wizard account.
- [ ] Test setup complete, delayed, failed, retry, and safe-delete recovery paths.
- [ ] Attempt to resume another user's `accountId`; no account details are disclosed.
- [ ] Rapidly switch organisations during loading; stale data never appears under the new account.

Expected limitation requiring product acceptance:

- [ ] AFL, Hockey, Netball, and Basketball are intentionally disabled as “Coming soon”; verify production messaging is acceptable.

## 3. Navigation, account boundaries, and responsive shell

- [ ] Sidebar links open Dashboard, Bundles, Vision, Settings, Templates, Background images, Sort Order, Branding, Logo, Sponsors, and Club Logos where applicable.
- [ ] Club Logos is shown for association-style accounts and hidden for club accounts.
- [ ] Organisation switcher changes every account-scoped link to the new account ID.
- [ ] Direct access to an invalid, missing, or unowned account ID returns a safe gateway/error state.
- [ ] Account, Billing, History, Notifications, and sponsor sub-routes remain reachable from their intended UI actions.
- [ ] Active navigation state and breadcrumbs match the current route.
- [ ] Mobile sidebar opens/closes, traps focus correctly, and does not hide primary actions.
- [ ] Unsaved-change warnings appear when leaving edited Settings, Notifications, Branding, Templates, or Sort Order.

## 4. Dashboard

- [ ] Dashboard loads the selected organisation only.
- [ ] Organisation name, status, branding, billing/access, and route cards show accurate values.
- [ ] Every card action opens the correct account-scoped destination.
- [ ] Loading, empty, partial-data, error, retry, and refreshed states are understandable.
- [ ] Switching accounts refreshes all metrics and never displays stale values.
- [ ] No debug data, internal IDs, tokens, stack traces, or sandbox controls appear.
- [ ] Desktop and mobile layouts have no clipping or unusable actions.

## 5. Vision / season data

- [ ] Vision overview loads competitions, tracking state, counts, and last-updated values.
- [ ] Empty account shows a useful setup/no-data state.
- [ ] Open competition, grade, and fixture routes; IDs, titles, breadcrumbs, and back links remain correct.
- [ ] Grade fixtures show scheduled, completed, abandoned/cancelled, and missing-score states correctly.
- [ ] Fixture detail tabs and scorecard data display correctly for available data.
- [ ] Missing or inaccessible competition/grade/fixture IDs show a safe not-found state.
- [ ] Trigger/retry controls cannot double-submit and show progress, success, failure, and cooldown states.
- [ ] Refresh after a trigger displays updated tracking/data.
- [ ] Long team/grade names and large scorecards work on mobile.

## 6. Sort Order

- [ ] Existing grade groups and ordering load from the selected account.
- [ ] Drag/drop and keyboard reordering both work.
- [ ] Create/rename/reorder groups and move grades as supported.
- [ ] Save persists after refresh and after leaving/returning.
- [ ] Cancel/reset restores the last saved state.
- [ ] Unsaved-change warning prevents accidental loss.
- [ ] Empty, malformed, loading, error, retry, and concurrent-save states are safe.
- [ ] Switching accounts never carries draft ordering across accounts.

## 7. Branding, logo, and templates

- [ ] Branding loads the saved colours/theme and the preview matches them.
- [ ] Change colours/theme, review contrast/readability, save, refresh, and confirm persistence.
- [ ] Cancel/discard leaves the saved branding unchanged.
- [ ] Upload, crop, replace, and remove the organisation logo; validate file type, size, dimensions, and corrupted files.
- [ ] Logo changes appear in navigation, dashboard, and previews after refresh.
- [ ] Template Builder loads all available template options.
- [ ] Select template style, mode, colour pairing, contrast, gradient/image/noise/particle/texture/video options as available.
- [ ] Preview updates without crashing for every available combination.
- [ ] Save template options; refresh and confirm exact persistence.
- [ ] Required-media and missing-media states provide a clear next action.
- [ ] API failure preserves the user's draft and permits retry.
- [ ] Generated previews contain the selected organisation branding, logo, and sponsors.

## 8. Background images / media gallery

- [ ] Empty gallery explains what to do and exposes Upload.
- [ ] Upload a valid JPG/PNG/WebP up to the documented 15 MiB limit.
- [ ] Reject unsupported MIME, oversized, corrupt, or invalid-dimension files with useful messages.
- [ ] Crop portrait 4:5 and landscape 5:4 images and confirm the saved result.
- [ ] Add/edit title, age category, asset type, active state, and other exposed metadata.
- [ ] Switch between Image pool, category grouping, and asset-type grouping.
- [ ] Search/filter/sort controls return correct items and reset correctly.
- [ ] Activate/deactivate persists after refresh.
- [ ] Delete requires confirmation, removes the card after success, and handles retryable failure.
- [ ] Broken/missing image URLs render a usable fallback.
- [ ] Cross-account read, update, and delete attempts are denied without leaking data.
- [ ] Full flow passes: upload -> edit -> deactivate -> activate -> use in template -> delete.
- [ ] Dialog focus, keyboard controls, and status announcements are accessible.

## 9. Club logos (association accounts)

- [ ] Directory loads all and only the selected association's clubs.
- [ ] Search/filter and empty states work.
- [ ] Open a club; correct name and existing logo load.
- [ ] Upload/crop/replace/remove logo and confirm persistence after refresh.
- [ ] Invalid file and API failure preserve a retry path.
- [ ] Invalid/unowned club ID is safely rejected.
- [ ] Return to directory preserves useful navigation state.

## 10. Sponsors

- [ ] Sponsor pool loads total, placed, unassigned, and archived counts accurately.
- [ ] Add sponsor with valid name/logo/details; validation and duplicate-submit prevention work.
- [ ] Edit sponsor details/logo and confirm persistence.
- [ ] Archive and restore a sponsor; it moves between active and archive views correctly.
- [ ] Assign primary/general position slots and confirm occupied/empty counts.
- [ ] Assign sponsors to clubs, teams, grades, and competitions where supported.
- [ ] Reassign/remove allocations and confirm generated preview data updates.
- [ ] Filters for placement/entity/type work and reset correctly.
- [ ] Archived or ineligible sponsors cannot remain incorrectly assigned.
- [ ] Cross-account sponsor and allocation URLs are denied safely.
- [ ] Loading, empty, partial, failure, retry, and concurrent update states behave correctly.

## 11. Notifications and organisation settings

- [ ] Notifications load saved addressee, email, and delivery day.
- [ ] Invalid email is blocked with field-level feedback.
- [ ] Change one field and multiple fields; review confirmation and save.
- [ ] Partial save failure clearly identifies what did and did not save.
- [ ] Refresh confirms persistence and clears the unsaved indicator.
- [ ] Settings load scheduler and preference values.
- [ ] Change delivery weekday and preferences; save and confirm persistence.
- [ ] Missing scheduler and malformed weekday states give safe recovery guidance.
- [ ] Forbidden/permission failure shows support-oriented copy, not raw CMS details.
- [ ] Bundles delivery schedule reflects the saved weekday.
- [ ] Keyboard navigation and focus in confirmation dialogs work.

## 12. Bundles and downloads

- [ ] Bundle list loads useful metadata and correct newest-first ordering.
- [ ] Verify queued, processing, failed, and completed render states.
- [ ] Empty history and API failure states are useful and retryable.
- [ ] Active-run banner accurately reflects in-progress work.
- [ ] Delivery schedule and next-delivery countdown match Settings.
- [ ] Asset Hub link uses the correct account, sport, render, and grouping path.
- [ ] Open a render detail; header and summary match the selected render.
- [ ] Invalid/missing/unowned render IDs show a safe state and Back to bundles action.
- [ ] Every completed asset download opens/downloads the expected file.
- [ ] Failed or absent asset links are disabled or explained, not broken silently.
- [ ] Expired render tokens/links recover safely.
- [ ] Test large lists and mobile download controls.

## 13. Account and security

- [ ] Account page shows correct organisation, user display name, login email, account type, and status.
- [ ] Edit display name; success persists after refresh.
- [ ] Change login email; validation, confirmation/session behavior, and new login all work.
- [ ] Change password; current-password validation and password rules are clear.
- [ ] Old password fails, new password succeeds, and existing session behavior matches policy.
- [ ] Missing optional fields show safe placeholders rather than broken UI.
- [ ] Security mutations cannot target another account/user.
- [ ] Error messages do not expose CMS/provider internals.

## 14. Billing

- [ ] Billing overview matches each test account's access, trial, plan, order, and invoice state.
- [ ] Eligible account can start a trial once; duplicate attempts are prevented.
- [ ] Trial-ineligible/used/allocated-to-another-account states show correct guidance.
- [ ] Subscription wizard lists the correct club/association plans and prices.
- [ ] Stripe test checkout succeeds and returns to `/billing/success`; billing refreshes correctly.
- [ ] Cancel Stripe checkout and return through `/billing/cancel`; no false active subscription appears.
- [ ] Pending checkout can resume and discard where allowed.
- [ ] Invoice request submission, pending display, withdrawal/cancellation, and error recovery work.
- [ ] Billing history displays orders/invoices with correct dates, amounts, statuses, and links.
- [ ] Paid, expiring, expired, cancelled, payment-pending, and access-uncertain states have correct actions.
- [ ] Refreshing or double-clicking payment actions does not create duplicate orders.
- [ ] Payment/provider errors are customer-safe and contain no secret/provider internals.
- [ ] Cross-account order, invoice, checkout, and billing URLs are denied.

## 15. Cross-cutting quality checks

- [ ] Test latest Chrome, Edge, Safari, and Firefox at supported versions.
- [ ] Test 320/375 px mobile, tablet, laptop, and wide desktop layouts.
- [ ] Complete primary workflows using keyboard only; focus is visible and logical.
- [ ] Dialogs/sheets trap and restore focus; Escape and close actions behave safely.
- [ ] Inputs have labels; errors/statuses are announced; colour is not the only signal.
- [ ] Images have appropriate alternative text; decorative images are ignored by assistive tech.
- [ ] No hydration, uncaught exception, failed request, or repeated-request loop appears in the browser console/network panel.
- [ ] Loading states prevent duplicate mutations and layout jumps.
- [ ] Empty, 400, 401, 403, 404, 409, 429, and 500/upstream-down cases have safe UI.
- [ ] Session expiry during a form save preserves/recoverably handles user work.
- [ ] Refresh, Back/Forward, and opening links in a new tab work on every primary route.
- [ ] Sentry receives a controlled test error in the test environment and exposes no sensitive data.
- [ ] PostHog loads only when configured, records approved events, and contains no sensitive form data.
- [ ] Dev sandbox, route lab, data lab, kitchen sink, debug panels, and internal admin tools are disabled or access-controlled for production.
- [ ] `NEXT_PUBLIC_ENABLE_DEV_SANDBOX` and `NEXT_PUBLIC_SELECT_ORG_SIMULATOR` are false/absent in production.
- [ ] Production uses the correct HTTPS CMS, Stripe mode/key, PostHog host/key, Sentry project/token, and Asset Hub URL.

## Release gate

- [ ] All P0 flows pass: sign in, account isolation, onboarding, primary data view, save settings, billing/payment, logout.
- [ ] No open security, data isolation, payment, data-loss, or authentication defects.
- [ ] Full lint passes or generated vendor artifacts are explicitly excluded with an approved reason.
- [ ] Clean `npm run build` completes in the intended production-like environment.
- [ ] Automated test warnings and the 2 skipped tests are reviewed and accepted/fixed.
- [ ] Every customer-facing route is marked Ready, Blocked with an accepted exception, or intentionally excluded.
- [ ] Known public placeholder content and Coming soon sports are approved or fixed.
- [ ] Product acceptance and test evidence are recorded with tester/date/environment.
- [ ] Rollback owner, deployment owner, smoke-test owner, and monitoring window are assigned.

## Final decision

- [ ] GO — all release gates pass.
- [ ] CONDITIONAL GO — only documented low-risk exceptions remain.
- [ ] NO-GO — one or more P0/P1, build, lint, security, payment, or data-isolation gates fail.
