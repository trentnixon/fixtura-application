import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface TypographyPProps {
  children: ReactNode;
  className?: string;
}

export function TypographyP({ children, className }: TypographyPProps) {
  return (
    <p className={cn("text-foreground font-sans text-base leading-7", className)}>{children}</p>
  );
}
