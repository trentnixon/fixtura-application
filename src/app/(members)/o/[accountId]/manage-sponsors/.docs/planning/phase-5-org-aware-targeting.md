# Phase 5: Org-Aware Targeting

## Goal

Target sponsors correctly based on account type and grouping mode.

## Outcomes

- club accounts assign sponsors to teams
- association accounts assign sponsors by competition or grade
- targeting rules are visible and enforced

## Tasks

### Task 5.1: Build targeting mode controls

Description:

- support `Global` vs `Specific entities`

Deliverables:

- targeting mode toggle
- global summary state
- scoped summary state

Acceptance criteria:

- users can choose between global and scoped assignment
- global precedence is represented clearly

### Task 5.2: Build club targeting flow

Description:

- support sponsor assignment to teams for club accounts

Deliverables:

- team list
- team selection
- multi-team assignment

Acceptance criteria:

- club users can assign one sponsor to multiple teams
- non-team targeting is not shown for club accounts

### Task 5.3: Build association targeting flow

Description:

- support sponsor assignment by competition or grade depending on grouping mode

Deliverables:

- competition targeting mode
- grade targeting mode
- grouping-aware UI branching

Acceptance criteria:

- association users see competition targeting when grouped by competition
- association users see grade targeting when grouped by grade
- team targeting is not shown for association accounts

### Task 5.4: Add targeting validation and summaries

Description:

- summarize targeting choices and enforce targeting rules

Deliverables:

- targeting summary chips
- invalid target protection
- empty scoped-state validation

Acceptance criteria:

- target summaries are visible in both pool cards and editor
- invalid scoped target states are prevented
