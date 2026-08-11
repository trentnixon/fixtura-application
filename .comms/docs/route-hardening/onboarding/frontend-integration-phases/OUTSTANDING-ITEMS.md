# Outstanding Items: Phase 01-08 Review

**Reviewed:** 2026-07-13  
**Resolved:** 2026-07-13  
**Scope:** Frontend multi-account implementation through Phase 08  
**Phase 09 owner:** User; browser/staging verification is intentionally not performed by this work

## Status

**Resolved.** OI-01 through OI-05 meet their acceptance criteria. Phase 09 remains unchecked for the user.

## Resolution summary

| ID    | Result                                                                                                                         |
| ----- | ------------------------------------------------------------------------------------------------------------------------------ |
| OI-01 | Fixed `exactOptionalPropertyTypes` in `next-response-from-strapi-fetch.ts` by omitting `headers` when `Retry-After` is absent  |
| OI-02 | Active prompts/plans updated; historical CMS research bannered; authority chain points to `12-frontend-integration-guide.md`   |
| OI-03 | Exact-id cache predicate clears account / season-hub / UI picker keys; manage-sponsors session key cleared for deleted id only |
| OI-04 | Deferred A→B race + scheduler cancel tests added; optimistic server rollback classified N/A (no audited `onMutate`)            |
| OI-05 | `accounts` required on `AccountMePayload`; `parseAccountMeResponse` fail-closed; missing/non-array cannot become empty picker  |

## Exit verification (2026-07-13)

- Combined suite: **27 files, 156 tests passed** (includes new parse / exact-id / race files).
- Focused ESLint on changed files: **exit 0**.
- `npm run typecheck`: **56** unrelated baseline `error TS`; **zero** errors owned by multi-account files (`next-response-from-strapi-fetch.ts`, `parse-account-me-response.ts`, delete/exact-id helpers).
- `npm run build`: still blocked by the unrelated baseline.

## Phase 09 handoff

No unresolved frontend-code blocker from this outstanding list. Proceed with browser/staging verification per Phase 09.

---

## Original review (archived)

The findings below are retained for history. Implementation notes live in Phase 07 / Phase 08 completion handoffs.

### Review conclusion (pre-fix)

The main multi-account flows were implemented and the focused automated suite was green, but Phases 01-08 should not yet be treated as fully closed until OI-01–05 were completed.

### Priority order (completed)

1. OI-01 — fix integration-owned TypeScript errors.
2. OI-02 — remove active stale contract instructions.
3. OI-03 — complete deleted-account cache/state cleanup.
4. OI-04 — add real race and mutation-isolation evidence.
5. OI-05 — make `/account/me.accounts[]` contract handling explicit and fail safely.
6. Re-run the Phase 08 exit suite and update its completion evidence.
