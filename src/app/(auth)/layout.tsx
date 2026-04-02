import { MembersSessionBoundary } from "@/components/auth/members-session-boundary";
import { DevDebugPanel } from "@/components/dev/dev-debug-panel";
import { AppShell } from "@/components/layout/app/app-shell";

import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <MembersSessionBoundary>{children}</MembersSessionBoundary>
      <DevDebugPanel />
    </AppShell>
  );
}
