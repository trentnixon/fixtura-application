import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface TypographyBlockquoteProps {
  children: ReactNode;
  className?: string;
}

export function TypographyBlockquote({ children, className }: TypographyBlockquoteProps) {
  return (
    <blockquote
      className={cn(
        "border-primary text-muted-foreground border-l-4 py-1 pl-4 font-sans text-lg italic",
        className,
      )}
    >
      {children}
    </blockquote>
  );
}
