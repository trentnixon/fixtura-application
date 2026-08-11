# CMS handoff — online invoice request (address removed)

## What this is

A **narrow change note** for Strapi/CMS: how `POST …/billing/invoice-requests` payloads and validation should behave after the frontend switched to **online-only** invoice requests.

No other billing endpoints are in scope here. For the full account billing API catalogue, use [`frontend-billing-api-contract-handoff.md`](./frontend-billing-api-contract-handoff.md).

## How the members app reaches Strapi

The browser does **not** call Strapi directly. It posts to the **Next.js BFF** with the session cookie:

`POST /api/accounts/{accountId}/billing/invoice-requests`  
`Content-Type: application/json`  
(credentials: include — auth cookie)

The BFF forwards to:

`POST {STRAPI_URL}/api/accounts/{accountId}/billing/invoice-requests`  
`Authorization: Bearer <jwt>` (from the session)  
`Content-Type: application/json`

The signed-in user must own the account (same rules as other account billing routes). The BFF strips `null` / empty `billingAddress` and returns **400** if `billingAddress` is **partially** filled (so clients either omit it or send a complete postal block).

## Contract summary (Strapi)

The members app sends a JSON body with:

- **Required:** `subscriptionTierId` (string id of the chosen plan), `requestedStartDate` (ISO date, not in the past), `billingContactName`, `billingEmail`, `billingOrganisationName`.
- **Optional:** `notes`.
- **Online-only:** omit `billingAddress` entirely (or send `null`); the backend stores the request without postal fields and returns success the same way as before.

**Success response** (stable for the UI): `invoiceRequestId`, `status` (e.g. `submitted`), `submittedAt` (ISO), `message`.

After a successful submit, the app **refetches** `GET /api/accounts/{accountId}/billing` (via React Query invalidation) so `billingStatus`, `latestInvoiceRequest`, and `availableActions` stay in sync.

**Future postal step:** you may send `billingAddress` again as an object with `line1`, `city`, `state`, `postcode`, `country`, and optional `line2`. Partial objects are rejected with **400** (BFF and/or Strapi with field-specific messages where applicable).

## Product intent

- Members request an **online** invoice: plan, start date, and **invoice contact** details (name, email, organisation).
- There is **no** postal billing address step; we are not collecting street/city/state/postcode/country for this flow.
- The request is stored for your team; the invoice is raised manually (e.g. Hnry), sent to the customer, and should also appear with their **outstanding billing** in the app.

## What changed (vs previous frontend)

| Before                                     | After                                                                |
| ------------------------------------------ | -------------------------------------------------------------------- |
| UI required a full `billingAddress` object | UI does **not** collect address; frontend **omits** `billingAddress` |
| Body always included `billingAddress`      | Body may include only the fields below                               |

## Expected request body (current frontend → BFF → Strapi)

Same JSON shape on **both** the BFF URL and Strapi (BFF forwards the normalised body).

Required fields (as today, except address):

- `subscriptionTierId` (string)
- `requestedStartDate` (ISO string)
- `billingContactName` (string)
- `billingEmail` (string)
- `billingOrganisationName` (string)

Optional:

- `notes`

**`billingAddress`**: optional. Frontend sends it **only** if you reintroduce address collection later; for the current app build it is **not sent**.

Example minimal JSON:

```json
{
  "subscriptionTierId": "12",
  "requestedStartDate": "2026-06-01T00:00:00.000Z",
  "billingContactName": "Jane Example",
  "billingEmail": "billing@example.com",
  "billingOrganisationName": "Example Assoc",
  "notes": ""
}
```

## CMS / Strapi work

1. Treat **`billingAddress` as optional** on create (validation, schema, lifecycles): accept POST bodies **without** this key.
2. If existing content-types or admin flows assume a physical address for every invoice request, update them for **online** requests (address nullable or absent).
3. Confirm response shape is unchanged (`invoiceRequestId`, `status`, `submittedAt`, `message`) so the frontend can keep handling success the same way.

## Frontend reference (this repo)

- Types: `src/types/api/account.ts` — `PostAccountBillingInvoiceRequestBody` (`billingAddress` optional).
- Wizard: `src/app/(members)/o/[accountId]/billing/create/create-subscription-wizard.tsx`.
- Standalone form on billing page: `…/billing/_components/invoice-request/`.
