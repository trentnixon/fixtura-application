import { PublicPageWrapper } from "@/components/auth/layout";
import { DevSandboxGate } from "@/components/dev/DevSandboxGate";

import type { ReactNode } from "react";

export default function SandboxLayout({ children }: { children: ReactNode }) {
  return (
    <DevSandboxGate>
      <PublicPageWrapper contentAs="div" className="text-foreground">
        {children}
      </PublicPageWrapper>
    </DevSandboxGate>
  );
}
