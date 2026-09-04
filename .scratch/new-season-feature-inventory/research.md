# Former-customer feature inventory for "New season, new Fixtura"

Status: repository-confirmed and public-site cross-checked, production members-app confirmation required

Reviewed: 2026-09-01

Source baseline: branch `staging`, commit `80e66c64bacd41ebefe3b396970acf9b56727fe6`

## Decision summary

The current source supports six customer-facing claims:

1. One login can access and switch between multiple organisations.
2. **Fixtura Vision** lets an organisation browse its synced season and queue scoped data refreshes.
3. **Fixtura Members** has an organisation-scoped dashboard and grouped navigation.
4. **Templates** lets an organisation choose a template, colours, contrast, and a background, then preview and save the result.
5. **Bundles**, **Organisation settings**, and **Notifications** expose bundle history, Asset Hub links, delivery timing, and recipient settings.
6. **Sponsors** has a sponsor pool, position and entity assignments, previews, and an archive.

Do not promote these claims from this repository alone:

- **AI Pressbox** and its article types. The repository has no customer-facing Pressbox route, component, copy, or article-type catalogue. It only displays an **AI articles** count in bundle render detail.
- A named **new content template**. The repository supports a **Templates** builder and a server-provided template catalogue, but it does not identify one template as the new marketing template.
- Customer **user management**. Customers can edit their own profile and sign-in security. No production invite, member, role, or removal workflow exists in this repository.
- A customer-facing **new admin area**. The customer product name in the source is **Fixtura Members**. `/admin/system` is an internal diagnostics area whose navigation appears only when the development sandbox flag is enabled.
- **Animated backgrounds**. Work for this option exists only in uncommitted files and edits in the reviewed worktree. It is not part of the reviewed commit.

The source proves that the features are implemented, routed, and linked in the current application. It does not prove that commit `80e66c6` is deployed to production. Smoke-test each production route with a normal organisation-owner account before changing the status below to **confirmed live**.

## Public-site cross-check

Fixtura's public site currently supports several broad product claims. It advertises automated weekly content packs, optional AI-written match reports, sponsor integration, a 14-day free trial, and Cricket, AFL, and Netball coverage. It also says customers choose a delivery day and receive a link to the Delivery Hub. Sources: [Fixtura home](https://www.fixtura.com.au/), [FAQ](https://www.fixtura.com.au/faq), [delivery](https://www.fixtura.com.au/delivery), and [sponsors](https://www.fixtura.com.au/sponsors).

This does not confirm the new authenticated screens are deployed. It also exposes a wording conflict: the public site advertises AFL and Netball support, but the current self-service **Create organisation** wizard disables AFL and Netball as **Coming soon**. Market platform coverage separately from self-service setup availability until production owners confirm the intended rule.

Public campaign CTAs are [Start free trial](https://www.fixtura.com.au/register), [Pricing](https://www.fixtura.com.au/pricing), and [Contact](https://www.fixtura.com.au/contact). For former customers who already have access, the safest in-product destination remains the production equivalent of `/select-organisation`; its production host was not present in this repository or exposed on the public site.

## Live-now candidates

### Select organisation

- **Exact feature name:** **Select organisation**. The related action is **Create organisation**.
- **What it lets the customer do:** One signed-in user can see each owned organisation returned by `/account/me`, open one organisation workspace, switch later, search and sort a larger list, and create another organisation. The picker says "Choose a workspace to continue. You can switch later" and explains that a user may belong to multiple workspaces. Sources: `src/types/api/account.ts:60-64,100-115`; `src/lib/account/account-me-rows.ts:23-48`; `src/app/(members)/select-organisation/select-organisation-content.tsx:384-394,435-470,524-619`; `src/app/(members)/select-organisation/_components/select-org-help-dialog.tsx:60-73`.
- **What changed:** The 2026 application introduced account-specific workspace selection and organisation-scoped routing. Commit `bbd81cf` on 2026-04-04 records "multi-organisation routing." Commit `ab4dae7` on 2026-07-15 records multi-account creation hardening. The current selector does not silently fall back to the first account. Source: `src/lib/account/account-me-rows.ts:36-48`.
- **Availability:** Code-confirmed live candidate. The routes are present in authenticated gateway navigation with no front-end feature flag. Sources: `src/components/navigation/app-sidebar/_constants/sidebar-nav.ts:27-31`; `src/lib/config/routes.ts:30-36`.
- **Limits:** The API describes these as owned-organisation rows. Organisation routes enforce account access. The source does not establish shared access, invitations, roles, or membership administration. Search, sort, view controls, and the resume panel appear only when more than five organisations exist. No sport or plan gate was found. Sources: `src/types/api/account.ts:60-64`; `src/components/auth/org-access-boundary.tsx:30-34`; `src/app/(members)/select-organisation/select-organisation-content.tsx:193-196,424-447`.
- **Screen asset:** Capture `/select-organisation` with at least two real organisations. Six or more gives the strongest image because it shows search, sort, grid or list controls, the last workspace, and **Create organisation**.
- **CTA:** `/select-organisation`. Use `/create-organisation` only when the CTA means adding another organisation.
- **Avoid:** Avoid "multiple organisations under one account." In this data model, each organisation is an account row. Use "Use one Fixtura login to access and switch between your organisations." Avoid "invite your team" and "shared workspaces."

### Create organisation

- **Exact feature name:** Page title **Create organisation**. The first heading is **Set up**. The four steps are **Organisation and permission**, **Branding**, **Contact and delivery**, and **Review and confirm**. Sources: `src/app/(members)/create-organisation/page.tsx:8-11`; `src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx:56-78,513-520`.
- **What it lets the customer do:** The customer chooses a sport, organisation type, association, and optional club. They confirm authority and data permission, upload branding, enter contact and delivery details, review the setup, and start background preparation. The customer can resume an unfinished setup and delete an eligible unfinished account. Sources: `src/app/(members)/create-organisation/_components/wizard-step-organisation.tsx:289-465`; `src/app/(members)/create-organisation/_components/wizard-step-review.tsx:274-375`; `src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx:399-405,791-807`.
- **What changed:** Commit `6116503` on 2026-04-13 added background setup progress and recovery. Commit `3105854` on 2026-07-09 reworked the wizard state and UI. Commit `ab4dae7` on 2026-07-15 hardened creation for users with multiple accounts. The recovery page polls setup and sends completed accounts to their dashboard. Sources: `src/lib/config/routes.ts:34-36`; `src/app/(members)/create-organisation/setup/setup-client.tsx:25-28,54-77,126-140`.
- **Availability:** Code-confirmed live candidate. **Create organisation** is in authenticated gateway navigation. Source: `src/components/navigation/app-sidebar/_constants/sidebar-nav.ts:27-31`.
- **Limits:** Sports come from a CMS lookup. AFL, hockey, netball, and basketball are visibly disabled as **Coming soon** in the current wizard. Association and club choices depend on the selected sport. The user must confirm both authority to act and permission to fetch data. No plan gate was found. Sources: `src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx:101-108,530-545`; `src/app/(members)/create-organisation/_components/wizard-step-organisation.tsx:175-183,330-418`.
- **Screen asset:** Capture `/create-organisation` at the sport picker to show availability honestly. A second image of **Review and confirm** shows the complete guided setup. Use an owned unfinished account for the latter.
- **CTA:** `/create-organisation`.
- **Avoid:** Avoid "all sports," "instant setup," "automatic onboarding," and "connect any competition." Use "guided organisation setup." Preparation can continue in the background.

### Fixtura Vision

- **Exact feature name:** Navigation label **Vision**. Page metadata calls it **Fixtura Vision**. Sources: `src/components/navigation/app-sidebar/_constants/sidebar-nav.ts:85-103`; `src/app/(members)/o/[accountId]/season/page.tsx:5-8`.
- **What it lets the customer do:** The customer browses synced competitions, grades, teams, fixtures, match data, scorecards when available, and delivered outputs. The overview supports search and season, association, and status filters. A fixture has **Match**, **Scorecard**, **Teams**, and conditional **Outputs** views. Sources: `src/app/(members)/o/[accountId]/season/_components/_sections/season-overview-tracked-competitions-section.tsx:88-167,187-255`; `src/app/(members)/o/[accountId]/season/_components/_constants/season-fixture-tabs.ts:1-15`; `src/app/(members)/o/[accountId]/season/_components/_utils/season-fixture-tabs.ts:8-31`; `src/app/(members)/o/[accountId]/season/_components/_sections/season-fixture-outputs-section.tsx:11-47`.
- **What changed:** Commit `ef24941` on 2026-04-25 integrated the season hub into the members area with competition, grade, and fixture views, access control, and empty states. Commit `657e8ff` on 2026-04-29 refined competition detail and data handling.
- **Availability:** Code-confirmed live candidate for completed owner accounts. The route registry marks the season-hub read API as `ready`. Sources: `src/lib/api/routes/route-definitions.ts:690-704`; `src/app/(members)/o/[accountId]/season/_components/season-onboarding-shell.tsx:12-15,41-54`.
- **Limits:** Vision is unavailable until account setup reports `isSetup: true`. It is disabled while support staff browse a customer account. Data may have no competitions, scorecards, or outputs. No plan gate was found in the front end. Sources: `src/app/(members)/o/[accountId]/season/_components/season-onboarding-shell.tsx:12-15,41-51`; `src/app/(members)/o/[accountId]/season/_components/season-overview.tsx:74-80`; `src/app/(members)/o/[accountId]/season/_components/_utils/season-fixture-tabs.ts:8-13`.
- **Screen asset:** Capture `/o/{accountId}/season` with a populated competition table. A strong recording opens one competition, one grade, and one fixture, then moves through the fixture tabs.
- **CTA:** `/o/{accountId}/season` after sign-in. Do not place a fixed account ID in a bulk former-customer email unless the email system can resolve the recipient's account.
- **Avoid:** Avoid "edit fixture data" and "competition connection manager." The verified UI lets customers inspect loaded data. It does not edit source fixtures or connect and disconnect competitions.

### Vision data sync

- **Exact feature names:** The UI uses **Sync**, **Confirm Competition Sync**, **Resync this grade?**, and **Queue result scrape for this fixture?** Sources: `src/app/(members)/o/[accountId]/season/_components/_sections/season-overview-sync-dialog.tsx:29-49`; `src/app/(members)/o/[accountId]/season/_components/_sections/season-grade-sync-dialog.tsx:39-70`; `src/app/(members)/o/[accountId]/season/_components/_sections/season-fixture-result-sync-dialog.tsx:24-54`.
- **What it lets the customer do:** The customer can queue an organisation-level competition refresh, queue grade teams and fixtures together, and queue a result scrape for one fixture. Successful requests refresh the displayed data after processing. Sources: `src/app/(members)/o/[accountId]/season/_components/_hooks/use-season-sync-actions.ts:19-37,47-69,85-157`; `src/app/(members)/o/[accountId]/season/_components/season-fixture-view.tsx:48-79,102-123`.
- **What changed:** This arrived with the 2026 Vision integration and later scoped queue integrations. The current model separates competition, grade, and fixture refreshes instead of presenting one opaque account refresh. Source: `src/app/(members)/o/[accountId]/season/_components/_sections/season-overview-sync-dialog.tsx:30-35`.
- **Availability:** Code-confirmed live candidate. The route registry marks competition, team, fixture discovery, and fixture-result trigger endpoints as `ready`. Sources: `src/lib/api/routes/route-definitions.ts:706-773`.
- **Limits:** Sync is queued, not immediate. A PlayHQ fixture result often takes 30 to 60 seconds, and a grade refresh can take minutes. Overview sync updates only competition-level data. Grade, team, fixture, and result refreshes require their specific pages. Queue actions require valid positive CMS IDs. Organisation-level sync supports Association or Club accounts with an organisation ID. Sources: `src/app/(members)/o/[accountId]/season/_components/_sections/season-fixture-result-sync-dialog.tsx:27-31`; `src/app/(members)/o/[accountId]/season/_components/_sections/season-grade-sync-dialog.tsx:43-47`; `src/app/(members)/o/[accountId]/season/_components/_sections/season-overview-sync-dialog.tsx:30-35`; `src/app/(members)/o/[accountId]/season/_components/season-grade-view.tsx:21-30`; `src/lib/api/hooks/account/useTriggerOrgSingleScrape.ts:9-15,42-66`.
- **Screen asset:** Record the populated Vision overview, open **Sync**, show **Confirm Competition Sync**, then open a grade and show its separate sync dialog. A fixture result dialog makes the PlayHQ and processing delay clear.
- **CTA:** Start at `/o/{accountId}/season`. Nested routes follow `/o/{accountId}/season/competitions/{competitionId}/grades/{gradeId}/fixtures/{fixtureId}`. Source: `src/app/(members)/o/[accountId]/season/_components/_utils/season-routes.ts:3-28`.
- **Avoid:** Avoid "real-time sync," "instant refresh," "sync your whole season in one click," "sync it with your games," and "we correct your source data." Prefer "Review the season data Fixtura has loaded and queue a refresh when something looks out of date."

### Fixtura Members dashboard

- **Exact feature name:** **Dashboard** in **Fixtura Members**. The customer-facing source does not call it an admin area. Source: `src/app/(members)/o/[accountId]/dashboard/page.tsx:7-9`.
- **What it lets the customer do:** Each organisation gets a scoped dashboard with asset preview, branding, Vision, billing, activity metrics, and sponsors. Navigation groups **Bundles**, **Assets**, and **Organisation** tools. Sources: `src/app/(members)/o/[accountId]/dashboard/dashboard-content.tsx:92-115`; `src/components/navigation/app-sidebar/_constants/sidebar-nav.ts:59-157`.
- **What changed:** Authenticated product routes now live under `/o/{accountId}/...`. Signed-in visits to old flat paths such as `/dashboard`, `/settings`, `/bundles`, `/template-builder`, and `/season` redirect to **Select organisation**. Sources: `src/lib/config/account-routes.ts:1-3,31-63`; `src/middleware.ts:7-21,48-52`.
- **Availability:** Code-confirmed live candidate for an owned organisation. The middleware protects organisation-scoped routes and the organisation boundary enforces access. Sources: `src/middleware.ts:74-90`; `src/components/auth/org-access-boundary.tsx:30-34`.
- **Limits:** Dashboard content is organisation-scoped. Some tools disappear in support view, and **Club Logos** depends on account type. No plan gate was found in navigation. Sources: `src/components/navigation/app-sidebar/_constants/sidebar-nav.ts:42-57,127-153`.
- **Screen asset:** Capture `/o/{accountId}/dashboard` with its organisation name, asset preview, and route cards. A short recording can open the organisation switcher and return to a different scoped dashboard.
- **CTA:** `/select-organisation` is the safe email CTA. It resolves the organisation before sending the customer to `/o/{accountId}/dashboard`.
- **Avoid:** Avoid "new admin area" unless stakeholders intentionally use that label outside the product. Use "the new Fixtura Members dashboard" or "your organisation workspace." Do not mention `/admin/system`.

### Templates

- **Exact feature name:** Navigation and page-help label **Templates**. The route folder is `template-builder`, but the visible page says **Templates**. Sources: `src/components/navigation/app-sidebar/_constants/sidebar-nav.ts:105-123`; `src/app/(members)/o/[accountId]/template-builder/_utils/build-template-builder-page-help-content.ts:25-31`.
- **What it lets the customer do:** The customer chooses a template style, colour layout, contrast, and background. The preview updates while they work, and saved changes apply to new graphics. Sources: `src/app/(members)/o/[accountId]/template-builder/page.tsx:3-13`; `src/app/(members)/o/[accountId]/template-builder/_utils/build-template-builder-page-help-content.ts:29-56`; `src/lib/api/hooks/account/usePutTemplateOptions.ts:12-29`.
- **What changed:** The current builder combines catalogue-based selections, media-backed backgrounds, an embedded asset preview, save feedback, and reset-to-saved behavior. Texture catalogue support landed in commit `8b1100a` on 2026-08-12. Template guidance was clarified in commit `675d6c9` on 2026-08-25. Sources: `src/app/(members)/o/[accountId]/template-builder/_components/template-builder-preview-panel.tsx:76-124`; `src/app/(members)/o/[accountId]/template-builder/template-builder-editor.tsx:812-835`.
- **Availability:** Code-confirmed live candidate for owner accounts. The page reads and saves account template options. Sources: `src/lib/api/hooks/account/useAllTemplateOptions.ts:39-70`; `src/lib/api/hooks/account/usePutTemplateOptions.ts:12-29`.
- **Limits:** The embedded preview is enabled only for cricket in the current source. The category picker removes private categories. Image background depends on an uploaded background image. The builder is unavailable in support read-only mode. No plan gate was found. Sources: `src/app/(members)/o/[accountId]/template-builder/_components/template-builder-preview-panel.tsx:76-90,121-124`; `src/app/(members)/o/[accountId]/template-builder/template-builder-editor.tsx:183-191`; `src/app/(members)/o/[accountId]/template-builder/template-builder-content.tsx:118-133`.
- **Screen asset:** Capture `/o/{accountId}/template-builder` on a cricket account with the tool rail and preview visible. Record a colour or background change, the live preview response, and **Save changes**.
- **CTA:** `/o/{accountId}/template-builder`, or `/select-organisation` when the campaign cannot resolve an account ID.
- **Avoid:** Avoid "new content template" until a stakeholder supplies the exact catalogue name and confirms its published status. Avoid "preview every sport." Do not mention animated backgrounds from the current worktree.

### Bundles and delivery controls

- **Exact feature names:** **Bundles**, **Delivery schedule**, **Organisation settings**, and **Bundle delivery profile** under **Notifications**. Sources: `src/app/(members)/o/[accountId]/bundles/_consts/index.ts:6-24`; `src/app/(members)/o/[accountId]/settings/page.tsx:5-8`; `src/app/(members)/o/[accountId]/notifications/_components/notifications-form.tsx:359-369`.
- **What it lets the customer do:** **Bundles** shows render history, status, created date, render detail, delivery links, and an **Asset Hub** action. **Delivery schedule** shows the weekly day, next-delivery timing, and run status. **Organisation settings** changes the bundle delivery day. **Bundle delivery profile** changes the addressee and delivery email. Sources: `src/app/(members)/o/[accountId]/bundles/page.tsx:5-14`; `src/app/(members)/o/[accountId]/bundles/_consts/renders-list.ts:3-30`; `src/app/(members)/o/[accountId]/bundles/_components/bundles-delivery-schedule-section.tsx:21-64`; `src/app/(members)/o/[accountId]/settings/_components/account-settings-preferences.tsx:108-144`; `src/app/(members)/o/[accountId]/notifications/_components/notifications-form.tsx:212-285`.
- **What changed:** The application now exposes delivery schedule, render history, bundle detail, and hub links inside the organisation workspace. Commit `36f0606` on 2026-05-04 added account notifications management with API integration. Commit `981e984` on 2026-06-04 replaced the old bundles data dump with the current **Bundles** screen.
- **Availability:** Code-confirmed live candidate. The routes appear in scoped navigation or the user menu. Sources: `src/components/navigation/app-sidebar/_constants/sidebar-nav.ts:85-103`; `src/components/navigation/nav-user/_utils/resolve-nav-user-menu-hrefs.ts:12-14`; `src/lib/config/account-routes.ts:35-63`.
- **Limits:** An account may have no scheduler. The external Asset Hub link depends on `NEXT_PUBLIC_BUNDLES_HUBS_URL` and a configured sport. Render history can be empty while the first bundle is pending. Saving can be forbidden separately for contact and delivery-day fields. No plan gate was found in the front end. Sources: `src/app/(members)/o/[accountId]/bundles/_consts/index.ts:11-13`; `src/lib/config/bundles-hub.ts:2-9,16-37`; `src/app/(members)/o/[accountId]/bundles/_consts/renders-list.ts:10-19`; `src/app/(members)/o/[accountId]/notifications/_components/notifications-form.tsx:112-114,319-334`.
- **Screen asset:** Capture `/o/{accountId}/bundles` with at least one render and the **Delivery schedule** strip. A second image at `/o/{accountId}/notifications` can show **Bundle delivery profile**. For video, open a render, show its asset groups, then return to **Change delivery day**.
- **CTA:** `/o/{accountId}/bundles` for history and delivered assets. Use `/o/{accountId}/settings` for the delivery day and `/o/{accountId}/notifications` for recipient details. Use `/select-organisation` when account ID resolution is unavailable.
- **Avoid:** Avoid "guaranteed weekly delivery" and "all content is stored in Fixtura Members." The UI links to an external Asset Hub, and an account can lack a scheduler or published render. Use "See your bundle history, delivery schedule, and links to delivered assets."

### Sponsors

- **Exact feature name:** Navigation label **Sponsors**. Sub-features are **Sponsor pool**, **Add a sponsor**, **Assign to positions**, an account-specific entity assignment page, and **Archived sponsors**. Sources: `src/components/navigation/app-sidebar/_constants/sidebar-nav.ts:127-153`; `src/app/(members)/o/[accountId]/manage-sponsors/_utils/build-manage-sponsors-page-help-content.ts:36-180`.
- **What it lets the customer do:** The customer uploads a sponsor once, keeps it in the pool, assigns it to primary or general positions, assigns it to a team, competition, or grade as the account model allows, previews placement, archives and restores sponsors, or permanently deletes an archived sponsor. Assignment is explicit. Sources: `src/app/(members)/o/[accountId]/manage-sponsors/_utils/build-manage-sponsors-page-help-content.ts:41-68,78-97,107-126,137-179`; `src/app/(members)/o/[accountId]/manage-sponsors/_components/placement/sponsor-slot-placement-panel.tsx:77-125`.
- **What changed:** Commit `8d62120` on 2026-05-10 added a dedicated add-sponsor route. Commit `ef558ed` on 2026-05-10 added the archive route. Later May commits reworked the pool and assignment workflow. Commit `33b5b95` on 2026-08-25 added route-specific **How this works** guidance.
- **Availability:** Code-confirmed live candidate for owner accounts. Sponsor routes and mutations are present without a front-end feature flag. Source: `src/lib/config/account-routes.ts:17-22,49-57`.
- **Limits:** An active sponsor needs a logo. Upload accepts PNG, JPEG, or WebP up to 8 MB, with a 500 by 500 source minimum and a 400 by 400 crop minimum. The position system has 4 primary and 26 general slots. Entity assignment means teams for clubs, competitions for grouped associations, and grades otherwise. Support view is read-only. A template must include the selected placement before it appears in an output. No plan or sport gate was found. Sources: `src/app/(members)/o/[accountId]/manage-sponsors/_components/editor/_utils/sponsor-editor.ts:122-139`; `src/app/(members)/o/[accountId]/manage-sponsors/_components/editor/_constants/sponsor-logo-upload.ts:9-22`; `src/lib/sponsors/position-slots.ts:19-35,59-67`; `src/app/(members)/o/[accountId]/manage-sponsors/_utils/sponsor-assignment-target-copy.ts:21-52`; `src/app/(members)/o/[accountId]/manage-sponsors/_components/overview/manage-sponsors-workspace.tsx:15-46`.
- **Screen asset:** Capture a populated `/o/{accountId}/manage-sponsors` pool and the preview. The best short recording moves from the pool to **Assign to positions**, opens **Preview**, and shows the archive.
- **CTA:** `/o/{accountId}/manage-sponsors`, or `/select-organisation` when account ID resolution is unavailable.
- **Avoid:** Avoid "sponsors automatically appear," "unlimited placements," "works on every graphic," and generic "assign sponsors to clubs." A sponsor must be active, have a logo, have an assignment, and use a placement supported by the template.

### Account Settings for the current user

- **Exact feature name:** **Account Settings**. This is self-service profile and sign-in security, not user management. Sources: `src/app/(members)/o/[accountId]/account/page.tsx:7-15`; `src/components/navigation/nav-user/_utils/resolve-nav-user-menu-hrefs.ts:4-6`.
- **What it lets the customer do:** The signed-in user can change their display name, login email, and password. Sources: `src/app/(members)/o/[accountId]/account/_components/AccountSecurityContent.tsx:105-158`; `src/app/(members)/o/[accountId]/account/_components/AccountSignInSecuritySection.tsx:22-83`.
- **What changed:** The current organisation-scoped account page puts profile and sign-in security inside Fixtura Members. The repository does not supply a reliable comparison to the former product beyond the new scoped route.
- **Availability:** Code-confirmed live candidate for the signed-in user.
- **Limits:** The feature manages only the current user. No production invitation, member list, roles, permissions, or user-removal workflow was found.
- **Screen asset:** Capture `/o/{accountId}/account` only if the campaign mentions self-service profile and sign-in security.
- **CTA:** `/o/{accountId}/account`, or `/select-organisation` when account ID resolution is unavailable.
- **Avoid:** Avoid "user management," "invite users," "manage team access," and "roles and permissions." Use "Manage your own profile and sign-in security."

## Testing, planned, internal, or unconfirmed

### AI Pressbox and article types

- **Status:** Unconfirmed. Do not include in the email from this evidence.
- **Evidence:** A repository-wide search for `AI Pressbox` and `Pressbox` finds no customer route, component, help text, or article-type catalogue. The only customer-facing article reference is the label **AI articles** beside `ai_articles_count` in bundle render detail. Sources: `src/app/(members)/o/[accountId]/bundles/_consts/render-detail.ts:5-12`; `src/app/(members)/o/[accountId]/bundles/_components/bundles-render-detail-summary.tsx:12-16`; `src/types/api/account.ts:1077`.
- **What is needed:** Product or CMS owners must provide the exact feature name, published article types, plan and sport eligibility, customer route or external Asset Hub URL, and a production account that shows the feature.
- **Avoid:** Avoid all Pressbox and article-type claims until those details are supplied. An article count does not prove a customer creation workflow or named article types.

### A named new content template

- **Status:** Unconfirmed as a distinct item. Do not call any template "new" without a catalogue record or release decision.
- **Evidence:** **Templates** is live as a builder. The catalogue is server-provided and filters private categories, but the application source does not name one catalogue item as the new customer template. Source: `src/app/(members)/o/[accountId]/template-builder/template-builder-editor.tsx:183-191`.
- **What is needed:** Supply the exact published template category name and slug, the previous template it replaces, supported sports and composition types, plan access, and a production account with that category selected.
- **Avoid:** Avoid "the new content template" as a stand-alone claim. Market the verified **Templates** builder unless the catalogue item is confirmed separately.

### Animated backgrounds

- **Status:** In development in the reviewed worktree. Do not promote.
- **Evidence:** The worktree contains uncommitted changes in template builder state, save validation, preview mapping, API types, and a new untracked animation picker. It also contains an untracked handoff dated 2026-08-28. None of this is in baseline commit `80e66c6`.
- **What is needed:** Commit and deploy the change, confirm the CMS catalogue and save contract, then smoke-test selection, save, reload, preview, and rendered output in production.

### Internal system tools

- **Status:** Internal and development-gated. Do not promote to customers.
- **Exact names:** **System Tools**, **System Inspector**, and **Fetch Health**. Sources: `src/app/(members)/admin/system/page.tsx:10-42`; `src/components/navigation/nav-system/_constants/nav-system-ui.ts:7-28`.
- **Evidence:** The **Admin** sidebar group renders only when `NEXT_PUBLIC_ENABLE_DEV_SANDBOX` is `true`. The pages describe infrastructure debugging, cache inspection, and fetch health. The route registry still marks the admin fetch-health endpoint as `planned`. Sources: `src/components/navigation/app-sidebar/_components/app-sidebar-admin-menu.tsx:13-25`; `src/lib/dev-sandbox.ts:1`; `src/app/(members)/admin/system/page.tsx:75-84`; `src/lib/api/routes/route-definitions.ts:775-784`.
- **Avoid:** Do not use these screens as evidence for a "new admin area." They are not a customer feature.

### Customer user management

- **Status:** Not implemented in the production members routes found here. Do not promote.
- **Evidence:** Production navigation has no users or members section. Searches find no production invite, role, membership, or removal workflow. **Account Settings** only edits the current user.
- **What is needed:** A production route and API contract for member lists, invitations, role changes, and removals, plus permission and plan rules.

## Production confirmation checklist

Before the email is locked:

1. Sign in to production with a normal owner account that has two organisations.
2. Confirm `/select-organisation`, `/create-organisation`, and one `/o/{accountId}/dashboard` route.
3. Confirm Vision loads competitions, grade fixtures, and one fixture. Queue only a safe non-destructive refresh and verify the status response.
4. Confirm the Templates page loads the published catalogue, previews a cricket asset, saves one reversible change, and reloads that change.
5. Confirm Bundles shows a render, a working Asset Hub link, and the expected delivery day. Confirm Notifications saves to a test recipient if allowed.
6. Confirm a sponsor can move through pool, assignment, preview, archive, and restore in a test account.
7. Ask the product or CMS owner to confirm whether AI Pressbox and a named new content template exist outside this repository.
8. Capture screenshots only after the production account, sport, and data are representative. Remove personal email addresses and private competition data from campaign images.

## Reproduction commands

These commands were used against the source baseline and worktree:

```powershell
git rev-parse HEAD
git status --short
rg -ni "AI Pressbox|Pressbox|article type|article types" src docs .scratch .comms
rg -n "Select organisation|Create organisation|Vision|Templates|Sponsors" src/components/navigation
rg -n "sync|scrape|PlayHQ" "src/app/(members)/o/[accountId]/season"
rg -n "delivery|Bundle delivery profile|Asset Hub" "src/app/(members)/o/[accountId]"
git log --all --date=short --pretty=format:'%h %ad %s'
```
