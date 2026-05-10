# Phase 3: Sponsor Editor And Logo Workflow

## Goal

Make sponsor records editable, including logo upload and crop.

## Outcomes

- users can edit sponsor details
- users can manage sponsor logos through the existing cropper flow
- sponsor edits can be saved intentionally

## Tasks

### Task 3.1: Build sponsor details form

Description:

- build the sponsor editor form for the selected sponsor

Deliverables:

- name
- tagline
- url
- description
- active toggle

Acceptance criteria:

- selected sponsor data is editable in the workspace
- validation states are visible

### Task 3.2: Integrate sponsor logo upload and crop

Description:

- reuse the existing cropper flow for sponsor logos

Deliverables:

- upload logo
- replace logo
- recrop logo
- remove logo

Acceptance criteria:

- logo workflow uses `ImageUploaderCrop`
- logo state updates correctly in the sponsor editor

### Task 3.3: Add sponsor save workflow

Description:

- save sponsor changes explicitly

Deliverables:

- save action
- dirty-state support
- save confirmation feedback

Acceptance criteria:

- sponsor edits can be saved reliably
- unsaved state is visible before save
