# App handoff — Phase 6 onboarding S1 (setup status) + S2 (polling)

**Date:** 2026-04-07  
**Audience:** CMS / Strapi implementers + members app deployers  
**BFF:** `GET /api/accounts/:accountId/onboarding/setup-status` → **Upstream:** `GET {STRAPI_URL}/api/accounts/:accountId/onboarding/setup-status`

## Members app (BFF) — implemented

Strapi owns `GET /api/accounts/:accountId/onboarding/setup-status`. The members app exposes the same path under the Next BFF and proxies to Strapi with the session Bearer token; non-OK responses forward JSON bodies like other account-scoped GETs where possible.

| Piece                    | Location                                                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| BFF route                | [`src/app/api/accounts/[accountId]/onboarding/setup-status/route.ts`](../../../../api/accounts/%5BaccountId%5D/onboarding/setup-status/route.ts) |
| Client API               | `accountApi.getOnboardingSetupStatus` in [`src/lib/api/services/account.api.ts`](../../../../../lib/api/services/account.api.ts)                 |
| TanStack Query + polling | [`src/lib/api/hooks/account/useOnboardingSetupStatus.ts`](../../../../../lib/api/hooks/account/useOnboardingSetupStatus.ts)                      |
| Terminal / poll defaults | [`src/lib/config/onboarding.ts`](../../../../../lib/config/onboarding.ts) (`ONBOARDING_SETUP_STATUS_POLL_MS`, `isTerminalOnboardingSetupStatus`) |

## Deploy — `getOnboardingSetupStatus` permission (Strapi)

Use the same **Authenticated** role grant as other account routes. Step-by-step checklist and Strapi implementation path: [**deploy-get-onboarding-setup-status-permission.md**](./deploy-get-onboarding-setup-status-permission.md).

## S1 — Response shape (minimum useful set)

Align with [cms-handoff-onboarding-api-requirements.md](../cms-handoff-onboarding-api-requirements.md) §4.4 (includes the **Strapi implementation** note under §4.4).

Recommended JSON (BFF forwards Strapi body; v1 client expects a **`data`** object when present):

```json
{
  "data": {
    "phase": "preparation",
    "status": "in_progress",
    "requiresUserAction": false,
    "errorCode": null,
    "progress": null
  }
}
```

| Field                | Type                                          | Notes                                                      |
| -------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| `phase`              | string (optional)                             | Human or machine phase label for UI.                       |
| `status`             | string (required)                             | Machine-readable lifecycle: see **Terminal states** below. |
| `requiresUserAction` | boolean (optional)                            | If true, UI should surface a clear CTA or link.            |
| `errorCode`          | string \| null (optional)                     | When blocked or failed; stable code for support / i18n.    |
| `progress`           | number \| string \| object \| null (optional) | CMS picks one convention and versions it.                  |

If Strapi uses a different envelope, document it in OpenAPI; the app maps `data` when present.

## S2 — Polling contract (client behaviour)

| Topic                               | App default                                                                                                                                                                                                    |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Poll interval**                   | `5000` ms between successful fetches while **non-terminal** (`ONBOARDING_SETUP_STATUS_POLL_MS` in [`onboarding.ts`](../../../../../lib/config/onboarding.ts)). Product may tune (e.g. 2–10s range per CMS Q9). |
| **Stop polling**                    | When `status` is **terminal**: `ready`, `blocked`, or `abandoned` (case-insensitive).                                                                                                                          |
| **Continue polling**                | `in_progress`, `retryable`, or any other non-terminal value.                                                                                                                                                   |
| **`Retry-After` / `Cache-Control`** | Not required for v1; if Strapi adds them later, the BFF can forward headers and the client can be extended to honour them.                                                                                     |
| **Errors**                          | **404** / **503**: no aggressive polling; UI shows a short “unavailable” state. **401**: session handling unchanged.                                                                                           |

## Verification

- After **W1**, status may move from not-ready to `in_progress`; UI should poll until terminal.
- After **W4**, wizard is complete but setup may continue; **S1** still reflects background preparation until `ready` or `blocked`.

## PDR alignment

- **W4** does not require setup to be finished; **S1** is the source of truth for background preparation. See [app-handoff-onboarding-phase5-w4.md](../phase-5/app-handoff-onboarding-phase5-w4.md).
