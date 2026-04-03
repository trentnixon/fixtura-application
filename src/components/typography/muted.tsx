import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface TypographyMutedProps {
  children: ReactNode;
  className?: string;
}

export function TypographyMuted({ children, className }: TypographyMutedProps) {
  return (
    <p className={cn("text-muted-foreground font-sans text-sm leading-6", className)}>{children}</p>
  );
}
