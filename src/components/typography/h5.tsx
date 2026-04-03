import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface TypographyH5Props {
  children: ReactNode;
  className?: string;
}

export function TypographyH5({ children, className }: TypographyH5Props) {
  return (
    <h5 className={cn("font-heading text-foreground text-lg font-medium", className)}>
      {children}
    </h5>
  );
}
