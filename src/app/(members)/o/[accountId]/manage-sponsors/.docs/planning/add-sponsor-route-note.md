# Add Sponsor Route Note

## Decision

Add sponsor should no longer be part of:

- `/o/[accountId]/manage-sponsors`

New route direction:

- `/o/[accountId]/manage-sponsors` = sponsor overview
- `/o/[accountId]/add-sponsor` = create a single sponsor and confirm the upload/save

## Why

This keeps each route focused on one clear job.

### Overview route

`/o/[accountId]/manage-sponsors`

Purpose:

- overview sponsor state
- review the sponsor pool
- edit existing sponsors
- navigate to assignment
- navigate to archive
- launch add sponsor

This route should not own:

- new sponsor creation flow
- upload confirmation flow

### Add sponsor route

`/o/[accountId]/add-sponsor`

Purpose:

- create one sponsor
- upload and crop logo
- enter sponsor details
- save sponsor
- confirm the resulting sponsor

This route should not include:

- sponsor pool
- sponsor overview stats
- assignment UI
- archive management

## Recommended UX

### `/o/[accountId]/manage-sponsors`

Keep:

- page header
- sponsor overview cards
- sponsor pool
- existing sponsor editing
- preview panel

Replace:

- `Add sponsor` should navigate to `/o/[accountId]/add-sponsor`

### `/o/[accountId]/add-sponsor`

Recommended flow:

1. page header with `Back to overview`
2. sponsor logo upload/crop
3. sponsor details
4. save / confirm
5. created sponsor preview

## Implementation Notes

Recommended route structure:

```text
src/app/(members)/o/[accountId]/
  manage-sponsors/
    page.tsx
    assign/
      page.tsx
    archive/
      page.tsx
  add-sponsor/
    page.tsx
    _components/
      add-sponsor-screen.tsx
      add-sponsor-header.tsx
      add-sponsor-form.tsx
      add-sponsor-logo-card.tsx
      add-sponsor-save-dialog.tsx
      add-sponsor-success-preview.tsx
```

## Acceptance Direction

We should consider this split correct when:

- the overview route no longer enters inline draft-creation mode
- `Add sponsor` launches a dedicated route
- the add-sponsor route can save one sponsor and confirm it cleanly
- returning to overview is an explicit user action
