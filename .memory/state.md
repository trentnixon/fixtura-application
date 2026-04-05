# State

## Current focus

- **Shared `Button`** ([`src/components/ui/button.tsx`](src/components/ui/button.tsx)): pill shape, hover lift + border + shadow, cursor, **`loading`** / **`fullWidth`** / **`compact`**; kitchen sink **`/sandbox/kitchen-sink/buttons`** documents hierarchy and **brand/accent** form actions (avoid **`default`** blue for member form primaries).
- **`SubmitButton`** ([`src/components/auth/actions.tsx`](src/components/auth/actions.tsx)) uses **`Button`** **`loading`**; defaults **`brand`**; optional **`fullWidth`** / **`loadingText`**. **Route lab** auth/org pages updated to match.
- Members **gateway** **`/select-organisation`**: grid cards, gateway **`reason`** query, **`AccountLoadErrorFeedback`** on load failure; dev **`orgSim`** when enabled.
- **Scoped dashboard (`/o/[accountId]/dashboard`):** **`temp-data-drilling/temp-org-data-dump`** until real UI.
- **Dev sandbox** **`/sandbox`**; **`NEXT_PUBLIC_ENABLE_DEV_SANDBOX`**. Route lab under **`/sandbox/route-lab`**.
- **Feedback cards:** **`@/components/ui/feedback-card`**; kitchen sink **`/sandbox/kitchen-sink/cards`**.

## Next actions

- [ ] Wire **create organisation** when CMS contract exists.
- [ ] Smoke **`/select-organisation`** with simulator and real API path when convenient.
- [ ] Optional: smoke **`/sandbox/kitchen-sink/buttons`**, **`/sandbox/route-lab/public/sign-in?state=submitting`** (dev sandbox on).
- [ ] Replace **`dashboard/temp-data-drilling`** when real dashboard UI ships.

## Blockers / risks

- **Create-org** flow blocked on backend spec (TBC).
