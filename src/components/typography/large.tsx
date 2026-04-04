import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface TypographyLargeProps {
  children: ReactNode;
  className?: string;
}

export function TypographyLarge({ children, className }: TypographyLargeProps) {
  return <p className={cn("text-lg font-medium", className)}>{children}</p>;
}
