# Folder Overview

Reusable card wrappers built on shadcn/ui `Card` primitives. All components accept props/children (no hardcoded content) and can be composed.

## Files

- `BasicCard.tsx`: title/description/content/footer slots
- `BasicCard.test.tsx`: basic-card component tests
- `ActionHeaderCard.tsx`: header actions slot in addition to title/description
- `ActionHeaderCard.test.tsx`: action-header-card component tests
- `MediaCard.tsx`: media slot inside content + footer
- `MediaCard.test.tsx`: media-card component tests
- `ListCard.tsx`: list slot + footer
- `ListCard.test.tsx`: list-card component tests
- `config.ts`: shared classNames for card internals
- `index.ts`: barrel exports

## Relations

- Parent folder: [../../readMe.md](../../readMe.md)
- Used by: `src/app/components/components/cards.tsx`

## Dependencies

- Internal: `src/components/ui/card`
- External: none
