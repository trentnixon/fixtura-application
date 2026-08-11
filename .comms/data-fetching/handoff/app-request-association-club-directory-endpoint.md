# Archived — Association club directory (original request)

**Do not extend this file.** Backend shipped the endpoint.

## The only spec (FE + everyone else)

[**app-handoff-account-club-logos-directory-endpoint.md**](../handoff/app-handoff-account-club-logos-directory-endpoint.md)

---

_Below preserved as historical intent only._

---

**From:** Fixtura App (frontend) Team  
**To:** CMS (Strapi) Backend Team  
**Date:** 2026-05-25  
**Feature:** `/o/:accountId/club-logos`

## Purpose

Associations need to add/update club logos for member clubs without their own branding. Product needs an authoritative club list scoped to comps/grades attributed to that account—not sponsor allocations.

## Historical interim (retire)

Previously: derive from `GET /api/accounts/:accountId/sponsor-entity-targets`; wrong because sponsor catalogue ≠ every participating club.

## Contract

See **canonical doc** (`app-handoff-account-club-logos-directory-endpoint.md`) for payload, paths, filters, permissions, migration checklist.
