import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export function ManageSponsorsShell({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn("mx-auto grid max-w-[88rem] gap-6 px-4 pb-12 sm:px-6 lg:px-8", className)}
    >
      {children}
    </section>
  );
}
