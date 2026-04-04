# State

## Current focus

- Members area ships **multi-organisation flow**: gateway selection + **`/o/[accountId]/...`** scoped UI, CMS-backed organisation aggregate via BFF.
- **Dev sandbox** under **`/sandbox`** (portal, kitchen sink, route lab, **interaction lab** placeholders); gated by **`NEXT_PUBLIC_ENABLE_DEV_SANDBOX=true`**. Sandbox UI uses **`@/components/typography`**. Kitchen sink hub (`/sandbox/kitchen-sink`) uses a **4-column** card grid from **`lg`** breakpoints.
- **`.skills/dev-Sandbox.md`** documents how to extend the sandbox (gate, `ROUTES`, `dev-sandbox-nav`, three-lab split).

## Next actions

- [ ] Wire **create organisation** when CMS contract exists (`/create-organisation` is placeholder).
- [ ] Confirm **staging/CI** after recent routing and doc changes (set sandbox env if previews need **`/sandbox`**).
- [ ] Optional: align [`.comms/19-Dev-Sandbox-Routes.md`](.comms/19-Dev-Sandbox-Routes.md) and [`.comms/20-Interaction Lab.md`](.comms/20-Interaction%20Lab.md) with canonical **`/sandbox/...`** URLs.
- [ ] Implement **interaction lab** scenarios one-by-one when ready (placeholders list planned coverage only).

## Blockers / risks

- **Create-org** flow blocked on backend spec (documented as TBC).
