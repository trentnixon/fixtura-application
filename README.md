# Folder Overview

Root of the marketing site built with Next.js 15, React 19, TypeScript 5, Tailwind CSS v4, and shadcn/ui. This document is optimized for LLM navigation and describes only the current folder.

## Files

- `package.json`: project scripts, dependencies, and toolchain metadata
- `tsconfig.json`: TypeScript compiler configuration and path aliases
- `next.config.ts`: Next.js configuration
- `postcss.config.mjs`: PostCSS pipeline for Tailwind v4
- `components.json`: shadcn/ui configuration
- `README.md`: human-oriented Next.js template readme
- `readMe.md`: LLM-oriented folder overview (this file)
- `public/*`: static assets
- `src/app/*`: app router pages, layouts, and global styles
- `src/components/ui/*`: shadcn/ui components
- `src/lib/utils.ts`: utility helpers (incl. className merger)
- `src/lib/query.tsx`: TanStack Query provider and defaults (devtools in dev)
- `src/lib/error.ts`: user-visible error mapping helper
- `src/lib/notify.ts`: toast helpers using Sonner

## Relations

- Parent folder: none (repository root)
- Key dependencies: Next.js 15, React 19, TypeScript 5, Tailwind v4, shadcn/ui, TanStack Query, Zod
- Consumed by: local dev server (`next dev`), Vercel or other Node hosts

## Dependencies

- Internal: `src/app`, `src/components`, `src/lib`, `public`
- External: npm packages defined in `package.json`, Node.js >= 18.18

## Tailwind CSS v4 Notes

- Tailwind is enabled via `@tailwindcss/postcss` in `postcss.config.mjs` and `@import "tailwindcss"` in `src/app/globals.css`.
- Shadcn tokens and CSS variables live in `globals.css` under `:root`/`.dark` with `@theme inline`.
- Class sorting is handled by Prettier `prettier-plugin-tailwindcss`.
- Branding tokens:
  - Colors: `--brand-primary`, `--brand-secondary`, `--brand-accent`, `--brand-foreground`
  - Fonts: `--font-brand` (maps to Geist Sans by default)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## shadcn/ui

This project is configured with [shadcn/ui](https://ui.shadcn.com/) and Tailwind CSS v4.

### Commands

```bash
# Initialize (already done)
npx shadcn@latest init -d

# Add components
npx shadcn@latest add button
npx shadcn@latest add card
```

### Usage

- Components are generated in `src/components/ui/*`.
- Utilities are in `src/lib/utils.ts`.
- Tailwind v4 is configured via `postcss.config.mjs` and `src/app/globals.css`.

Example:

```tsx
import { Button } from "@/components/ui/button";

export default function Example() {
  return <Button>Click me</Button>;
}
```

## Testing

This project uses Vitest + Testing Library.

Commands:

```bash
npm run test           # run tests once
npm run test:watch     # watch mode
npm run test:coverage  # generate coverage report
```

Config files: `vite.config.ts`, `vitest.setup.ts`. Sample test: `src/components/typography/h1.test.tsx`.

See `TESTING.md` for rules on what/when/how to test.
