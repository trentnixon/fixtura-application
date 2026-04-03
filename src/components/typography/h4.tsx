import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface TypographyH4Props {
  children: ReactNode;
  className?: string;
}

export function TypographyH4({ children, className }: TypographyH4Props) {
  return (
    <h4
      className={cn("font-heading text-foreground text-xl font-medium tracking-tight", className)}
    >
      {children}
    </h4>
  );
}
