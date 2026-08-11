import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

interface TypographyInlineCodeProps {
  children: ReactNode;
  className?: string;
}

export function TypographyInlineCode({ children, className }: TypographyInlineCodeProps) {
  return (
    <code className={cn("bg-muted rounded px-1 py-0.5 font-mono text-sm", className)}>
      {children}
    </code>
  );
}

/** Plain monospace for IDs / slugs without chip background. */
export function TypographyMonoText({ children, className }: TypographyInlineCodeProps) {
  return <code className={cn("font-mono text-sm", className)}>{children}</code>;
}

/** Alias for {@link TypographyInlineCode} (PDR naming). */
export const TypographyCodeInline = TypographyInlineCode;
