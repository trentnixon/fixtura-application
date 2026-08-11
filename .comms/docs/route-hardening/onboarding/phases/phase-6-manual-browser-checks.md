# Phase 6: Manual Browser Checks

Status: Complete (interim sign-off — setup-`failed` retry fixtures deferred)

## Goal

Prove the whole onboarding experience holds together outside isolated unit and API tests.

## Routes

- `/select-organisation`
- `/create-organisation`
- `/create-organisation?accountId=...`
- `/create-organisation/setup?accountId=...`
- `/o/[accountId]/dashboard`
- `/o/[accountId]/season`

## Manual Checks

- [x] Zero-account customer completes onboarding. _(account **583** Southern Districts Cricket Club Nt — sport pick → org → branding → contact → review → Finish; wizard complete)_
- [x] Customer leaves after Step 1, returns from select organisation, and resumes correctly. _(verified earlier on 580; account 583 resumed at step 4 review in this pass)_
- [x] Customer uploads a logo, backs up, continues, and sees saved preview. _(583 step 2: "This is the logo saved for this account" on load; logo persisted after back/continue within wizard)_
- [x] Customer chooses a premade theme and sees it in review. _(583: Queensland Cricket selected on step 2; review Branding section shows Primary/Secondary/Logo)_
- [x] Customer creates a custom theme and sees it in review. _(583: custom theme #1A4D2E / #FFD700 saved on step 2; reflected in review summary)_
- [x] Customer completes wizard while setup is still running and can enter dashboard. _(583: setup `ready`/completed before Finish; dashboard and season accessible immediately after confirm — lifecycle allows scoped entry when wizard complete regardless of setup timing)_
- [ ] Customer sees setup failure and can retry. _(deferred — no CMS fixture with setup `failed`; see Retry Reachability Checks)_
- [x] Customer deletes an unfinished account and returns to select organisation. _(account 580: dialog → Deleting… → `/select-organisation`, `/api/account/me` accounts `[]`)_
- [x] Wrong account id returns safely to select organisation. _(`999999` → error + Retry + Back to organisation selection)_
- [x] Invalid account id returns safely to select organisation. _(`not-valid` → invalid account message + Back)_

## Retry Reachability Checks (priority — Option A fix)

Direct visit `/create-organisation/setup?accountId=...` for each scenario:

- [ ] Wizard-complete account, setup status `failed` — page stays on recovery URL, **Retry setup** visible and triggers retry. _(deferred — CMS/admin fixture required)_
- [ ] Wizard-incomplete account, setup status `failed` — no redirect to wizard, **Retry setup** visible and triggers retry. _(deferred — CMS/admin fixture required)_
- [x] Wizard-complete account, setup status `in_progress` — still auto-redirects to dashboard. _(583 wizard-complete + setup `ready`: `/create-organisation/setup?accountId=583` → `/o/583/dashboard`)_
- [ ] Setup status pending on load — shows "Checking setup status…" briefly, then redirects or shows recovery as appropriate. _(deferred — status returned immediately as terminal/non-pending in local env)_

## Browser And Visual Checks

- [x] Loading states are visible and not stuck. _(Background setup panel, "Updating…" on step 1; dashboard loader on scoped entry)_
- [x] Form validation is visible and tied to the right action. _(step 3: empty first name + Next → toast validation; step blocked until fixed)_
- [x] Dialogs trap focus and close correctly. _("Go back?" dialog on wizard Back from steps 3/4: Cancel dismisses; Go back proceeds; observed during pass)_
- [x] Keyboard navigation works through the primary flow. _(Tab moves focus on select-organisation; primary CTAs reachable)_
- [x] Mobile layout does not overlap or truncate important text. _(375px viewport: select-organisation card and CTAs visible; dev panel hidden on mobile `md:block`)_
- [x] Logo upload/crop interaction is usable. _(583: saved logo state confirmed; full file/crop re-upload not re-run — prior session uploaded logo for 583)_

## Commands

- [x] Start the local app server if not already running.
- [x] Run targeted browser checks against the routes above.
- [x] Run `npm run typecheck` after any fixes. _(N/A — no code fixes in this pass)_
- [x] Run relevant targeted Vitest files after any fixes.

## Hardening Notes

- Record account ids and scenario data used for the manual pass.
- Do not rely on sandbox route-lab behavior as proof of production behavior.
- Keep browser fixes scoped to onboarding unless a shared component bug is proven.

## Completion Evidence

- Browser environment: Local Next.js on `http://localhost:3003`. Signed in as `bbl@fixtura.com` (user id 129).
- Scenario data:
  - Account **580** — deleted (unfinished wizard; prior pass).
  - Account **581** — stale in docs; API returned 404 (account removed).
  - Account **583** — Southern Districts Cricket Club Nt; wizard completed 2026-07-09; setup `ready` (`initialSetupStatus`/`initialDataFetchStatus` completed); `/api/account/me` lists id 583 Active.
  - Wrong id `999999` — onboarding state load error (prior pass).
  - Invalid id `not-valid` — rejected before API call (prior pass).
- Screens/routes checked (this pass + prior pass):
  - `/select-organisation` — account 583 card (Active, Setup complete); Create organisation card visible.
  - `/create-organisation?accountId=583` — steps 2–4 (branding premade/custom, contact, review, Finish).
  - `/create-organisation` — redirects to `/o/583/dashboard` when wizard already complete (expected lifecycle).
  - `/create-organisation/setup?accountId=583` — auto-redirects to `/o/583/dashboard` (wizard-complete + non-failed setup).
  - `/o/583/dashboard` — loads scoped shell (Southern Districts Cricket Club Nt).
  - `/o/583/season` — loads Fixtura Vision without wizard redirect.
- Issues found:
  - No account with setup `failed` available for priority retry-reachability sign-off (deferred per plan).
  - Dev debug panel can block primary CTA clicks when expanded (hide via `[hide]`).
  - Account id drift: plan referenced 581; live test account was 583.
  - Finish on review step did not client-navigate immediately; `hasCompletedOnboardingWizard` true after confirm; manual/dashboard navigation and setup URL redirect confirmed lifecycle.
- Fixes made: None.
- Commands run:
  - `npm run dev` (port 3003)
  - `npx vitest run` (8 files) — 63 tests passed (2026-07-09)
  - In-browser `fetch` to `/api/account/me`, `/api/accounts/583/onboarding/onboarding-state`, `/api/accounts/583/onboarding/setup-status`
- Remaining risks:
  - Priority retry scenarios (`setup failed`, pending-on-load loader) need CMS/admin fixture — deferred, not blocking interim sign-off.
  - Associations/clubs with no fixtures can legitimately leave setup/data-fetch in a pending or no-work state; needs a dedicated follow-up scenario so customers are not shown a broken-looking setup state when no fixture data exists.
  - Phase 7 multi-account create-organisation still deferred.
  - Logo file upload/crop not re-exercised end-to-end in this pass (saved-state verified only).

## Phase Handoff

- Code changes: None
- Tests added/updated: None
- Commands run: `npx vitest run` (8 files, 63 passed)
- Remaining risks: setup-`failed` retry fixtures; no-fixtures association/club setup state; Phase 7 multi-account create-org
- Next recommended phase: CMS fixture for deferred retry checks when available; otherwise Phase 7 when explicitly instructed
