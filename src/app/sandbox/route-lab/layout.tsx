import { SandboxToolsShell } from "@/components/dev/sandbox-tools-shell";
import { SandboxRouteLabSidebar } from "@/components/dev/SandboxRouteLabSidebar";

import type { ReactNode } from "react";

export default function RouteLabLayout({ children }: { children: ReactNode }) {
  return <SandboxToolsShell sidebar={<SandboxRouteLabSidebar />}>{children}</SandboxToolsShell>;
}
