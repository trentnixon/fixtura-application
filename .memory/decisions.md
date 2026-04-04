# Decisions

## 2026-04-03 — Members URL model (gateway + account-scoped)

**Decision:** Authenticated members UI lives under **`src/app/(members)/`**. Users land on **`/select-organisation`** after login (unless `from` is a safe **`/o/{accountId}/...`** path). Organisation-scoped pages use **`/o/[accountId]/...`** where **`accountId`** is the Strapi account id; full dashboard data loads via **`GET /api/account/organisation/[accountId]`** (BFF → CMS). Legacy flat **`/dashboard`**-style URLs redirect to the gateway.

**Why:** Matches [`.comms/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md`](.comms/18-FIXTURA_MULTI_ORGANISATION_ROUTE_LOGIC.md) and [`.comms/responses/app-handoff-account-organisation-endpoint.md`](.comms/responses/app-handoff-account-organisation-endpoint.md) (two-step `account/me` + organisation aggregate).

**Tradeoffs:** Account ids appear in URLs; middleware cannot validate ownership (handled by CMS + **`OrgAccessBoundary`**). **Create organisation** remains TBC until CMS documents an API.
