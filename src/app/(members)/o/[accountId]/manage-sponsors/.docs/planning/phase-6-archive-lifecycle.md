# Phase 6: Archive Lifecycle

## Goal

Move sponsors safely out of the pool and support recovery or deletion.

## Outcomes

- sponsors can be archived safely
- archive removes active usage
- restore and hard delete flows exist in archive

## Tasks

### Task 6.1: Build archive confirmation flow

Description:

- warn users before archiving sponsors with active placements or assignments

Deliverables:

- archive confirmation dialog
- warning copy for allocated sponsors

Acceptance criteria:

- users are warned when archiving a sponsor that is currently allocated
- archive action explains placement and assignment removal

### Task 6.2: Apply archive side effects

Description:

- remove sponsor usage when archived

Deliverables:

- remove primary placement
- remove ranked placement
- remove entity assignments

Acceptance criteria:

- archived sponsors are fully detached from active usage

### Task 6.3: Build archive route

Description:

- add dedicated archive view for archived sponsors

Deliverables:

- archive page header
- archived sponsor list
- restore action
- permanent delete action

Acceptance criteria:

- archived sponsors are removed from the main pool route
- archived sponsors can be viewed and managed from archive

### Task 6.4: Build restore and hard delete flows

Description:

- support sponsor recovery and final deletion

Deliverables:

- restore sponsor
- permanently delete archived sponsor

Acceptance criteria:

- restore returns sponsor to the pool
- hard delete is only available from archive
