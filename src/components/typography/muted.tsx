import type { ReactNode } from "react";

export function TypographyMuted({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground text-sm">{children}</p>;
}
