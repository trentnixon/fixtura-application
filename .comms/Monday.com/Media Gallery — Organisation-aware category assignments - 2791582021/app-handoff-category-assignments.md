# Application Integration Handoff — Media Gallery categories

Synced from Monday doc `5030034061`.

## Data sources

Use existing account organisation/settings state plus TanStack season-hub competitions and grade-ordering data. Do not add a duplicate catalogue endpoint.

Current option labels come from TanStack state. Historical labels and missing selections come from Media Library `resolvedTargets`.

## Configuration model

Resolve one mode: `club-age`, `competition`, or `grade`. Expose category label, options, All label, loading/error state, and current permitted type to the gallery and dialogs.

## Writes

POST JSON-encodes `categoryAssignment` in multipart metadata. PATCH sends flat JSON. Send `categoryAssignment` during edit only when the category changed; omitting it preserves historical assignments during unrelated edits.

Never submit `targetSnapshots` or labels. Use CMS IDs for competition and grade targets.

## Cache behaviour

After category mutations invalidate the account Media Library list/item. After account grouping settings change, refresh settings, relevant organisation catalogue state, and Media Library state.

## Compatibility

Consume canonical `categoryAssignment` first. The CMS owns legacy `ageGroup` normalization. Treat `categoryStatus: needs_reclassification` as a user-action state, not a failed read.

## Scope

Renderer, scheduler and Creator consumption are excluded.
