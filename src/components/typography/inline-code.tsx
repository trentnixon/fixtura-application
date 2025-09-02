import type { ReactNode } from "react";

export function TypographyInlineCode({ children }: { children: ReactNode }) {
  return <code className="bg-muted rounded px-1 py-0.5 font-mono text-sm">{children}</code>;
}
