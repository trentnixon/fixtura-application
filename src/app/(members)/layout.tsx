import { MembersSessionBoundary } from "@/components/auth/members-session-boundary";
import { MembersAppShell } from "@/components/layout/members-app-shell";
import { SupportViewProvider } from "@/lib/support/support-view-context";

import type { ReactNode } from "react";

export default function MembersLayout({ children }: { children: ReactNode }) {
  return (
    <MembersSessionBoundary>
      <SupportViewProvider>
        <MembersAppShell>{children}</MembersAppShell>
      </SupportViewProvider>
    </MembersSessionBoundary>
  );
}
