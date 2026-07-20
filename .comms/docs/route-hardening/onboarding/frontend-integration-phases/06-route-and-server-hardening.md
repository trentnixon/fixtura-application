# Phase 06: Route and Server-Side Hardening

## Goal

Ensure every member-facing account operation obtains its selected account from explicit routing or explicit call arguments, never from authentication or a compatibility fallback.

## Scope

Audit and update:

- `/o/:accountId/...` pages and layouts;
- links, buttons, breadcrumbs, and navigation helpers;
- redirects and lifecycle routing;
- server components, loaders, and metadata functions;
- server actions and route handlers;
- middleware and access guards;
- BFF calls made from server-side frontend code;
- billing, checkout, subscriptions, invoices, settings, branding, media, sponsors, renders, analytics, fixtures, tracking, and scheduler entry points.

## Tasks

- Validate route account ids consistently.
- Pass the explicit route id through every downstream account-scoped operation.
- Remove silent fallback to another owned account on malformed, missing, inaccessible, or stale ids.
- Treat cross-user and nonexistent account ids identically.
- Confirm redirects preserve the intended id and never substitute `accounts[0]`.
- Confirm server actions bind or validate the route account instead of trusting a body override.
- Confirm authenticated payloads are never publicly cached.
- Verify browser/member calls use user JWT ownership.
- Confirm `INTERNAL_CMS_TOKEN` is absent from client bundles, public configuration, and frontend logs.
- Compare frontend route consumers with the CMS ownership-audit ledger.

## Special handling

Legacy account-scoped 404s may lack `ACCOUNT_NOT_FOUND`; normalize only with endpoint context. Nested resources such as renders may have their own not-found state and must retain resource-specific behavior.

## Tests

- Missing/malformed route id.
- Owned explicit id.
- Nonexistent id.
- Cross-user id with identical safe UI.
- Redirects retain the chosen id.
- Server actions cannot switch account through body data.
- No fallback occurs after ownership failure.
- Representative high-risk routes use their explicit id.

## Acceptance criteria

- Every confirmed member account route has an explicit account-id source.
- No server-side consumer derives selection from user identity alone.
- Ownership failures neither enumerate nor redirect into another account.
- CMS ledger comparison has no unexplained frontend consumer gaps.

## Handoff to Phase 07

Provide the complete list of account-scoped route families and their data hooks so every cache/state namespace can be checked against them.

---

## Phase 06 completion handoff — 2026-07-13

### Outcome

**Phase complete**

Organisation access treats nonexistent and cross-user ownership failures identically (`not_found` gateway + shared copy). `isAccountUnavailableError` is wired into organisation-context and OrgAccessBoundary onboarding-state errors. The only `"use server"` account action (`createStrapiStripeInvoice`) requires a matching `routeAccountId`. CMS dual-path `getDownloads` / `INTERNAL_CMS_TOKEN` have no FE consumers under `src/`.

### Acceptance criteria

| Criterion                                                              | Status                                                                                              |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Every confirmed member account route has an explicit account-id source | Pass — `/o/[accountId]` layout + pages use route params; BFF path id                                |
| No server-side consumer derives selection from user identity alone     | Pass — Stripe invoice bound to route id; sole `"use server"` account action                         |
| Ownership failures neither enumerate nor redirect into another account | Pass — 403/404 → identical `not_found`; no `accounts[0]` fallback                                   |
| CMS ledger comparison has no unexplained frontend consumer gaps        | Pass — no FE `getDownloads` / `INTERNAL_CMS_TOKEN`; members use JWT + `/api/accounts/:accountId/**` |

### Findings and implementation

- Files changed:
  - `src/lib/config/gateway-reasons.ts` (+ test) — identical copy for `forbidden`/`not_found`; `selectOrgOwnershipUnavailableReason`
  - `src/lib/api/hooks/account/useAccountOrganisationContext.ts` (+ test) — ownership mapper + `isAccountUnavailableError`
  - `src/components/auth/org-access-boundary.tsx` (+ test) — onboarding-state account-unavailable → gateway
  - `src/app/(members)/o/[accountId]/billing/create/actions/create-stripe-invoice.ts` (+ test) — `routeAccountId` binding
  - `src/app/(members)/o/[accountId]/billing/create/create-subscription-wizard.tsx` — pass route id
  - Docs: this file; `01-audit-ledger.md`; phase index README

### Phase 07 starting inputs — route families and cache namespaces

**Route families under `/o/[accountId]/…`:**

- dashboard
- billing (+ create / history / success / cancel)
- settings, account, notifications
- branding, brand-logo, club-logos
- media-gallery
- manage-sponsors (+ assign / archive), add-sponsor
- template-builder
- bundles (+ `[renderId]`)
- season (+ competitions / grades / fixtures)

**Account-scoped query-key namespaces (`queryKeys`):**

- `account.organisationContext`, `onboardingState`, `setupStatus`, `settings`, `notifications`
- `branding`, `mediaLibrary` / `mediaLibraryItem`
- `sponsors`, `sponsorEntityTargets`, `clubLogosDirectory`, sponsor allocations
- `billing`, `billingAvailableTiers`, `billingInvoiceRequests`, `billingOrders`
- `scheduler`, `renderToken`, `renders`, `renderDetail`, `analyticsOverview`, `allTemplateOptions`
- `seasonHub.*` (recon, stats, competitions, grades, fixtures)
- User-scoped (not account): `account.me`, `auth.me`
- **Open for Phase 07:** global `ui.*PickerSelectedId` (no `accountId`)

**Delete already clears (Phase 05):** `onboardingState`, `setupStatus`, `settings`, `organisationContext`, `branding` for deleted id; invalidates `account.me` + `auth.me`. Phase 07 must still prove isolation under rapid switch for the remaining families above.

### Verification

```powershell
npx vitest run src/lib/config/gateway-reasons.test.ts src/lib/api/account-unavailable.test.ts src/components/auth/org-access-boundary.test.tsx src/lib/api/hooks/account/useAccountOrganisationContext.test.tsx "src/app/(members)/o/[accountId]/billing/create/actions/create-stripe-invoice.test.ts" "src/app/(members)/o/[accountId]/billing/create/create-subscription-wizard.test.tsx"
```

- Focused vitest: **6 files, 38 tests passed**.

### Working-tree notes

Unrelated dirty files outside Phase 06 (dashboard branding, `button.tsx`, save-branding dialog, older onboarding docs, Phase 02–05 work) were preserved.

### Next phase

**Phase 07: Cache and state isolation** — prove rapid account switch does not leak prior-account data; namespace or clear `ui.*PickerSelectedId`; audit remaining account-scoped key families listed above.
