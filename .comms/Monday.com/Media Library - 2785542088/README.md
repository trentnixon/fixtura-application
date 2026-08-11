# Developer Delivery Guide — Account Media Library

> Monday parent `2785542088` | Board `5029957869` — Fixtura Application | Prepared 17 July 2026

This is the development handoff for bringing the existing account Media Library into the new Fixtura Application. It combines the parent ticket, all subitems and updates, the attached Monday development handoff, and the current Application repository.

The implementation team should read this file and [LLM-TEAM-PROMPT.md](./LLM-TEAM-PROMPT.md), complete the phases in dependency order, and maintain [SIGN-OFF-CHECKLIST.md](./SIGN-OFF-CHECKLIST.md) as the evidence ledger used for Monday reporting.

## Source authority

- [Monday parent ticket](https://trentnixons-team-company.monday.com/boards/5029957869/pulses/2785542088)
- [Media Library — Focused Development Handoff](https://trentnixons-team-company.monday.com/docs/5029988554)
- The eight focused Monday subitems listed in the phase table below
- Repository evidence, where it confirms an existing convention or contract

If older subitems conflict with the focused handoff, the focused handoff wins. Do not silently expand scope.

## Product outcome

An authenticated user can open the selected account's Media Gallery in the new Application and:

- view account-owned Media Library images;
- upload one supported image at a time;
- add and edit title, tags, age group, asset type, active state, and focal point;
- edit alternative text when supported by the existing CMS upload relation;
- activate or deactivate an item;
- delete an item after confirmation; and
- see successful mutations reflected in the gallery without leaking data between accounts.

The feature extends the existing `/o/[accountId]/media-gallery` route. Do not create a second Media Library route or a parallel data-access architecture.

## Scope boundary

### Included

- Existing account-scoped list and item reads
- Missing upload/create, update, activation, and deletion operations
- Application request/response types, API service methods, query keys, and hooks
- Upload and metadata form
- Account gallery and item-management actions
- Accessible relative-coordinate focal-point editing
- Focused unit/integration coverage and one end-to-end workflow
- Account ownership, input validation, and retryable failures

### Excluded

- CMS content-type redesign or schema migration unless Phase 0 proves a blocker
- Renderer, scheduler, or asset-generation changes
- Generic upload lifecycle or global orphan-file programme
- Analytics, dashboards, or broad observability work
- Production-data migration or historical cleanup
- New subscription quotas or media limits
- Server-side search, sorting, filtering, or pagination infrastructure unless already supported and required by the current experience
- Bulk upload/edit, advanced cropping, face detection, AI analysis, or multiple focal points
- Sponsor, logo, branding, roster, video, audio, or document media management
- Separate rollout programme beyond normal CMS/Application deployment

## Current Application baseline

The feature is partially implemented as a read-only gallery. Preserve and extend this baseline.

| Capability              | Current repository evidence                                               | Required action                                                      |
| ----------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Protected account route | `src/app/(members)/o/[accountId]/media-gallery/page.tsx`                  | Retain route; update copy and compose management UI                  |
| Read-only gallery state | `src/app/(members)/o/[accountId]/media-gallery/media-gallery-content.tsx` | Extend with upload/edit/activate/delete flows                        |
| Gallery components      | `src/app/(members)/o/[accountId]/media-gallery/_components/`              | Reuse/refactor; do not build a competing page tree                   |
| List BFF                | `src/app/api/accounts/[accountId]/media-library/route.ts`                 | Preserve GET; add upload/create only after CMS contract is confirmed |
| Item BFF                | `src/app/api/accounts/[accountId]/media-library/[mediaId]/route.ts`       | Preserve GET; add update/delete methods after contract confirmation  |
| Read DTOs               | `src/types/api/account.ts` (`AccountMediaLibrary*`)                       | Replace `unknown` fields with confirmed DTO/input types              |
| Account service         | `src/lib/api/services/account.api.ts`                                     | Add typed mutation methods                                           |
| Route registry          | `src/lib/api/routes/route-definitions.ts`                                 | Represent supported methods without hardcoded component URLs         |
| Query keys              | `src/lib/api/query/query-keys.ts`                                         | Keep `accountId` in list/item keys                                   |
| Read hooks              | `src/lib/api/hooks/account/useAccountMediaLibrary*.ts`                    | Retain gateway redirect behaviour; add mutation hooks                |
| Route builder           | `src/lib/config/account-routes.ts`                                        | Continue using `accountScopedRoutes.mediaGallery(accountId)`         |
| Navigation              | `src/components/navigation/app-sidebar/_constants/sidebar-nav.ts`         | Existing Media Gallery link should remain canonical                  |
| Upload/crop primitives  | `src/components/media/image-uploader-crop.tsx`, `image-crop-dialog.tsx`   | Reuse only where their behaviour matches the confirmed contract      |
| Upload proof            | `src/app/sandbox/interaction-lab/upload/image-crop/`                      | Reference multipart/BFF behaviour; do not ship lab code directly     |

Follow the local rules in `.skills/index.md`. At minimum the implementation team must read:

- `.skills/orchestrator-skill.md`
- `.skills/api-data-layer-patterns.md`
- `.skills/add-protected-page.md`
- `.skills/navigation-route-management.md`
- `.skills/form-Patterns.md`
- `.skills/buttons-and-CTA.md`
- `.skills/ui-State-Patterns.md`
- `.skills/feedback-and-Notifications.md`
- `.skills/component-Usage-Patterns.md`
- `.skills/layout-and-Spacing-System.md`

## Locked security rules

- Every CMS and Application operation is scoped by the route `accountId`.
- The server verifies that the authenticated user can access that account.
- For item operations, the server also verifies that `mediaId` belongs to the route account.
- The browser must never supply a trusted account relation or change ownership.
- The browser must not call unrestricted Strapi CRUD routes directly.
- Update inputs must allowlist supported Media Library fields; unrelated CMS fields are rejected or ignored according to the confirmed CMS convention.
- Switching accounts must not display or mutate the previous account's cached data.
- A denied cross-account read, update, or delete must not reveal the item's data.

## Proposed normalized Application contract

Phase 0 must verify exact CMS names, enum values, nullability, and mutation envelopes. The Application should expose a stable camel-case DTO rather than raw Strapi entities:

```ts
type MediaLibraryMarkerPosition = {
  x: number;
  y: number;
};

type MediaLibraryImage = {
  id: number;
  url: string;
  width: number | null;
  height: number | null;
  mime: string;
  alternativeText: string | null;
};

type MediaLibraryItem = {
  id: number;
  title: string;
  isActive: boolean;
  tags: string[];
  ageGroup: string;
  assetType: string;
  markerPosition: MediaLibraryMarkerPosition | null;
  image: MediaLibraryImage;
};
```

Mutation inputs should be separate types. They must not contain `accountId`, ownership fields, publication internals, or arbitrary Strapi attributes. Do not freeze guessed enum literals into the UI before Phase 0 records the source-of-truth values.

## Expected endpoint surface

Existing reads:

```text
GET /api/accounts/:accountId/media-library
GET /api/accounts/:accountId/media-library/:mediaId
```

Operations to confirm and implement or complete:

```text
POST   /api/accounts/:accountId/media-library
PATCH  /api/accounts/:accountId/media-library/:mediaId
DELETE /api/accounts/:accountId/media-library/:mediaId
```

The exact upload encoding and update verb/envelope are Phase 0 findings. Prefer established CMS and Application conventions over inventing a novel wire format. Upload is expected to be multipart unless repository/CMS evidence proves otherwise.

## Upload and mutation behaviour

- Accept one image per submission.
- Use the existing provider's accepted MIME types and file-size rule.
- Require the fields the current Media Library requires.
- Set the account relationship from the authenticated route context on the server.
- Prevent duplicate submissions in the UI.
- Return the normalized created or updated DTO.
- Preserve entered form values after recoverable failure.
- Provide a clear retry path when upload, record creation, update, or delete fails.
- Use the existing CMS project's file-deletion convention. Do not design a new global reference-audit system in this ticket.
- Refresh/invalidate only the affected account list and item keys after success.

## Focal-point behaviour

- Store relative coordinates, not screen pixels.
- Preserve the current point during editing.
- Use a centred default when no point exists.
- Support pointer and keyboard operation.
- Expose a textually understandable control/state for assistive technology.
- Clamp and validate values using the confirmed CMS coordinate domain.
- Do not add advanced crop previews, safe zones, subject detection, or multiple focal points.

## Required UI states

The page and each mutation must deliberately cover:

- initial loading;
- empty account library with an upload action;
- successful gallery display;
- list/read failure with retry;
- upload/edit pending state;
- validation errors located near their fields;
- recoverable mutation failure without losing input;
- activate/deactivate success and failure;
- delete confirmation, pending, success, and failure; and
- account/session gateway redirect behaviour already used by the read hooks.

Use existing Fixtura `BrandedLoader`, `Skeleton`, `EmptyState`, `ErrorState`, form, dialog, button-loading, and notification conventions. Never surface raw backend errors.

## Phase plan

| Phase                             | Monday item                                                                                     | Deliverable                                             | Entry dependency                     | Exit gate                                                                                                            |
| --------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| 0 — Contract confirmation         | [`2785580218`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785580218) | Evidence-based CMS/Application gap ledger               | None                                 | Exact enums, fields, upload limits/formats, marker shape, endpoints, deletion convention, and existing code recorded |
| 1A — Read and upload/create       | [`2785655430`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785655430) | Account-scoped reads confirmed; upload/create available | Phase 0                              | Valid upload creates one route-account item; cross-account access denied                                             |
| 1B — Metadata/focal/active update | [`2785667168`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785667168) | Allowlisted account-scoped update                       | Phase 0                              | Supported values persist; invalid/cross-account updates fail safely                                                  |
| 1C — Delete                       | [`2785601242`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785601242) | Account-scoped item deletion                            | Phase 0                              | Owned item disappears; cross-account delete denied; failure is retryable                                             |
| 2A — Types, API, and hooks        | [`2785580221`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785580221) | Complete typed Application data layer                   | Required Phase 1 contracts available | Account-keyed queries and mutations work without raw component fetches                                               |
| 2B — Upload and metadata UI       | [`2785667346`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785667346) | Accessible upload/edit form and focal-point control     | Phase 2A                             | Valid upload succeeds; invalid/retry states preserve user input                                                      |
| 2C — Gallery management UI        | [`2785667362`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785667362) | Gallery plus edit/activate/delete actions               | Phase 2A; can overlap 2B             | All required actions update the correct visible account library                                                      |
| 3 — Focused verification          | [`2785667264`](https://trentnixons-team-company.monday.com/boards/5029958325/pulses/2785667264) | Tests, smoke evidence, and end-to-end sign-off          | Phases 1–2                           | Checklist complete and Monday-ready completion report produced                                                       |

Phases 1A, 1B, and 1C may proceed in parallel after Phase 0 if the CMS team can keep the contract coherent. Phases 2B and 2C may overlap after the Phase 2A types and mutation interfaces stabilize.

## Phase 0 mandatory discovery record

Record these findings in [SIGN-OFF-CHECKLIST.md](./SIGN-OFF-CHECKLIST.md) before marking Phase 0 complete:

1. Current `account-media-library` schema and exact field names/nullability.
2. Exact `AgeGroup` and `AssetType` stored values and labels.
3. Exact `tags` representation.
4. Exact `markerPosition` shape, coordinate domain, and null/default behaviour.
5. Accepted image MIME types/extensions and maximum upload size.
6. Whether alternative text is mutable through the existing upload relation.
7. Confirmed list and item-read response envelopes.
8. Confirmed upload/create, update, activation, and deletion paths, methods, and envelopes.
9. Existing CMS file-deletion convention and the intended record/file outcome.
10. Existing Application components that can be safely reused.

A finding that differs from this proposal is not automatically a blocker. Update the typed adapter and ledger, explain the evidence, and continue unless it changes customer-visible behaviour or the locked security rules.

## Verification strategy

### CMS/API

- Authorised account list and single-item read
- Cross-account list/item access denied without data leakage
- Valid upload and record creation
- Invalid MIME, size, metadata, and marker values rejected clearly
- Route account overrides or rejects any client-supplied ownership
- Supported metadata, active state, and focal point persist
- Unsupported fields cannot be changed
- Owned delete succeeds; cross-account delete fails
- Failure paths use stable status and error envelopes

### Application data layer

- DTO parsing/mapping covers nullable legacy records safely
- BFF forwards supported multipart/JSON requests and auth correctly
- Registry, service, keys, hooks, and invalidation follow existing patterns
- Account A cache cannot appear after switching to Account B
- Mutations invalidate/update only the intended account/item keys
- Gateway redirect behaviour remains intact

### UI

- Loading, empty, error, and success states
- Upload validation, preview, pending, success, retry, and duplicate-submit protection
- Edit form prepopulation and value preservation after failure
- Pointer and keyboard focal-point editing
- Active-state feedback
- Delete confirmation and retry
- Responsive gallery at realistic item counts
- Accessible labels, focus order, status announcements, and non-colour-only state

### End to end

For one authorised account: list → upload → observe item → edit metadata/focal point → deactivate/activate → delete → confirm removal. Add a negative cross-account case for read and mutation isolation.

## Definition of done

- All eight focused Monday items meet their acceptance criteria.
- Phase 0 findings are recorded with evidence.
- An authenticated account user can view, upload, edit, classify, tag, focus, activate/deactivate, and delete their account's images.
- Cross-account reads and mutations are denied and tested.
- The Application uses its route registry → service → TanStack hook pipeline.
- No raw Strapi entity or unrestricted CMS CRUD call leaks into UI code.
- Required UI states and accessible interactions are verified.
- Relevant tests, typecheck, lint, and build pass, or unrelated pre-existing failures are clearly separated.
- One complete workflow passes in the target environment.
- [SIGN-OFF-CHECKLIST.md](./SIGN-OFF-CHECKLIST.md) contains repository/test evidence and a Monday-ready report.
