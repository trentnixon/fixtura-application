import { MembersSessionBoundary } from "@/components/auth/members-session-boundary";
import { MembersAppShell } from "@/components/layout/members-app-shell";

import type { ReactNode } from "react";

export default function MembersLayout({ children }: { children: ReactNode }) {
  return (
    <MembersSessionBoundary>
      <MembersAppShell>{children}</MembersAppShell>
    </MembersSessionBoundary>
  );
}
