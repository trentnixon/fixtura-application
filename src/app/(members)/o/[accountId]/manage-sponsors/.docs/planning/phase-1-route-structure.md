# Phase 1: Route Structure

## Goal

Set up the route architecture and workspace shell for the sponsor overview, add-sponsor flow, and archive/assignment routes.

## Route Split Follow-up

Phase 1 was originally completed against the older inline-create model.

Because the route direction has changed, Phase 1 now also includes a structural refactor:

- move new-sponsor creation out of `/manage-sponsors`
- introduce `/add-sponsor` as a first-class account route
- keep `/manage-sponsors` focused on overview responsibilities only

## Outcomes

- main sponsor workspace route is structured correctly
- dedicated add-sponsor route exists
- archive route exists
- read-only sponsor page is replaced by a real workspace shell

## Tasks

### Task 1.1: Create route architecture

Description:

- confirm overview, add-sponsor, assignment, and archive route structure
- prepare route-level shells for active pool, add sponsor, assignment, and archive

Deliverables:

- `/manage-sponsors`
- `/add-sponsor`
- `/manage-sponsors/assign`
- `/manage-sponsors/archive`
- route-level structure aligned with account-scoped route conventions

Acceptance criteria:

- all routes resolve under the account-scoped members area
- route responsibilities are clearly separated

Refactor acceptance:

- `/manage-sponsors` no longer owns inline draft-creation state
- `/add-sponsor` exists as a standalone route shell

### Task 1.2: Scaffold feature folders and shared types

Description:

- add route-local component, hook, type, and util folders
- introduce sponsor workspace UI model

Deliverables:

- `_components`
- `_hooks`
- `_types`
- `_utils`

Acceptance criteria:

- files and directories match the agreed route structure
- sponsor workspace model exists for UI-level state

### Task 1.3: Replace read-only route shell

Description:

- replace the current read-only sponsor page layout with a workspace shell
- keep placeholder states where save behavior is not wired yet

Deliverables:

- overview header shell
- overview pool rail shell
- add-sponsor shell
- assignment shell

Acceptance criteria:

- page no longer renders as a simple read-only list
- layout matches the approved split-route sponsor direction

### Task 1.4: Refactor inline create shell into add-sponsor route

Description:

- extract the current inline new-sponsor UI state into the dedicated add-sponsor route

Deliverables:

- `/add-sponsor/page.tsx`
- add-sponsor route header shell
- add-sponsor route workspace shell

Acceptance criteria:

- creating a sponsor is no longer an in-page mode inside `/manage-sponsors`
- add-sponsor route can render independently of the overview layout
