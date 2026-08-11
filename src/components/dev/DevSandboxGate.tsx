import { notFound } from "next/navigation";

import { isDevSandboxEnabled } from "@/lib/dev-sandbox";

import type { ReactNode } from "react";

export function DevSandboxGate({ children }: { children: ReactNode }) {
  if (!isDevSandboxEnabled) {
    notFound();
  }

  return <>{children}</>;
}
