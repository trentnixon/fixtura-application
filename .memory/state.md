# State

## Current focus

- **CMS account data (Phases 1–9 + template catalog):** Hooks + BFFs per contract; see [`route-definitions.ts`](src/lib/api/routes/route-definitions.ts) and [`account.api.ts`](src/lib/api/services/account.api.ts). **`accounts.allTemplateOptions`** → BFF `GET /api/accounts/:id/all-template-options` (Strapi `template-categories/all-template-options`).
- **Dev JSON visibility (temporary):**
  - **Dashboard** [`temp-org-data-dump.tsx`](<src/app/(members)/o/[accountId]/dashboard/temp-data-drilling/temp-org-data-dump.tsx>): Phases **1–4**, **9**, legacy hub [`useAccountOrganisation`](src/lib/api/hooks/account/useAccountOrganisation.ts). Shared [`dump-block.tsx`](<src/app/(members)/o/[accountId]/dashboard/temp-data-drilling/dump-block.tsx>).
  - **Bundles** [`bundles-api-dump.tsx`](<src/app/(members)/o/[accountId]/bundles/bundles-api-dump.tsx>): Phases **5–8** (Phase 8 **`renderId`** = first row **`data.renders[0].id`** from Phase 7 list; Phase 6 token redacted in dump).
  - **Settings** [`settings-account-me-dump.tsx`](<src/app/(members)/o/[accountId]/settings/settings-account-me-dump.tsx>): Phase **1** `/api/account/me` (duplicate of dashboard block for inspection).
  - **Branding** [`branding-api-dump.tsx`](<src/app/(members)/o/[accountId]/branding/branding-api-dump.tsx>): Phase **3** `/api/accounts/:id/branding` only.
  - **Template builder** [`template-builder-content.tsx`](<src/app/(members)/o/[accountId]/template-builder/template-builder-content.tsx>) + [`all-template-options-dump.tsx`](<src/app/(members)/o/[accountId]/template-builder/all-template-options-dump.tsx>): branding summary + full catalog JSON (`useAllTemplateOptions`; `templateOptionId` from `/account/me` row or branding).
- **Members nav (scoped):** Dashboard → **Bundles** → **Branding** → Templates → …; **Settings** in secondary. [`app-sidebar.tsx`](src/components/app-sidebar.tsx).
- **Typography / Button / sandbox:** unchanged from prior state; replace dashboard dumps when real UI ships.

## Next actions

- [ ] Smoke BFFs against live Strapi (Phases 2–9) where not recently verified.
- [ ] Smoke **`GET /api/accounts/{accountId}/all-template-options`** (BFF → CMS); Strapi **Users & permissions → Authenticated → Template-category → `getAllTemplateOptions`** (403 if missing).
- [ ] Replace **`temp-data-drilling`** / bundle dumps with product UI when ready.
- [ ] Optional: dedupe Phase 3 branding JSON on dashboard if Branding page is sufficient.
- [ ] Wire **create organisation** when CMS contract exists.
- [ ] **Create-org** flow still TBC on backend.

## Blockers / risks

- **Create-org** flow blocked on backend spec (TBC).
