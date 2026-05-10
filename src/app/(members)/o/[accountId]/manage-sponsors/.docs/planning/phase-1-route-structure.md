# Phase 1: Route Structure

## Goal

Set up the route architecture and workspace shell for the sponsor pool.

## Outcomes

- main sponsor workspace route is structured correctly
- archive route exists
- read-only sponsor page is replaced by a real workspace shell

## Tasks

### Task 1.1: Create route architecture

Description:

- confirm main route and archive route structure
- prepare route-level shells for active pool and archive

Deliverables:

- `/manage-sponsors`
- `/manage-sponsors/archive`
- route-level structure aligned with account-scoped route conventions

Acceptance criteria:

- both routes resolve under the account-scoped members area
- route responsibilities are clearly separated

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

- header shell
- left pool rail shell
- center editor shell
- right assignment shell

Acceptance criteria:

- page no longer renders as a simple read-only list
- layout matches the approved sponsor workspace direction
