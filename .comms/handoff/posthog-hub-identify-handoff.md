# PostHog Hub identify handoff — contentv2 (Delivery Hub)

**Date:** 2026-09-08  
**Project:** `214725` (US, shared)  
**From:** Members app (`application` repo)  
**To:** Delivery Hub (contentv2)  
**Related:** `.comms/handoff/posthog-round2-decisions.md`

---

## Context

When a signed-in member opens Delivery Hub from the members app (bundles downloads table), the app opens Hub in a **new tab** with an opaque Strapi user id in the query string. Hub must **identify** that user on init so app + hub events share one PostHog person.

Cross-subdomain cookie (`cross_subdomain_cookie: true` on app + hub init) covers most cases; the query param is the **fallback** for incognito or first Hub visit before cookie sync.

---

## What the members app sends

| Item             | Value                                                                                  |
| ---------------- | -------------------------------------------------------------------------------------- |
| Query param name | `phDistinctId`                                                                         |
| Value            | Strapi user id (string, opaque — **not** email or token)                               |
| When             | External hub links from bundles downloads (`hub_opened` flow)                          |
| Example          | `https://hub.fixtura.com.au/{accountId}/{sport}/{renderId}/{category}?phDistinctId=42` |

Existing query params are preserved. Param is omitted when user id is unavailable (unsigned-in edge — should not occur for this flow).

**Do not use `alias()`** for this handoff.

---

## contentv2 implementation

### 1. Read param on init (before first capture)

```javascript
const params = new URLSearchParams(window.location.search);
const handoffId = params.get("phDistinctId")?.trim();

if (handoffId && posthog.get_distinct_id() !== handoffId) {
  posthog.identify(handoffId);
}
```

Use `identify(handoffId)` only — no email, name, or PII in identify properties.

### 2. Strip param from URL immediately

After reading, remove `phDistinctId` from the address bar so ids are not bookmarked or shared.

```javascript
if (params.has("phDistinctId")) {
  params.delete("phDistinctId");
  const next = params.toString();
  const path = `${window.location.pathname}${next ? `?${next}` : ""}${window.location.hash}`;
  window.history.replaceState({}, "", path);
}
```

### 3. PostHog init alignment

Match members app baseline:

- `autocapture: false`
- `cross_subdomain_cookie: true`
- `persistence: "localStorage+cookie"`
- Consent: same pattern as app (no `$opt_in` on route change)
- `surface: hub` on hub-originated events (existing convention)

---

## Acceptance criteria

- [ ] Hub init reads `phDistinctId` when present and calls `identify(strapiUserId)`.
- [ ] Param stripped from URL via `history.replaceState` on first load.
- [ ] No `alias()` used for app → hub handoff.
- [ ] Joint smoke test: member opens hub from app bundles → PostHog Live shows **one person** with both `surface: app` (`hub_opened`) and `surface: hub` events.
- [ ] Incognito smoke: param path still identifies when cross-subdomain cookie absent.

---

## Future upgrade path

When Hub handles sensitive content, replace query param with **postMessage** or a **signed short-lived token** exchanged server-side. Query param is acceptable for opaque Strapi ids only.
