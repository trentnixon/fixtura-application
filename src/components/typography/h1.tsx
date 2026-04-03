import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface TypographyH1Props {
  children: ReactNode;
  className?: string;
}

export function TypographyH1({ children, className }: TypographyH1Props) {
  return (
    <h1 className={cn("font-heading text-foreground text-4xl font-bold tracking-tight", className)}>
      {children}
    </h1>
  );
}
