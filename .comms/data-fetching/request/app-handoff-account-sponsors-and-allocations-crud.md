# App handoff: Account sponsors and sponsorship allocations (custom CRUD)

**From:** CMS (Strapi) Backend
**To:** Fixtura App (frontend)
**Date:** 2026-05-12
**Purpose:** Document account-scoped write APIs for `api::sponsor.sponsor` and `api::sponsorship-allocation.sponsorship-allocation`, separate from core Strapi REST. List/read for published sponsors remains `GET /api/accounts/:accountId/sponsors`.

---

## Allocation JSON contracts

### General allocations (`…/allocations/general`)

Used for account-wide / slot-based placement compatible with scheduler grouping (`accountGroup.category` + `accountGroup.id` in `sponsorsFormatted.js`).

**Stored `Allocation` shape:**

- Required: `accountGroup` — object with string `category` and string `id` (non-empty after trim).
- Forbidden: root key `entity` (reserved for entity allocations).

Optional additional keys may be stored under `Allocation` if present in the request body.

### Entity allocations (`…/allocations/entity/:entityType/:entityId`)

Ties a sponsor placement to a resource the account is allowed to use.

**Supported `entityType` (path, lowercase):** `club`, `team`, `grade`.

**Ownership rules (backend enforced):**

| Type    | Rule                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------ |
| `club`  | Club `id` must be linked to the account (`club.accounts` includes the account).                              |
| `team`  | Team’s `club` must belong to the account (same as above).                                                    |
| `grade` | Grade’s `competition` must have at least one `club_to_competitions` row whose `club` belongs to the account. |

**Stored `Allocation` shape:**

- Required: `entity` — `{ type: 'club' \| 'team' \| 'grade', id: number }` matching path params.
- Forbidden: root key `accountGroup` (reserved for general allocations).

Optional `extra` object from the JSON body is merged into `Allocation` (must not define `entity` or `accountGroup`).

---

## Publish behaviour

- Creates and updates through these routes set **`publishedAt`** so entries are immediately **published** (aligned with member list filtering on sponsors and allocations).

---

## Logo uploads

- **Route:** `POST …/sponsors/:sponsorId/upload` — multipart, field `file` or `files` (same as onboarding step 2).
- **Response:** `{ data: SponsorDto }` after attaching media to `Logo`.
- Old upload files are **not** deleted from the media library when replacing a logo (no storage cleanup in v1).

---

## Users & permissions

Enable under **Authenticated → Account** (or appropriate role) for each new action:

| Scope                                                        | Handler                                 |
| ------------------------------------------------------------ | --------------------------------------- |
| `api::account.account.createAccountSponsor`                  | `createAccountSponsor`                  |
| `api::account.account.updateAccountSponsor`                  | `updateAccountSponsor`                  |
| `api::account.account.uploadAccountSponsorLogo`              | `uploadAccountSponsorLogo`              |
| `api::account.account.deleteAccountSponsor`                  | `deleteAccountSponsor`                  |
| `api::account.account.listAccountSponsorAllocationsGeneral`  | `listAccountSponsorAllocationsGeneral`  |
| `api::account.account.createAccountSponsorAllocationGeneral` | `createAccountSponsorAllocationGeneral` |
| `api::account.account.updateAccountSponsorAllocationGeneral` | `updateAccountSponsorAllocationGeneral` |
| `api::account.account.deleteAccountSponsorAllocationGeneral` | `deleteAccountSponsorAllocationGeneral` |
| `api::account.account.listAccountSponsorAllocationsEntity`   | `listAccountSponsorAllocationsEntity`   |
| `api::account.account.createAccountSponsorAllocationEntity`  | `createAccountSponsorAllocationEntity`  |
| `api::account.account.updateAccountSponsorAllocationEntity`  | `updateAccountSponsorAllocationEntity`  |
| `api::account.account.deleteAccountSponsorAllocationEntity`  | `deleteAccountSponsorAllocationEntity`  |

Existing: `api::account.account.getAccountSponsors` for read list.

---

## Endpoint summary

| Method | Path                                                                                                  |
| ------ | ----------------------------------------------------------------------------------------------------- |
| POST   | `/api/accounts/:accountId/sponsors`                                                                   |
| PATCH  | `/api/accounts/:accountId/sponsors/:sponsorId`                                                        |
| POST   | `/api/accounts/:accountId/sponsors/:sponsorId/upload`                                                 |
| DELETE | `/api/accounts/:accountId/sponsors/:sponsorId`                                                        |
| GET    | `/api/accounts/:accountId/sponsors/:sponsorId/allocations/general`                                    |
| POST   | `/api/accounts/:accountId/sponsors/:sponsorId/allocations/general`                                    |
| PATCH  | `/api/accounts/:accountId/sponsors/:sponsorId/allocations/general/:allocationId`                      |
| DELETE | `/api/accounts/:accountId/sponsors/:sponsorId/allocations/general/:allocationId`                      |
| GET    | `/api/accounts/:accountId/sponsors/:sponsorId/allocations/entity/:entityType/:entityId`               |
| POST   | `/api/accounts/:accountId/sponsors/:sponsorId/allocations/entity/:entityType/:entityId`               |
| PATCH  | `/api/accounts/:accountId/sponsors/:sponsorId/allocations/entity/:entityType/:entityId/:allocationId` |
| DELETE | `/api/accounts/:accountId/sponsors/:sponsorId/allocations/entity/:entityType/:entityId/:allocationId` |

**Auth:** JWT. Non-owned or missing account → **404** (`Account not found`) for enumeration safety.

---

## Response conventions

- Sponsor mutations: `{ data: SponsorDto }` — same field names as `getAccountSponsors` items (`name`, `logo`, `sponsorshipAllocations`, …).
- Allocation list: `{ data: { items: { id, allocation }[] } }`.
- Allocation mutations: `{ data: { id, allocation } }`.

Errors: **400** validation, **401** unauthenticated, **403** missing scope, **404** account/sponsor/allocation not found, **500** unexpected.

---

## Contract details (implementation; reduces app surprises)

### Request body wrapping

JSON bodies may be sent either as a flat object or nested as **`{ "data": { … } }`** (same pattern as Strapi REST). The backend reads the inner `data` object when present.

### Sponsor `POST` (create)

- **Required:** `name` (non-empty string after trim). Maps to Strapi `Name`.
- **Optional (omit = leave Strapi schema defaults):** `url`, `startDate`, `endDate`, `isActive`, `isPrimary`, `tagline`, `order`, `description`, `isVideo`, `isArticle`, `logoMediaId` (positive integer; connects existing upload file to `Logo`).
- **`logoMediaId` / ABAC:** The API **does not verify** that the file was uploaded by this user or is otherwise scoped to this account — it only checks the id is a positive integer. If arbitrary media ids are a concern, rely on upload flows that only return ids the client may use, or add a follow-up **ownership check** on the upload plugin entry.
- **Defaults:** Anything not sent is **not** written on create; Strapi/content-type defaults apply (e.g. `isActive` default `true`, `Order` default `0`, `isVideo` / `isArticle` defaults per schema). **`account` and `publishedAt` are set by the server** (publish immediately).
- **Immutable via these routes:** **`account`** cannot be changed; there is no field in `PATCH` to move a sponsor to another account.

### Sponsor `PATCH` (update)

- **Partial updates:** Send only fields to change. Omitted keys are left unchanged.
- **Exceptions:** Every successful `PATCH` also refreshes **`publishedAt`** (re-publish timestamp).
- **Nullable via explicit null:** `url`, `startDate`, `endDate`, `tagline`, `description`, `logoMediaId` accept **`null`** to clear (logo clears relation).
- **`name`:** If present, must be non-empty after trim.
- **No optimistic locking:** **Last-write-wins.** No `updatedAt` / version header required or checked.

### Allocation `POST` / `PATCH`

- **General:** Body is the allocation object itself, or `{ "allocation": { … } }`. On **PATCH**, the validated object **replaces** the entire Strapi **`Allocation`** JSON for that row (full document replace, not deep merge into existing keys).
- **Entity `POST`:** Path carries `entityType` / `entityId`; optional `{ "extra": { … } }` is shallow-merged into `{ entity: { type, id } }`. `extra` must **not** contain `entity` or `accountGroup`.
- **`PATCH` entity:** Send a full **`allocation`** object that passes validation (must include `entity` matching the path).

### Allocation JSON beyond reserved keys

- **No max length or key whitelist** in application code beyond the reserved-key rules (`entity` vs `accountGroup`) and shape checks above. Effective limits are **DB/Strapi JSON column** and ops policy. Treat as **structured JSON blob**: extra keys allowed on general allocations via spread of the payload; entity create merges `extra` only.

### `entityId` in path

- **Positive integer** — Strapi **document id** for `api::club.club`, `api::team.team`, or `api::grade.grade`. **Not** PlayHQ/slug strings.

### Deleting a sponsor

- **Linked allocations:** Deleted **automatically** before the sponsor (no orphan allocation rows, no extra step for the client).
- **Last / only primary:** **No** guard; deleting a primary sponsor is **allowed** if the client calls `DELETE`.

### Logo upload (`POST …/upload`)

- **Multipart:** Field **`file`** or **`files`** (same as onboarding step 2).
- **Limits / MIME / SVG:** Not customised in `config/plugins.js` for this feature; behaviour is **Strapi upload plugin + provider defaults** (S3). Size and type rules follow global Strapi/media settings and any reverse-proxy limits in each environment.
- **Concurrent requests:** **No ordering guarantees** between parallel upload and `PATCH`; last successful write to `Logo` wins.

### Validation errors (400, etc.)

- Handlers use Strapi/Koa helpers (`badRequest`, `notFound`, …). Responses follow the **usual Strapi error envelope** (typically `error.status`, `error.message` — exact shape per Strapi version). **No** field-level `details` array is produced by these routes today; messages are a **single string**.
- Services use internal **`code`** strings (e.g. `INVALID_BODY`, `SPONSOR_NOT_FOUND`) for logs/maintainers; **they are not currently duplicated in the JSON body** unless the API is extended to return them.

**Example payloads (Strapi ~4.24 style; verify in your environment):**

```json
// HTTP 400 — validation / bad request (shape may include `name`, `details`)
{
  "error": {
    "status": 400,
    "message": "name is required."
  }
}
```

```json
// HTTP 404 — not found (handlers use generic messages; same envelope)
{
  "error": {
    "status": 404,
    "message": "Account not found."
  }
}
```

### Allocation lists (`GET` general / entity)

- **Sort order (contract):** Lists load published rows with **`orderBy: id` ascending**; nested **`sponsorshipAllocations`** inside SponsorDto (e.g. `GET …/sponsors`, sponsor mutation responses) are sorted by allocation **`id` ascending** after the published filter. Stable for UI/tests.
- **No pagination.** **Full list** for that sponsor: **published** allocation rows only, then **filtered in memory** (general = has `accountGroup`, no root `entity`; entity = matches path `entityType` / `entityId`).
- **No** filter by `accountGroup` on `GET` beyond the general/entity split. Large accounts: expect **unbounded** list size unless product adds pagination later.

### 403 vs 404

- **Wrong account / not owner:** Same as other account routes — handlers respond **404** `Account not found` when the JWT user does not own `accountId` (**not** 403), including allocation routes.
- **Sponsor not on account:** **404** `Sponsor not found.`
- **Entity not in account scope** (entity create/update with invalid club/team/grade): **404** with message e.g. entity not found for account (implementation message: `Entity not found for this account.`).
- **403:** User **authenticated** but **Users & Permissions** role lacks the specific **`api::account.account.<action>`** scope (Strapi layer, before handler).

### Auth, JWT, CORS

- **JWT:** Same issuer and usage as existing `/api/accounts/:accountId/*` routes.
- **New scopes:** Listed above; bootstrap enables them for **Authenticated** on server start (verify **staging/prod** after deploy if Admin toggles differ).
- **CORS / cookies:** Unchanged from other Account custom routes (including `GET …/sponsors`).

### Idempotency / races

- **`POST` create sponsor / allocation:** **Not** idempotent; duplicate submits create duplicate rows unless the client dedupes.
- **No** client idempotency-key header support.
- **`PATCH`:** Last-write-wins; no ETag / `If-Match`.

### Alignment with `GET …/sponsors` (SponsorDto)

- **`POST` / `PATCH` / `POST …/upload`** return **`{ data: <SponsorDto> }`** using the same **`mapSponsor`** as the list endpoint (camelCase fields, nested **`sponsorshipAllocations`**: only **published** child rows, `id` + `allocation`).
- For a given sponsor, that body should **match** what `GET …/sponsors` would show for that id **at the same moment** (same populate rules). **Subset mismatch** should only occur if another request changes data between calls.

### Rate limiting / abuse

- **Not documented or enforced** in this API layer. Treat as **out of scope** for the handoff unless compliance or platform (edge,WAF) adds global limits.

---

## Related code

- Handlers: `src/api/account/controllers/account.js`
- Routes: `src/api/account/routes/custom-account.js`
- Sponsor DTO / list: `src/api/account/controllers/services/sponsorDto`, `getAccountSponsorsPayload`
- Mutations: `accountSponsorsMutations`, `accountSponsorAllocations`
