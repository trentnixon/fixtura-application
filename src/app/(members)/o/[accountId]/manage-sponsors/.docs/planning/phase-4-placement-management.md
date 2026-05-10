# Phase 4: Placement Management

## Goal

Support global sponsor placement across the account.

## Outcomes

- one sponsor can be marked primary
- ranked sponsor positions can be managed
- placement rules are enforced clearly

## Tasks

### Task 4.1: Build primary sponsor assignment UI

Description:

- add UI for one global primary sponsor

Deliverables:

- primary assignment control
- primary badge display

Acceptance criteria:

- only one primary sponsor can be assigned
- no primary sponsor is also a valid state

### Task 4.2: Build ranked sponsor positions UI

Description:

- support ranked sponsor slots for end screens

Deliverables:

- ranked positions list
- assign/remove rank
- reorder rank

Acceptance criteria:

- ranked slots are unique
- users can manage ranked sponsor ordering
- capacity supports up to 30 positions

### Task 4.3: Add placement validation

Description:

- enforce placement rules in UI and save flow

Deliverables:

- duplicate-rank prevention
- inactive sponsor placement protection
- primary uniqueness validation

Acceptance criteria:

- invalid placement states are blocked or surfaced clearly
