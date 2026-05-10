# Phase 7: Preview, Polish And Tests

## Goal

Make the feature understandable, safe, and release-ready.

## Outcomes

- sponsor behavior is easier to understand
- the route handles edge states well
- critical workflows are covered by tests

## Tasks

### Task 7.1: Add sponsor preview panel

Description:

- show how a selected sponsor may appear in output contexts

Deliverables:

- sponsor preview card
- placement-aware preview hints

Acceptance criteria:

- users can see a basic preview representation of sponsor output usage

### Task 7.2: Add empty, loading, and error states

Description:

- improve route clarity and resilience

Deliverables:

- first-time empty state
- loading state
- error state

Acceptance criteria:

- route handles no-data and failure cases clearly

### Task 7.3: Add unsaved changes protection

Description:

- protect users from losing sponsor edits accidentally

Deliverables:

- unsaved changes dialog or guard

Acceptance criteria:

- users get a warning before losing unsaved sponsor changes

### Task 7.4: Add test coverage

Description:

- cover critical workflows

Deliverables:

- unit tests for placement and targeting logic
- component tests for pool and editor flows
- integration tests for sponsor lifecycle paths

Acceptance criteria:

- core sponsor workflows are covered by automated tests
