# Phase 4: Placement Management

## Status

In progress

## Phase 4 Build Focus

This phase should now be thought of as the first half of the dedicated sponsor assignment screen.

Primary focus:

1. create the `assign sponsors to asset` flow
2. support one global primary sponsor
3. support ranked sponsor positions for end screens
4. keep placement separate from sponsor create/edit

Expected Phase 4 outcome:

- users assign sponsors from a dedicated assignment screen
- one sponsor can be made primary
- ranked sponsor slots become editable
- placement state becomes visible across the pool and assignment UI
- placement preview quality is treated as important, not optional

Current implementation direction:

- stop extending placement inside the sponsor edit screen
- move placement into the dedicated `assign sponsors` route
- use sponsor selection with preview for position assignment

## Goal

Support global sponsor placement across the account from a dedicated assignment flow.

## Outcomes

- one sponsor can be marked primary
- ranked sponsor positions can be managed
- placement rules are enforced clearly
- sponsor create/edit no longer owns placement

## Tasks

### Task 4.1: Build primary sponsor assignment UI

Description:

- add assignment-screen UI for one global primary sponsor

Deliverables:

- primary assignment control
- sponsor select with preview
- primary badge display

Acceptance criteria:

- only one primary sponsor can be assigned
- no primary sponsor is also a valid state

### Task 4.2: Build ranked sponsor positions UI

Description:

- support ranked sponsor slots for end screens from the assignment route

Deliverables:

- ranked positions list
- sponsor selector per position
- assign/remove rank
- reorder rank

Acceptance criteria:

- ranked slots are unique
- users can manage ranked sponsor ordering
- capacity supports up to 30 positions

### Task 4.3: Add placement validation

Description:

- enforce placement rules in the assignment screen and save flow

Deliverables:

- duplicate-rank prevention
- inactive sponsor placement protection
- primary uniqueness validation

Acceptance criteria:

- invalid placement states are blocked or surfaced clearly
