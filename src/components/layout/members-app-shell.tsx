"use client";

import { usePathname } from "next/navigation";

import { DevDebugPanel } from "@/components/dev/dev-debug-panel";
import { AppSidebar } from "@/components/navigation/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ACCOUNT_SCOPE_PREFIX } from "@/lib/config/account-routes";

import type { CSSProperties, ReactNode } from "react";

function parseAccountIdFromPath(pathname: string): string | undefined {
  if (!pathname.startsWith(`${ACCOUNT_SCOPE_PREFIX}/`)) return undefined;
  const seg = pathname.split("/")[2];
  return seg && /^\d+$/.test(seg) ? seg : undefined;
}

export function MembersAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const accountId = parseAccountIdFromPath(pathname);
  const navMode = accountId ? "scoped" : "gateway";

  return (
    <SidebarProvider
      className="md:[--sidebar-width:--spacing(60)] lg:[--sidebar-width:--spacing(54)]"
      style={
        {
          "--header-height": "calc(var(--spacing) * 12)",
        } as CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        navMode={navMode}
        {...(accountId !== undefined ? { accountId } : {})}
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="relative flex min-h-screen flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
              {children}
              <DevDebugPanel />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
