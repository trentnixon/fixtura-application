# Phase 09 — Save, Validation, Conflict, and Unsaved-Change UX

> Monday child `2785756852` | Primary repository: Application

## Outcome

Users can review, save, retry, reset, recover from `409`, and navigate safely without silent data loss.

## Editor state machine

Maintain:

- `canonical`: latest accepted normalized server response;
- `draft`: editable group ID arrays;
- `dirty`: semantic comparison of draft versus canonical custom/effective order;
- mutation state: idle/pending/success/error;
- conflict state: attempted draft plus `details.current` from the 409;
- validation issues addressable by group key and Grade ID.

Suggested hook: `_hooks/use-grade-ordering-editor.ts` returns reorder, reset, save, retry, accept-server-version, and state flags. Keep pure comparison/payload building in `_utils/grade-ordering-draft.ts` with unit tests.

## Save payload construction

- Send the canonical `revision` loaded with the draft.
- Include server-provided organisation type/id.
- Submit the complete custom replacement desired by the user.
- After a reorder, include the full ordered Grade ID array for that changed group.
- Preserve existing custom arrays for unchanged groups.
- Leave fallback-only Grades omitted from unchanged groups until the user deliberately includes/reorders them.
- Empty array intentionally clears custom order for a group.
- Never send position, `scopeKey`, `orderingKey`, group label, or ownership relations.

## Save behavior

1. Disable Save when clean, invalid, unauthorised, or pending.
2. On Save, show pending text and prevent duplicate submission/reordering if it could change the submitted snapshot.
3. On success, set canonical and draft from the returned normalized payload, update revision, clear dirty/conflict state, and announce/toast success.
4. Invalidate/refetch relevant account data, but do not let a stale refetch replace the canonical success response.
5. On network/5xx failure, keep the exact draft and offer retry.
6. On 422, keep draft, show summary, and associate issues with affected group/row where possible.
7. On 403, show access-denied guidance and disable further saves.

## `409 Conflict` flow

Parse `ApiError.details.error.code === GRADE_ORDERING_REVISION_CONFLICT`.

- Keep the user’s attempted draft in memory.
- Show a dialog explaining another save won.
- Present two safe actions:
  - **Load latest order**: accept `details.current`, replace canonical/draft, clear dirty.
  - **Review my changes**: keep attempted draft visible but update the baseline/current revision only after a deliberate merge UI; do not resubmit automatically.
- v1 does not need an automated merge. The safe default is load latest, then reorder again.
- Never silently update revision and replay the old payload.

## Reset/clear behavior

- “Reset changes” restores the current canonical response.
- “Use default ordering” is a separate destructive action that submits empty custom arrays for all groups after confirmation.
- Success copy must distinguish “order saved” from “custom order cleared.”

## Unsaved navigation

Next.js App Router has no reliable page-local blocker for all navigation surfaces. Implement a small shared guard rather than only `beforeunload`:

```text
src/components/navigation/unsaved-changes/
  unsaved-changes-provider.tsx
  use-unsaved-changes.ts
  guarded-link.tsx
  unsaved-changes-dialog.tsx
```

- Wrap `MembersAppShell` content/navigation with the provider.
- Register the Sort Order editor’s dirty state and discard callback.
- Use `GuardedLink` in `nav-main.tsx` and account-switch/user-menu links in `nav-user.tsx`.
- Add `beforeunload` for refresh/close/external navigation.
- A confirmed navigation clears/discards once and continues to the intended URL.
- Cancel leaves route, focus, and draft unchanged.
- Avoid global warnings when editor is clean or after successful save/reset.

If a smaller existing navigation-guard pattern appears before implementation, reuse it and document the paths.

## Tests

- Clean/dirty equality and reorder-back-to-original.
- Payload preserves unchanged custom groups and intentionally clears empty group.
- Double submit prevention.
- Success adopts canonical response and new revision.
- 422 group/item display while retaining draft.
- 409 load-latest path and no silent retry.
- Network retry reuses the draft but reads current expected revision rules.
- Reset and clear-default confirmation.
- `beforeunload`, sidebar link, user-menu link, cancel, and confirm navigation.
- Live-region/save feedback and focus management.

## Exit gate

No failure, conflict, refetch, or navigation path silently loses or overwrites user changes; all outcomes are visible and keyboard operable.
