# Route Hardening Deep Dives

This folder contains production-readiness workbooks for customer-facing routes.

The root checklist at `PRODUCTION_ROUTE_HARDENING_CHECKLIST.md` is the high-level tracker. These files are where each route or route family gets its detailed feature proof, API proof, error handling review, and test plan.

## Scope

Included:

- Public customer pages.
- Authenticated customer pages.
- Customer-facing API routes used by those pages.
- Error, empty, permission, loading, and recovery behavior.

Excluded:

- Sandbox pages.
- Route lab pages.
- Kitchen sink pages.
- Data lab and interaction lab pages.
- Internal admin pages.

## Suggested Review Flow

1. Confirm the route is meant to ship to customers.
2. Fill in the customer purpose and feature list.
3. Map the UI to components, hooks, and API routes.
4. Add required unit, component, API, and browser/manual checks.
5. Review loading, empty, error, unauthorized, and not-found states.
6. Record known gaps.
7. Mark the route `Ready`, `Blocked`, or `Needs product decision`.

## Files

### Public and auth

- `public/root.md`
- `public/sign-in.md`
- `public/forgot-password.md`
- `public/check-email.md`
- `public/auth-error.md`
- `public/session-expired.md`
- `public/maintenance.md`
- `public/help.md`
- `public/support.md`
- `public/components.md`
- `auth/logout.md`

### Onboarding

- `onboarding/onboarding-llm-team-prompt.md`
- `onboarding/hardening-and-testing-plan.md`
- `onboarding/phases/phase-1-scope-and-contract.md`
- `onboarding/phases/phase-2-lifecycle-routing-and-access.md`
- `onboarding/phases/phase-3-wizard-data-collection.md`
- `onboarding/phases/phase-4-bff-endpoint-hardening.md`
- `onboarding/phases/phase-5-recovery-retry-and-deletion.md`
- `onboarding/phases/phase-6-manual-browser-checks.md`
- `onboarding/phases/phase-7-multi-account-create-organisation.md`
- `onboarding/select-organisation.md`
- `onboarding/create-organisation.md`
- `onboarding/setup.md`

### Account

- `account/dashboard.md`
- `account/account.md`
- `account/settings.md`
- `account/notifications.md`

### Branding, media, and templates

- `branding/branding.md`
- `branding/brand-logo.md`
- `branding/template-builder.md`
- `branding/media-gallery.md`
- `branding/club-logos.md`
- `branding/club-logo-detail.md`

### Sponsors

- `sponsors/add-sponsor.md`
- `sponsors/manage-sponsors.md`
- `sponsors/archive.md`
- `sponsors/assign.md`
- `sponsors/assign-entity.md`
- `sponsors/assign-position.md`

### Billing

- `billing/billing.md`
- `billing/cancel.md`
- `billing/create.md`
- `billing/history.md`
- `billing/success.md`

### Season hub

- `season/overview.md`
- `season/competition-detail.md`
- `season/grade-detail.md`
- `season/fixture-detail.md`

### Bundles

- `bundles/bundles.md`
- `bundles/render-detail.md`

## Status Values

- `Pending review`: not inspected yet.
- `In review`: currently being hardened.
- `Needs product decision`: route may not belong in production or needs expected behavior clarified.
- `Blocked`: cannot complete without an external dependency or decision.
- `Ready`: feature, API, error, accessibility, and test checks are complete.
