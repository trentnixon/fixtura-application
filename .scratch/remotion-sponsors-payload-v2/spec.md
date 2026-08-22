# Spec: Remotion preview sponsors payload v2

Status: ready-for-agent

Related: `.comms/remotion/scheduledSchameaUpdates` (Scheduler → Remotion handoff)

## Problem Statement

Asset preview examples and the dynamic sponsor swap still use the legacy club sponsors shape (`default` slot map + fat sponsor rows). Remotion compositions now consume Scheduler sponsors payload v2 (`primary` / `general` arrays, `sponsorNum`, per-row `primaryForScreen`, slim DTOs). Preview therefore cannot honestly show a user’s primary and general sponsors on cricket demo assets.

## Solution

Update cricket example datasets and the account-sponsor merge path so preview assets match sponsors payload v2 for **primary and general only**. Entity grade/team logos stay empty in demos (no entity links in demo content). When account sponsors load, merge replaces account-level sponsors and stamps `primaryForScreen` on content rows that already carry sponsor fields.

## User Stories

1. As a club admin, I want asset preview to show my primary sponsors, so that branding previews match what members will see on graphics.
2. As a club admin, I want asset preview to show my general sponsors on outro / group sequences, so that end-card sponsorship looks correct.
3. As a club admin, I want preview to hide sponsors when I have none active, so that empty accounts do not show leftover example logos.
4. As a club admin, I want inactive sponsors excluded from preview, so that archived or inactive logos never appear.
5. As a club admin with position-slot allocations, I want those slots to drive primary vs general order in preview, so that manage-sponsors placement matches Remotion.
6. As a club admin with unassigned primary-flagged sponsors, I want them auto-filled into empty primary slots, so that preview still works before every slot is assigned.
7. As a club admin with unassigned general sponsors, I want them filled into general slots in order, so that outro order is predictable.
8. As an association admin, I want the same primary/general preview behaviour, so that account type does not change the account-level sponsor contract.
9. As a product engineer, I want example JSON to ship empty sponsor shells, so that git never embeds stale logo URLs.
10. As a product engineer, I want merge to overwrite example sponsors entirely, so that example keys like legacy `default` cannot leak into Remotion.
11. As a product engineer, I want slim sponsor DTOs (`id`, `name`, `logo`), so that preview matches Scheduler’s guaranteed fields.
12. As a product engineer, I want `sponsorNum` derived as primary length + general length, so that outro timing matches production assets.
13. As a product engineer, I want `video.metadata.includeSponsors` set from whether any primary/general exist, so that Remotion outro gating matches the vendor bundle.
14. As a product engineer, I want each content row’s `primaryForScreen` set to account primaries at merge time, so that footers that prefer per-row primaries work in preview.
15. As a product engineer, I want demo `assignSponsors` arrays left empty, so that we do not invent entity logos without demo entity links.
16. As a product engineer, I want recursive stamping only on objects that already expose `assignSponsors` and/or `primaryForScreen`, so that unrelated nested shapes are untouched.
17. As a product engineer, I want cricket demo generators to emit the same v2 empty sponsor shapes, so that regenerating demos does not reintroduce legacy name-object `assignSponsors`.
18. As a product engineer, I want Top5 / performance generators to stop stuffing competition/grade/team **names** into `assignSponsors`, so that Remotion never treats metadata blobs as sponsor logos.
19. As a cricket preview user, I want Ladder / Results / Upcoming / Weekend / Top5 / Performances examples updated, so that every cricket composition path I can open is on v2 shells.
20. As a cricket preview user, I want Roster player `sponsors: []` left alone when it is not the v2 row contract, so that we do not invent a second sponsor model on roster rows.
21. As a QA engineer, I want builder unit tests for null, inactive, slot-honouring, and primary/general fill, so that swap regressions are caught without Remotion.
22. As a QA engineer, I want merge tests that assert `default` is gone and rows receive `primaryForScreen`, so that the end-to-end preview contract is locked.
23. As a future multi-sport engineer, I want AFL/Netball dummy JSON out of this change, so that cricket-gated preview can ship without a full sport matrix rewrite.
24. As a Remotion composer, I want buckets kept separate (no merge of primary + general + entity into one list), so that layout ownership stays in Remotion.
25. As a platform engineer, I want Scheduler entity-matching behaviour documented as out of scope for demos, so that preview does not pretend to reimplement Scheduler.

## Implementation Decisions

1. **Seams (test at these only)**
   - Account sponsors → club sponsors payload builder (pure function).
   - Account branding merge into example dataset (includes sponsor payload write, `includeSponsors`, and recursive row stamp).
   - Cricket demo generator row shapes (unit tests on generated rows / sanitised club sponsors), not Remotion render output.

2. **Account-level shape** replaces legacy `{ default, primary }` with:
   - `primary: SponsorDto[]` (max driven by existing primary position slots)
   - `general: SponsorDto[]` (ordered general position slots)
   - `sponsorNum: number` (= primary.length + general.length)

3. **Sponsor DTO** is slim only: `{ id, name, logo: { id, url } }`.

4. **Slot-fill algorithm retained**: global position allocations win; remaining active sponsors fill empty primary then general slots (overflow primary into general), matching manage-sponsors semantics.

5. **`includeSponsors`** is written to `videoMeta.video.metadata.includeSponsors` (Remotion vendor path), not the handoff’s `videoMeta.data.includeSponsors` typo/alternate.

6. **Per-row stamp**: for any object already containing `assignSponsors` and/or `primaryForScreen`, set `primaryForScreen` to a copy of account primaries and force `assignSponsors` to `{ competition: [], grade: [], team: [] }`.

7. **No entity logos in demos** — grade/team/competition arrays stay empty because demo fixtures have no entity allocation links.

8. **Static cricket examples** ship empty shells; merge is source of truth at runtime.

9. **Sport scope**: cricket dummy assets + cricket demo generators only.

10. **Do not dual-write** legacy `default` slot maps.

## Testing Decisions

- Good tests assert external payload shape and merge outcomes with literal expected DTOs, not internal slot maps.
- Modules under test: club-sponsors payload builder; branding merge (sponsor portions); cricket generators that previously emitted legacy `assignSponsors` metadata objects.
- Prior art: existing vitest files beside those modules in remotion-asset-preview.
- Do not add Remotion composition snapshot tests for this sponsor-only change.

## Out of Scope

- Rendering / dual-placement layout changes inside Remotion compositions.
- Injecting real entity (grade/team) sponsors into demo rows.
- AFL / Netball / other sports dummy JSON.
- CMS AccountTheme sponsors shape or Scheduler ingestion.
- Changing manage-sponsors CRUD APIs.
- Updating vendor `preview.mjs` (already on v2 readers).

## Further Notes

- Handoff checklist item “design for up to 4 primaries + 1 entity on a content screen” is Remotion layout ownership; preview only supplies empty entity arrays.
- Team of the Week demo rows may lack `assignSponsors` / `primaryForScreen` keys; under the recursive stamp rule they are not forced. Account-level `club.sponsors` still drives intro/outro via Remotion fallbacks.
