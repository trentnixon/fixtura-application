import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export function ManageSponsorsShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <section className={cn("grid gap-4", className)}>{children}</section>;
}
