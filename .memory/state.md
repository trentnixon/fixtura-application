# State

## Current focus

- Members **gateway** **`/select-organisation`**: grid cards, gateway **`reason`** query, **`AccountLoadErrorFeedback`** (**`FeedbackCardTinted` / `kind="error"`**) on load failure; empty copy **“Set up an organisation”** + **“Create one below.”**; main column **start-aligned** (no **`mx-auto`** on the wrapper).
- **Dev-only UI state simulation:** **`NEXT_PUBLIC_SELECT_ORG_SIMULATOR=true`** and **`?orgSim=loading|none|one|multiple|error`** on **`/select-organisation`** (see **`src/lib/dev/select-organisation-sim.ts`**); real **`useAccountMe`** when flag off or param absent.
- **Multi-org access UX:** **`OrgAccessBoundary`**, **`gateway-reasons`**, **`member-route-sign-in`**, **`accountPickerRowsFromMePayload`** (unchanged).
- **Dev sandbox** under **`/sandbox`**; **`NEXT_PUBLIC_ENABLE_DEV_SANDBOX`**. Route lab mirror: **`/sandbox/route-lab/org/select-organisation`**.
- **Feedback cards (design system):** **`@/components/ui/feedback-card`**; kitchen sink **`/sandbox/kitchen-sink/cards`** documents soft / tinted / strong variants (see **`.skills`**: component-usage, layout-and-spacing, feedback-and-notifications, kitchen-sink-maintenance). **`AccountLoadErrorFeedback`** on select-org uses **`FeedbackCardTinted`**.

## Next actions

- [ ] Wire **create organisation** when CMS contract exists (`/create-organisation` is placeholder).
- [ ] Smoke **`/select-organisation`** with **`NEXT_PUBLIC_SELECT_ORG_SIMULATOR`** and **`orgSim`** values; confirm real API path when simulator off.
- [ ] Confirm **staging/CI** after recent routing changes; optional smoke **`/sandbox`**, **`/select-organisation`** (reason banners), logged-out deep link to **`/o/{id}/...`**.
- [ ] Optional: align [`.comms/19-Dev-Sandbox-Routes.md`](.comms/19-Dev-Sandbox-Routes.md) and [`.comms/20-Interaction Lab.md`](.comms/20-Interaction%20Lab.md) with canonical **`/sandbox/...`** URLs.
- [ ] Optional: smoke **`/sandbox/kitchen-sink/cards`** (full **GridCard** showcase; dev sandbox env on).

## Blockers / risks

- **Create-org** flow blocked on backend spec (documented as TBC).
