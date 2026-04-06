# State

## Current focus

- **Typography system** ([`src/components/typography/`](src/components/typography/index.ts)): semantic exports adopted across shared states, metrics, cards, overlays, nav, and public footer; legacy scale **`TypographyH1`–`TypographyH5`** retained. Reference: **`/sandbox/kitchen-sink/typography`**. Optional follow-up: typography inside **`ui/card`** / table column text, **`typography/readMe.md`** refresh.
- **Shared `Button`** ([`src/components/ui/button.tsx`](src/components/ui/button.tsx)): pill shape, hover lift + border + shadow, cursor, **`loading`** / **`fullWidth`** / **`compact`**; kitchen sink **`/sandbox/kitchen-sink/buttons`** documents hierarchy and **brand/accent** form actions (avoid **`default`** blue for member form primaries).
- **`SubmitButton`** ([`src/components/auth/actions.tsx`](src/components/auth/actions.tsx)) uses **`Button`** **`loading`**; defaults **`brand`**; optional **`fullWidth`** / **`loadingText`**. **Route lab** auth/org pages updated to match.
- Members **gateway** **`/select-organisation`**: grid cards, gateway **`reason`** query, **`AccountLoadErrorFeedback`** on load failure; dev **`orgSim`** when enabled.
- **Scoped dashboard (`/o/[accountId]/dashboard`):** **`temp-data-drilling/temp-org-data-dump`** until real UI.
- **Dev sandbox** **`/sandbox`**; **`NEXT_PUBLIC_ENABLE_DEV_SANDBOX`**. Route lab under **`/sandbox/route-lab`**.
- **Feedback cards:** **`@/components/ui/feedback-card`** (semantic typography for label/title/description); kitchen sink **`/sandbox/kitchen-sink/cards`**.
- **Metadata:** **`src/config/metadata.ts`** + **`src/lib/metadata/buildMetadata.ts`**; favicon and logo assets under **`public/logos/`** (shared with **`metadata.icons`** and auth UI).

## Next actions

- [ ] Wire **create organisation** when CMS contract exists.
- [ ] Smoke **`/select-organisation`** with simulator and real API path when convenient.
- [ ] Optional: smoke **`/sandbox/kitchen-sink/typography`**, **`/sandbox/kitchen-sink/buttons`**, **`/sandbox/kitchen-sink/dialogs`**, **`/sandbox/route-lab/public/sign-in?state=submitting`** (dev sandbox on).
- [ ] Replace **`dashboard/temp-data-drilling`** when real dashboard UI ships.
- [ ] Optional: further typography adoption ( **`ui/card`** bake-in, **`TypographyTable*`** in data-table) when touching those areas.

## Blockers / risks

- **Create-org** flow blocked on backend spec (TBC).
