import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface TypographyH2Props {
  children: ReactNode;
  className?: string;
}

export function TypographyH2({ children, className }: TypographyH2Props) {
  return (
    <h2
      className={cn(
        "font-heading text-foreground text-3xl font-semibold tracking-tight",
        className,
      )}
    >
      {children}
    </h2>
  );
}
