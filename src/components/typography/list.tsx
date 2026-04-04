import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface TypographyListProps {
  children: ReactNode;
  className?: string;
}

export function TypographyList({ children, className }: TypographyListProps) {
  return <ul className={cn("list-disc pl-6 text-sm", className)}>{children}</ul>;
}
