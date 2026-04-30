# CMS handoff — Persist organisation branding (palette + template mode)

**To:** CMS / Strapi  
**From:** Fixtura application (members app + route-lab branding workspace)  
**Date:** 2026-04-29

## Context

We are completing the **branding workspace**: users choose **primary/secondary** brand colours (with optional premade themes), a **template mode** (contrast preset — e.g. light / light-alt / dark / dark-alt — used for rendered assets), then confirm **Save branding**.

Today:

- **Colours** follow existing onboarding/branding: they live on **`api::theme.theme`** as JSON (`primary`, `secondary`, `dark`, `white`, as applicable), linked from the account via **`themeId`**. See create-organisation comms (e.g. `PATCH …/onboarding/step-2`, `POST …/onboarding/step-2/theme`, and `theme-wizard-theme-only-colours.md`).
- **Template modes** are exposed for the UI via **`GET …/api/template-modes/ui`** (Next.js BFF forwards to Strapi). Rows include at least **`id`**, **`name`**, **`slug`**. There is no first-class **write** from the app that updates “which template mode this account uses” alongside a colour save.

Route-lab **Save branding** is intended to persist **both** palette and mode so **`GET …/accounts/:accountId/branding`** and downstream renders stay consistent.

## Problem

We need a **single, explicit server contract** to:

1. Apply the organisation’s **colour palette** (as you already model it — typically via **theme** update/create + **`account.theme`**).
2. Persist the chosen **template mode** (Strapi **`template-modes`** row **`id`**, or an equivalent relation stored on the account).

Without this, the app must issue multiple partial updates or omit mode, and **mode** can drift from **theme**.

## Request

**A new authenticated endpoint** (path and naming are yours; align with existing account-scoped routes) that:

- Accepts **`accountId`** (path segment or body — consistency with existing patterns).
- Accepts **palette / theme** in the same shape you already persist (e.g. **`primary`**, **`secondary`**, **`dark`**, **`white`**, and **`themeId`** when the user selects a premade catalogue theme vs custom colours).
- Accepts **`templateModeId`** (integer — same **`id`** domain as **`GET …/api/template-modes/ui`**).

If you prefer two internal writes (“two collection items”), document that the handler **atomically** (or in one transaction):

1. Ensures **`api::theme.theme`** reflects the palette and **`account.theme`** points at the correct theme.
2. Sets the account’s **template mode** relation or scalar field to **`templateModeId`**.

The app only needs the **HTTP contract** and **success/error** shape; Strapi implementation detail is yours.

## Illustrative payload

Exact field names should match Strapi and existing W2/theme routes.

```json
{
  "accountId": 575,
  "theme": {
    "themeId": 12,
    "primary": "#112233",
    "secondary": "#445566",
    "dark": "#111111",
    "white": "#FFFFFF"
  },
  "templateModeId": 3
}
```

Variants are fine — for example **`themeId` only** when colours are unchanged, or a flatter body — as long as the contract is documented.

## Why we need it

- **Product:** One **Save branding** action should map to one durable outcome: colours and contrast preset stored together.
- **Technical:** The app already reads **`GET …/branding`** and modes via **`template-modes/ui`**. A dedicated **write** closes the loop without overloading **`PATCH …/onboarding/step-2`** with fields it was not designed for (unless you explicitly extend that route and document it).
- **Safety:** Validate **`templateModeId`** against published modes and **`accountId`** against the authenticated user, consistent with other account-scoped routes.

## App-side expectations

- **Auth:** Bearer JWT; caller must be allowed to manage that account.
- **Success:** **`200`** or **`201`** with JSON confirming persisted **`themeId`** (or theme id) and **`templateModeId`** (optional: echo **`slug`** for support).
- **Errors:** **`400`** (validation, unknown mode, bad hex, empty update), **`403`**, **`404`**, aligned with your existing Strapi error envelope where applicable.

## References (this repo)

- Colours on theme / W2: `src/app/(members)/create-organisation/.comms/` (Phase 3 Step 2, theme-only colours).
- Template modes (read): `src/app/api/template-modes/ui/route.ts` → Strapi **`/api/template-modes/ui`**.
- Branding read types: `src/types/api/account.ts` (`AccountBrandingData`, theme shape).
- Route-lab branding UX (save stub until wired): `src/app/sandbox/route-lab/app/branding/_components/branding-lab-workspace.tsx`.

## Document history

| Date       | Change                   |
| ---------- | ------------------------ |
| 2026-04-29 | Initial handoff for CMS. |
