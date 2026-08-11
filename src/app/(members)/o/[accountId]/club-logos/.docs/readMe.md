# Folder Overview

Association club logos route: gated to non-club accounts; lists clubs (`GET /api/accounts/:accountId/club-logos-directory`) and per-club logo editor (`/club-logos/:clubId`) with M1+W2 writes.

## Files

- `page.tsx`: Directory route entry; renders club list screen.
- `[clubId]/page.tsx`: Per-club logo editor route entry.
- `_components/club-logos-screen.tsx`: Client shell; association-only body after settings gate.
- `_components/club-logo-directory-panel.tsx`: Fetches club directory; links to per-club editor.
- `_components/club-logo-editor-screen.tsx`: Editor shell for a single club.
- `_components/club-logo-workspace.tsx`: Crop/upload/save/clear (M1 + W2).
- `_hooks/use-club-logos-screen.ts`: Validates segment and account settings; redirects clubs to dashboard.
- `_hooks/use-club-logo-editor-screen.ts`: Loads directory row + branding for editor.
- `_hooks/index.ts`: Re-exports route hooks.
- `_consts/index.ts`: User-facing strings.
- `_types/index.ts`: Screen props and view discriminant types.
- `_utils/`: Screen view helpers and `resolve-club-logo-error-message.ts` (CMS write error codes).
- `.docs/MANUAL_QA_CHECKLIST.md`: Browser QA steps after Strapi wiring.
- `.docs/Completed.md`: Archived completion summaries.

## Child Modules

- `.comms/`
- `.docs/`
- `_components/`
- `_hooks/`
- `_utils/`

## Relations

- Parent: `src/app/(members)/o/[accountId]/`
- Route URL helpers: `src/lib/config/account-routes.ts`
- Sidebar: `src/components/navigation/app-sidebar/_constants/sidebar-nav.ts`
- Club vs association constant: `src/lib/config/onboarding.ts` (`CLUB_ACCOUNT_TYPE_ID`)
- **Locked v1 directory handoff:** [`.comms/data-fetching/handoff/app-handoff-account-club-logos-directory-endpoint.md`](../../../../../../../.comms/data-fetching/handoff/app-handoff-account-club-logos-directory-endpoint.md)
- **CMS FE/BFF handoff (read + write):** [`.comms/data-fetching/handoff/cms-handoff-club-logos-fe.md`](../../../../../../../.comms/data-fetching/handoff/cms-handoff-club-logos-fe.md)
- **Local Strapi permissions + curl smoke:** [`.comms/data-fetching/handoff/club-logos-local-setup-and-smoke.md`](../../../../../../../.comms/data-fetching/handoff/club-logos-local-setup-and-smoke.md)
- **Write request (historical):** [`.comms/data-fetching/request/app-request-association-club-logo-write-endpoint.md`](../../../../../../../.comms/data-fetching/request/app-request-association-club-logo-write-endpoint.md)
- Sponsor entity targets (`GET …/sponsor-entity-targets`) remain for manage-sponsors only; not used for this route. Handoff: [`.comms/data-fetching/handoff/app-handoff-sponsor-entity-targets-endpoint.md`](../../../../../../../.comms/data-fetching/handoff/app-handoff-sponsor-entity-targets-endpoint.md).
