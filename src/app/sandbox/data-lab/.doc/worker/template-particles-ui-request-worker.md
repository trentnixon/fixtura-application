# Worker Brief: Build backend request for `GET /api/template-particles/ui`

## Objective

Implement the backend Strapi endpoint requested in:
`src/app/sandbox/data-lab/.doc/requests/template-particles-ui-request.md`

This worker brief is for the **backend route/controller creation work** that produces the frontend-facing contract later consumed by the app.

Target endpoint:

- `GET /api/template-particles/ui`

This route should be:

- authenticated only
- published-only
- sorted by ascending `id`
- intentionally app-shaped for UI usage

Preferred response shape:

```json
{
  "data": [
    {
      "id": 1,
      "name": "Soft Dots",
      "ui": {
        "type": "dots",
        "particleCount": 80,
        "speed": 1.2,
        "direction": "up",
        "animation": "fade"
      }
    }
  ]
}
```

Do not implement the alternative raw CMS shape unless explicitly directed.

---

## Primary goal

Create the Strapi-side custom route and controller action that expose the particle catalog in the normalized `ui` shape.

This worker is about:

- backend route registration
- backend controller logic
- auth protection
- published filtering
- field selection
- field mapping from CMS names to app-facing names
- safe error handling

---

## Required backend files

### 1. Add custom route file

Create:
`src/api/template-particle/routes/custom-template-particle.js`

Responsibilities:

- register `GET /template-particles/ui`
- connect it to `template-particle.getTemplateParticlesForUi`
- keep it authenticated
- configure the correct action/scope for Strapi permissions
- leave policies and middlewares empty unless there is a clear reason to add them

### 2. Extend controller

Update:
`src/api/template-particle/controllers/template-particle.js`

Add:

- `async getTemplateParticlesForUi(ctx)`

Responsibilities:

- require authenticated user via `ctx.state.user`
- return `ctx.unauthorized("Authentication required")` when missing
- call `strapi.entityService.findMany(...)`
- filter to `publicationState: "live"`
- request only required fields
- sort ascending by `id`
- map raw CMS field names to the app-shaped contract
- return `ctx.send({ data })`
- log unexpected failures and return a safe `500`

### 3. Optional mapper extraction

Only if it makes the controller cleaner:

- `src/api/template-particle/controllers/services/...`

This is optional for v1. Do not over-engineer a tiny endpoint.

---

## Required fetched fields

Read only these CMS fields:

- `id`
- `name`
- `particleType`
- `particleCount`
- `speed`
- `direction`
- `animationType`

Do not expose timestamps, publication metadata, or unrelated relations.

---

## Mapping rules

Map CMS row:

```json
{
  "id": 1,
  "name": "Soft Dots",
  "particleType": "dots",
  "particleCount": 80,
  "speed": 1.2,
  "direction": "up",
  "animationType": "fade"
}
```

To API response row:

```json
{
  "id": 1,
  "name": "Soft Dots",
  "ui": {
    "type": "dots",
    "particleCount": 80,
    "speed": 1.2,
    "direction": "up",
    "animation": "fade"
  }
}
```

Important:

- `particleType` -> `ui.type`
- `animationType` -> `ui.animation`
- keep `particleCount`, `speed`, and `direction` under `ui`
- return `name` at the top level

The whole reason for this endpoint is to avoid exposing only raw CMS naming.

---

## Auth and security rules

- This route must be auth-only.
- Do not use `auth: false`.
- No account ownership checks are required in v1 because this is a global published lookup list.
- If `ctx.state.user` is missing, return `401` using `ctx.unauthorized("Authentication required")`.

---

## Query and filtering rules

- no query params
- `publicationState: "live"`
- sort by `id: "asc"`
- return all published rows for v1

---

## Error handling rules

On unexpected failure:

- log the error with Strapi logging
- return a safe internal server error
- do not leak raw stack traces to the client

The safe user-facing error can be along the lines of:

- `Failed to load template particles.`

---

## Permissions setup expectations

After implementation, the action must be available for enabling under the authenticated role.

Expected action naming is based on:

- `template-particle.getTemplateParticlesForUi`

Or the full generated scope form used by Strapi, depending on admin display.

Make sure the route config and handler naming allow the permission to appear correctly.

---

## Example implementation outline

1. create `custom-template-particle.js`
2. register `GET /template-particles/ui`
3. add `getTemplateParticlesForUi` to the template-particle controller
4. inside controller:
   - verify `ctx.state.user`
   - fetch published rows with selected fields only
   - sort by `id` ascending
   - map CMS rows to `{ id, name, ui: { ... } }`
   - `ctx.send({ data })`
5. catch unexpected errors
6. log and return safe server error

---

## Acceptance criteria

- [ ] `GET /api/template-particles/ui` exists
- [ ] endpoint requires authentication
- [ ] unauthenticated requests return `401`
- [ ] only published template particles are returned
- [ ] response is sorted by ascending `id`
- [ ] each item includes:
  - `id`
  - `name`
  - `ui.type`
  - `ui.particleCount`
  - `ui.speed`
  - `ui.direction`
  - `ui.animation`
- [ ] response excludes Strapi timestamps and publication metadata
- [ ] unexpected errors are logged and return a safe server error
- [ ] route/action is visible for Strapi permission configuration

---

## Do not do these things

- do not expose the full default Strapi collection shape
- do not return `particleType` and `animationType` as the only public contract fields
- do not make the route public
- do not add unnecessary query params for v1
- do not return drafts

---

## Notes for the worker

- Prefer the `ui` response shape, not the fallback raw CMS shape.
- Keep the endpoint small and direct.
- Align naming with the app-facing particle structure already used in `templateOptionDestruct`.
- If the backend already has a matching implementation, compare it against this request doc and only adjust gaps instead of rewriting everything.
