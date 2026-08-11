import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface TypographyLeadProps {
  children: ReactNode;
  className?: string;
}

export function TypographyLead({ children, className }: TypographyLeadProps) {
  return (
    <p className={cn("text-muted-foreground font-sans text-xl leading-relaxed", className)}>
      {children}
    </p>
  );
}
