import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface TypographyH3Props {
  children: ReactNode;
  className?: string;
}

export function TypographyH3({ children, className }: TypographyH3Props) {
  return (
    <h3
      className={cn(
        "font-heading text-foreground text-2xl font-semibold tracking-tight",
        className,
      )}
    >
      {children}
    </h3>
  );
}
