# CMS dependency — P02 to P05 (external)

Application repo documents CMS requirements here. Implementation lives in CMS, not this repository.

## P02 — Canonical storage

- Store `categoryAssignment` JSON: `type`, `scope`, `targets`, server-managed `targetSnapshots`
- Default omitted assignment to current permitted type with `scope: "all"` and empty targets
- Preserve existing `ageGroup` for read compatibility

## P03 — Legacy normalization

- Read-time: Juniors → selected `["junior"]`; Seniors → `["senior","masters"]`; Both → All ages
- No dual-write of new assignments to `ageGroup`
- Reject requests containing both `ageGroup` and `categoryAssignment`

## P04 — Validation

- Reload org/settings on each assignment mutation
- Stable field errors: `CATEGORY_TYPE_MISMATCH`, `TARGET_NOT_ACCESSIBLE`, `SELECTED_TARGETS_REQUIRED`, `ALL_TARGETS_MUST_BE_EMPTY`, `INVALID_CLUB_AGE_KEY`, `TOO_MANY_TARGETS`, `MALFORMED_ASSIGNMENT`, `INVALID_JSON`, `RECLASSIFICATION_REQUIRED`

## P05 — Endpoint DTOs

- POST: optional JSON-encoded `categoryAssignment` in multipart metadata
- PATCH: flat JSON; metadata-only PATCH when recategorisation required
- GET: `categoryAssignment` (no snapshots), `categoryStatus`, `resolvedTargets`

**App gate:** P07 category writes require P05 live on CMS. Application ships read/write client support against this contract.
