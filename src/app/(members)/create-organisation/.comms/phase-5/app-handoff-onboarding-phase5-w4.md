# App handoff — Phase 5 onboarding W4 (confirm wizard)

**Date:** 2026-04-07
**Audience:** CMS / Strapi implementers + members app deployers
**BFF:** `POST /api/accounts/:accountId/onboarding/confirm` → **Upstream:** `POST {STRAPI_URL}/api/accounts/:accountId/onboarding/confirm`

## Members app (BFF) — implemented

Strapi owns `POST /api/accounts/:accountId/onboarding/confirm`. The members app exposes the same path under the Next BFF and proxies to Strapi with the session Bearer token; non-OK responses forward JSON bodies like W1–W3.

| Piece                            | Location                                                                                                                                                                                                                                     |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BFF route                        | [`src/app/api/accounts/[accountId]/onboarding/confirm/route.ts`](../../../../api/accounts/%5BaccountId%5D/onboarding/confirm/route.ts)                                                                                                       |
| Client API                       | `accountApi.confirmOnboarding` in [`src/lib/api/services/account.api.ts`](../../../../../lib/api/services/account.api.ts)                                                                                                                    |
| TanStack mutation + invalidation | [`src/lib/api/hooks/account/useConfirmOnboarding.ts`](../../../../../lib/api/hooks/account/useConfirmOnboarding.ts) — on success invalidates `account.me`, `account.settings`, `account.organisation-context`, `account.branding`, `auth.me` |

## Deploy — `confirmOnboarding` permission (Strapi)

After each deploy that includes `POST /api/accounts/:accountId/onboarding/confirm` on Strapi:

1. Open **Settings → Users & permissions → Roles → Authenticated**.
2. Under **Account**, enable **`confirmOnboarding`** (same pattern as `updateOnboardingStep1`–`updateOnboardingStep3`).
3. Save.

Without this grant, authenticated users receive **403** when calling the confirm endpoint (via the BFF or directly on Strapi).

## Purpose

Record **wizard complete** on the server as a distinct state from **setup complete** (background preparation). Aligns with [cms-handoff-onboarding-api-requirements.md](../../../.comms/cms-handoff-onboarding-api-requirements.md) §4.2 (W4) and §4.5 (review reads — app v1 uses parallel GETs, not R1).

## Request

- **Method:** `POST`
- **Auth:** Same Bearer JWT as other account-scoped routes (session cookie → BFF → Strapi).
- **Body:** JSON object; v1 client sends `{}`. CMS may accept optional fields later; document if added.
- **Content-Type:** `application/json`

## Success

- **2xx** with JSON body (shape CMS-defined; may be minimal `{ data: { … } }`).
- Client invalidates `account.me`, account `settings`, `organisation` context, `branding`, and `auth/me` after success.

## Errors

- Forward JSON error bodies from Strapi through the BFF (same pattern as W1–W3 routes).
- **403:** Forbidden — often missing **`confirmOnboarding`** on the Authenticated role (see **Deploy** above).
- **409:** Conflict when the wizard cannot be completed (e.g. illegal state, required steps not persisted). Map stable `code` / `message` for TanStack Query.
- **422:** Validation if CMS applies.

## PDR — W4 vs setup readiness

**Confirm must not reject solely because background setup / preparation is unfinished.** Reject only when the **wizard** cannot be completed (validation, missing required persisted steps, illegal state). Setup progress belongs to **S1** (Phase 6). If Strapi implements stricter rules, document the deviation explicitly in OpenAPI.

## Verification

- After steps 1–3 saved, `POST …/confirm` returns success and subsequent `GET /api/account/me` (or signed flags when available) reflects wizard completion per CMS model.
- Idempotent or safe repeat: second `POST` should return **200** with no error or a documented idempotent response.
