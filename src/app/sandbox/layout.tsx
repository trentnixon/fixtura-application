import { DevSandboxGate } from "@/components/dev/DevSandboxGate";

import type { ReactNode } from "react";

export default function SandboxLayout({ children }: { children: ReactNode }) {
  return (
    <DevSandboxGate>
      <div className="bg-background text-foreground min-h-screen">{children}</div>
    </DevSandboxGate>
  );
}
