import Link from "next/link";

import type { ReactNode } from "react";

const NAV_LINKS = [
  { href: "/kitchen-sink", label: "Overview" },
  { href: "/kitchen-sink/brand-colors", label: "Brand Colors" },
  { href: "/kitchen-sink/typography", label: "Typography" },
  { href: "/kitchen-sink/containers", label: "Containers" },
  { href: "/kitchen-sink/navigation", label: "Navigation" },
  { href: "/kitchen-sink/buttons", label: "Buttons" },
  { href: "/kitchen-sink/cards", label: "Cards" },
  { href: "/kitchen-sink/toasts", label: "Toasts" },
  { href: "/kitchen-sink/forms", label: "Forms" },
  { href: "/kitchen-sink/dialogs", label: "Dialogs" },
  { href: "/kitchen-sink/tables", label: "Tables" },
  { href: "/kitchen-sink/popovers", label: "Popovers" },
  { href: "/kitchen-sink/loading", label: "Loading" },
  { href: "/kitchen-sink/inputs", label: "Inputs" },
];

export default function KitchenSinkLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar specifically for Kitchen Sink Navigation */}
      <aside className="border-border bg-card sticky top-0 flex h-screen w-64 flex-col gap-4 overflow-y-auto border-r p-6">
        <div>
          <h2 className="font-heading text-foreground text-xl font-semibold tracking-tight">
            Kitchen Sink
          </h2>
          <p className="text-muted-foreground mt-1 font-sans text-sm">
            Reference for design and patterns.
          </p>
        </div>
        <nav className="mt-4 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="bg-background text-foreground flex-1 overflow-y-auto p-8 md:p-12 lg:p-16">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
