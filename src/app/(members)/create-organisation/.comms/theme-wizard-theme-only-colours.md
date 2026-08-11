# Theme-only colours (W2 + branding) — app ↔ CMS

**Date:** 2026-04-08 (updated 2026-04-08 — theme JSON shape)

## Context

The members app onboarding **Step 2 (branding)** stores brand colours **only on the linked theme** (`api::theme.theme`), not as separate account onboarding colour fields.

## Client contract

- **PATCH** `…/onboarding/step-2` (W2): JSON may include **`themeId`**, **`logoMediaId`** only. The app does **not** send account-level colour fields on W2.
- **POST** `…/onboarding/step-2/theme` (custom theme): **`name`**, **`primary`**, **`secondary`**, **`dark`**, **`white`** (hex strings). Product defaults for **`dark`** / **`white`** are `#111` and `#FFF` when the user does not override; the app sends all four so Strapi can persist a single **`Theme` JSON** shape. W2 then links via **`themeId`**.
- **GET** `…/branding`: colours for UI/review are read from **`data.theme.theme`** JSON: **`{ primary, secondary, dark, white }`**. **`GET …/onboarding/lookups/themes`** (L3) rows expose the same shape on each row’s **`theme`** when present.

## CMS / Strapi follow-up

- Account-level onboarding colour fields are **not** part of the members app contract; colours live on **`theme.theme`** only.
- Ensure theme documents expose hex in **`theme.theme`** so GET branding supports preview + review swatches.
