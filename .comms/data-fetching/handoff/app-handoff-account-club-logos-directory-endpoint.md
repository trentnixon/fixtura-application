# App: Association club directory — `GET /api/accounts/:accountId/club-logos-directory`

**From:** CMS (Strapi) Backend Team → Fixtura App (frontend) Team  
**Date:** 2026-05-26  
**Purpose:** Authoritative v1 **read-only** club list for the Club Logos members route (`/o/:accountId/club-logos`), replacing interim sponsor-targets derivation.

**Prerequisite request:** [app-request-association-club-directory-endpoint.md](../request/app-request-association-club-directory-endpoint.md)

---

## Document location (canonical + Backend mirror)

| Copy                                     | Purpose                                                                                                                                                                                         |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Canonical (Fixtura application repo)** | This file: **`.comms/data-fetching/handoff/app-handoff-account-club-logos-directory-endpoint.md`** — version-controlled with frontend; QA in **CMS confirmation checklist** updates here first. |
| **Backend repo**                         | Mirror under CMS conventions (e.g. **`.comms/FrontEnd/handoff/app-handoff-account-club-logos-directory-endpoint.md`**) so both teams share one narrative.                                       |

---

## Endpoint

| Property       | Value                                                     |
| -------------- | --------------------------------------------------------- |
| **Method**     | `GET`                                                     |
| **Path**       | `/api/accounts/:accountId/club-logos-directory`           |
| **Path param** | `accountId` — positive integer Strapi account document id |
| **Auth**       | **Required.** `Authorization: Bearer <jwt>`               |

Ownership and JWT behaviour match **`GET /api/accounts/:accountId/sponsor-entity-targets`**: authenticated user must own the account referenced by `:accountId`.

| Item                                                       | v1 expectation                                                                                                                                                                                                                                                              |
| ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Users-permissions action** _(confirm exact Strapi slug)_ | **Proposed:** `getAccountClubLogosDirectory` (mirror naming of `getAccountSponsorEntityTargets`). Enable **Authenticated** → Account → that action once registered. CMS: confirm final key if different.                                                                    |
| **Error response body**                                    | Match other account custom controllers the app proxies today: **`{ error: { code, message } }`** (plus `details` if your standard adds it)—same semantics as **`getAccountSponsorEntityTargets`** / sibling routes. HTTP status as below.                                   |
| **Cache-Control**                                          | **Recommended:** **`private, no-store`** (or **`private, max-age=0`**)—member‑scoped roster; aligns with correctness over aggressive caching. If you prefer alignment with onboarding lookups (**`private, max-age=3600`**), state explicitly—**CMS confirm final header.** |

**App BFF:** mirror as `GET /api/accounts/:accountId/club-logos-directory` (proxy to Strapi with same JWT + guards), consistent with existing account proxies.

---

## Locked product / scope decisions

### 1. Source of truth for “which clubs”

| Source                                | Role                                                                                                                                                                                                                                                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **In scope v1**                       | Account pipeline: **`account → linked association(s) → competitions` in scope**, then **`union(club_to_competition ∪ team.club)`** over teams under those competitions → **dedupe** by **`club.id`** → **sort** display name (**`localeCompare`**, locale-aware if available) → tie-break **`id` ascending**. |
| **Multiple associations per account** | **Yes — union.** Run the same pipeline for **each** association linked to the account, then dedupe globally by **`club.id`** (one row per club).                                                                                                                                                              |
| **Zero competitions**                 | **`HTTP 200`** with **`{ "data": { "clubs": [] } }`** (empty list)—not an error.                                                                                                                                                                                                                              |
| **Explicitly NOT used v1**            | **`club.associations` M2M** / onboarding-only club↔association lists; **`GET …/sponsor-entity-targets`**; heuristic FE-only stitching of season-hub payloads.                                                                                                                                                 |

This matches competitive scope: comps the account resolves through—not sponsor catalogue.

### 2. Club-account behaviour (`account_type.id === 1`)

**Contract:** **`HTTP 200`** with **`{ "data": { "clubs": [] } }`** (empty array).

Do **not** return `403` solely for organisation type — keeps error surface aligned with “no clubs in scope” and allows the app to treat all successful bodies uniformly. **Invalid path / forbidden user / missing account** still use normal error semantics below.

### 3. `logoUrl` resolution (club entity only, v1)

Logos live on **`club`** only for v1. **Association-level logo overrides / uploads are out of scope** for this read path and remain a future topic.

Resolved **`logoUrl`** per club row, **first defined non-empty usable URL wins**, else **`null`**:

1. **`Logo`** → use **`url`** (or equivalent CMS media/CDN URL after resolution)
2. **`PlayHQLogo`** → **`url`**
3. **`ParentLogo`** → **`url`** / parent-provided logo per CMS

_(Exact field accessors are CMS internal; semantic order above is FE-locked.)_

Rules:

| Rule        | Requirement                                                                                                                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| URL shape   | **Absolute URLs only** (`https:` preferred)—suitable for `<img src>`. Relative storage paths must be **resolved server-side** to an absolute URL; if resolution fails, treat as no logo (**`logoUrl`: `null`**). |
| Missing     | Omit key → treat as **`null`** in contract; **`null`** is acceptable explicitly.                                                                                                                                 |
| Placeholder | **No** invented default image URL; if nothing resolves → **`logoUrl`: `null`**.                                                                                                                                  |

### 4. Clubs that also have a Fixtura (club) account

**Include every club** returned by the scope algorithm above regardless of whether that club links to another Strapi **`account`** (Fixtura “club organisation”).

Rationale:

- Associations may still need visibility of logos for stewardship and consistency reporting.
- Excluding linked accounts duplicates policy across CMS and splits the directory from competitive scope.
- If product later wants a **“managed in own organisation”** badge, add a **`hasOwnAccount?: boolean`** (or similar) in a phase 2 handoff—not required v1.

### 5. Row filters (published + active only)

| Filter                       | v1 FE–CMS locked rule                                                                                                                                                                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Published**                | **Yes** — only **published** club documents (**`publishedAt` set** where Strapi uses draft/publish, or equivalent `publicationState` / published-only reads). Traverse only published competition/team/etc. edges consistent with sponsor-target / season-hub read-model. |
| **`isActive === false`**     | **Exclude** clubs where **`isActive === false`** when that field exists (same semantics as other app read models—if CMS uses another flag for archived, omit those rows equivalently).                                                                                    |
| **Clubs missing `isActive`** | Treat **include** unless CMS confirms “default inactive”—state in backend README if deviation.                                                                                                                                                                            |

If a relation blocks visibility (unpublished competition, etc.), dropping that path from the union is intentional.

---

## Success response (`HTTP 200`)

```json
{
  "data": {
    "clubs": [
      {
        "id": 32961,
        "name": "Example Cricket Club",
        "logoUrl": "https://cdn.example/strapi/asset.png"
      }
    ]
  }
}
```

| Field             | Notes                                                  |
| ----------------- | ------------------------------------------------------ |
| `clubs[].id`      | Strapi **`club`** document id (numeric).               |
| `clubs[].name`    | Canonical CMS display name for the club row.           |
| `clubs[].logoUrl` | Resolved per §3 above, or **`null`** / omit when none. |

Empty directory: **`"clubs": []`**.

---

## Error & permissions contract

Align with **`getAccountSponsorEntityTargets`** and sibling account reads:

| HTTP    | When                                                                         |
| ------- | ---------------------------------------------------------------------------- |
| **400** | Malformed `:accountId` (non-positive / non-numeric etc.)                     |
| **401** | Missing or invalid JWT                                                       |
| **403** | JWT valid but forbidden (e.g. permission plugin / role cannot invoke action) |
| **404** | Account not found or not owned by user                                       |
| **500** | Server error                                                                 |

Response shape: **`{ error: { code: string; message: string; details?: … } }`** (match **`getAccountSponsorEntityTargets`** and sibling **`/api/accounts/:accountId/...`** custom routes)—BFF forwards as today.

---

## CMS confirmation checklist _(paste / email)_

Below: **answers we are carrying**—please reply **confirm** or **correct** inline so production matches one contract.

### Scope & data source

| #   | Question                                                                                                                                                                                | Answer (v1 unless noted) |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| 1   | Club list built from **account → linked associations → competitions → union(`club_to_competition`, `team.club`)**, **not** from `club.associations` M2M nor **sponsor-entity-targets**? | **Yes — agreed.**        |
| 2   | Account linked to **multiple** associations → **union** clubs across all?                                                                                                               | **Yes.**                 |
| 3   | Account has **zero** competitions → always **`200`** + **`{ clubs: [] }`**?                                                                                                             | **Yes.**                 |

### Inclusion filters

| #   | Question                                                                                                | Answer                                                                 |
| --- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 4   | Include clubs that **already have** their own Fixtura (**club**) **account**, or only “external” clubs? | **Include all clubs in scope**, whether or not they link an `account`. |
| 5   | **`publishedAt`** — only published clubs?                                                               | **Yes** (equivalent CMS published-only rule acceptable).               |
| 6   | **`isActive === false`** — excluded?                                                                    | **Yes**, when field exists / same as other read APIs.                  |

### Account type

| #   | Question                                                                             | Answer                       |
| --- | ------------------------------------------------------------------------------------ | ---------------------------- |
| 7   | **`account_type === 1`** (club org): **`200`** + empty **`clubs`** vs **`403/404`**? | **`200` + `{ clubs: [] }`.** |

### Logo (`logoUrl`)

| #   | Question                                                     | Answer                                                                           |
| --- | ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| 8   | Resolution order?                                            | **`Logo`** → **`PlayHQLogo`** → **`ParentLogo`** → **`null`**.                   |
| 9   | URLs **absolute** (base prepended for relative CMS storage)? | **Yes** — resolve server-side; **`null`** if cannot resolve.                     |
| 10  | Default placeholder asset in API?                            | **No** — **`null`**; UI owns empty state.                                        |
| 11  | **`logoUrl`** v1 scope                                       | **Club-native logos only.** No association-junction overrides on **read** in v1. |

### API contract

| #   | Question                      | Answer                                                                                                   |
| --- | ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| 12  | Path                          | **`GET /api/accounts/:accountId/club-logos-directory`**                                                  |
| 13  | users-permissions action name | **`getAccountClubLogosDirectory`** _(proposed—confirm slug)_                                             |
| 14  | Error envelope + status codes | **`400` / `401` / `403` / `404` / `500`** + **`{ error: { code, message } }`** as sibling account routes |
| 15  | **Cache-Control**             | **`private, no-store`** recommended — **CMS confirm** if different                                       |
| 16  | Sort                          | Name **`localeCompare`** (locale-aware if Strapi locale known); **`id ascending`** tie-break             |

### Delivery & phased work

| #   | Topic                    | Note                                                                                                                                                                                          |
| --- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 17  | Handoff doc living place | Canonical: **`application/.comms/data-fetching/handoff/app-handoff-account-club-logos-directory-endpoint.md`**. Backend: mirror copy under your layout (e.g. **`.comms/FrontEnd/handoff/`**). |
| 18  | Writes / PATCH / uploads | **Phase 2** — separate handoff after read path shipped.                                                                                                                                       |

### Short paste (Slack/email)

```
v1 club directory — please confirm:
• Scope = account → linked association(s) → competitions → union(club_to_competition, team.club), deduped by club id, sorted A–Z (name localeCompare; tie-break id asc). NOT club.associations M2M, NOT sponsor-entity-targets.
• Multi-association accounts: union clubs across all associations.
• Zero competitions: 200 + clubs: []
• Filters: published only (publishedAt / equivalent); exclude isActive === false when present
• Include clubs even if they have their own Fixtura club account
• Club-org accounts (type 1): 200 + empty clubs
• logoUrl: Logo → PlayHQLogo → ParentLogo → null; absolute URLs server-resolved; no API placeholder
• GET /api/accounts/:accountId/club-logos-directory ; permission action getAccountClubLogosDirectory (confirm slug)
• Errors match other account reads (400/401/403/404/500 + error envelope); Cache-Control: private,no-store preferred—confirm if different
• Writes phase 2, separate doc
Canonical handoff: application repo .comms/data-fetching/handoff/app-handoff-account-club-logos-directory-endpoint.md — please mirror under Backend per your conventions.
```

---

## Explicitly out of scope (v1)

- **Writes:** logo upload, PATCH club media, multipart, association overrides — **confirmed phase 2, separate handoff.**
- **Pagination:** not required v1 unless large-tenant rollout forces it (coordinate separately).
- **Extra metadata:** no `updatedAt`, `hasOwnAccount`, association ids in payload unless a follow-up ticket requests them.

---

## Frontend follow-up

- **Done:** BFF **`GET /api/accounts/:accountId/club-logos-directory`**, **`getAccountClubLogosDirectory`**, **`useAccountClubLogosDirectory`**, and Club Logos panel consume CMS directory (see `club-logo-directory-panel.tsx`). Interim sponsor-targets derivation removed.
- Respect **`logoUrl: null`** and absolute URLs only; no client-side placeholder CDN unless product adds one later.
- **Write path (agreed):** [cms-handoff-club-logos-fe.md](../handoff/cms-handoff-club-logos-fe.md) — M1/W2; FE/BFF wired.

---

## Status

**Ready for CMS sign-off.** Product rules are articulated in §1–§5 and echoed in **CMS confirmation checklist** (below). **`getAccountClubLogosDirectory`** permission slug and **`Cache-Control`** need explicit backend **confirm**—then frontend/BFF proceeds. After ship, canonical handoff + Backend mirror stay in parity.
