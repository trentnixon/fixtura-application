# LLM Instructions — Using CMS Handoff Notes with Fixtura API Skills

## Purpose

Use this guide when you are given:

1. **one CMS handoff note**
2. the Fixtura **API skill documents**
3. a task to implement or prepare frontend integration for that handoff

This document explains how to read the handoff note, which skills to follow, and how to convert the handoff into the approved Fixtura members-area API pattern.

---

## Core Rule

Treat the **handoff note as the feature contract**.

Treat the **API skill documents as the implementation policy**.

This means:

- the handoff note tells you **what endpoint exists**, **what it returns**, **what errors matter**, and **what the frontend should use it for**
- the API skills tell you **how that endpoint must be integrated into the app**

Do not invent a different fetch pattern.
Do not bypass the approved API architecture.

---

## Skills to Use

### Primary skill

Use:

- `api-data-layer-patterns.md`

This is the canonical skill for all new development.

It defines the approved pipeline:

1. route registry
2. central fetch client
3. domain API service
4. TanStack Query hook

Follow this skill for all new route integration work.

### Legacy skill

You may also be given:

- `authenticated-api-call.md`

This exists only as legacy reference.

It explicitly says the old direct authenticated fetch pattern is deprecated.
Do not use it for new implementation unless the task is specifically about updating or migrating old code.

---

## How to Read a Handoff Note

When given a single handoff note, extract these things first:

### 1. Route identity

Identify:

- HTTP method
- path
- whether it is bootstrap, feature-specific, or legacy
- whether it is account-scoped

Example questions:

- Is this `GET /account/me`?
- Is this `GET /accounts/:accountId/settings`?
- Is it a legacy hub route or a new dedicated route?

### 2. Purpose

Identify exactly what the route is for.

Do not broaden its use beyond the handoff.

Example:

- shell bootstrap only
- settings screen source of truth
- branding page source
- scheduler page source

### 3. Auth and tenancy rules

Extract:

- does it require JWT/session?
- does it require `accountId` in path?
- does ownership matter?
- what happens for non-owner access?

This must influence route metadata, service assumptions, and UI handling.

### 4. Response shape

Extract:

- envelope shape
- stable fields
- nullable fields
- fields that must not be assumed
- fields explicitly excluded

Do not guess extra properties.

### 5. Error behaviour

Extract:

- 400 cases
- 401 cases
- 403 cases
- 404 cases
- 500 cases

These matter because UI state, empty states, redirects, and route guards may depend on them.

### 6. Migration guidance

Read the “migration from legacy hub” section carefully.

This tells you:

- what old route or payload may have been used before
- whether the new route replaces that usage
- whether the old hub should still be used for some screens

This is important for avoiding mixed assumptions in the frontend.

---

## Implementation Policy

Once you understand the handoff note, implement it using the approved Fixtura API pattern only.

### Layer A — Route Registry

Add or update the route in:

`src/lib/api/routes/route-definitions.ts`

Define:

- key
- method
- path
- auth requirement
- status
- domain

Do not hardcode the route anywhere else.

### Layer B — Fetch Client

Use the existing central fetch client.

Do not add raw `fetch()` in components.
Do not add one-off auth handling.
Do not manually implement 401 redirect logic in a hook or component.

The central client owns:

- credentials/session handling
- parsing
- normalization
- global auth behaviour

### Layer C — Domain API Service

Add a typed service function in the correct domain file:

`src/lib/api/services/*.api.ts`

This service should:

- reference the route definition
- return typed data
- stay close to the handoff contract
- avoid UI logic

### Layer D — TanStack Query Hook

Add the UI-facing hook in:

`src/lib/api/hooks/*.ts`

Use TanStack Query for:

- loading
- caching
- refetching
- error state
- server-state ownership

UI components should consume hooks, not raw service calls.

---

## Required Behaviour Rules

### 1. Never use raw fetch in a component

All route integration must go through:

route registry -> fetch client -> service -> hook

### 2. Never hardcode API strings outside the registry

All new endpoint paths belong in the route registry.

### 3. Never bypass TanStack Query for server state

Do not store fetched API data in ad hoc UI stores unless there is a very specific local UI reason.
Server data belongs to TanStack Query.

### 4. Do not invent fields

Only use fields documented in the handoff note or already established in app types.

### 5. Do not silently merge route responsibilities

If the handoff says the route is for bootstrap only, use it for bootstrap only.

If the handoff says a dedicated route is now the canonical source for a screen, use that route for that screen.

---

## Recommended Working Process

For each handoff note, follow this order.

### Step 1 — Read the handoff as a contract

Summarise:

- what route exists
- what screen/use-case it supports
- what data it returns
- what it does not return
- what errors matter

### Step 2 — Map it to the Fixtura API pipeline

Determine:

- which domain it belongs to
- which route definition must be added or updated
- which service file should own it
- which hook should expose it to the UI

### Step 3 — Respect existing route responsibilities

Before implementing, check whether:

- another route already owns bootstrap
- another route already owns settings
- another route is still the legacy fallback

Do not collapse multiple route purposes into one abstraction if the handoff deliberately separates them.

### Step 4 — Add types from the documented response

Model the response from the documented contract, not guesswork.

Prefer:

- explicit response interfaces
- nullable fields where documented
- clear envelope handling

### Step 5 — Build the hook for component consumption

Expose the route to the UI through a domain hook.

The component should only care about:

- data
- loading
- error
- refetch if needed

### Step 6 — Handle route-specific UX consequences

Apply the handoff’s error semantics properly.

Examples:

- 401 may trigger auth redirect through the central client
- 404 may mean “not found” or “no linked account” depending on the contract
- 403 may mean role permission issue
- 400 may indicate invalid path param or malformed request

Do not flatten all errors into the same UI state.

---

## What the LLM Should Produce

When asked to implement from a handoff note, the output should usually include:

1. route definition update
2. typed service function
3. query key update if needed
4. TanStack Query hook
5. notes on expected UI state handling
6. notes on what old route usage should be replaced, if the handoff includes migration guidance

If asked for planning only, produce:

- a short implementation summary
- affected files
- response type notes
- UI integration notes
- migration notes

---

## Handoff Interpretation Rules

### If the handoff says “bootstrap only”

Treat the endpoint as shell/init data only.

Do not use it as the source of truth for full screen payloads unless the handoff says so.

### If the handoff says “canonical source”

Use that endpoint as the main route for that screen or domain.

Do not keep pulling the same data from the old hub unless the migration note says the old hub is still required.

### If the handoff says “does not include”

Believe it.

Do not assume related fields are available.
Do not build UI that depends on undocumented nested objects.

### If the handoff says “legacy hub retained”

That means the old route may still be necessary for some areas until later phases ship.

Do not remove old usage blindly without checking the migration note.

---

## Quality Checklist

Before finishing, confirm:

- [ ] I used `api-data-layer-patterns.md` as the implementation skill
- [ ] I did not use deprecated direct fetch patterns for new work
- [ ] I treated the handoff note as the route contract
- [ ] I added or updated the route in the route registry
- [ ] I added a typed service function
- [ ] I exposed the route through a TanStack Query hook
- [ ] I did not hardcode API paths outside the registry
- [ ] I respected the route’s documented purpose
- [ ] I respected the documented error semantics
- [ ] I considered migration away from the legacy hub where relevant

---

## Final Instruction

When given one handoff note at a time, do not redesign the API.

Your job is to:

1. read the handoff note carefully
2. extract the contract
3. apply the Fixtura API skill pattern
4. integrate the route into the approved members-area data layer
5. keep responsibilities clear between bootstrap, feature routes, and legacy hub usage
