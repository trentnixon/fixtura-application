# CMS handoff — Account notifications (bundle contact + delivery channel)

**From:** Fixtura Members app (frontend)  
**To:** CMS / Strapi backend  
**Date:** 2026-05-02  
**Purpose:** Specify a new **account-scoped** read/write contract for the **Notifications** screen so organisations can manage **who bundles are addressed to**, **where delivery emails go**, and (if owned here rather than on existing settings) **asset delivery weekday**.

---

## Context (what the product is doing)

### Members route

- Production URL: **`/o/[accountId]/notifications`** (Next.js app route; `accountId` is the Strapi account id).
- Today the page is a **shell**: it explains the feature and links users to **Organisation settings** for preferences that already exist (for example bundle delivery day on the existing settings flow).
- The **target UX** matches the **Route Lab** prototype (fixture only, no live API today):
  - Lab path: `/sandbox/route-lab/app/notifications`
  - UI implementation reference: `src/app/sandbox/route-lab/app/notifications/_components/notifications-lab-workspace.tsx`
  - Fixture types: `src/features/route-lab/fixtures/account.ts` (`AccountNotificationsLabDraft`)

### Why we want this

Members need a dedicated place to control **outbound communication and delivery identity** for weekly assets (display/addressee naming, notification email, alignment with delivery cadence). Product has separated this from the broader **Organisation settings** screen so the **Notifications** area can grow without overloading the general preferences page.

### Relationship to existing settings (important)

The app **already** persists some bundle/delivery behaviour via:

- `GET /api/accounts/:accountId/settings` — `AccountSettingsData`; may embed `scheduler` / delivery context.
- `PATCH /api/accounts/:accountId/settings` — partial updates including `bundleDeliveryDay`, `daysOfTheWeekId`, etc. (see `PatchAccountSettingsBody` in `src/types/api/account.ts` and [.comms handoff — account settings preferences](./cms-handoff-account-settings-preferences.md)).

**Open decision for CMS (pick one and document):**

1. **Dedicated notifications resource** — New `GET`/`PATCH` (below) owns **addressee + delivery email**; **weekday** remains only on **settings** (frontend loads both where needed, or notifications `GET` returns a read-only mirror for display).
2. **Single expanded settings document** — Add fields to `GET`/`PATCH .../settings` only; **no** separate notifications path (frontend would drop the separate endpoint request).
3. **Hybrid** — `PATCH .../notifications` updates only the new fields; weekday **must** continue to use `PATCH .../settings` (one source of truth for scheduler/day).

The frontend can align with whichever model you publish; the payload below assumes **option 1 or 3** for a **named notifications slice**.

---

## What the form does (behaviour)

| Field (UI label)        | Purpose                                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Bundle addressed to** | Legal or display name used on generated bundles (copy shown to end users / printed context).                                                 |
| **Delivery email**      | Primary mailbox for **weekly asset notifications and delivery** (operational contact).                                                       |
| **Asset delivery day**  | Weekday when generated assets are targeted for delivery (same conceptual domain as bundle delivery day in settings; see overlap note above). |

**UX patterns (for permission/error parity):**

- View vs edit modes; save confirmation dialog summarising changed fields.
- Invalid / inactive account states should be handled server-side with **4xx** and stable error bodies (frontend mirrors patterns used on `PATCH .../settings`).
- Email field should be validated (format + any CMS-specific rules).

---

## Proposed API surface (Strapi + BFF)

Align with existing members conventions: Next BFF paths mirror Strapi **`/api/accounts/:accountId/...`**.

### Suggested routes

| Method  | Path                                     | Role                                                     |
| ------- | ---------------------------------------- | -------------------------------------------------------- |
| `GET`   | `/api/accounts/:accountId/notifications` | Return current notification preferences for the account. |
| `PATCH` | `/api/accounts/:accountId/notifications` | Partial update; only changed keys sent from client.      |

Optional later: `PUT` if you prefer full replacement (not required for first ship).

### AuthN / AuthZ

- **Caller:** authenticated user with access to `:accountId` (same model as other account-scoped routes).
- **Permission:** define a Strapi action analogous to **`saveAccountSettings`** (for example **`saveAccountNotifications`**) so writes can be toggled per role independently from full settings save.

---

## Payload shapes (proposal)

Names below match the **frontend lab** and TypeScript fixture; **CMS may rename** if you publish a field mapping table — but please keep **one canonical wire name** per concept.

### `GET` success — `200`

Envelope should match existing account routes the app already types (typically `{ data: { ... } }`).

```json
{
  "data": {
    "bundleAddressedTo": "Cricket Whanganui",
    "deliveryEmail": "club-ops@example.com",
    "assetDeliveryDay": "sunday"
  }
}
```

**`assetDeliveryDay`:** string enum from the same set the app uses elsewhere:

`"sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"`

(Defined as `WeekdayKey` in `src/features/settings/bundle-delivery-weekdays.ts`.)

**Alternative:** return `daysOfTheWeekId` (integer `1`–`7`, Sunday–Saturday per Fixtura catalogue — see comments in `bundle-delivery-weekdays.ts`) instead of or alongside the string key; if both exist, document which is authoritative.

### `PATCH` request body — partial JSON

Flat body (preferred for symmetry with `PatchAccountSettingsBody`), with optional Strapi `{ data: { ... } }` wrapper — same convention as settings PATCH.

Example:

```json
{
  "deliveryEmail": "new-ops@example.com"
}
```

Example with all three fields:

```json
{
  "bundleAddressedTo": "Cricket Whanganui",
  "deliveryEmail": "club-ops@example.com",
  "assetDeliveryDay": "sunday"
}
```

### `PATCH` success — `200`

Return **updated** notification slice the same shape as **`GET`** `data`, or return the full account settings envelope if that is your standard (frontend can adapt if documented in OpenAPI / handoff response doc).

### Errors

Document expected status codes: **`400`** validation, **`403`** missing `saveAccountNotifications` (or equivalent), **`404`** unknown account. Prefer JSON `{ "error": { "message": "...", "code": "..." } }` consistent with other account endpoints.

---

## Strapi / data model questions (for CMS)

1. **Storage:** Are these attributes on **`account`**, a **singleton component**, or a related **notifications** collection linked to account?
2. **`bundleAddressedTo`:** Is this the same as an existing org display name field, or intentionally independent?
3. **`deliveryEmail`:** Distinct from **login email** and from **user email** on the account row? (Security: confirm who may change it.)
4. **`assetDeliveryDay` vs scheduler:** If weekday is stored on **scheduler** / `days_of_the_week`, should `PATCH .../notifications` delegate to that relation, or should the app **only** PATCH settings for day and keep notifications endpoint for the two string/email fields only?
5. **Publishing:** Should `GET .../notifications` be a **computed** projection (merge account + scheduler), or a **materialised** document?

---

## Frontend integration (app — implemented)

- **BFF:** `src/app/api/accounts/[accountId]/notifications/route.ts` (GET + PATCH proxy to Strapi).
- **Client:** `useAccountMe` + `useAccountScheduler` → `notificationsDataFromMeRowAndScheduler`; **writes:** `useUpdateOnboardingStep3` (contact) + `usePatchAccountSettings` (delivery day); types in `src/types/api/account.ts`.
- **UI:** `src/app/(members)/o/[accountId]/notifications/` — live form; weekday changes still via organisation settings.

Canonical wire contract for CMS behaviour: [../response/frontend-handoff-account-notifications.md](../response/frontend-handoff-account-notifications.md) (hybrid model: notifications PATCH only `bundleAddressedTo` / `deliveryEmail`; read-only `assetDeliveryDay`).

---

## Production cutover checklist

### CMS / Strapi (blocking)

1. Deploy `PATCH /api/accounts/:accountId/notifications` (and optional `GET` for non-app clients) per the response handoff; expose **bundle addressee** and **delivery email** on **`GET .../settings`** for the members read path.
2. Enable **Authenticated** (or app role) permissions: **`saveAccountNotifications`**; **`getAccountSettings`** for reads; **`saveAccountSettings`** where roles edit bundle delivery day. **`getAccountNotifications`** is optional for the app once settings carries those fields.
3. Confirm members app points at this environment (`STRAPI_URL` / env convention used in this repo).

### Manual QA — `/o/575/notifications` (example account)

Use a JWT user who **owns** account `575` (or substitute your pilot id):

1. **Load:** Page loads from **`GET .../settings`**; fields match CMS; read-only **asset delivery day** matches scheduler-derived value or “Not set”.
2. **PATCH:** Change addressee/email → save → persists after hard refresh.
3. **Errors:** 403 when `saveAccountNotifications` is off; invalid email returns documented error code; wrong org → gateway/404 behaviour per app.
4. **Cross-screen:** Change bundle delivery day under **Organisation settings**, return to notifications → read-only day updates without full refresh (shared **settings** query invalidated after settings save).

### Route lab

- Keep `src/app/sandbox/route-lab/app/notifications/page.tsx` for **fixture scenarios** only; production comparison link lives in route-lab nav (e.g. **Notifications (members 575)**).

---

## References (repo)

| Area                      | Path                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| Route Lab UI              | `src/app/sandbox/route-lab/app/notifications/_components/notifications-lab-workspace.tsx` |
| Fixture draft type        | `src/features/route-lab/fixtures/account.ts`                                              |
| Weekday keys + CMS id map | `src/features/settings/bundle-delivery-weekdays.ts`                                       |
| Existing settings types   | `src/types/api/account.ts` (`AccountSettingsData`, `PatchAccountSettingsBody`)            |
| Related CMS handoff       | `src/app/(members)/.comms/handoff/cms-handoff-account-settings-preferences.md`            |
| Settings BFF (pattern)    | `src/app/api/accounts/[accountId]/settings/route.ts`                                      |

---

## Summary ask

Please implement **`GET` + `PATCH /api/accounts/:accountId/notifications`** (Strapi + docs), with a **partial PATCH** body covering **`bundleAddressedTo`**, **`deliveryEmail`**, and (if this endpoint owns it) **`assetDeliveryDay`** / **`daysOfTheWeekId`**, plus **role permission** for writes and clear rules for **how this coexists with existing `.../settings`** so we do not double-persist the same weekday in conflicting ways.
