# Handoff — Phase NN: &lt;short title&gt;

**Phase:** NN  
**Date:** YYYY-MM-DD  
**Author:** (name or team)  
**Backend reference:** link or path to contract / OpenAPI / phase doc if any

**Audience:** Fixtura admin application LLM / frontend developers

---

## Summary

One paragraph: what shipped or was decided in this phase and why it matters for the app.

---

## Endpoints

| Method | Path | Purpose |
| ------ | ---- | ------- |
| GET    | …    | …       |

---

## Auth and tenancy

- **JWT:** (where it is sent; any quirks)
- **Account ID:** (path / header / query per Phase 0)
- **Access rule:** (how the backend decides the user may use this account)

---

## Request details

- Query params, headers, body (if any)
- Pagination / filters (if applicable)
- Example request (sanitised):

```http

```

---

## Response shape

- High-level JSON structure (field names and meaning)
- What is **stable** vs **may evolve**
- Example response (sanitised):

```json

```

---

## Errors

| Situation            | HTTP status | Notes |
| -------------------- | ----------- | ----- |
| Not authenticated    |             |       |
| No access to account |             |       |
| Wrong account ID     |             |       |
| Resource not found   |             |       |

---

## Migration from legacy hub

- What the app used to call (`GET /account/organisation/:accountId` or other)
- Which fields moved here vs other phases
- What the app should **stop** relying on from the hub for this concern

---

## Caching and freshness

- Expected cache behaviour (if any)
- Staleness acceptable to product

---

## Open questions / follow-ups

- Bullets

---

## Links

- Phase plan: `../phase-NN-*.md`
- Research brief: `../../Fixtura-account-data-research-brief-v2.md`
