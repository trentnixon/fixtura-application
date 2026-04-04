# Decisions

## 2026-04-04 — Dev sandbox URL model (`/sandbox` tree + env gate)

**Decision:** Development sandbox routes are served only under **`/sandbox`**: portal at **`/sandbox`**, **kitchen sink** at **`/sandbox/kitchen-sink/*`**, **route lab** at **`/sandbox/route-lab/*`**. The segment **`src/app/sandbox/layout.tsx`** wraps the tree with **`DevSandboxGate`**; access requires **`NEXT_PUBLIC_ENABLE_DEV_SANDBOX`** to be the literal string **`true`** (see [`src/lib/dev-sandbox.ts`](src/lib/dev-sandbox.ts)). Public marketing chrome link “Sandbox” points to **`ROUTES.sandbox`**.

**Why:** Single discoverable entry, one layout for env enforcement, room to add more tools under the same prefix without route groups; matches product intent in [`.comms/19-Dev-Sandbox-Routes.md`](.comms/19-Dev-Sandbox-Routes.md) (env-controlled, not auth-controlled).

**Tradeoffs:** Breaks old **`/kitchen-sink`** and **`/route-lab`** bookmarks; preview/CI must set the env flag when those URLs are needed.

---

## 2026-04-03 — Members URL model (gateway + account-scoped)

**Decision:** Authenticated members UI lives under **`src/app/(members)/`**. Users land on **`/select-organisation`** after login (unless `from` is a safe **`/o/{accountId}/...`** path). Organisation-scoped pages use **`/o/[accountId]/...`** where **`accountId`** is the Strapi account id; full dashboard data loads via **`GET /api/account/organisation/[accountId]`** (BFF → CMS). Legacy flat **`/dashboard`**-style URLs redirect to the gateway.

**Why:** Matches [`.comms/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md`](.comms/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md) and [`.comms/responses/app-handoff-account-organisation-endpoint.md`](.comms/responses/app-handoff-account-organisation-endpoint.md) (two-step `account/me` + organisation aggregate).

**Tradeoffs:** Account ids appear in URLs; middleware cannot validate ownership (handled by CMS + **`OrgAccessBoundary`**). **Create organisation** remains TBC until CMS documents an API.
