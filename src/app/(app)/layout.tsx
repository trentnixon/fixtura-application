import { MembersSessionBoundary } from "@/components/auth/members-session-boundary";
import { AppShell } from "@/components/layout/app/app-shell";

import type { ReactNode } from "react";

export default function MembersLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <MembersSessionBoundary>{children}</MembersSessionBoundary>
    </AppShell>
  );
}
