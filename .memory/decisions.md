# Decisions

## 2026-04-30 — Production brand logo uses onboarding Step 2 (M1 + W2), not `PATCH /branding`

**Decision:** The members **Brand Logo** screen (`/o/[accountId]/brand-logo`) persists logo changes via **`POST …/onboarding/step-2/upload`** (M1) and **`PATCH …/onboarding/step-2`** with `logoMediaId`, using `useUpdateOnboardingStep2`. **`PATCH /api/accounts/:accountId/branding`** remains palette + template mode only until CMS extends that contract.

**Why:** Matches the implemented Strapi/onboarding handoff; the hook already invalidates branding reads after W2.

**Tradeoffs:** Product naming references “onboarding” for ongoing maintenance; if CMS restricts M1/W2 after wizard completion, FED must migrate to an extended branding PATCH or dedicated logo route (documented in `.comms/responses/brand-logo-cms-fed-briefing.md`).

---

## 2026-04-30 — SidebarProvider applies default `--sidebar-width` via `className`, not inline

**Decision:** `SidebarProvider` sets default `--sidebar-width` and `--sidebar-width-icon` on the wrapper using Tailwind arbitrary properties in `className` (`[--sidebar-width:16rem]`, `[--sidebar-width-icon:3rem]`). The merged `style` object no longer injects those keys by default; callers pass `style` only for other variables (or to force `--sidebar-width` inline when needed).

**Why:** Inline custom properties on the same element beat class-based breakpoints, so responsive utilities such as `md:[--sidebar-width:…]` could not override members-shell width until defaults moved off inline.

**Tradeoffs:** Call sites must use `className` for responsive width tuning; explicit `style={{ "--sidebar-width": "…" }}` still overrides when required. Mobile `SheetContent` continues to set its own `--sidebar-width` for the drawer.

---

## 2026-04-29 — Members dashboard is UI-first; raw payloads are collapsed debug with token redaction

**Decision:** The members dashboard route (`/o/[accountId]/dashboard`) is implemented as a structured UI-first surface (header, KPI strip, activity table, account summary, branding), while raw API payload dumps are moved into a collapsed developer section. Legacy payload dumps must redact token values via the existing redaction helper.

**Why:** Keeps the dashboard aligned with product-facing member experience while preserving developer visibility during migration from JSON-first placeholders.

**Tradeoffs:** Adds component/view-model structure to maintain; debug visibility policy (`development` only vs `?debug=1`) still needs explicit environment agreement.

---

## 2026-04-29 — Route lab branding: template-mode slug drives shared contrast preview helpers

**Decision:** Contrast preset behaviour for branding UX (contrast selector inset list, template-mode card styling, and `FixturaAssetColorPreview`) is derived from the CMS **template mode slug** via shared helpers in `@/components/pickers/template-mode/_utils` (`templateModeContrastVariant`, `templateModeUsesDarkTitlesOnGradient`, `templateModeUsesDarkLogoBackdrop`, etc.), rather than re-implementing rules per component.

**Why:** One mapping keeps row styling, mock asset preview (titles, logo strip, glass + solid discs), and confirmation copy aligned as presets or slug naming evolve.

**Tradeoffs:** `brand-color` depends on picker `_utils` for preview semantics; if layering matters later, equivalent helpers could move under `@/lib/branding/` without changing slug rules.

---

## 2026-04-29 — Tailwind v4 color system uses token modules + theme mappings

**Decision:** Tailwind v4 color variations are treated as token-driven (`@theme inline` + `--color-*` mappings) and the global styling setup is split into dedicated modules: `src/app/styles/theme-tokens.css`, `src/app/styles/color-variables.css`, and `src/app/styles/color-utilities.css`, imported by `src/app/globals.css`.

**Why:** Restores clear ownership of where color classes come from in v4, reduces `globals.css` bloat, and makes it easier to add/maintain shade variations (for example `primary-600`) without mixing unrelated concerns.

**Tradeoffs:** Additional files increase import-surface management, and shade classes still require explicit token + mapping definitions (they are not auto-generated from a legacy config object).

---

## 2026-04-29 — Members grade Sync batches two CMS queue triggers

**Decision:** On the members **grade** page, the single **Sync** action (after confirmation) calls **both** the CMS **teams lookup** trigger (competition-scoped) and the **fixture discovery** trigger (grade document id) in parallel (`Promise.allSettled`), then refetches season-hub grade and fixtures when at least one request succeeds. User-facing copy describes **resyncing the grade**, not two separate backend jobs.

**Why:** One CTA matches user mental model; both queues are still required to refresh teams and fixtures for the experience the page presents.

**Tradeoffs:** Partial failure is possible; UI shows a success toast plus an error when only one path fails. Competition-scoped team refresh still affects other grades under the same competition (unchanged CMS contract).

---

## 2026-04-28 — Season-hub fixture detail: client-side payload normalization

**Decision:** Fixture detail responses are normalized in **`unwrapSeasonHubFixturePayload`** and **`extractFixtureRecord`** (`src/app/(members)/o/[accountId]/season/_components/_utils/season-fixture.ts`) to accept multiple envelopes (`json`, `data`, `attributes`), a **flattened** match DTO (no nested `fixture` key), and a shallow scan of top-level object values when the real payload is nested one level deep.

**Why:** The BFF forwards Strapi JSON as-is; observed shapes differ between routes and serializers, which broke the route-lab fixture page when only a single shape was assumed.

**Tradeoffs:** Client logic is more complex and must stay in sync with upstream changes until the API exposes one canonical fixture-detail contract; then unwrap logic can shrink or move server-side.

---

## 2026-04-28 — Page-header reference naming + copy token convention

**Decision:** Kitchen sink page header variants use a canonical reference naming format **`page.header.<variant>[.<modifier>]`** and each variant section exposes a copy-to-clipboard reference token via **`PageHeaderReferenceName`** (`src/app/sandbox/kitchen-sink/page-headers/page-header-reference-name.tsx`).

**Why:** Mirrors the successful cards reference pattern, gives product/design/dev a shared vocabulary, and makes it easy to cite exact header patterns in tickets, docs, and implementation reviews.

**Tradeoffs:** Naming governance is required to avoid token sprawl and near-duplicates; future variant additions should follow the same namespace to stay coherent.

---

## 2026-04-28 — Sandbox tools shell: document scroll, not scrollable main column

**Decision:** [`SandboxToolsShell`](src/components/dev/sandbox-tools-shell.tsx) no longer applies **`overflow-y-auto`** on the content **`<main>`**; tall pages scroll with the **document** instead of a nested main-column scrollbar.

**Why:** Prefer a single scroll surface for dev/sandbox tool layouts; the previous pattern pinned main to the viewport beside an **`h-screen`** sidebar and produced an inner scrollbar.

**Tradeoffs:** Sticky sidebar behavior on very long pages may differ from the old viewport-locked main pane; sidebars still use **`overflow-y-auto`** only when the nav list itself is taller than the viewport.

---

## 2026-04-25 — Season route access gate uses onboarding `isSetup` completion

**Decision:** The members Season area (`/o/[accountId]/season`) is locked unless onboarding-state reports **`isSetup === true`**. Wizard completion alone does not unlock Season.

**Why:** Product requested Season to remain unavailable while setup/data preparation is still in progress, even if the account is otherwise reachable.

**Tradeoffs:** This creates a route-specific stricter gate than wizard-complete access; users may see other scoped areas while Season remains locked, which can feel inconsistent unless messaging is clear.

---

## 2026-04-20 — Template pattern picker uses TanStack Query UI cache selection

**Decision:** The new `template-pattern` picker package stores selected id in TanStack Query UI cache (`queryKeys.ui.templatePatternPickerSelectedId`) via `useTemplatePatternPickerSelection`, with value shape `string | null` and fallback resolution in `useTemplatePatternPickerList`.

**Why:** Keeps selection shared and consistent across select/cards/detail variants while making parent pages thin consumers with reusable picker components.

**Tradeoffs:** UI state depends on cache-key discipline; broad cache reset/invalidation flows must not clear UI-only picker keys unintentionally.

---

## 2026-04-25 — Season feature component layering uses `_constants`/`_hooks`/`_types`/`_utils`

**Decision:** Season route components under `src/app/(members)/o/[accountId]/season/_components` are organized around explicit support folders: `_constants` (copy/text tokens), `_types` (props and shared shapes), `_utils` (pure parsing/format helpers), and `_hooks` (derived view-state composition), while top-level component files remain orchestration-focused.

**Why:** Reduces per-file complexity, improves testability/reuse, and keeps hook/state derivation and data-shaping logic out of JSX-heavy render files.

**Tradeoffs:** Increases file count and import-management overhead; requires strict lint discipline (import ordering + hook call order) to avoid regressions during refactors.

---

## 2026-04-25 — Route-lab season FE-first layout with explicit debug isolation

**Decision:** In `src/app/sandbox/route-lab/season/575/*`, primary page content should mirror FE user-facing UI (clean header/title and user-focused sections), while all developer debugging affordances (endpoint scope, refetch debug control, raw payload views) are rendered in dedicated bottom-of-page debugging blocks using `FeedbackCardTinted` with `kind="critical"`.

**Why:** Keeps route-lab suitable for FE UX validation without losing developer observability; makes debug intent explicit and avoids dev text leaking into user-facing sections.

**Tradeoffs:** Slightly more page structure and shared-component ceremony is required; duplicated FE + debug sections can increase maintenance when route content changes.

---

## 2026-04-20 — Template palette picker uses TanStack Query UI cache selection

**Decision:** The new `template-palette` picker package stores selected id in TanStack Query UI cache (`queryKeys.ui.templatePalettePickerSelectedId`) via `useTemplatePalettePickerSelection`, with value shape `string | null` and fallback resolution in `useTemplatePalettePickerList`.

**Why:** Keeps selection shared and consistent across select/cards/detail variants while making parent pages thin consumers with reusable picker components.

**Tradeoffs:** UI state depends on cache-key discipline; broad cache reset/invalidation flows must not clear UI-only picker selection keys unintentionally.

---

## 2026-04-15 — Carousel prev/next: keep vertical centering on hover (override Button translate)

**Decision:** Horizontal [`CarouselPrevious`](src/components/ui/carousel.tsx) and [`CarouselNext`](src/components/ui/carousel.tsx) append Tailwind classes **`hover:-translate-y-1/2`**, **`focus-visible:-translate-y-1/2`**, **`disabled:hover:-translate-y-1/2`**, and **`hover:shadow-xs`** alongside **`top-1/2 -translate-y-1/2`**. Shared [`Button`](src/components/ui/button.tsx) uses **`hover:-translate-y-px`**, which otherwise overrides the transform and makes arrows jump vertically on hover.

**Why:** Carousel positioning depends on **`translateY(-50%)`**; button hover utilities must not replace it.

**Tradeoffs:** Duplicates transform intent if **`Button`** drops hover translate later; vertical-orientation carousel buttons unchanged (different transform axis).

---

## 2026-04-15 — Template category picker: client selection in TanStack Query cache as `string | null`

**Decision:** Shared UI selection for template category pickers uses **`useQuery`** on [`queryKeys.ui.templateCategoryPickerSelectedId`](src/lib/api/query/query-keys.ts) with **`useTemplateCategoryPickerSelection`** ([`use-template-category-picker-selection.ts`](src/components/pickers/template-category/use-template-category-picker-selection.ts)). Cached value type is **`string | null`** (`null` = no selection). **`queryFn`** returns `getQueryData(queryKey) ?? null` (never **`undefined`**) so TanStack Query v5’s “query data cannot be undefined” rule is satisfied. **`setQueryData`** is called with **`id ?? null`**. Do not invalidate this key in broad cache-reset flows.

**Why:** One global selection across picker variants without React context; avoids `undefined` as successful query data, which v5 rejects.

**Tradeoffs:** Client/UI state lives in the server-state cache; misuse (invalidation) could clear selection; alternative would be context or URL state.

---

## 2026-04-14 — Remotion preview: host style isolation without iframe

**Decision:** The in-app Remotion preview uses **`#remotion-preview-root`** as the immediate wrapper around **`@remotion/player` `<Player />`**, with **`not-prose`** on that element, plus co-located scoped CSS in [`src/components/remotion/remotion-preview.css`](src/components/remotion/remotion-preview.css) ( **`box-sizing`** on the root and descendants; margin reset for headings, paragraphs, lists, **`figure`**; **`max-width: none`** on **`img`**, **`svg`**, **`video`**, **`canvas`**). **Do not use an iframe** for this isolation layer. Optional follow-ups: extend the reset if host selectors still leak ([`.comms/Remotion Style Isolation Handoff.md`](.comms/Remotion%20Style%20Isolation%20Handoff.md) Phase 2); Tailwind prefix in **`@fixtura/remotion-assets`** if utility collisions persist (Phase 3).

**Why:** Host globals and Tailwind preflight can alter composition typography and media sizing; an ID-scoped reset overrides those rules without a separate document context.

**Tradeoffs:** A fixed **`id`** assumes at most one preview per page; multiple instances would need generated IDs or a class-based scope. The reset is a baseline, not a guarantee against every future host rule.

---

## 2026-04-14 — Remotion in-app preview: composition matches `@fixtura/remotion-assets` handoff

**Decision:** The Next app’s `@remotion/player` integration for `FixturaTemplateScene` uses **`compositionWidth={1080}`** and **`compositionHeight={1350}`**, **FPS 30**, full dataset via **`inputProps={{ data }}`**, and duration from **`getProductionCompositionFromData(data)`**. Canonical contract: [`.comms/Guide to Remotion Set up handoff.md`](.comms/Guide%20to%20Remotion%20Set%20up%20handoff.md) §1–2 and §13.

**Why:** Compositions in the package are authored for **1080×1350**; using **1920** height mis-sized the canvas and caused incorrect aspect ratio / layout.

**Tradeoffs:** If the Remotion package ever changes default resolution, this app must update constants and docs in lockstep.

---

## 2026-04-09 — Onboarding lifecycle: dashboard when wizard complete; `isSetup` non-blocking for routing

**Decision:** [`resolveAccountEntry`](src/lib/onboarding/resolve-account-entry.ts) returns **`dashboard`** when the onboarding wizard is complete (`hasCompletedOnboardingWizard` or `onboardingWizardStatus === "completed"`), and **`wizard`** otherwise. **`isSetup`**, initial setup, and initial data-fetch **failure** states **do not** change routing. **`AccountEntryIntent`** is only **`dashboard` \| `wizard`**; **`accountEntryIntentAfterWizardConfirm`** was removed — after **W4** confirm, navigation goes to **`accountScopedRoutes.dashboard`**. **`OrgAccessBoundary`** and **`/select-organisation`** use the same resolver. Optional **`/create-organisation/setup`** remains for recovery; wizard-complete visits redirect to the dashboard. **[`ScopedOnboardingSyncBanner`](src/components/scoped-onboarding-sync-banner.tsx)** in the members shell shows info/destructive alerts when scoped, wizard-complete, and **`isSetup === false`** (or pipeline failed on onboarding-state).

**Why:** Aligns with [`.comms/CODEX/ONBOARDING_STRUCTURE_REVIEW_SETUP_REDIRECT.md`](.comms/CODEX/ONBOARDING_STRUCTURE_REVIEW_SETUP_REDIRECT.md): background sync is a **status signal**, not a hard gate.

**Tradeoffs:** **Supersedes** 2026-04-08 decisions that gated **`/o/...`** on **`isSetup === true`** or routed wizard-done accounts to **`/create-organisation/setup`**. Pipeline failure is surfaced in the shell banner, not by blocking dashboard entry.

---

## 2026-04-08 — Epic 2: post-W4 and preparation routes align with `isSetup` only

**Decision:** After **W4** confirm, **`handleConfirmSuccess`** uses **`accountEntryIntentAfterWizardConfirm`** ([`resolve-account-entry.ts`](src/lib/onboarding/resolve-account-entry.ts)): navigate with **`accountEntryPath`** — **`dashboard`** only when refetched **`onboarding-state`** has **`isSetup === true`**; **`preparation` / `preparationFailed`** when **`resolveAccountEntry`** returns those; if the refetch is still stale and resolves to **`wizard`**, default to **`preparation`** so users are not left on the review step implying dashboard access. On **`/create-organisation/setup`**, redirect to the scoped dashboard **only** when **`onboarding-state` reports `isSetup === true`**. When **`setup-status`** is **`ready`** but **`isSetup`** is still false, **`invalidateQueries`** on **`onboarding-state`** (do **not** navigate on **`ready`** alone).

**Why:** Matches Epic 1 gate and [`.comms/CODEX/ONBOARDING_IMPLEMENTATION_BACKLOG.md`](.comms/CODEX/ONBOARDING_IMPLEMENTATION_BACKLOG.md) Epic 2; avoids **`hasCompletedOnboardingWizard`** / pipeline **`ready`** racing ahead of **`isSetup`**.

**Tradeoffs:** Brief wait on preparation if **`isSetup`** lags **`ready`**; acceptable for consistent access control.

---

## 2026-04-08 — Account-scoped app only when `isSetup === true` (onboarding route recovery)

**Decision:** **Dashboard** and all **`/o/[accountId]/…`** routes are allowed only when **`isSetup === true`**. Wizard completion alone does **not** open the scoped members shell. The app uses **`GET …/onboarding/onboarding-state`**, **`resolveAccountEntry`** / **`accountEntryPath`** ([`src/lib/onboarding/resolve-account-entry.ts`](src/lib/onboarding/resolve-account-entry.ts)): **`/select-organisation`** resolves lifecycle per tile before navigation; **`OrgAccessBoundary`** re-validates and redirects unfinished accounts to **`/create-organisation?accountId=`** or **`/create-organisation/setup?accountId=`**; the setup page polls via **`SetupStatusCard`** until **`onboarding-state` `isSetup === true`** (see Epic 2 entry: **`setup-status` `ready`** alone does not open the dashboard). **`create-organisation`** accepts **`?accountId=`** so multi-account selection matches the active onboarding account.

**Why:** Matches [`.comms/CODEX/ACCOUNT_ONBOARDING_ROUTE_RECOVERY_PLAN.md`](.comms/CODEX/ACCOUNT_ONBOARDING_ROUTE_RECOVERY_PLAN.md) (and related lifecycle handoff): unfinished accounts must not leak into the scoped app.

**Tradeoffs:** **Supersedes** the same-day decision “scoped members after wizard complete even if `!isSetup`” for **routing**; product/CMS must treat **`isSetup`** as the gate for scoped entry (optional dashboard banner when `!isSetup` is moot for access control).

---

## 2026-04-08 — Scoped members app (`/o/[accountId]/…`) after wizard complete, even if `isSetup` is false

**Decision:** Users may navigate to the **account-scoped members area** (e.g. **`/o/[accountId]/dashboard`**) when **`hasCompletedOnboardingWizard === true`**, even when **`isSetup`** is still **false**. Initial setup / initial data fetch may continue in the background; the wizard is treated as having collected the data needed to use the account. Implemented in [`create-organisation-wizard.tsx`](<src/app/(members)/create-organisation/_components/create-organisation-wizard.tsx>) via **`canOpenScopedApp`** (`hasCompletedOnboardingWizard` or **`isSetup`**): redirect after confirm, on cold load of create-organisation, and full-page loader while redirecting. The blocking **preparation-only** screen (wizard done but setup not complete) was **removed** in favour of sending users into the app.

**Why:** Product confirmed (Q11–Q13) that wizard completion is sufficient for full account viewing; background fetch is non-blocking for entry.

**Tradeoffs:** Dashboard and sibling routes may show data that is still backfilling; optional soft UI (banner) can warn when **`!isSetup`** without blocking navigation.

---

## 2026-04-08 — Onboarding Step 4 (review): no embedded setup-status card; merged footer copy; review colour resolution

**Decision:** The **Review and confirm** step (**W4**) does **not** render **`SetupStatusCard`** (S1 polling UI); post-**W4** success shows only the success **`InlineAlert`** until redirect. The **Finish** footer helper text is a **single sentence** inside the shared **`Card`** component (merged “dashboard / backend preparation” copy). Brand **primary/secondary** swatches on review are resolved by **`themeColoursForReviewStep`**: use **`GET …/branding`** **`data.theme.theme`** when both colours parse as hex; otherwise, if **`data.theme.id`** matches a row in **`GET …/account/onboarding/lookups/themes`**, use that catalogue row’s **`theme`** JSON (aligned with Step 2). Hex parsing accepts **3-digit shorthand** and alternate CMS keys (**`primaryColour`**, **`secondaryColour`**, etc.) via **`themeColoursFromAccountBrandingTheme`** / **`tryNormalizeHex`**.

**Why:** Product asked to drop the noisy setup block on review and consolidate legal-style copy; swatches failed when Strapi returned empty or partial **`theme.theme`** while the saved theme id still pointed at a premade catalogue.

**Tradeoffs:** Users no longer see live S1 status on the review screen (they may still see it elsewhere if reintroduced); catalogue must be loaded for the fallback path.

---

## 2026-04-08 — Onboarding Step 3 (W3): `deliveryAddress` is weekly assets email (product)

**Decision:** In create-organisation **Step 3**, the CMS field persisted as **`deliveryAddress`** on **W3** (`PATCH …/onboarding/step-3`) is the **weekly assets delivery email** in the product UI — a single-line **`type="email"`** value, not a postal address. The step collects **contact name** + that email; **Send to Me** pre-fills from the signed-in user’s email. Client-side validation requires **first name** and a **plausible email** before Next; errors use **Sonner** (`toast.error`), consistent with Step 1. The **Sign-in email** read-only block is **not** shown on Step 3 (org-creation scope).

**Why:** Product clarified assets are emailed weekly; the account owner may direct them to an address other than sign-in.

**Tradeoffs:** Strapi/API name **`DeliveryAddress`** remains; CMS and comms should document the semantic as email for this flow. Review step may still show **Email (sign-in)** separately from **Weekly assets email**.

---

## 2026-04-08 — Onboarding: canonical `Theme` JSON keys (`primary`, `secondary`, `dark`, `white`)

**Decision:** Strapi **`api::theme.theme`** **`Theme`** JSON (and L3 **`theme`** on premade rows) uses **`primary`**, **`secondary`**, **`dark`**, **`white`** as hex strings. Product defaults for **`dark`** / **`white`** when unspecified are **`#111`** and **`#FFF`** (`THEME_JSON_DEFAULT_DARK` / `THEME_JSON_DEFAULT_WHITE` in [`theme-colours-from-account.ts`](src/lib/branding/theme-colours-from-account.ts)). **`POST …/onboarding/step-2/theme`** sends the same four keys (no `primaryColor` / `secondaryColor`). Parsing may still read legacy **`PrimaryColour` / `SecondaryColour`** for primary/secondary only.

**Why:** One wire shape for GET branding, L3, and custom theme creation; removes redundant account-level colour fields and top-level L3 hex duplicates.

**Tradeoffs:** Strapi must migrate any stored `primaryColor`/`secondaryColor` theme JSON; until then only legacy CMS spellings in the parser help.

---

## 2026-04-08 — Onboarding Step 2: custom theme `name` is system-derived (user + organisation)

**Decision:** For **custom** (private) themes in create-organisation **Step 2**, the **`POST …/onboarding/step-2/theme`** **`name`** field is **not** user-editable. The app builds **`"{userPart} — {orgPart}"`** (truncated to 255 chars): **userPart** from the active **`accounts[]`** row **`FirstName`/`LastName`**, else **`user.username`**, else email local-part; **orgPart** from **`onboardingOrganisationName`**, else **`accountOrganisationDetails.Name`**. Implemented in [`build-custom-theme-name.ts`](src/lib/onboarding/build-custom-theme-name.ts) and consumed by [`wizard-step-branding.tsx`](<src/app/(members)/create-organisation/_components/wizard-step-branding.tsx>). **Skip-recreate** when colours unchanged uses **primary/secondary + `themeId`** only (not name equality).

**Why:** Product asked to stop prompting for a theme label; keeps private theme titles aligned to profile + org context already collected in onboarding.

**Tradeoffs:** Renaming in CMS/CRM later does not auto-update existing theme names unless the user recreates the theme or a future migration runs; very long combined strings are hard-truncated.

---

## 2026-04-08 — Onboarding Step 2: brand colours live on the theme only (not on the account)

**Decision:** During create-organisation **Step 2 (branding)**, primary/secondary brand colours are persisted **only** on the linked **`api::theme.theme`** (premade catalogue or private theme from **`POST …/onboarding/step-2/theme`**). **`PATCH …/onboarding/step-2` (W2)** sends **`themeId`** and **`logoMediaId`** as needed — **not** standalone **`primaryColor`/`secondaryColor`** on the account. **`GET …/branding`** supplies colours via **`data.theme.theme`** JSON (parsed by **`themeColoursFromAccountBrandingTheme`** for review and hydration).

**Why:** Single source of truth in CMS; avoids duplicating colours on the account row and drifting from the theme document.

**Tradeoffs:** Strapi must expose hex in **`theme.theme`** (and optionally on L3 rows); until CMS removes deprecated fields, the app types no longer expect account-level onboarding colour properties.

---

## 2026-04-08 — Default Card and Surface: ring + shadow-xl (not border + shadow-sm)

**Decision:** Shared **`Card`** ([`src/components/ui/card.tsx`](src/components/ui/card.tsx)) and **`Surface`** ([`src/components/ui/container.tsx`](src/components/ui/container.tsx)) default to **`border-none shadow-xl ring-1 ring-border`** instead of **`border shadow-sm`**, aligned with the kitchen-sink **Complex Composition** pattern. Components that intentionally use a classic **border** outline or dashed/left-accent frames pass **`ring-0`** (and their own **`border-*`**) so the default ring does not double the edge.

**Why:** One elevation language across the app; ring reads consistently in light/dark next to the rest of the UI kit.

**Tradeoffs:** App-wide visual shift; any screen that assumed the old subtle border must be checked (overrides preserved where already explicit).

---

## 2026-04-07 — Onboarding Phase 2: “club” org type by `account_type.id`, not label

**Decision:** In **create-organisation** Step 1, treat **club** vs **association** (and optional club under an association) using **CMS `account_type.id`**: **`id === 1`** means **club** (show association + club selectors; derive display name from selected club when present, else association). Do **not** infer club from **organisation type label** text or regex.

**Why:** Backend and Strapi use stable ids; labels can vary or be localized.

**Tradeoffs:** If CMS ever renumbers ids, the app constant must update (document in handoff).

---

## 2026-04-07 — Image crop uploader: validation and success via Sonner

**Decision:** The shared **`ImageUploaderCrop`** flow reports **pre-crop** (dropzone + file/source rules), **post-crop** (output dimensions), and **crop pipeline** failures with **`toast.error`** (Sonner), not inline destructive text under the drop zone or inside **`ImageCropDialog`**. A successful crop uses **`toast.success`** (with optional description, e.g. dimensions). **`ImageCropDialog`** does not take an inline **`validationError`** prop.

**Why:** Matches app-wide toast patterns; keeps the drop zone and dialog layout clean; failures remain visible without scrolling.

**Tradeoffs:** Dismissed toasts can be missed; parents should still use **`onError`** if they need persistent UI or logging.

---

## 2026-04-07 — Onboarding Phase 4: W3 app delivery closed; Strapi ops + QA follow

**Decision:** **Phase 4** (create-organisation Step 3 contact, **W3**, TKT-2026-ONB-005) is **closed** for application delivery (BFF `PATCH …/onboarding/step-3`, `WizardStepContact`, hooks, comms handoffs). **Strapi** enablement (**`api::account.account.updateOnboardingStep3`**), **`DeliveryAddress`** migration smoke, and **E2E** against live CMS are **ops/QA**, not open FE scope. **Canonical email (§5)** and **409** on W3 remain **product/CMS** for future revisions; Strapi v1 does **not** emit **409** on W3 per CMS response.

**Why:** Matches the Phase 3 pattern: ship app + contract docs first; validate against live backend in QA.

**Tradeoffs:** Product may later require required-field gating on Step 3 or email writes — would be a new ticket.

---

## 2026-04-07 — Onboarding Phase 3: app delivery closed; CMS E2E in QA

**Decision:** **Phase 3** (create-organisation Step 2 branding, **M1/W2**, TKT-2026-ONB-004) is **closed** for application delivery. Remaining **Strapi/CMS round-trip and edge-case behaviour** for Step 2 are owned by **testing/QA**, not held open as incomplete FE scope.

**Why:** BFF, client, and wizard Step 2 are implemented per handoff; downstream validation is standard QA against live CMS.

**Tradeoffs:** Product still tracks CMS gaps until E2E passes; issues found in QA may require BFF or UI tweaks.

---

## 2026-04-07 — Onboarding delivery: contract-first (data → CMS/API → app layer → UI)

**Decision:** Fixtura **members onboarding** should be delivered in **contract-first** order: inventory required data → define and implement CMS/API (lookups, step-scoped writes, setup status reads) → integrate BFF/`accountApi`/query keys/mutations/polling → build the visible wizard **last**. Documented in [`src/app/(members)/.comms/handoff-onboarding.md`](<src/app/(members)/.comms/handoff-onboarding.md>) Part 4.

**Why:** The flow depends on reference data, persisted fields, progress/completion semantics, and setup status; UI-first work risks throwaway screens and client-only state.

**Tradeoffs:** Slower visible progress until the backend is ready; requires CMS coordination before FE showcases UI.

---

## 2026-04-06 — Account-scoped list hooks: map 403/404 to gateway, not 400 when query params can be invalid

**Decision:** TanStack hooks for account-scoped **paginated or filtered** GET routes where HTTP **400** may mean invalid **query** parameters (e.g. Phase 7 `GET /api/accounts/:accountId/renders`) use **`selectOrgReasonFromApiStatusExcludingBadRequest`** so **400** surfaces as a normal query error. Hooks for routes where **400** reliably means invalid path **`accountId`** only keep using **`selectOrgReasonFromApiStatus`** (which maps **400** → select-org **`invalid_org`**).

**Why:** Avoids sending users to **`/select-organisation`** when they only have bad filters or pagination input.

**Tradeoffs:** Implementers must read the handoff and pick the correct helper per endpoint.

---

## 2026-04-06 — Account-scoped CMS routes: planned registry + contract doc

**Decision:** New Strapi **`/api/accounts/:accountId/*`** endpoints are registered under **`appRoutes.accounts`** in [`src/lib/api/routes/route-definitions.ts`](src/lib/api/routes/route-definitions.ts) with **`status: "planned"`** until the matching phase ships live handlers. The normative index for handoffs is [`.comms/data-fetching/account-admin-api-contract.md`](.comms/data-fetching/account-admin-api-contract.md) (with stable anchors for §7, §9–§15). UI and hooks should use [`accountScopedHttpSemantics`](src/lib/api/account-scoped-http-semantics.ts) when interpreting account-scoped HTTP status codes (401 / 403 / 400 / 404 / 500 per Phase 0).

**Why:** Phase 0 did not ship new handlers; front-load the approved pipeline (registry → client → service → hook) without pretending routes are **`ready`**, and give handoff links a single resolving document.

**Tradeoffs:** **`admin/fetch-health`** lists more **skipped** rows until phases flip to **`ready`**; services are still added per phase (no premature **`account.api`** surface for planned routes).

---

## 2026-04-05 — Application typography: semantic `Typography*` components + kitchen sink reference

**Decision:** Product UI text should prefer named exports from **`@/components/typography`** (e.g. **`TypographyPageTitle`**, **`TypographyCardTitle`**, **`TypographyLabel`**, **`TypographyMetricValue`**) with a **`Typography*`** prefix, built on **`TypographyBase`** / **`typographyBaseVariants`** (font + tone). Scale primitives **`TypographyH1`–`TypographyH5`** and **`TypographyP`** remain for compatibility. **`/sandbox/kitchen-sink/typography`** and **`.skills/patterns/typography-system.md`** are the reference; **`PageHeader`** uses semantic page title/description components.

**Why:** Matches the typography PDR: semantic intent, fewer ad hoc Tailwind text stacks, clearer LLM and review alignment.

**Tradeoffs:** More imports to learn; incremental migration—old patterns remain until files are touched.

---

## 2026-04-20 — Self-contained gradient picker uses TanStack Query UI cache selection

**Decision:** The new gradient picker package stores selected id in TanStack Query UI cache (`queryKeys.ui.templateGradientPickerSelectedId`) via `useTemplateGradientPickerSelection`, with value shape `string | null` and fallback resolution in `useTemplateGradientPickerList`.

**Why:** Keeps selection shared and consistent across select/cards/detail variants while allowing parent pages to remain thin and reusable.

**Tradeoffs:** UI state now depends on query-cache discipline; broad cache reset flows must avoid invalidating UI-only picker keys unintentionally.

---

## 2026-04-20 — Exclude vendored bundles from ESLint app-source checks

**Decision:** ESLint ignores `src/vendor/**` so generated third-party bundles (for example `src/vendor/fixtura-remotion-assets/preview.mjs`) are not linted by the project’s app-source rules. App source files continue to be linted normally.

**Why:** Vendored generated files produced high-volume `no-undef` / `no-unused-vars` diagnostics that do not represent maintainable app-code issues and are likely to reappear on vendor sync.

**Tradeoffs:** Potential issues inside vendored code will not be surfaced by the app lint run; if vendor quality checks become necessary, they should use a separate targeted lint config/process rather than modifying generated artifacts.

---

## 2026-04-05 — Favicon and app icons: canonical `public/logos` paths

**Decision:** Browser tab icons and in-app logo marks use files under **`public/logos/`** (e.g. **`favicon.ico`**, **`favicon-16x16.png`**, **`favicon-32x32.png`**, **`apple-touch-icon.png`**). Next.js **`metadata.icons`** is defined in **`src/config/metadata.ts`**; **`auth`** layout/structure and public home **`&lt;img&gt;`** reference the same **`apple-touch-icon`** path. Do not duplicate icon sets at **`public/`** root.

**Why:** One source of truth for brand exports; tab and UI stay aligned when assets are swapped.

**Tradeoffs:** PWA / manifest may later reference **`android-chrome-*`** in the same folder; env **`NEXT_PUBLIC_APP_URL`** should be set for correct **`metadataBase`** outside localhost.

---

## 2026-04-05 — Member form primary CTAs: `brand` / `accent` over `default`

**Decision:** For members-area forms, primary submit actions should use **`Button`** **`variant="brand"`** (teal) or **`variant="accent"`** (promotional / upgrade) as intent requires—not **`variant="default"`** (blue primary). **`SubmitButton`** defaults to **`brand`**. Secondary / cancel actions use **`secondary`**, **`outline`**, or **`ghost`** per hierarchy.

**Why:** Aligns product UI with Fixtura brand emphasis and keeps the blue **`default`** token for other primary surfaces; kitchen sink and route lab document the pattern.

**Tradeoffs:** Teams must choose **`brand` vs `accent`** deliberately; existing screens using **`default`** on submits should migrate over time.

---

## 2026-04-04 — Select-organisation dev simulator (`orgSim` + env)

**Decision:** Optional UI-state exercise on the real **`/select-organisation`** route uses query **`orgSim=loading|none|one|multiple|error`** only when **`NEXT_PUBLIC_SELECT_ORG_SIMULATOR`** is the literal **`true`**. Implementation lives in **`src/lib/dev/select-organisation-sim.ts`**; **`useAccountMe`** accepts **`{ enabled: false }`** while simulating so GET **`/account/me`** is not called for that view.

**Why:** Teams can validate every screen state on the production route without real account shapes; default path (flag off or param absent) stays the real API.

**Tradeoffs:** Another **`NEXT_PUBLIC_*`** flag to document; query param must not be relied on in production builds without the flag.

---

## 2026-04-04 — Persistent semantic messaging: `FeedbackCard` family

**Decision:** In-page persistent feedback (info, success, warning, error, critical, premium) uses **`@/components/ui/feedback-card`**—either **`FeedbackCard`** with **`visualVariant`** or **`FeedbackCardSoft` / `FeedbackCardTinted` / `FeedbackCardStrong`**. Reference **`/sandbox/kitchen-sink/cards`**. Short-lived confirmations and background events stay on **toasts**; field validation stays **inline**.

**Why:** One card-system surface, three visual variants for hierarchy, kitchen sink + skills give a single approved pattern (vs ad hoc banners).

**Tradeoffs:** Call sites must choose **`kind`** and variant; not a substitute for **`GridCard`** tiles or raw **`Card`** layouts.

---

## 2026-04-04 — RSC boundary: Lucide `LucideIcon` props and client `GridCard`

**Decision:** UI that passes **`LucideIcon` component references** into **`GridCard` / `GridCardIcon`** (both client components) must live in a **`"use client"`** module, or the parent page must be a client component. Thin server pages should import a small client child that owns the icon map; avoid **`visual={<GridCardIcon icon={SomeLucideIcon} />}`** from a Server Component.

**Why:** Next.js serializes server → client props; function/component values are not serializable and produce 500s (`Only plain objects…`, `Functions cannot be passed directly to Client Components`).

**Tradeoffs:** Extra client-only files for grid portals; **`metadata`** stays on the server page when the split is used.

---

## 2026-04-04 — Dev sandbox URL model (`/sandbox` tree + env gate)

**Decision:** Development sandbox routes are served only under **`/sandbox`**: portal at **`/sandbox`**, **kitchen sink** at **`/sandbox/kitchen-sink/*`**, **route lab** at **`/sandbox/route-lab/*`**. The segment **`src/app/sandbox/layout.tsx`** wraps the tree with **`DevSandboxGate`**; access requires **`NEXT_PUBLIC_ENABLE_DEV_SANDBOX`** to be the literal string **`true`** (see [`src/lib/dev-sandbox.ts`](src/lib/dev-sandbox.ts)). Public marketing chrome link “Sandbox” points to **`ROUTES.sandbox`**.

**Why:** Single discoverable entry, one layout for env enforcement, room to add more tools under the same prefix without route groups; matches product intent in [`.comms/19-Dev-Sandbox-Routes.md`](.comms/19-Dev-Sandbox-Routes.md) (env-controlled, not auth-controlled).

**Tradeoffs:** Breaks old **`/kitchen-sink`** and **`/route-lab`** bookmarks; preview/CI must set the env flag when those URLs are needed.

---

## 2026-04-04 — Sandbox shell: public chrome + full-bleed tool layouts

**Decision:** The **`src/app/sandbox/layout.tsx`** tree wraps children in **`PublicPageWrapper`** with **`contentAs="div"`** so **`PublicTopBar`** and **`PublicFooter`** apply to the portal and all tools without invalid nested **`<main>`** elements. Kitchen sink, interaction lab, and route lab use **`SandboxToolsShell`**: sidebar flush to the viewport edge (no **`PublicShellContainer`** around the whole row), main column content capped at **`max-w-[min(100%,92rem)]`**. **`PublicPageWrapper`** applies **`py-12`** only when **`contentAs="main"`**; for sandbox **`py-0`** on the content slot—**`/sandbox`** portal adds spacing via **`PublicShellContainer`** + **`py-8 md:py-12`**.

**Why:** One public chrome for the whole sandbox; more horizontal space for dev UIs; semantics-safe layout.

**Tradeoffs:** Slightly more layout composition on the portal page; tool layouts must not re-wrap with **`PublicShellContainer`**.

---

## 2026-04-03 — Members URL model (gateway + account-scoped)

**Decision:** Authenticated members UI lives under **`src/app/(members)/`**. Users land on **`/select-organisation`** after login (unless `from` is a safe **`/o/{accountId}/...`** path). Organisation-scoped pages use **`/o/[accountId]/...`** where **`accountId`** is the Strapi account id; full dashboard data loads via **`GET /api/account/organisation/[accountId]`** (BFF → CMS). Legacy flat **`/dashboard`**-style URLs redirect to the gateway.

**Why:** Matches [`.comms/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md`](.comms/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md) and [`.comms/responses/app-handoff-account-organisation-endpoint.md`](.comms/responses/app-handoff-account-organisation-endpoint.md) (two-step `account/me` + organisation aggregate).

**Tradeoffs:** Account ids appear in URLs; middleware cannot validate ownership (handled by CMS + **`OrgAccessBoundary`**). **Create organisation** remains TBC until CMS documents an API.

---

## 2026-04-20 — Template image picker uses TanStack Query UI cache selection

**Decision:** The new `template-image` picker package stores selected id in TanStack Query UI cache (`queryKeys.ui.templateImagePickerSelectedId`) via `useTemplateImagePickerSelection`, with value shape `string | null` and fallback resolution in `useTemplateImagePickerList`.

**Why:** Keeps selection shared and consistent across select/cards/detail variants while making parent pages thin consumers with reusable picker components.

**Tradeoffs:** UI state depends on cache-key discipline; broad cache reset/invalidation flows must not clear UI-only picker selection keys unintentionally.

---

## 2026-04-20 — Template mode picker uses TanStack Query UI cache selection

**Decision:** The new `template-mode` picker package stores selected id in TanStack Query UI cache (`queryKeys.ui.templateModePickerSelectedId`) via `useTemplateModePickerSelection`, with value shape `string | null` and fallback resolution in `useTemplateModePickerList`.

**Why:** Keeps selection shared and consistent across select/cards/detail variants while making parent pages thin consumers with reusable picker components.

**Tradeoffs:** UI state depends on cache-key discipline; broad cache reset/invalidation flows must not clear UI-only picker selection keys unintentionally.

---

## 2026-04-20 — Template noise picker uses TanStack Query UI cache selection

**Decision:** The new `template-noise` picker package stores selected id in TanStack Query UI cache (`queryKeys.ui.templateNoisePickerSelectedId`) via `useTemplateNoisePickerSelection`, with value shape `string | null` and fallback resolution in `useTemplateNoisePickerList`.

**Why:** Keeps selection shared and consistent across select/cards/detail variants while making parent pages thin consumers with reusable picker components.

**Tradeoffs:** UI state depends on cache-key discipline; broad cache reset/invalidation flows must not clear UI-only picker selection keys unintentionally.

---

## 2026-04-20 — Template particle picker uses TanStack Query UI cache selection

**Decision:** The new `template-particle` picker package stores selected id in TanStack Query UI cache (`queryKeys.ui.templateParticlePickerSelectedId`) via `useTemplateParticlePickerSelection`, with value shape `string | null` and fallback resolution in `useTemplateParticlePickerList`.

**Why:** Keeps selection shared and consistent across select/cards/detail variants while making parent pages thin consumers with reusable picker components.

**Tradeoffs:** UI state depends on cache-key discipline; broad cache reset/invalidation flows must not clear UI-only picker selection keys unintentionally.

---

## 2026-04-20 — Template patterns UI endpoint uses dedicated top-level API domain

**Decision:** Integrate the new catalog route under a dedicated top-level domain (`appRoutes.templatePatterns.ui`, `queryKeys.templatePatterns.ui`, `templatePatternsApi`, `useTemplatePatternsUi`) with `domain: "template-patterns"` and a dedicated BFF proxy at `GET /api/template-patterns/ui` rather than nesting inside `accountApi`.

**Why:** Template pattern lookup is authenticated but not account-scoped, and this keeps parity with existing template `/ui` endpoint architecture (gradients, images, modes, noises, palettes, particles) for consistent route/service/hook wiring.

**Tradeoffs:** Adding a new domain requires touching shared route typing (`AppRouteDefinition.domain` union) and keeping naming consistent across registry, query keys, and Data Lab links to avoid drift.

---

## 2026-04-25 — Data Lab Season pages standardize on Kitchen Sink Surface and Stat Card patterns

**Decision:** The `/sandbox/data-lab/season/575/*` pages use shared Kitchen Sink-aligned UI primitives: `PageHeader` + `Section` + `Surface` for layout containers, Surface-header body composition for endpoint/payload blocks, and stat-card style metric tiles for overview counts.

**Why:** Keeps season sandbox pages visually consistent with approved application design options shown in Kitchen Sink (`/sandbox/kitchen-sink/lists` and `/sandbox/kitchen-sink/cards`) while preserving the route-contract testing purpose.

**Tradeoffs:** Slightly higher UI abstraction in sandbox pages; if Kitchen Sink container patterns evolve, season data-lab pages should be updated to stay aligned.
