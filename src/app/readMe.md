# Folder Overview

App Router entry for pages, layouts, and global styles.

## Files

- `layout.tsx`: Root layout with header/nav/footer and content container
- `page.tsx`: Home page rendering shadcn test components
- `globals.css`: Global Tailwind v4 styles
- `error.tsx`: Client error boundary page
- `not-found.tsx`: 404 page for unknown routes
- Query provider: App uses `QueryProvider` from `src/lib/query.tsx` in `layout.tsx`

## Relations

- Parent folder: [../../readMe.md](../../readMe.md)
- Key dependencies: `src/components/ui/*`, Tailwind tokens
- Consumed by: Next.js App Router

## Dependencies

- Internal: `src/components/ui`, `src/lib/utils.ts`
- External: Next.js 15, React 19
