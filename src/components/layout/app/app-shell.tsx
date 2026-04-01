import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { SidebarLayout } from "@/components/containers/SidebarLayout";
import { Button } from "@/components/ui/button";

import type { ReactNode } from "react";

const nav = [
  { href: "/app", label: "Overview" },
  { href: "/app/home", label: "Home" },
  { href: "/app/account", label: "Account" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/app" className="font-semibold tracking-tight">
            Fixtura Members
          </Link>
          <LogoutButton />
        </div>
      </header>
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <SidebarLayout
          sidebar={
            <nav className="flex flex-col gap-1">
              <p className="text-muted-foreground mb-2 text-xs font-medium uppercase">Navigate</p>
              {nav.map((item) => (
                <Button key={item.href} asChild variant="ghost" size="sm" className="justify-start">
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
            </nav>
          }
          main={children}
        />
      </div>
    </div>
  );
}
