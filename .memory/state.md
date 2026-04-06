# State

## Current focus

- **CMS account data layer (Phase 0+):** Normative contract in [`.comms/data-fetching/account-admin-api-contract.md`](.comms/data-fetching/account-admin-api-contract.md); [`accountScopedHttpSemantics`](src/lib/api/account-scoped-http-semantics.ts) for account-scoped error mapping. **Phase 1 bootstrap** — `GET /api/account/me` aligned in types + [`AppSidebar`](src/components/app-sidebar.tsx) via [`activeAccountSummaryFromMePayload`](src/lib/account/account-me-rows.ts); no `?depth=extended` in app layer. Legacy hub **`GET /api/account/organisation/:accountId`** unchanged for heavy aggregate.
- **Phase 2 — settings:** `appRoutes.accounts.settings` is **`ready`**; BFF `GET /api/accounts/[accountId]/settings`, [`accountApi.getAccountSettings`](src/lib/api/services/account.api.ts), [`queryKeys.account.settings`](src/lib/api/query/query-keys.ts), [`useAccountSettings`](src/lib/api/hooks/account/useAccountSettings.ts). Scoped [**`/o/[accountId]/settings`**](<src/app/(members)/o/[accountId]/settings/page.tsx>) shows read-only sample fields; canonical flags include `hasCompletedStartSequence`, `hasCustomTemplate`.
- **Phase 3 — branding:** `appRoutes.accounts.branding` is **`ready`**; BFF `GET /api/accounts/[accountId]/branding`, [`accountApi.getAccountBranding`](src/lib/api/services/account.api.ts), [`queryKeys.account.branding`](src/lib/api/query/query-keys.ts), [`useAccountBranding`](src/lib/api/hooks/account/useAccountBranding.ts). Template builder page shows a read-only summary; `hasCustomTemplate` stays on settings.
- **Phase 4 — organisation context:** `appRoutes.accounts.organisation` is **`ready`**; BFF `GET /api/accounts/[accountId]/organisation`, [`accountApi.getAccountOrganisationContext`](src/lib/api/services/account.api.ts), [`queryKeys.account.organisationContext`](src/lib/api/query/query-keys.ts), [`useAccountOrganisationContext`](src/lib/api/hooks/account/useAccountOrganisationContext.ts). **[`OrgAccessBoundary`](src/components/auth/org-access-boundary.tsx)** and scoped **[`AppSidebar`](src/components/app-sidebar.tsx)** use this slice; legacy **[`useAccountOrganisation`](src/lib/api/hooks/account/useAccountOrganisation.ts)** remains for **[`temp-org-data-dump`](<src/app/(members)/o/[accountId]/dashboard/temp-data-drilling/temp-org-data-dump.tsx>)** (hub aggregate).
- **Phase 5 — scheduler:** `appRoutes.accounts.scheduler` is **`ready`**; BFF `GET /api/accounts/[accountId]/scheduler`, [`accountApi.getAccountScheduler`](src/lib/api/services/account.api.ts), [`useAccountScheduler`](src/lib/api/hooks/account/useAccountScheduler.ts). No scheduler screen wired yet.
- **Phase 6 — render token:** `appRoutes.accounts.renderToken` is **`ready`**; BFF `GET /api/accounts/[accountId]/render-token`, [`accountApi.getAccountRenderToken`](src/lib/api/services/account.api.ts), [`useAccountRenderToken`](src/lib/api/hooks/account/useAccountRenderToken.ts) (`staleTime: 0`). No members screen consumes the token yet.
- **Phase 7 — renders list:** `appRoutes.accounts.renders` is **`ready`**; BFF `GET /api/accounts/[accountId]/renders`, [`accountApi.getAccountRenders`](src/lib/api/services/account.api.ts), [`useAccountRenders`](src/lib/api/hooks/account/useAccountRenders.ts). No dedicated members renders table page yet.
- **Phase 8 — render detail:** `appRoutes.accounts.renderDetail` is **`ready`**; BFF `GET /api/accounts/[accountId]/renders/[renderId]`, [`accountApi.getAccountRenderDetail`](src/lib/api/services/account.api.ts), [`useAccountRenderDetail`](src/lib/api/hooks/account/useAccountRenderDetail.ts). Members job-detail **page** not wired yet.
- **Typography system** ([`src/components/typography/`](src/components/typography/index.ts)): semantic exports adopted across shared states, metrics, cards, overlays, nav, and public footer; legacy scale **`TypographyH1`–`TypographyH5`** retained. Reference: **`/sandbox/kitchen-sink/typography`**. Optional follow-up: typography inside **`ui/card`** / table column text, **`typography/readMe.md`** refresh.
- **Shared `Button`** ([`src/components/ui/button.tsx`](src/components/ui/button.tsx)): pill shape, hover lift + border + shadow, cursor, **`loading`** / **`fullWidth`** / **`compact`**; kitchen sink **`/sandbox/kitchen-sink/buttons`** documents hierarchy and **brand/accent** form actions (avoid **`default`** blue for member form primaries).
- **`SubmitButton`** ([`src/components/auth/actions.tsx`](src/components/auth/actions.tsx)) uses **`Button`** **`loading`**; defaults **`brand`**; optional **`fullWidth`** / **`loadingText`**. **Route lab** auth/org pages updated to match.
- Members **gateway** **`/select-organisation`**: grid cards, gateway **`reason`** query, **`AccountLoadErrorFeedback`** on load failure; dev **`orgSim`** when enabled.
- **Scoped dashboard (`/o/[accountId]/dashboard`):** **`temp-data-drilling/temp-org-data-dump`** until real UI.
- **Dev sandbox** **`/sandbox`**; **`NEXT_PUBLIC_ENABLE_DEV_SANDBOX`**. Route lab under **`/sandbox/route-lab`**.
- **Feedback cards:** **`@/components/ui/feedback-card`** (semantic typography for label/title/description); kitchen sink **`/sandbox/kitchen-sink/cards`**.
- **Metadata:** **`src/config/metadata.ts`** + **`src/lib/metadata/buildMetadata.ts`**; favicon and logo assets under **`public/logos/`** (shared with **`metadata.icons`** and auth UI).

## Next actions

- [ ] When remaining CMS phases ship (e.g. Phase 9 analytics), set the matching **`appRoutes.accounts.*`** to **`ready`** and add **`account.api`** + query keys + hooks per [`.skills/api-data-layer-patterns.md`](.skills/api-data-layer-patterns.md).
- [ ] Smoke Phase 2 settings BFF against live Strapi (`getAccountSettings` on Authenticated role).
- [ ] Smoke Phase 3 branding BFF against live Strapi (`getAccountBranding` on Authenticated role).
- [ ] Smoke Phase 4 organisation-context BFF against live Strapi (`getAccountOrganisation` on Authenticated role).
- [ ] Smoke Phase 5 scheduler BFF against live Strapi (`getAccountScheduler` on Authenticated role).
- [ ] Smoke Phase 6 render-token BFF against live Strapi (`getAccountRenderToken` on Authenticated role).
- [ ] Smoke Phase 7 renders-list BFF against live Strapi (`getAccountRenders` on Authenticated role).
- [ ] Smoke Phase 8 render-detail BFF against live Strapi (`getAccountRenderDetail` on Authenticated role).
- [ ] Optional: wire **`/o/[accountId]/...`** render job detail UI using **`useAccountRenderDetail`**.
- [ ] Wire **create organisation** when CMS contract exists.
- [ ] Smoke **`/select-organisation`** with simulator and real API path when convenient.
- [ ] Optional: **404** on **`GET /account/me`** → clearer empty-org copy in **`AccountLoadErrorFeedback`** (if HTTP status is available on errors).
- [ ] Optional: smoke **`/sandbox/kitchen-sink/typography`**, **`/sandbox/kitchen-sink/buttons`**, **`/sandbox/kitchen-sink/dialogs`**, **`/sandbox/route-lab/public/sign-in?state=submitting`** (dev sandbox on).
- [ ] Replace **`dashboard/temp-data-drilling`** when real dashboard UI ships.
- [ ] Optional: further typography adoption ( **`ui/card`** bake-in, **`TypographyTable*`** in data-table) when touching those areas.

## Blockers / risks

- **Create-org** flow blocked on backend spec (TBC).
