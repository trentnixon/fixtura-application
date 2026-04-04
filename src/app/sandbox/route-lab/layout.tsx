import { SandboxRouteLabSidebar } from "@/components/dev/SandboxRouteLabSidebar";

import type { ReactNode } from "react";

export default function RouteLabLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <SandboxRouteLabSidebar />
      <main className="flex-1 overflow-y-auto p-8 md:p-12 lg:p-16">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
