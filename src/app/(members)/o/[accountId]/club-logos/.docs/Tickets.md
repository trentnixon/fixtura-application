# Tickets — Club logos route

Execution detail for `/o/[accountId]/club-logos`.

---

# Completed Tickets Index

- TKT-CLUB-LOGOS-001

---

ID: TKT-CLUB-LOGOS-001
Status: Completed
Priority: Medium
Owner:
Created: 2026-05-22
Updated: 2026-05-26
Related: Route-club-logos

---

## Overview

Implement association club logos: data loading, uploads or CMS wiring, list UI, and error states beyond the scaffold.

## What We Need to Do

Define payloads and behaviours with CMS, build the workspace UI under this route, and keep association-only access consistent with onboarding `account_type` rules.

## Completion Summary

Club directory integrates `GET …/club-logos-directory`; per-club editor uses `POST …/clubs/:clubId/logo/upload` then `PATCH …/clubs/:clubId/logo`; `useUpdateClubLogo` merges W2 response into directory cache and invalidates queries; clear flow documents PlayHQ/parent cascade. Local QA steps live in `.docs/MANUAL_QA_CHECKLIST.md`.

---

## Constraints, Risks, Assumptions

Route visibility remains association-only (`account_type !== CLUB_ACCOUNT_TYPE_ID`); writes target club `Logo` relation only — see CMS handoff for `logoUrl` cascade after clear.
