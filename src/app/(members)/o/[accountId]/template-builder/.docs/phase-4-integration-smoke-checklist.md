# Phase 4 — Integration smoke checklist

**Route:** `/o/[accountId]/template-builder`  
**When to run:** After CMS Phase 4 PUT is deployed and **putTemplateOptions** is enabled in Strapi Admin (see [handoff-put-template-options.md](../.comms/response/handoff-put-template-options.md)).  
**Related:** [handoff-put-template-options.md](../.comms/response/handoff-put-template-options.md), [phase-1-data-contract.md](./phase-1-data-contract.md)

---

## Preconditions

- [ ] Logged in as a user who owns the test `accountId`
- [ ] Strapi permission `getAllTemplateOptions` enabled (catalog GET works)
- [ ] Strapi permission `putTemplateOptions` (or agreed name) enabled for Authenticated
- [ ] App BFF deployed with `PUT /api/accounts/:accountId/template-options`
- [x] CMS PUT accepts **flat** body (legacy nested `data` removed per handoff)

---

## A. Account with existing `templateOptionId`

| Step | Action                          | Expected                                             |
| ---- | ------------------------------- | ---------------------------------------------------- |
| A1   | Open template builder           | Catalog loads; editor shows saved labels             |
| A2   | Change one field (e.g. palette) | Dirty = Yes; Save enabled                            |
| A3   | Click **Save changes**          | Button shows Saving…; then success message           |
| A4   | Confirm dirty clears            | Dirty = No; changed count = 0                        |
| A5   | Reload page                     | Same selection persisted                             |
| A6   | Raw dump                        | `currentSelection` reflects saved ids                |
| A7   | Branding card (optional)        | Template option id label unchanged unless mode saved |

**Network (DevTools):**

- [ ] `PUT …/api/accounts/{id}/template-options` → **200** (update) or **201** (create)
- [ ] Request body: flat keys, `useBackground` is enum string (e.g. `"Gradient"`)
- [ ] Response: `{ data: { templateOptionId } }` or legacy normalized by BFF
- [ ] Then `GET /api/account/me` (refetch)
- [ ] Then `GET …/all-template-options?templateOptionId=…`

---

## B. Account without `templateOptionId` (first save)

| Step | Action                                                    | Expected                                   |
| ---- | --------------------------------------------------------- | ------------------------------------------ |
| B1   | Use account where branding/me show no template option id  | `currentSelection: null` in dump           |
| B2   | Set **Category**, **Mode**, **Use background** (required) | Save enabled when dirty                    |
| B3   | Save                                                      | Success; no gateway redirect               |
| B4   | After refetch                                             | `/account/me` shows new `templateOptionId` |
| B5   | Catalog GET                                               | Uses new id; `currentSelection` populated  |
| B6   | Reload                                                    | Hydration uses me → catalog with id        |

---

## C. Validation and errors (app + CMS)

| Step | Action                               | Expected                                |
| ---- | ------------------------------------ | --------------------------------------- |
| C1   | Dirty save with Category unset       | Inline validation; no PUT               |
| C2   | Dirty save with Mode unset           | Inline validation; no PUT               |
| C3   | Dirty save with Use background unset | Inline validation; no PUT               |
| C4   | Invalid catalog id (if reproducible) | **400** + inline error; draft unchanged |
| C5   | Save failure                         | Draft preserved; Reset still works      |

---

## D. `useBackground` enum

| Step | Action                                                                  | Expected                                   |
| ---- | ----------------------------------------------------------------------- | ------------------------------------------ |
| D1   | Picker lists Solid, Gradient, Video, Image, Graphics, Texture, Particle | No Yes/No/Unset boolean labels             |
| D2   | Save with `useBackground: "Video"`                                      | PUT body string `"Video"`; GET echoes same |

---

## D2. Conditional background asset UI

| Step | Action                                                              | Expected                                                                    |
| ---- | ------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| D2a  | Set use background to **Video**                                     | Only **Video** background-asset row visible (plus primary settings)         |
| D2b  | Switch to **Gradient**                                              | **Gradient** row visible; Video row hidden; stale video id cleared in draft |
| D2c  | Set use background to **Solid**                                     | No background-asset section                                                 |
| D2d  | Save after switching Video → Gradient with stale video id in memory | PUT sends `templateVideoId: null`; gradient id preserved if set             |
| D2e  | Preview after D2b                                                   | Preview does not show video asset when use background is Gradient           |
| D2f  | **Texture** + pick catalog texture with media URL                   | Remotion preview background image updates (not example Print Texture)       |
| D2g  | **Graphics** + pick noise                                           | Preview noise variant matches selection (not example default only)          |
| D2h  | **Particle** + change particle row                                  | Preview particle type/count reflects selection                              |

---

## E. Video field (CMS target only)

| Step | Action              | Expected                                 |
| ---- | ------------------- | ---------------------------------------- |
| E1   | Set Video id + save | `templateVideoId` in PUT body            |
| E2   | Refetch catalog     | `currentSelection.templateVideo` matches |

Skip if CMS target not yet saving video.

---

## F. Read path regression

| Step | Action                         | Expected                     |
| ---- | ------------------------------ | ---------------------------- |
| F1   | Invalid route account segment  | Redirect to select-org       |
| F2   | Stale/wrong `templateOptionId` | Gateway redirect (unchanged) |
| F3   | Catalog **403**                | Redirect; not a save defect  |

---

## G. Branding overlap (manual policy)

| Step | Action                                         | Expected                            |
| ---- | ---------------------------------------------- | ----------------------------------- |
| G1   | Save mode in template builder                  | Mode in `currentSelection`          |
| G2   | Save palette in branding workspace             | Theme/mode on branding card updated |
| G3   | Avoid editing mode in both UIs without refetch | Document last-write-wins if tested  |

---

## Sign-off

| Role    | Name | Date | Pass? |
| ------- | ---- | ---- | ----- |
| App     |      |      |       |
| CMS     |      |      |       |
| Product |      |      |       |

**Notes / blockers:**

---

## If save fails

| Symptom                          | Likely cause                                       |
| -------------------------------- | -------------------------------------------------- |
| **403** on PUT                   | `putTemplateOptions` not enabled for Authenticated |
| **400** `CATEGORY_NOT_AVAILABLE` | Private category id in body                        |
| **400** `UNKNOWN_OR_DRAFT_*`     | Unpublished catalog id                             |
| **401**                          | Session / JWT issue                                |

**Action:** See handoff § Permissions and error codes.
