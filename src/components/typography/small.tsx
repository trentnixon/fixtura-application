import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface TypographySmallProps {
  children: ReactNode;
  className?: string;
}

export function TypographySmall({ children, className }: TypographySmallProps) {
  return <p className={cn("text-foreground font-sans text-sm leading-6", className)}>{children}</p>;
}
