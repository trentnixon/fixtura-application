# App request: Association club directory (for Club Logos UI)

**From:** Fixtura App (frontend) Team  
**To:** CMS (Strapi) Backend Team  
**Date:** 2026-05-25  
**Feature:** `/o/:accountId/club-logos` (members UI, association accounts only)

---

## Purpose

Associations need to **add or update club logos** for member clubs where those clubs **do not** have their own Fixtura account or pre-configured branding. The Club Logos screen is the UX surface for that.

To do that reliably, the app needs a **single, authoritative list of clubs under the association’s competitive scope**, aligned with **all competitions and grades** the CMS attributes to that account—not with sponsor allocation rows or heuristic client joins.

This document asks for a **new account-scoped read endpoint** (or equivalent contract) dedicated to that list.

---

## What the app does today (interim — not sufficient)

Implementation today is **temporary**:

- Calls existing `GET /api/accounts/:accountId/sponsor-entity-targets` and derives clubs from `type === "club"` plus `meta.clubId` / `meta.clubName` on other targets (`src/app/(members)/o/[accountId]/club-logos/`).
- **Why this fails product alignment:**
  - The sponsor targets catalogue reflects **assignable sponsor entities**, not necessarily **every club** that participates across comps and grades.
  - Names and linkage can drift from the season/competition truth the association expects for **logo stewardship**.

We want to **replace** this with a backend-defined directory once shipped.

---

## Requirements (must-have)

1. **Auth & ownership**
   - Same pattern as other account routes: JWT required; user must own the Strapi account id (`accountId` path segment).
   - Return `400`/`403`/`404` consistent with existing account proxies when out of scope.

2. **Account type behaviour**
   - **Association organisation** (`account_type` ≠ club id `1` in app jargon): endpoint returns the club directory (see payload below).
   - **Club organisation** (`account_type === 1`): either `403`/`404`, or **`200` with empty `clubs` array—pick one stable contract.** (App sends club accounts to dashboard and hides nav; defence-in-depth prefers explicit empty or forbidden.)

3. **Semantic coverage**
   - List must reflect clubs that participate under the association’s umbrella across **scope implied by comps and grades** linked to that account—as **you** resolve in CMS (teams → clubs → competitions → account). The app must not guess by walking sponsor targets or stitching season-hub list rows alone.
   - **Dedupe:** one row per logical Strapi `club` document id even if that club appears in many comps/grades.
   - **Sort:** stable **alphabetical** ordering by display name (`locale-aware` ideally; ASCII acceptable if documented).

4. **Payload**

   Minimal v1 shape the UI needs:

   ```json
   {
     "data": {
       "clubs": [
         {
           "id": 32961,
           "name": "Example Cricket Club",
           "logoUrl": null
         }
       ]
     }
   }
   ```

   | Field                          | Meaning                                                                                                                                                                   |
   | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | `clubs[].id`                   | Strapi **`club`** document id (numeric). Same id the app uses elsewhere (e.g. club-trigger scrape, entity allocation `entityType=club`).                                  |
   | `clubs[].name`                 | Canonical display label for UI (prefer official club name from CMS).                                                                                                      |
   | `clubs[].logoUrl` _(optional)_ | If CMS already has a persisted logo/media URL per club Association override, expose it—**omit key or `null` if not modeled yet.** v1 UI can hide until write path exists. |

5. **BFF alignment**
   - App calls Next BFF routes like other account proxies; suggest mirroring naming under:

     `GET /api/accounts/:accountId/club-logos-directory`

     _(Exact path negotiable—keep it account-scoped and obvious.)_

6. **Performance**
   - Single round-trip suitable for rendering the Club Logos page (pagination **not required** initially if club counts stay bounded—if pagination is mandated, coordinate with frontend).

---

## Nice-to-have (can be phase 2)

- `updatedAt` / `logoUpdatedAt` per club row for stale UI hints.
- Optional `associationId` or relationship metadata **only if** helpful for auditing—not required for rendering the list.

---

## Out of scope in this doc

- **Writes** (upload PATCH, media upload URLs, Strapi multipart flow). See [app-request-association-club-logo-write-endpoint.md](../request/app-request-association-club-logo-write-endpoint.md).

---

## Open questions for CMS

**Resolved** in [app-handoff-account-club-logos-directory-endpoint.md](../handoff/app-handoff-account-club-logos-directory-endpoint.md): scope source of truth, club-account `200` + empty clubs, `logoUrl` cascade, inclusion of clubs with own accounts, published/active filters, error contract.

---

## References

- Club Logos UI folder: [`src/app/(members)/o/[accountId]/club-logos/.docs/readMe.md`](<../../../src/app/(members)/o/[accountId]/club-logos/.docs/readMe.md>)
- Club Logos directory panel: [`src/app/(members)/o/[accountId]/club-logos/_components/club-logo-directory-panel.tsx`](<../../../src/app/(members)/o/[accountId]/club-logos/_components/club-logo-directory-panel.tsx>) _(replaced interim sponsor-targets derivation)_
- Similar account-scoped read style: [app-handoff-sponsor-entity-targets-endpoint.md](../handoff/app-handoff-sponsor-entity-targets-endpoint.md)
- **Implementation handoff (Q&A + checklist + short paste):** [app-handoff-account-club-logos-directory-endpoint.md](../handoff/app-handoff-account-club-logos-directory-endpoint.md)

---

## Status

**Agreed.** CMS ⇄ FE contract documented in [.comms/data-fetching/handoff/app-handoff-account-club-logos-directory-endpoint.md](../handoff/app-handoff-account-club-logos-directory-endpoint.md). Frontend consumes `GET /api/accounts/:accountId/club-logos-directory` via BFF (`useAccountClubLogosDirectory`).
